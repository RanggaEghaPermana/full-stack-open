import express from 'express'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Person from './models/person.js'
import connectDatabase from './utils/database.js'
import { unknownEndpoint, errorHandler } from './utils/middleware.js'

const app = express()
const directory = path.dirname(fileURLToPath(import.meta.url))
app.use((request, response, next) => { request.receivedAt = new Date(); next() })
app.use(express.json())
morgan.token('post-data', request => request.method === 'POST' ? JSON.stringify(request.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data', { skip: () => process.env.NODE_ENV === 'test' }))
app.use(express.static(path.join(directory, 'dist')))
app.use(['/api', '/info'], async (request, response, next) => { await connectDatabase(); next() })

app.get('/api/persons', async (request, response) => response.json(await Person.find({})))
app.get('/info', async (request, response) => {
  const count = await Person.countDocuments({})
  response.type('html').send(`<p>Phonebook has info for ${count} people</p><p>${request.receivedAt.toString()}</p>`)
})
app.get('/api/persons/:id', async (request, response) => {
  const person = await Person.findById(request.params.id)
  return person ? response.json(person) : response.status(404).json({ error: 'Person not found' })
})
app.post('/api/persons', async (request, response) => {
  const body = request.body || {}
  if (typeof body.name !== 'string' || typeof body.number !== 'string') {
    return response.status(400).json({ error: 'Name and number are required strings' })
  }
  const person = new Person({ name: body.name, number: body.number })
  const saved = await person.save()
  return response.status(201).json(saved)
})
app.put('/api/persons/:id', async (request, response) => {
  const body = request.body || {}
  if (typeof body.name !== 'string' || typeof body.number !== 'string') {
    return response.status(400).json({ error: 'Name and number are required strings' })
  }
  const person = await Person.findById(request.params.id)
  if (!person) return response.status(404).json({ error: 'Person not found' })
  person.name = body.name
  person.number = body.number
  return response.json(await person.save())
})
app.delete('/api/persons/:id', async (request, response) => {
  const deleted = await Person.findByIdAndDelete(request.params.id)
  return deleted ? response.status(204).end() : response.status(404).json({ error: 'Person not found' })
})
app.use(unknownEndpoint)
app.use(errorHandler)
export default app
