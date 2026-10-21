import axios from 'axios'
const getAll = signal => axios.get('https://studies.cs.helsinki.fi/restcountries/api/all', { signal }).then(response => response.data)
const getWeather = (latitude, longitude, signal) => axios.get('https://api.open-meteo.com/v1/forecast', {
  signal,
  params: { latitude, longitude, current: 'temperature_2m,wind_speed_10m,weather_code', wind_speed_unit: 'ms', timezone: 'auto' },
}).then(response => response.data)
export default { getAll, getWeather }
