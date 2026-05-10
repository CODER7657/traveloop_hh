const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/cities?q=paris
router.get('/', async (req, res) => {
  const { q } = req.query
  try {
    let query, params
    if (q && q.length >= 2) {
      query = `SELECT * FROM cities WHERE name ILIKE $1 ORDER BY popularity DESC LIMIT 24`
      params = [`%${q}%`]
    } else {
      query = `SELECT * FROM cities ORDER BY popularity DESC LIMIT 24`
      params = []
    }
    const { rows } = await db.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' })
  }
})

// GET /api/cities/:id/activities
router.get('/:id/activities', async (req, res) => {
  const { type, max_cost } = req.query
  try {
    let query = 'SELECT * FROM activities WHERE city_id=$1'
    const params = [req.params.id]
    if (type) { query += ` AND type=$${params.length + 1}`; params.push(type) }
    if (max_cost) { query += ` AND cost<=$${params.length + 1}`; params.push(Number(max_cost)) }
    query += ' LIMIT 20'
    const { rows } = await db.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

module.exports = router
