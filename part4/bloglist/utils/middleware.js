import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/user.js'
import { secret } from './config.js'
import { error as logError } from './logger.js'
export function tokenExtractor(request, _response, next) {
  const header = request.get('authorization') || ''
  request.token = /^Bearer /i.test(header) ? header.slice(7) : null
  next()
}
export async function userExtractor(request, response, next) {
  if (!request.token) return response.status(401).json({ error: 'token missing' })
  const decoded = jwt.verify(request.token, secret, { algorithms: ['HS256'] })
  if (!mongoose.isObjectIdOrHexString(decoded.id)) return response.status(401).json({ error: 'token invalid' })
  const user = await User.findById(decoded.id)
  if (!user) return response.status(401).json({ error: 'user no longer exists' })
  request.user = user
  next()
}
export function unknownEndpoint(_request, response) {
  response.status(404).json({ error: 'unknown endpoint' })
}
export function errorHandler(error, _request, response, _next) {
  if (error.name === 'CastError') return response.status(400).json({ error: 'malformatted id or value' })
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message })
  if (error.code === 11000) return response.status(400).json({ error: 'username must be unique' })
  if (error.name === 'TokenExpiredError') return response.status(401).json({ error: 'token expired' })
  if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') return response.status(401).json({ error: 'token invalid' })
  if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'invalid JSON' })
  logError(error.name)
  response.status(500).json({ error: 'internal server error' })
}
