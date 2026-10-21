import { useState } from 'react'
import styled from 'styled-components'
const Card = styled.article`
  background: white; border: 1px solid #d2dde5; border-radius: 14px;
  padding: clamp(20px, 5vw, 36px); box-shadow: 0 5px 20px #1725360a;
  h2 { margin-top: 0; font-size: 1.7rem; }
  .author { color: #526779; }
  .likes { font-size: 1.15rem; padding: 12px 0; }
`
export default function BlogDetails({ blog, user, onLike, onRemove }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!blog) return <p>Blog not found.</p>
  async function mutate(action) {
    if (busy) return
    setBusy(true)
    try { await action(blog) } finally { setBusy(false) }
  }
  return <Card data-testid="blog-details">
    <h2>{blog.title}</h2><p className="author">by {blog.author}</p>
    <p><a href={/^https?:\/\//i.test(blog.url) ? blog.url : undefined} target="_blank" rel="noreferrer">{blog.url}</a></p>
    <p className="likes">likes <span data-testid="likes">{blog.likes}</span> {user && <button disabled={busy} onClick={() => mutate(onLike)}>like</button>}</p>
    <p>Added by {blog.user?.name || blog.user?.username}</p>
    {user?.username === blog.user?.username && (confirming ? <div role="group" aria-label="Confirm removal">
      <p>Remove {blog.title} by {blog.author}?</p>
      <button disabled={busy} onClick={() => mutate(onRemove)}>Confirm removal</button>
      <button disabled={busy} onClick={() => setConfirming(false)}>Keep blog</button>
    </div> : <button disabled={busy} onClick={() => setConfirming(true)}>remove</button>)}
  </Card>
}
