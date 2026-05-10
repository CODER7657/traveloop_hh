const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/rpc', async (req, res) => {
  const { table, action, columns, data, filters, orders, single, limit } = req.body;

  try {
    let query = '';

    if (action === 'select') {
      // Parse Supabase-style nested relations: "*, trip_activities(*)" → main columns + nested tables
      let mainCols = columns || '*';
      const nestedRelations = [];
      const relationRegex = /,?\s*(\w+)\s*\(\s*\*\s*\)/g;
      let match;
      while ((match = relationRegex.exec(mainCols)) !== null) {
        nestedRelations.push(match[1]);
      }
      // Strip the nested relation parts from the column list
      mainCols = mainCols.replace(relationRegex, '').replace(/^,\s*|,\s*$/g, '').trim() || '*';
      
      query = `SELECT ${mainCols} FROM ${table}`;
      
      // Store for post-processing
      req._nestedRelations = nestedRelations;
    } else if (action === 'delete') {
      query = `DELETE FROM ${table}`;
    } else if (action === 'insert') {
      const keys = Object.keys(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(data);
      query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      // Use parameterized query for insert
      console.log('[DBR RPC INSERT]', query, values);
      const { rows } = await db.query(query, values);
      if (single && rows && rows.length > 0) {
        return res.json({ result: rows[0], error: null });
      }
      return res.json({ result: rows, error: null });
    } else if (action === 'update') {
      const keys = Object.keys(data);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = Object.values(data);
      query = `UPDATE ${table} SET ${sets}`;

      // Add WHERE clauses
      if (filters && filters.length > 0) {
        const filterStrs = filters.map(f => {
          values.push(f.val);
          return `${f.col} = $${values.length}`;
        });
        query += ` WHERE ${filterStrs.join(' AND ')}`;
      }
      query += ' RETURNING *';

      console.log('[DBR RPC UPDATE]', query, values);
      const { rows } = await db.query(query, values);
      if (single && rows && rows.length > 0) {
        return res.json({ result: rows[0], error: null });
      }
      return res.json({ result: rows, error: null });
    } else if (action === 'upsert') {
      const keys = Object.keys(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(data);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${sets} RETURNING *`;

      console.log('[DBR RPC UPSERT]', query, values);
      const { rows } = await db.query(query, values);
      if (single && rows && rows.length > 0) {
        return res.json({ result: rows[0], error: null });
      }
      return res.json({ result: rows, error: null });
    }

    // Build WHERE for select/delete
    const params = [];
    if (filters && filters.length > 0) {
      const filterStrs = filters.map(f => {
        if (f.op === 'eq') {
          params.push(f.val);
          return `${f.col} = $${params.length}`;
        }
        if (f.op === 'neq') {
          params.push(f.val);
          return `${f.col} != $${params.length}`;
        }
        if (f.op === 'ilike') {
          params.push(f.val);
          return `${f.col} ILIKE $${params.length}`;
        }
        if (f.op === 'like') {
          params.push(f.val);
          return `${f.col} LIKE $${params.length}`;
        }
        if (f.op === 'gt') {
          params.push(f.val);
          return `${f.col} > $${params.length}`;
        }
        if (f.op === 'gte') {
          params.push(f.val);
          return `${f.col} >= $${params.length}`;
        }
        if (f.op === 'lt') {
          params.push(f.val);
          return `${f.col} < $${params.length}`;
        }
        if (f.op === 'lte') {
          params.push(f.val);
          return `${f.col} <= $${params.length}`;
        }
        if (f.op === 'is') {
          if (f.val === null) return `${f.col} IS NULL`;
          return `${f.col} IS ${f.val}`;
        }
        if (f.op === 'in') {
          const inPlaceholders = f.vals.map(v => {
            params.push(v);
            return `$${params.length}`;
          }).join(', ');
          return `${f.col} IN (${inPlaceholders})`;
        }
        return '1=1';
      });
      query += ` WHERE ${filterStrs.join(' AND ')}`;
    }

    if (action === 'delete') {
      query += ' RETURNING *';
    }

    if (orders && orders.length > 0) {
      const orderStrs = orders.map(o => `${o.col} ${o.ascending ? 'ASC' : 'DESC'}`);
      query += ` ORDER BY ${orderStrs.join(', ')}`;
    }

    if (limit) {
      query += ` LIMIT ${parseInt(limit, 10)}`;
    }

    console.log('[DBR RPC]', query, params);
    let { rows } = await db.query(query, params);

    // Hydrate nested relations (e.g. stops → trip_activities)
    if (req._nestedRelations && req._nestedRelations.length > 0 && rows.length > 0) {
      for (const relTable of req._nestedRelations) {
        // Determine the foreign key: convention is parent_table_singular + '_id'
        // For stops → trip_activities, the FK is stop_id
        const parentTable = table;
        // Try common FK patterns
        const singularParent = parentTable.replace(/s$/, '');
        const fkCol = `${singularParent}_id`;
        
        const parentIds = rows.map(r => r.id);
        if (parentIds.length > 0) {
          const placeholders = parentIds.map((_, i) => `$${i + 1}`).join(', ');
          try {
            const childResult = await db.query(
              `SELECT * FROM ${relTable} WHERE ${fkCol} IN (${placeholders})`,
              parentIds
            );
            // Group by FK and attach to parent rows
            const grouped = {};
            for (const child of childResult.rows) {
              const key = child[fkCol];
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(child);
            }
            rows = rows.map(r => ({
              ...r,
              [relTable]: grouped[r.id] || []
            }));
          } catch (relErr) {
            console.warn(`[DBR] Could not hydrate ${relTable}:`, relErr.message);
            // Attach empty arrays so UI doesn't break
            rows = rows.map(r => ({ ...r, [relTable]: [] }));
          }
        }
      }
    }

    if (single && rows && rows.length > 0) {
      return res.json({ result: rows[0], error: null });
    }

    res.json({ result: rows, error: null });

  } catch (err) {
    console.error('[DBR RPC Error]', err);
    res.json({ result: null, error: err.message });
  }
});

module.exports = router;
