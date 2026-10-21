// Only this loopback-only test launcher registers reset. The normal app never does.
import { randomBytes } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
process.env.NODE_ENV = 'test'
process.env.SECRET = randomBytes(32).toString('hex')
const mongo = await MongoMemoryServer.create()
process.env.TEST_MONGODB_URI = mongo.getUri('fso_bloglist_e2e')
const { connect } = await import('../utils/database.js')
await connect(process.env.TEST_MONGODB_URI)
const app = (await import('../app.js')).default
const Blog = (await import('../models/blog.js')).default
const User = (await import('../models/user.js')).default
await User.init()
const express = (await import('express')).default
const testApp = express()
testApp.post('/api/testing/reset', async (_request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  response.status(204).end()
})
testApp.use(app)
const server = testApp.listen(3006, '127.0.0.1', () => console.log('Isolated E2E backend on port3006'))
async function stop() { server.close(); await mongoose.disconnect(); await mongo.stop() }
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
