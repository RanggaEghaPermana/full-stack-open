import { randomBytes } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
const mongo = await MongoMemoryServer.create()
process.env.MONGODB_URI = mongo.getUri('fso_bloglist_demo')
process.env.SECRET = randomBytes(32).toString('hex')
const { connect } = await import('../utils/database.js')
await connect(process.env.MONGODB_URI)
const app = (await import('../app.js')).default
const server = app.listen(3005, '127.0.0.1', () => console.log('Temporary Blog List demo: http://127.0.0.1:3005/api/blogs'))
async function stop() {
  server.close()
  await mongoose.disconnect()
  await mongo.stop()
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
