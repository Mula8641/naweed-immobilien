import pg from 'pg'
import { config } from '../config/index.js'

const pool = new pg.Pool({ connectionString: config.dbUrl })

pool.on('error', (err) => console.error('DB pool error:', err))

export const query = (text, params) => pool.query(text, params)
export default pool
