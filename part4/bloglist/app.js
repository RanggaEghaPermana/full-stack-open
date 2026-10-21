import express from 'express'
import cors from 'cors'
import blogs from './controllers/blogs.js'
import users from './controllers/users.js'
import login from './controllers/login.js'
import { tokenExtractor, unknownEndpoint, errorHandler } from './utils/middleware.js'
const app = express()
app.use(cors())
app.use(express.json())
app.use(tokenExtractor)
app.use('/api/blogs', blogs)
app.use('/api/users', users)
app.use('/api/login', login)
app.use(unknownEndpoint)
app.use(errorHandler)
export default app
