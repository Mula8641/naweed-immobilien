import { Router } from 'express'
import { query } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { generateInvoicePdf } from '../services/pdfService.js'

const router = Router()

// Tenant: own invoices
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY year DESC, month DESC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// Tenant: download own invoice PDF
router.get('/my/:id/pdf', authenticate, async (req, res, next) => {
  try {
    const { rows: invRows } = await query('SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.id])
    if (!invRows[0]) return res.status(404).json({ error: 'Not found' })
    const { rows: userRows } = await query('SELECT name, email FROM users WHERE id = $1', [req.user.id])
    const doc = generateInvoicePdf(invRows[0], userRows[0])
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="rechnung-${req.params.id}.pdf"`)
    doc.pipe(res)
    doc.end()
  } catch (err) { next(err) }
})

// Admin: all invoices
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT i.*, u.name AS tenant_name
       FROM invoices i JOIN users u ON i.tenant_id = u.id
       ORDER BY i.year DESC, i.month DESC`
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// Admin: create invoice
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { tenant_id, month, year, rent_amount, extras, total } = req.body
    const { rows } = await query(
      'INSERT INTO invoices (tenant_id, month, year, rent_amount, extras, total) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [tenant_id, month, year, rent_amount, JSON.stringify(extras || []), total]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

// Admin: toggle status
router.patch('/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body
    const paid_at = status === 'paid' ? new Date() : null
    const { rows } = await query(
      'UPDATE invoices SET status=$1, paid_at=$2 WHERE id=$3 RETURNING *',
      [status, paid_at, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

// Admin: download any invoice PDF
router.get('/:id/pdf', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { rows: invRows } = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id])
    if (!invRows[0]) return res.status(404).json({ error: 'Not found' })
    const { rows: userRows } = await query('SELECT name, email FROM users WHERE id = $1', [invRows[0].tenant_id])
    const doc = generateInvoicePdf(invRows[0], userRows[0])
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="rechnung-${req.params.id}.pdf"`)
    doc.pipe(res)
    doc.end()
  } catch (err) { next(err) }
})

export default router
