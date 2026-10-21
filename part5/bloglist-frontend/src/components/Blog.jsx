import { useState } from 'react'
export default function Blog({ blog, user, onLike, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const owned = user?.username === blog.user?.username
  async function mutate(action) {
    if (busy) return
    setBusy(true)
    try { await action(blog) } finally { setBusy(false) }
  }
  const safeUrl = /^https?:\/\//i.test(blog.url) ? blog.url : undefined
  return <article className="blog" data-testid="blog">
    <div className="blog-summary"><strong>{blog.title}</strong> <span>{blog.author}</span> <button onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>{expanded ? 'hide' : 'view'}</button></div>
    {expanded && <div className="blog-details">
      <p><a href={safeUrl} rel="noreferrer" target="_blank">{blog.url}</a></p>
      <p>likes <span data-testid="likes">{blog.likes}</span> <button disabled={busy} onClick={() => mutate(onLike)}>like</button></p>
      <p>Added by {blog.user?.name || blog.user?.username}</p>
      {owned && !confirming && <button disabled={busy} onClick={() => setConfirming(true)}>remove</button>}
      {owned && confirming && <div role="group" aria-label="Confirm removal">
        <p>Remove {blog.title} by {blog.author}?</p>
        <button disabled={busy} onClick={() => mutate(onRemove)}>Confirm removal</button>
        <button disabled={busy} onClick={() => setConfirming(false)}>Keep blog</button>
      </div>}
    </div>}
  </article>
}
