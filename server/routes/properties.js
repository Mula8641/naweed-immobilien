import { Router } from 'express'
import { query } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/buildings', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM buildings ORDER BY id')
    res.json(rows)
  } catch (err) { next(err) }
})

router.get('/units/:buildingId', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM units WHERE building_id = $1 ORDER BY unit_number', [req.params.buildingId])
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/buildings', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, address, description } = req.body
    const { rows } = await query('INSERT INTO buildings (name, address, description) VALUES ($1,$2,$3) RETURNING *', [name, address, description])
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

router.delete('/buildings/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM buildings WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.post('/units', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { building_id, unit_number, floor, rent_amount, description, is_available } = req.body
    const { rows } = await query(
      'INSERT INTO units (building_id, unit_number, floor, rent_amount, description, is_available) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [building_id, unit_number, floor ?? null, rent_amount, description, is_available ?? true]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

router.patch('/units/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { unit_number, floor, rent_amount, description, is_available } = req.body
    const { rows } = await query(
      'UPDATE units SET unit_number=$1, floor=$2, rent_amount=$3, description=$4, is_available=$5 WHERE id=$6 RETURNING *',
      [unit_number, floor ?? null, rent_amount, description, is_available, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.delete('/units/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM units WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
