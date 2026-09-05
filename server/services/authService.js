import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'
import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'

export async function loginUser(email, password) {
  const { rows } = await query(
    `SELECT u.*, un.unit_number, un.rent_amount, b.name AS building_name
     FROM users u
     LEFT JOIN units un ON u.unit_id = un.id
     LEFT JOIN buildings b ON un.building_id = b.id
     WHERE u.email = $1`,
    [email]
  )
  const user = rows[0]
  if (!user) throw new ApiError(401, 'Invalid credentials')

  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) throw new ApiError(401, 'Invalid credentials')

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  )

  return {
    token,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    unit_number: user.unit_number,
    rent_amount: user.rent_amount,
    building_name: user.building_name,
  }
}
