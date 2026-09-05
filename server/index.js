import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes       from './routes/auth.js'
import propertyRoutes   from './routes/properties.js'
import userRoutes       from './routes/users.js'
import invoiceRoutes    from './routes/invoices.js'
import contractRoutes   from './routes/contracts.js'
import faqRoutes        from './routes/faq.js'

const app = express()

app.use(cors({ origin: config.clientUrl, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',       authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/users',      userRoutes)
app.use('/api/invoices',   invoiceRoutes)
app.use('/api/contracts',  contractRoutes)
app.use('/api/faq',        faqRoutes)

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
