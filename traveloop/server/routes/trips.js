const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')
const { nanoid } = require('nanoid')

// GET /api/trips
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM trips WHERE user_id=$1 ORDER BY start_date ASC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trips' })
  }
})

// GET /api/trips/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM trips WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Trip not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trip' })
  }
})

// POST /api/trips
router.post('/', auth, async (req, res) => {
  const { name, description, start_date, end_date, vibe_tag, total_budget, currency, is_public } = req.body
  const slug = is_public ? nanoid(8) : null
  try {
    const { rows } = await db.query(
      `INSERT INTO trips (user_id,name,description,start_date,end_date,vibe_tag,total_budget,currency,is_public,slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, name, description, start_date, end_date, vibe_tag, total_budget || 0, currency || 'USD', is_public || false, slug]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create trip' })
  }
})

// PUT /api/trips/:id
router.put('/:id', auth, async (req, res) => {
  const { name, description, start_date, end_date, vibe_tag, total_budget, currency, is_public } = req.body
  try {
    const { rows } = await db.query(
      `UPDATE trips SET name=COALESCE($1,name), description=COALESCE($2,description),
       start_date=COALESCE($3,start_date), end_date=COALESCE($4,end_date),
       vibe_tag=COALESCE($5,vibe_tag), total_budget=COALESCE($6,total_budget),
       currency=COALESCE($7,currency), is_public=COALESCE($8,is_public)
       WHERE id=$9 AND user_id=$10 RETURNING *`,
      [name, description, start_date, end_date, vibe_tag, total_budget, currency, is_public, req.params.id, req.user.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip' })
  }
})

// DELETE /api/trips/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM trips WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip' })
  }
})

// GET /api/trips/:id/stops  (with activities)
router.get('/:id/stops', auth, async (req, res) => {
  try {
    const { rows: stops } = await db.query(
      'SELECT * FROM stops WHERE trip_id=$1 ORDER BY order_index ASC',
      [req.params.id]
    )
    // attach activities
    for (const stop of stops) {
      const { rows: acts } = await db.query(
        'SELECT * FROM trip_activities WHERE stop_id=$1',
        [stop.id]
      )
      stop.trip_activities = acts
    }
    res.json(stops)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stops' })
  }
})

// GET /api/trips/public/:slug  (no auth — public share)
router.get('/public/:slug', async (req, res) => {
  try {
    const { rows: trips } = await db.query(
      'SELECT * FROM trips WHERE slug=$1 AND is_public=true',
      [req.params.slug]
    )
    if (!trips.length) return res.status(404).json({ error: 'Trip not found or private' })
    const trip = trips[0]
    const { rows: stops } = await db.query(
      'SELECT * FROM stops WHERE trip_id=$1 ORDER BY order_index ASC',
      [trip.id]
    )
    for (const stop of stops) {
      const { rows: acts } = await db.query('SELECT * FROM trip_activities WHERE stop_id=$1', [stop.id])
      stop.trip_activities = acts
    }
    res.json({ trip, stops })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shared trip' })
  }
})

module.exports = router
