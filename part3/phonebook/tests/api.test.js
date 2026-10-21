import { before, after, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app.js'
import Person from '../models/person.js'
import connectDatabase from '../utils/database.js'

const api = supertest(app)
let mongo
process.env.NODE_ENV = 'test'

before(async () => {
  mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } })
  process.env.MONGODB_URI = mongo.getUri('phonebook_integration_test')
  await connectDatabase()
})
beforeEach(async () => {
  await Person.deleteMany({})
  await Person.create({ name: 'Test Person', number: '040-1234567' })
})
after(async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
})

test('GET returns normalized ids and info reflects stored count', async () => {
  const response = await api.get('/api/persons').expect(200).expect('Content-Type', /json/)
  assert.equal(response.body.length, 1)
  assert.equal(typeof response.body[0].id, 'string')
  assert.equal(response.body[0]._id, undefined)
  assert.equal(response.body[0].nameKey, undefined)
  const info = await api.get('/info').expect(200)
  assert.match(info.text, /info for 1 people/)
  assert.match(info.text, /GMT/)
})

test('POST persists a record, GET retrieves it, PUT updates it, DELETE removes it', async () => {
  const created = await api.post('/api/persons').send({ name: 'New Person', number: '09-1234567' }).expect(201)
  const id = created.body.id
  assert.equal((await Person.findById(id)).number, '09-1234567')
  await api.get(`/api/persons/${id}`).expect(200)
  await api.put(`/api/persons/${id}`).send({ name: 'New Person', number: '040-7654321' }).expect(200)
  assert.equal((await Person.findById(id)).number, '040-7654321')
  await api.delete(`/api/persons/${id}`).expect(204)
  assert.equal(await Person.findById(id), null)
  await api.get(`/api/persons/${id}`).expect(404)
  await api.delete(`/api/persons/${id}`).expect(404)
  await api.put(`/api/persons/${id}`).send({ name: 'New Person', number: '040-1234567' }).expect(404)
})

test('POST rejects missing fields, short names, and invalid phone formats', async () => {
  const invalid = [
    {}, { name: 'Only Name' }, { number: '040-1234567' },
    { name: 'Ab', number: '040-1234567' },
    ...['1234556', '1-22334455', '10-22-334455', '09-123', '040-abcd123'].map(number => ({ name: 'Invalid Contact', number })),
  ]
  for (const body of invalid) {
    const response = await api.post('/api/persons').send(body).expect(400)
    assert.equal(typeof response.body.error, 'string')
  }
  assert.equal(await Person.countDocuments({}), 1)
})

test('POST prevents case-insensitive duplicate names', async () => {
  const response = await api.post('/api/persons').send({ name: 'TEST PERSON', number: '09-1234567' }).expect(400)
  assert.match(response.body.error, /unique/i)
  assert.equal(await Person.countDocuments({}), 1)
})

test('PUT applies full validation and leaves existing data unchanged on failure', async () => {
  const original = await Person.findOne({})
  for (const body of [{ name: 'Ab', number: original.number }, { name: original.name, number: '1-234' }]) {
    await api.put(`/api/persons/${original.id}`).send(body).expect(400)
  }
  const saved = await Person.findById(original.id)
  assert.equal(saved.name, original.name)
  assert.equal(saved.number, original.number)
})

test('malformed ids and JSON have 400 responses; unknown routes have 404 responses', async () => {
  await api.get('/api/persons/not-an-id').expect(400)
  await api.delete('/api/persons/not-an-id').expect(400)
  await api.post('/api/persons').set('Content-Type', 'application/json').send('{ broken').expect(400)
  await api.get('/api/unknown').expect(404)
})

test('mongo.js creates and lists records against the same real MongoDB process', async () => {
  const run = promisify(execFile)
  const options = { cwd: process.cwd(), env: process.env }
  const added = await run(process.execPath, ['mongo.js', 'unused-local-password', 'CLI Contact', '040-1234567'], options)
  assert.match(added.stdout, /added CLI Contact/)
  const listed = await run(process.execPath, ['mongo.js'], options)
  assert.match(listed.stdout, /CLI Contact 040-1234567/)
  assert.equal(await Person.countDocuments({ name: 'CLI Contact' }), 1)
})
