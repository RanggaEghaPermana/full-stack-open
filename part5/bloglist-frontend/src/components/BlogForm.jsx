import { useState } from 'react'
export default function BlogForm({ createBlog }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const saved = await createBlog({ title, author, url })
      if (saved) { setTitle(''); setAuthor(''); setUrl('') }
    } finally { setBusy(false) }
  }
  return <form onSubmit={submit} aria-label="Create a blog">
    <h2>Create a new blog</h2>
    <label>title<input required value={title} onChange={e => setTitle(e.target.value)} /></label>
    <label>author<input value={author} onChange={e => setAuthor(e.target.value)} /></label>
    <label>url<input required type="url" value={url} onChange={e => setUrl(e.target.value)} /></label>
    <button disabled={busy} type="submit">{busy ? 'creating…' : 'create'}</button>
  </form>
}
