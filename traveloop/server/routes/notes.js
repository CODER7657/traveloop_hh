const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/notes?trip_id=xxx
router.get('/', auth, async (req, res) => {
  const { trip_id } = req.query
  if (!trip_id) return res.status(400).json({ error: 'trip_id required' })
  try {
    const { rows } = await db.query(
      'SELECT id, content, created_at, updated_at FROM notes WHERE trip_id=$1 ORDER BY created_at DESC',
      [trip_id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

// POST /api/notes
router.post('/', auth, async (req, res) => {
  const { trip_id, content, updated_at } = req.body
  try {
    const { rows } = await db.query(
      'INSERT INTO notes (trip_id, content, updated_at) VALUES ($1,$2,$3) RETURNING id, content, created_at, updated_at',
      [trip_id, content, updated_at || new Date().toISOString()]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create note' })
  }
})

// PUT /api/notes/:id
router.put('/:id', auth, async (req, res) => {
  const { content, updated_at } = req.body
  try {
    const { rows } = await db.query(
      'UPDATE notes SET content=$1, updated_at=$2 WHERE id=$3 RETURNING *',
      [content, updated_at || new Date().toISOString(), req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' })
  }
})

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM notes WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' })
  }
})

module.exports = router
