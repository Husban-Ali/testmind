import { validationResult, body } from 'express-validator'
import { User } from '../models/User.js'
import { sendRoleEmail } from '../services/emailService.js'

export const sendEmailValidation = [
  body('toEmail')
    .trim()
    .notEmpty().withMessage('Recipient email required')
    .isEmail().withMessage('Invalid recipient email'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject required')
    .isLength({ max: 150 }).withMessage('Subject too long'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message required')
]

export const sendEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() })
    }
    const { toEmail, subject, message } = req.body

    let recipient = await User.findOne({ email: toEmail })
    const external = !recipient
    if (external) {
      recipient = {
        email: toEmail,
        fullName: toEmail,
        role: 'EXTERNAL'
      }
    }

    const mailInfo = await sendRoleEmail({
      sender: req.user,
      recipient,
      subject,
      message
    })
    res.json({
      message: 'Email sent',
      id: mailInfo.messageId,
      envelope: mailInfo.envelope,
      recipientIsInternal: !external,
      ...(mailInfo.previewUrl && { previewUrl: mailInfo.previewUrl })
    })
  } catch (err) {
    if (err.message && err.message.includes('SMTP authentication failed')) {
      return res.status(502).json({ message: err.message })
    }
    next(err)
  }
}
