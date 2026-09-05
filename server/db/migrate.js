import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pool from './index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sql = readFileSync(join(__dirname, 'migrations/001_initial_schema.sql'), 'utf8')

try {
  await pool.query(sql)
  console.log('Migration complete.')
} catch (err) {
  console.error('Migration failed:', err.message)
} finally {
  await pool.end()
}
