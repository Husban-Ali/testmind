import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import { NODE_ENV } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import emailRoutes from './routes/emailRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: '*',
  credentials: false
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

app.use('/api/auth', authRoutes)
app.use('/api/email', emailRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
