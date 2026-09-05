import { Router } from 'express'
import { createReadStream, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { query } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = join(__dirname, '../uploads')

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => cb(null, `${uuid()}.pdf`),
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files allowed'))
  },
})

const router = Router()

// Tenant: get own contract info
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM contracts WHERE tenant_id = $1 ORDER BY uploaded_at DESC LIMIT 1', [req.user.id])
    if (!rows[0]) return res.status(404).json({ error: 'No contract found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

// Tenant: download own contract
router.get('/my/download', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM contracts WHERE tenant_id = $1 ORDER BY uploaded_at DESC LIMIT 1', [req.user.id])
    if (!rows[0]) return res.status(404).json({ error: 'No contract found' })
    const filePath = join(UPLOADS_DIR, rows[0].filename)
    if (!existsSync(filePath)) return res.status(404).json({ error: 'File not found' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="mietvertrag.pdf"')
    createReadStream(filePath).pipe(res)
  } catch (err) { next(err) }
})

// Admin: all contracts
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM contracts ORDER BY uploaded_at DESC')
    res.json(rows)
  } catch (err) { next(err) }
})

// Admin: upload contract for a tenant
router.post('/:tenantId', authenticate, requireAdmin, upload.single('contract'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    // Replace existing contract entry for this tenant
    await query('DELETE FROM contracts WHERE tenant_id = $1', [req.params.tenantId])
    const { rows } = await query(
      'INSERT INTO contracts (tenant_id, filename) VALUES ($1,$2) RETURNING *',
      [req.params.tenantId, req.file.filename]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

export default router
