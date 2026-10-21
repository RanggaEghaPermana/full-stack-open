import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } })
process.env.MONGODB_URI = mongo.getUri('phonebook_demo')
const { default: connectDatabase } = await import('../utils/database.js')
const { default: Person } = await import('../models/person.js')
await connectDatabase()
await Person.create([
  { name: 'Arto Hellas', number: '040-123456' },
  { name: 'Ada Lovelace', number: '039-445323523' },
])
const { default: app } = await import('../app.js')
const port = Number(process.env.PORT || 3003)
const server = app.listen(port, '127.0.0.1', () => console.log(`Temporary local MongoDB demo: http://127.0.0.1:${port}`))
const stop = async () => {
  await new Promise(resolve => server.close(resolve))
  await mongoose.disconnect()
  await mongo.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
