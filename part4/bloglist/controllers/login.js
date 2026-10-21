import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { secret } from '../utils/config.js'
const router = Router()
router.post('/', async (request, response) => {
  const { username, password } = request.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) return response.status(401).json({ error: 'invalid username or password' })
  const user = await User.findOne({ username })
  if (!user || !await bcrypt.compare(password, user.passwordHash)) return response.status(401).json({ error: 'invalid username or password' })
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h', algorithm: 'HS256' })
  response.json({ token, username: user.username, name: user.name })
})
export default router
