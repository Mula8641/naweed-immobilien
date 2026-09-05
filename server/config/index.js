import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port:       process.env.PORT || 5000,
  jwtSecret:  process.env.JWT_SECRET || 'change_this_secret',
  clientUrl:  process.env.CLIENT_URL || 'http://localhost:5173',
  dbUrl:      process.env.DATABASE_URL,
}
