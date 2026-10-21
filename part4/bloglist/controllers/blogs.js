import { Router } from 'express'
import Blog from '../models/blog.js'
import { userExtractor } from '../utils/middleware.js'
const router = Router()
router.get('/', async (_request, response) => {
  response.json(await Blog.find({}).populate('user', 'username name'))
})
router.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', 'username name')
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  response.json(blog)
})
router.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body ?? {}
  const blog = new Blog({ title, author, url, likes, user: request.user._id })
  await blog.save()
  await blog.populate('user', 'username name')
  response.status(201).json(blog)
})
router.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  if (!blog.user.equals(request.user._id)) return response.status(403).json({ error: 'only the creator can delete this blog' })
  await blog.deleteOne()
  response.status(204).end()
})
// Public likes updates are intentional for the course. Ownership and other fields cannot be changed here.
router.put('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  if (typeof request.body?.likes !== 'number' || !Number.isFinite(request.body?.likes) || request.body?.likes < 0) {
    return response.status(400).json({ error: 'likes must be a non-negative number' })
  }
  blog.likes = request.body?.likes
  await blog.save()
  await blog.populate('user', 'username name')
  response.json(blog)
})
export default router
