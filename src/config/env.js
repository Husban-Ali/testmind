import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT || 4000
export const NODE_ENV = process.env.NODE_ENV || 'development'

export const MONGO_URI = process.env.MONGO_URI

export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
export const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS
export const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'System Mailer'
export const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'no-reply@example.com'

export const COMPANY_NAME = process.env.COMPANY_NAME || 'Sample Company'
export const COMPANY_LOGO_URL = process.env.COMPANY_LOGO_URL || 'https://placehold.co/200x60?text=Logo'
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
