import mongoose from 'mongoose'
import { MONGO_URI, NODE_ENV } from './env.js'

async function connectWithRetry(uri, options = {}) {
  const maxAttempts = 5
  let attempt = 0
  const baseDelayMs = 2000

  while (attempt < maxAttempts) {
    attempt += 1
    try {
      await mongoose.connect(uri, options)
      console.log('MongoDB connected')
      return
    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      const isTransient = msg.includes('EAI_AGAIN') || (err && err.name === 'MongoNetworkError')
      console.error(`MongoDB connection attempt ${attempt} failed: ${msg}`)

      if (attempt >= maxAttempts) {
        console.error(`MongoDB: reached ${maxAttempts} attempts.`)
        if (NODE_ENV === 'development') {
          console.warn('Running in development: continuing without MongoDB connection. Some features will be disabled.')
          return
        }
        console.error('Exiting process because MongoDB is not available.')
        process.exit(1)
      }

      // If it's a transient DNS/network error, wait and retry with exponential backoff
      if (isTransient) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1)
        console.warn(`Transient network/DNS error detected; retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`)
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // Non-retryable error -> in development log and continue, otherwise exit
      console.error('Non-recoverable MongoDB error:', msg)
      if (NODE_ENV === 'development') {
        console.warn('Development mode: continuing without MongoDB connection.')
        return
      }
      process.exit(1)
    }
  }
}

if (!MONGO_URI) {
  if (NODE_ENV === 'development') {
    console.warn('MONGO_URI missing in environment. Skipping MongoDB connection in development.');
    // fall through and export mongoose (not connected)
  } else {
    console.error('MONGO_URI missing in environment.')
    process.exit(1)
  }
} else {
  // Start connection attempts (don't block module load)
  // Add serverSelectionTimeoutMS for faster failover and prefer IPv4 (family:4) to avoid some DNS resolution issues
  connectWithRetry(MONGO_URI, { autoIndex: true, serverSelectionTimeoutMS: 10000, family: 4 }).catch(err => {
    console.error('Unexpected error during MongoDB connectWithRetry:', err)
    if (NODE_ENV !== 'development') process.exit(1)
  })
}

export default mongoose
