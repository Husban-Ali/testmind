import { PORT } from './config/env.js'
import app from './app.js'
import './config/db.js'

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
