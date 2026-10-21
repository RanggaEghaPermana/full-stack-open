const unknownEndpoint = (request, response) => response.status(404).json({ error: 'Unknown endpoint' })

// Express identifies this as error middleware from all four parameters.
const errorHandler = (error, request, response, next) => {
  if (response.headersSent) return next(error)
  if (error.name === 'CastError') return response.status(400).json({ error: 'Malformed person id' })
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: Object.values(error.errors).map(item => item.message).join('; ') })
  }
  if (error.code === 11000) return response.status(400).json({ error: 'Name must be unique' })
  if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'Invalid JSON body' })
  console.error('Request failed:', error.name)
  return response.status(503).json({ error: 'Service temporarily unavailable' })
}
export { unknownEndpoint, errorHandler }
