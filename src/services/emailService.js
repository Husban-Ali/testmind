import nodemailer from 'nodemailer'
import { getTransporter, isUsingEthereal, defaultFrom } from '../config/mailer.js'
import { NODE_ENV, MAIL_FROM_NAME, MAIL_FROM_EMAIL } from '../config/env.js'
import baseTemplate from '../templates/email/baseTemplate.js'
import managerToUserTemplate from '../templates/email/managerToUserTemplate.js'

export async function sendRoleEmail ({ sender, recipient, subject, message }) {
  // ensure sender object exists to avoid template errors
  sender = sender || { fullName: MAIL_FROM_NAME || 'No Name', role: 'SYSTEM', email: MAIL_FROM_EMAIL }

  const bodyContent = managerToUserTemplate({ sender, recipient, message })

  // safe prettyRole mapping used by templates
  const prettyRole = (r) => {
    const map = { IT_MANAGER: 'IT Manager', CEO: 'CEO', OFFICE_MANAGER: 'Office Manager', EXTERNAL: 'External' }
    return map[r] || r || ''
  }

  const html = baseTemplate({ title: subject, content: bodyContent, sender, prettyRole })

  const transporter = await getTransporter()
  if (!transporter) {
    throw new Error('Mail transporter not initialized')
  }

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to: recipient.email,
      subject,
      html
    })

    // If using Ethereal in development, return the preview URL
    if (isUsingEthereal() && nodemailerPreviewUrl(info)) {
      return { ...info, previewUrl: nodemailerPreviewUrl(info) }
    }

    return info
  } catch (err) {
    // Add a clearer error message for SMTP auth errors
    if (err.code === 'EAUTH' || (err.response && err.response.includes('Username and Password'))) {
      // In development, transparently fallback to an Ethereal account and resend
      if (NODE_ENV === 'development') {
        try {
          const testAccount = await nodemailer.createTestAccount()
          const testTransport = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass }
          })
          const info2 = await testTransport.sendMail({ from: defaultFrom, to: recipient.email, subject, html })
          return { ...info2, previewUrl: nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info2) : null }
        } catch (e2) {
          const e = new Error('SMTP authentication failed and Ethereal fallback failed')
          e.cause = err
          throw e
        }
      }
      const e = new Error('SMTP authentication failed. Check SMTP_USER and SMTP_PASS in .env')
      e.cause = err
      throw e
    }
    throw err
  }
}

function nodemailerPreviewUrl (info) {
  // nodemailer stores preview URL in info if using ethereal
  return info && info.messageId && typeof info.messageId === 'string' && info.envelope ? (nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null) : null
}
