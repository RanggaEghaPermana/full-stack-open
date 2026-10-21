import { useEffect, useState } from 'react'
import countryService from './services/countries.js'
import Country from './components/Country.jsx'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    countryService.getAll(controller.signal).then(setCountries).catch(failure => {
      if (failure.code !== 'ERR_CANCELED') setError('Could not load countries. Please reload to try again.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const matches = countries.filter(country => country.name.common.toLowerCase().includes(query.trim().toLowerCase()))
  const shown = selected || (matches.length === 1 ? matches[0] : null)
  return (
    <main>
      <label>find countries <input value={query} onChange={event => { setQuery(event.target.value); setSelected(null) }} /></label>
      {loading ? <p>Loading countries…</p> : error ? <p role="alert">{error}</p>
        : shown ? <Country key={shown.cca3} country={shown} />
          : matches.length > 10 ? <p>Too many matches, specify another filter</p>
            : matches.length === 0 ? <p>No matching countries</p>
              : <ul>{matches.map(country => (
                <li key={country.cca3}>{country.name.common}{' '}
                  <button onClick={() => setSelected(country)} aria-label={`show ${country.name.common}`}>show</button>
                </li>
              ))}</ul>}
    </main>
  )
}
export default App
