import axios from 'axios'
export default async function login(credentials) {
  return (await axios.post('/api/login', credentials)).data
}
