const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const sign = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const exists = await db.query('SELECT id FROM profiles WHERE email=$1', [email])
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const result = await db.query(
      `INSERT INTO profiles (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email, name, avatar_url, travel_style`,
      [email, hash, name || email.split('@')[0]]
    )
    const user = result.rows[0]
    res.json({ token: sign(user), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const result = await db.query(
      'SELECT id, email, name, password_hash, avatar_url, travel_style FROM profiles WHERE email=$1',
      [email]
    )
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const { password_hash, ...profile } = user
    res.json({ token: sign(profile), user: profile })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me
const auth = require('../middleware/auth')
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, avatar_url, travel_style FROM profiles WHERE id=$1',
      [req.user.id]
    )
    res.json(result.rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  const { name, avatar_url, travel_style } = req.body
  try {
    const result = await db.query(
      `UPDATE profiles SET name=COALESCE($1,name), avatar_url=COALESCE($2,avatar_url), travel_style=COALESCE($3,travel_style)
       WHERE id=$4 RETURNING id, email, name, avatar_url, travel_style`,
      [name, avatar_url, travel_style, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' })
  }
})

module.exports = router
