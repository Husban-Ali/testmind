import { validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() })
    }
    const { fullName, email, password, role } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const user = await User.create({ fullName, email, password, role })
    const token = generateToken(user)

    res.status(201).json({
      message: 'User registered',
      user: user.toSafeObject(),
      token
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() })
    }
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    user.lastLoginAt = new Date()
    await user.save()

    const token = generateToken(user)
    res.json({
      message: 'Login successful',
      user: user.toSafeObject(),
      token
    })
  } catch (err) {
    next(err)
  }
}

export const me = async (req, res) => {
  res.json({ user: req.user.toSafeObject() })
}
