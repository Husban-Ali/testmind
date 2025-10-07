import nodemailer from 'nodemailer'
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM_EMAIL,
  MAIL_FROM_NAME,
  NODE_ENV
} from './env.js'

let transporter = null
let usingEthereal = false
let initPromise = null

async function createTransporter () {
  // sanitize inputs
  const host = SMTP_HOST ? String(SMTP_HOST).trim() : ''
  const user = SMTP_USER ? String(SMTP_USER).trim() : ''
  // remove accidental whitespace from password
  const pass = SMTP_PASS ? String(SMTP_PASS).trim().replace(/\s+/g, '') : ''
  const port = SMTP_PORT || 587
  const secure = SMTP_SECURE === true || String(SMTP_SECURE) === 'true' || Number(port) === 465

  if (!host || !user || !pass) {
    if (NODE_ENV === 'development') {
      console.warn('SMTP credentials missing or incomplete — creating Ethereal test account for development')
      const testAccount = await nodemailer.createTestAccount()
      usingEthereal = true
      console.info('Ethereal test account created (development only). Preview URL will be returned on send.')
      console.info(`ethereal user: ${testAccount.user}`)
      // do not log passwords in production, but in local dev it's helpful
      console.info(`ethereal pass: ${testAccount.pass}`)
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      })
    }

    console.warn('SMTP credentials incomplete. Attempting to create transport with configured values (may fail).')
    return nodemailer.createTransport({
      host: host || SMTP_HOST,
      port: port,
      secure: secure,
      auth: { user: user || SMTP_USER, pass: pass || SMTP_PASS }
    })
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  })

  // verify transporter to surface auth errors early
  try {
    await transport.verify()
    console.info('SMTP transporter verified')
  } catch (err) {
    console.warn('SMTP transporter verification failed:', err && err.message)
  }

  return transport
}

// initialize transporter asynchronously
initPromise = createTransporter().then(t => { transporter = t }).catch(err => {
  console.error('Failed to create mail transporter:', err && err.message)
})

export async function getTransporter () {
  if (transporter) return transporter
  if (initPromise) await initPromise
  return transporter
}

export function isUsingEthereal () {
  return usingEthereal
}

export const defaultFrom = `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`
