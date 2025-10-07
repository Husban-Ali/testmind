import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import { sendEmail, sendEmailValidation } from '../controllers/emailController.js'

const router = Router()

router.post(
  '/send',
  authenticate,
  authorizeRoles('IT_MANAGER', 'CEO', 'OFFICE_MANAGER'),
  sendEmailValidation,
  sendEmail
)

export default router
