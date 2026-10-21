import { Router } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user.js'
const router = Router()
router.get('/', async (_request, response) => {
  response.json(await User.find({}).populate('blogs', 'title author url likes'))
})
router.post('/', async (request, response) => {
  const { username, password, name } = request.body ?? {}
  if (typeof username !== 'string' || username.trim().length < 3 || typeof password !== 'string' || password.length < 3) {
    return response.status(400).json({ error: 'username and password must each contain at least 3 characters' })
  }
  if (Buffer.byteLength(password, 'utf8') > 72) return response.status(400).json({ error: 'password exceeds bcrypt limit of 72 bytes' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await new User({ username, name, passwordHash }).save()
  response.status(201).json(user)
})
export default router
