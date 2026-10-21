import { useEffect, useRef, useState } from 'react'
import personService from './services/persons.js'
import Filter from './components/Filter.jsx'
import PersonForm from './components/PersonForm.jsx'
import Persons from './components/Persons.jsx'
import Notification from './components/Notification.jsx'
import Confirmation from './components/Confirmation.jsx'
import './index.css'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [pending, setPending] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const notificationTimer = useRef(null)

  const notify = (message, type = 'success') => {
    clearTimeout(notificationTimer.current)
    setNotification({ message, type })
    notificationTimer.current = setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    let active = true
    personService.getAll().then(data => {
      if (active) setPersons(data)
    }).catch(() => {
      if (active) setNotification({ type: 'error', message: 'Could not load the phonebook. Check that the server is running, then reload.' })
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; clearTimeout(notificationTimer.current) }
  }, [])

  const clearForm = () => { setNewName(''); setNewNumber('') }

  const addPerson = async event => {
    event.preventDefault()
    const name = newName.trim()
    const number = newNumber.trim()
    if (!name || !number) { notify('Name and number are required.', 'error'); return }
    const existing = persons.find(person => person.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (existing.number === number) { notify(`${existing.name} is already added to the phonebook.`, 'error'); return }
      setPending({ type: 'update', person: existing, number })
      return
    }
    setBusy(true)
    try {
      const saved = await personService.create({ name, number })
      setPersons(current => current.concat(saved))
      clearForm()
      notify(`Added ${saved.name}`)
    } catch { notify(`Could not add ${name}. Try again.`, 'error') }
    finally { setBusy(false) }
  }

  const confirmChange = async () => {
    const change = pending
    if (!change || busy) return
    setBusy(true)
    try {
      if (change.type === 'delete') {
        await personService.remove(change.person.id)
        setPersons(current => current.filter(person => person.id !== change.person.id))
        notify(`Deleted ${change.person.name}`)
      } else {
        const saved = await personService.update(change.person.id, { ...change.person, number: change.number })
        setPersons(current => current.map(person => person.id === saved.id ? saved : person))
        clearForm()
        notify(`Updated ${saved.name}`)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setPersons(current => current.filter(person => person.id !== change.person.id))
        notify(`${change.person.name} has already been removed from the server.`, 'error')
      } else { notify(`Could not ${change.type} ${change.person.name}. Try again.`, 'error') }
    } finally { setPending(null); setBusy(false) }
  }

  const visible = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
  return (
    <main>
      <h1>Phonebook</h1>
      <Notification notification={notification} />
      <Filter value={filter} onChange={event => setFilter(event.target.value)} />
      <h2>Add a new</h2>
      <PersonForm name={newName} number={newNumber} onNameChange={event => setNewName(event.target.value)}
        onNumberChange={event => setNewNumber(event.target.value)} onSubmit={addPerson} disabled={loading || busy || Boolean(pending)} />
      <Confirmation pending={pending} onConfirm={confirmChange} onCancel={() => setPending(null)} disabled={busy} />
      <h2>Numbers</h2>
      {loading ? <p>Loading phonebook…</p> : <Persons persons={visible} onDelete={person => setPending({ type: 'delete', person })} disabled={busy || Boolean(pending)} />}
    </main>
  )
}
export default App
