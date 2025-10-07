export function notFoundHandler (req, res, next) {
  res.status(404).json({ message: 'Route not found' })
}

export function errorHandler (err, req, res, next) {
  console.error('Error:', err)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
}
