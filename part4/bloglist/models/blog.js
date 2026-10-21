import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: '', trim: true },
  url: { type: String, required: true, trim: true },
  likes: { type: Number, default: 0, min: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})
schema.set('toJSON', { transform: (_doc, result) => {
  result.id = result._id.toString()
  delete result._id
  delete result.__v
} })
export default mongoose.model('Blog', schema)
