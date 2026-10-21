import { useState } from 'react'
export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      if (await onLogin({ username, password })) { setUsername(''); setPassword('') }
    } finally { setBusy(false) }
  }
  return <form onSubmit={submit} aria-label="Login">
    <h2>Log in to application</h2>
    <label>username<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label>
    <label>password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
    <button disabled={busy} type="submit">{busy ? 'logging in…' : 'login'}</button>
  </form>
}
