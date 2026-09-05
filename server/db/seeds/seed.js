import bcrypt from 'bcryptjs'
import pool from '../index.js'

const hash = await bcrypt.hash('admin123', 10)

try {
  await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Admin', 'admin@naweed.com', $1, 'admin')
    ON CONFLICT (email) DO NOTHING
  `, [hash])
  console.log('Seed complete. Admin: admin@naweed.com / admin123')
} catch (err) {
  console.error('Seed failed:', err.message)
} finally {
  await pool.end()
}
