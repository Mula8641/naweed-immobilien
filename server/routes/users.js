import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.unit_id, u.created_at,
              un.unit_number, b.name AS building_name
       FROM users u
       LEFT JOIN units un ON u.unit_id = un.id
       LEFT JOIN buildings b ON un.building_id = b.id
       WHERE u.role = 'tenant'
       ORDER BY u.created_at DESC`
    )
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, password, unit_id } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' })
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash, role, unit_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, created_at',
      [name, email, hash, 'tenant', unit_id || null]
    )
    // Mark unit as occupied
    if (unit_id) await query('UPDATE units SET is_available = false WHERE id = $1', [unit_id])
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return next({ status: 409, message: 'Email already in use' })
    next(err)
  }
})

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    // Free up the unit before deleting
    const { rows } = await query('SELECT unit_id FROM users WHERE id = $1', [req.params.id])
    if (rows[0]?.unit_id) await query('UPDATE units SET is_available = true WHERE id = $1', [rows[0].unit_id])
    await query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
