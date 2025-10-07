import { body } from 'express-validator'
import { UserRoles } from '../models/User.js'

export const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name too short'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email required')
    .isEmail().withMessage('Invalid email'),
  body('password')
    .notEmpty().withMessage('Password required')
    .isLength({ min: 6 }).withMessage('Password min length 6'),
  body('role')
    .optional()
    .isIn(UserRoles).withMessage('Invalid role')
]

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email required')
    .isEmail().withMessage('Invalid email'),
  body('password')
    .notEmpty().withMessage('Password required')
]
