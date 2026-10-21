import { before, beforeEach, after, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import supertest from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Set test-only configuration before importing the application.
process.env.SECRET = randomBytes(32).toString('hex')
let mongo, api, Blog, User, owner, other, token, otherToken, blog
const validBlog = { title: 'Understanding middleware', author: 'Demo Author', url: 'https://example.com/middleware', likes: 3 }
const password = 'fictional-test-password'
before(async () => {
  mongo = await MongoMemoryServer.create()
  process.env.TEST_MONGODB_URI = mongo.getUri('fso_bloglist_test')
  const { connect } = await import('../utils/database.js')
  const { mongoUri } = await import('../utils/config.js')
  assert.equal(mongoUri, process.env.TEST_MONGODB_URI)
  await connect(mongoUri)
  Blog = (await import('../models/blog.js')).default
  User = (await import('../models/user.js')).default
  await User.init()
  api = supertest((await import('../app.js')).default)
})
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(password, 4)
  owner = await User.create({ username: 'demo-owner', name: 'Demo Owner', passwordHash })
  other = await User.create({ username: 'demo-other', name: 'Other User', passwordHash })
  token = (await api.post('/api/login').send({ username: owner.username, password }).expect(200)).body.token
  otherToken = (await api.post('/api/login').send({ username: other.username, password }).expect(200)).body.token
  blog = await Blog.create({ ...validBlog, user: owner.id })
})
after(async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
})

describe('blog reading and creation', () => {
  test('GET returns seeded count, JSON, id and populated creator without credentials', async () => {
    const { body } = await api.get('/api/blogs').expect(200).expect('Content-Type', /json/)
    assert.equal(body.length, 1)
    assert.equal(body[0].id, blog.id)
    assert.equal(body[0]._id, undefined)
    assert.equal(body[0].user.username, owner.username)
    assert.equal(body[0].user.passwordHash, undefined)
  })
  test('authenticated POST persists content and assigns token owner, ignoring supplied user', async () => {
    const { body } = await api.post('/api/blogs').auth(token, { type: 'bearer' }).send({ ...validBlog, title: 'New blog', user: other.id }).expect(201)
    assert.equal(await Blog.countDocuments(), 2)
    const saved = await Blog.findById(body.id)
    assert.equal(saved.title, 'New blog')
    assert.equal(saved.url, validBlog.url)
    assert.equal(saved.user.toString(), owner.id)
    assert.equal(body.user.id, owner.id)
  })
  test('omitted likes default to zero in response and database', async () => {
    const input = { ...validBlog }; delete input.likes
    const { body } = await api.post('/api/blogs').auth(token, { type: 'bearer' }).send(input).expect(201)
    assert.equal(body.likes, 0)
    assert.equal((await Blog.findById(body.id)).likes, 0)
  })
  for (const field of ['title', 'url']) test(`missing ${field} returns400 and leaves count unchanged`, async () => {
    const input = { ...validBlog }; delete input[field]
    const response = await api.post('/api/blogs').auth(token, { type: 'bearer' }).send(input).expect(400)
    assert(response.body.error.includes(field))
    assert.equal(await Blog.countDocuments(), 1)
  })
  test('missing and invalid tokens return401 and do not save', async () => {
    await api.post('/api/blogs').send(validBlog).expect(401)
    await api.post('/api/blogs').auth('invalid', { type: 'bearer' }).send(validBlog).expect(401)
    await api.put(`/api/blogs/${blog.id}`).send({ likes: 4 }).expect(401)
    assert.equal(await Blog.countDocuments(), 1)
  })
  test('expired, nonexistent-user, and malformed-identity tokens are rejected', async () => {
    const expired = jwt.sign({ id: owner.id }, process.env.SECRET, { expiresIn: -1 })
    const missingUser = jwt.sign({ id: new mongoose.Types.ObjectId().toString() }, process.env.SECRET)
    const badId = jwt.sign({ id: 'bad' }, process.env.SECRET)
    for (const value of [expired, missingUser, badId]) await api.post('/api/blogs').auth(value, { type: 'bearer' }).send(validBlog).expect(401)
    assert.equal(await Blog.countDocuments(), 1)
  })
})
describe('blog updates and deletion', () => {
  test('PUT changes likes, persists and preserves ownership and content', async () => {
    const { body } = await api.put(`/api/blogs/${blog.id}`).auth(token, { type: 'bearer' }).send({ likes: 12, title: 'Attempted overwrite', user: other.id }).expect(200)
    assert.equal(body.likes, 12)
    const stored = await Blog.findById(blog.id)
    assert.equal(stored.likes, 12)
    assert.equal(stored.title, validBlog.title)
    assert.equal(stored.user.toString(), owner.id)
  })
  test('invalid likes do not change saved document', async () => {
    for (const likes of [-1, '7', null]) await api.put(`/api/blogs/${blog.id}`).auth(token, { type: 'bearer' }).send({ likes }).expect(400)
    assert.equal((await Blog.findById(blog.id)).likes, 3)
  })
  test('creator deletion returns204 and removes blog from populated user list', async () => {
    await api.delete(`/api/blogs/${blog.id}`).auth(token, { type: 'bearer' }).expect(204)
    assert.equal(await Blog.countDocuments(), 0)
    const { body } = await api.get('/api/users').expect(200)
    assert.deepEqual(body.find(u => u.id === owner.id).blogs, [])
  })
  test('another user and missing token cannot delete', async () => {
    await api.delete(`/api/blogs/${blog.id}`).expect(401)
    await api.delete(`/api/blogs/${blog.id}`).auth(otherToken, { type: 'bearer' }).expect(403)
    assert(await Blog.findById(blog.id))
  })
  test('malformed and absent ids return400/404', async () => {
    const absent = new mongoose.Types.ObjectId().toString()
    for (const [id, code] of [['bad', 400], [absent, 404]]) {
      await api.get(`/api/blogs/${id}`).expect(code)
      await api.put(`/api/blogs/${id}`).auth(token, { type: 'bearer' }).send({ likes: 2 }).expect(code)
      await api.delete(`/api/blogs/${id}`).auth(token, { type: 'bearer' }).expect(code)
    }
  })
})
describe('users and login', () => {
  test('user creation hashes password and never exposes it; login verifies hash', async () => {
    const { body } = await api.post('/api/users').send({ username: 'new-user', name: 'Fictional User', password }).expect(201)
    assert.equal(body.passwordHash, undefined)
    assert.equal(body.password, undefined)
    const saved = await User.findById(body.id)
    assert.notEqual(saved.passwordHash, password)
    assert(await bcrypt.compare(password, saved.passwordHash))
    const login = await api.post('/api/login').send({ username: 'new-user', password }).expect(200)
    assert.equal(jwt.verify(login.body.token, process.env.SECRET).id, body.id)
    await api.post('/api/login').send({ username: 'new-user', password: 'wrong' }).expect(401)
    await api.post('/api/login').send({ username: 'unknown', password }).expect(401)
    await api.post('/api/login').send({ username: {}, password: [] }).expect(401)
    await api.post('/api/login').expect(401)
    await api.post('/api/login').send({ username: 'new-user', password: 'x'.repeat(73) }).expect(401)
  })
  test('missing, short, duplicate and overlong credentials leave user count unchanged', async () => {
    for (const input of [
      { username: 'ok-user' }, { password }, { username: 'ab', password },
      { username: 'ok-user', password: 'ab' }, { username: owner.username, password },
      { username: 'ok-user', password: 'x'.repeat(73) },
    ]) {
      const { body } = await api.post('/api/users').send(input).expect(400)
      assert.equal(typeof body.error, 'string')
      assert.equal(await User.countDocuments(), 2)
    }
  })
  test('GET users populates blogs and excludes hashes everywhere', async () => {
    const { body } = await api.get('/api/users').expect(200)
    assert.equal(body.length, 2)
    assert.equal(body.find(u => u.id === owner.id).blogs[0].title, validBlog.title)
    for (const user of body) assert.equal(user.passwordHash, undefined)
    assert(!JSON.stringify(body).includes('password'))
  })
})
test('invalid JSON and unknown routes have JSON errors', async () => {
  await api.post('/api/users').set('Content-Type', 'application/json').send('{').expect(400)
  await api.post('/api/users').expect(400)
  await api.post('/api/blogs').auth(token, { type: 'bearer' }).expect(400)
  await api.put(`/api/blogs/${blog.id}`).auth(token, { type: 'bearer' }).expect(400)
  await api.get('/unknown').expect(404).expect('Content-Type', /json/)
})
