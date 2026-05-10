/**
 * Fake Supabase Client — proxies all queries to the backend API.
 * Zero changes required in UI components.
 */

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

// Store auth state change listeners so login/signup can trigger them
let _authListeners = [];

class DBRQueryBuilder {
  constructor(table) {
    this._table = table;
    this._action = 'select';
    this._columns = '*';
    this._data = null;
    this._filters = [];
    this._orders = [];
    this._single = false;
    this._limit = null;
  }

  select(cols = '*') {
    // Only set action to select if no write action was already set (supports .insert().select() chaining)
    if (this._action === 'select') this._action = 'select';
    this._columns = cols;
    return this;
  }
  insert(data) { this._action = 'insert'; this._data = Array.isArray(data) ? data[0] : data; return this; }
  update(data) { this._action = 'update'; this._data = data; return this; }
  delete() { this._action = 'delete'; return this; }
  upsert(data) { this._action = 'upsert'; this._data = Array.isArray(data) ? data[0] : data; return this; }

  eq(col, val) { this._filters.push({ op: 'eq', col, val }); return this; }
  in(col, vals) { this._filters.push({ op: 'in', col, vals }); return this; }
  ilike(col, pattern) { this._filters.push({ op: 'ilike', col, val: pattern }); return this; }
  like(col, pattern) { this._filters.push({ op: 'like', col, val: pattern }); return this; }
  neq(col, val) { this._filters.push({ op: 'neq', col, val }); return this; }
  gt(col, val) { this._filters.push({ op: 'gt', col, val }); return this; }
  gte(col, val) { this._filters.push({ op: 'gte', col, val }); return this; }
  lt(col, val) { this._filters.push({ op: 'lt', col, val }); return this; }
  lte(col, val) { this._filters.push({ op: 'lte', col, val }); return this; }
  is(col, val) { this._filters.push({ op: 'is', col, val }); return this; }

  order(col, opts = {}) { this._orders.push({ col, ascending: opts.ascending !== false }); return this; }
  single() { this._single = true; return this; }
  limit(n) { this._limit = n; return this; }

  async then(resolve, reject) {
    const payload = {
      table: this._table,
      action: this._action,
      columns: this._columns,
      data: this._data,
      filters: this._filters,
      orders: this._orders,
      single: this._single,
      limit: this._limit
    };

    try {
      const token = localStorage.getItem('traveloop-token') || '';

      const res = await fetch(`${API_BASE}/dbr/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const { result, error } = await res.json();
      resolve({ data: result, error });
    } catch(err) {
      console.error('[DBR Client Error]', err);
      resolve({ data: null, error: err });
    }
  }
}

function _notifyAuthListeners(event, session) {
  _authListeners.forEach(cb => {
    try { cb(event, session); } catch(e) { console.error(e); }
  });
}

export const supabase = {
  from: (table) => new DBRQueryBuilder(table),
  auth: {
    signUp: async ({ email, password, options }) => {
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name: options?.data?.name,
            travel_style: options?.data?.travel_style
          })
        });
        const result = await res.json();
        if (!res.ok) return { data: { user: null }, error: { message: result.error } };
        localStorage.setItem('traveloop-token', result.token);
        localStorage.setItem('traveloop-user', JSON.stringify(result.user));
        const session = { user: result.user, access_token: result.token };
        _notifyAuthListeners('SIGNED_IN', session);
        return { data: { user: result.user }, error: null };
      } catch (err) {
        return { data: { user: null }, error: err };
      }
    },
    signInWithPassword: async ({ email, password }) => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await res.json();
        if (!res.ok) return { error: { message: result.error } };
        localStorage.setItem('traveloop-token', result.token);
        localStorage.setItem('traveloop-user', JSON.stringify(result.user));
        const session = { user: result.user, access_token: result.token };
        _notifyAuthListeners('SIGNED_IN', session);
        return { error: null };
      } catch (err) {
        return { error: err };
      }
    },
    getSession: async () => {
      const token = localStorage.getItem('traveloop-token');
      const userStr = localStorage.getItem('traveloop-user');
      if (token && userStr) {
        return { data: { session: { user: JSON.parse(userStr), access_token: token } } };
      }
      return { data: { session: null } };
    },
    signOut: async () => {
      localStorage.removeItem('traveloop-token');
      localStorage.removeItem('traveloop-user');
      _notifyAuthListeners('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange: (callback) => {
      _authListeners.push(callback);
      return { data: { subscription: { unsubscribe: () => {
        _authListeners = _authListeners.filter(cb => cb !== callback);
      } } } };
    }
  }
};
