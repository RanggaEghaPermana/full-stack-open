import app from './app.js'
import { connect } from './utils/database.js'
import { mongoUri, port, secret } from './utils/config.js'
import { info, error } from './utils/logger.js'
try {
  if (!secret) throw new Error('SECRET is required for token signing')
  await connect(mongoUri)
  app.listen(port, () => info(`Blog List listening on ${port}`))
} catch (err) {
  error(err.message)
  process.exitCode = 1
}
