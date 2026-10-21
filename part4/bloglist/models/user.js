import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3, unique: true, trim: true },
  name: { type: String, default: '' },
  passwordHash: { type: String, required: true },
}, { toJSON: { virtuals: true } })
schema.virtual('blogs', { ref: 'Blog', localField: '_id', foreignField: 'user' })
schema.set('toJSON', { virtuals: true, transform: (_doc, result) => {
  result.id = result._id.toString()
  delete result._id
  delete result.__v
  delete result.passwordHash
} })
export default mongoose.model('User', schema)
