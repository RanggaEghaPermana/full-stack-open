import 'dotenv/config'
export const port = Number(process.env.PORT || 3005)
export const mongoUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
export const secret = process.env.SECRET
