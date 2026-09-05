import { Router } from 'express'
import { query } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM faqs ORDER BY created_at')
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { question_en, answer_en, question_de, answer_de } = req.body
    const { rows } = await query(
      'INSERT INTO faqs (question_en, answer_en, question_de, answer_de) VALUES ($1,$2,$3,$4) RETURNING *',
      [question_en, answer_en, question_de, answer_de]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM faqs WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
