import pg from 'pg'
import dns from 'dns'
import { config } from '../config/index.js'

// Render free tier can't reach Supabase via IPv6 — force IPv4
dns.setDefaultResultOrder('ipv4first')

const pool = new pg.Pool({ connectionString: config.dbUrl, ssl: { rejectUnauthorized: false } })

pool.on('error', (err) => console.error('DB pool error:', err))

export const query = (text, params) => pool.query(text, params)
export default pool
