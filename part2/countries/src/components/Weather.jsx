import { useEffect, useState } from 'react'
import countryService from '../services/countries.js'

const condition = code => {
  if (code === 0) return 'Clear sky'
  if (code >= 1 && code <= 3) return 'Cloudy'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Weather conditions unavailable'
}

const Weather = ({ country }) => {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const coordinates = country.capitalInfo?.latlng
  const latitude = coordinates?.[0]
  const longitude = coordinates?.[1]

  useEffect(() => {
    if (latitude == null || longitude == null) return
    const controller = new AbortController()
    countryService.getWeather(latitude, longitude, controller.signal).then(setResult).catch(failure => {
      if (failure.code !== 'ERR_CANCELED') setError('Could not load weather. Please try again.')
    })
    return () => controller.abort()
  }, [latitude, longitude, attempt])

  if (!country.capital?.length || latitude == null || longitude == null) return <p>No capital weather data available.</p>
  return (
    <section>
      <h2>Weather in {country.capital[0]}</h2>
      {error ? <p role="alert">{error} <button onClick={() => { setError(''); setResult(null); setAttempt(value => value + 1) }}>Retry weather</button></p>
        : result?.current ? <>
          <p>temperature {result.current.temperature_2m} {result.current_units.temperature_2m}</p>
          <p>{condition(result.current.weather_code)}</p>
          <p>wind {result.current.wind_speed_10m} {result.current_units.wind_speed_10m}</p>
          <p>Updated {result.current.time} ({result.timezone})</p>
        </> : <p>Loading weather…</p>}
      <p>Weather data: <a href="https://open-meteo.com/">Open-Meteo</a></p>
    </section>
  )
}
export default Weather
