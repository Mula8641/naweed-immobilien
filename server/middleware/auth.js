import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'

export function authenticate(req, res, next) {
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) return next(new ApiError(401, 'Unauthorized'))
  try {
    req.user = jwt.verify(header.slice(7), config.jwtSecret)
    next()
  } catch {
    next(new ApiError(401, 'Invalid token'))
  }
}
