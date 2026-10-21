import mongoose from 'mongoose'
import Person from '../models/person.js'

let connectionPromise
const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return
  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is required')
    connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 }).then(() => Person.init()).catch(error => {
      connectionPromise = undefined
      throw error
    })
  }
  await connectionPromise
}
export default connectDatabase
