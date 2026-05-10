const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/budget?trip_id=xxx
router.get('/', auth, async (req, res) => {
  const { trip_id } = req.query
  if (!trip_id) return res.status(400).json({ error: 'trip_id required' })
  try {
    const { rows } = await db.query(
      'SELECT id, label, amount, category, date FROM budget_items WHERE trip_id=$1 ORDER BY date DESC',
      [trip_id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget items' })
  }
})

// POST /api/budget
router.post('/', auth, async (req, res) => {
  const { trip_id, label, amount, category, currency, date } = req.body
  try {
    const { rows } = await db.query(
      'INSERT INTO budget_items (trip_id, label, amount, category, currency, date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [trip_id, label, amount, category, currency || 'USD', date]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add budget item' })
  }
})

// DELETE /api/budget/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM budget_items WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete budget item' })
  }
})

module.exports = router
