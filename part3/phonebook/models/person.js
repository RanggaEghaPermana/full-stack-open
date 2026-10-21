import mongoose from 'mongoose'

const personSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minLength: [3, 'Name must contain at least 3 characters'] },
  number: {
    type: String,
    required: [true, 'Number is required'],
    trim: true,
    minLength: [8, 'Number must contain at least 8 characters'],
    validate: { validator: value => /^\d{2,3}-\d+$/.test(value), message: 'Number must have 2 or 3 digits, a hyphen, then digits only' },
  },
  nameKey: { type: String, unique: true, required: true },
})

personSchema.pre('validate', function () {
  if (this.name) this.nameKey = this.name.toLowerCase()
})
personSchema.set('toJSON', {
  transform: (document, object) => {
    object.id = object._id.toString()
    delete object._id
    delete object.__v
    delete object.nameKey
  },
})
export default mongoose.model('Person', personSchema)
