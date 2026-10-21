import 'dotenv/config'
import mongoose from 'mongoose'
import Person from './models/person.js'

const [password, name, number] = process.argv.slice(2)
const template = process.env.MONGODB_URI_TEMPLATE
const uri = template ? template.replace('<password>', encodeURIComponent(password || '')) : process.env.MONGODB_URI

if (!uri || (template && !password) || Boolean(name) !== Boolean(number)) {
  console.error('Set MONGODB_URI (or MONGODB_URI_TEMPLATE). Usage: node mongo.js [password] ["Name" "number"]')
  process.exitCode = 1
} else {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    await Person.init()
    if (name && number) {
      const saved = await new Person({ name, number }).save()
      console.log(`added ${saved.name} number ${saved.number} to phonebook`)
    } else {
      console.log('phonebook:')
      const persons = await Person.find({})
      persons.forEach(person => console.log(`${person.name} ${person.number}`))
    }
  } catch (error) {
    console.error(`Database command failed: ${error.name}`)
    process.exitCode = 1
  } finally { await mongoose.disconnect() }
}
