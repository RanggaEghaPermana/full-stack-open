import mongoose from 'mongoose'
export async function connect(uri) {
  if (!uri) throw new Error('A MongoDB URI is required')
  await mongoose.connect(uri)
}
