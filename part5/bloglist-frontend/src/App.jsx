import { useEffect, useRef, useState } from 'react'
import blogsService from './services/blogs.js'
import login from './services/login.js'
import Blog from './components/Blog.jsx'
import BlogForm from './components/BlogForm.jsx'
import LoginForm from './components/LoginForm.jsx'
import Togglable from './components/Togglable.jsx'
const storageKey = 'fso-bloglist-user'
function storedUser() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey))
    return typeof value?.token === 'string' && typeof value?.username === 'string' ? value : null
  } catch { return null }
}
export default function App() {
  const [user, setUser] = useState(storedUser)
  const [blogs, setBlogs] = useState([])
  const [notice, setNotice] = useState(null)
  const timer = useRef(null)
  const formRef = useRef(null)
  function notify(text, error = false) {
    clearTimeout(timer.current)
    setNotice({ text, error })
    timer.current = setTimeout(() => setNotice(null), 5000)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    blogsService.setToken(user?.token ?? null)
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        const result = await blogsService.getAll()
        if (!cancelled) setBlogs(result)
      } catch {
        if (!cancelled) notify('Could not load blogs', true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])
  function logout() {
    localStorage.removeItem(storageKey)
    blogsService.setToken(null)
    setUser(null)
    setBlogs([])
  }
  function handleFailure(error) {
    if (error.response?.status === 401) {
      logout()
      notify('Session expired. Please log in again.', true)
    } else notify(error.response?.data?.error || 'Operation failed. Please try again.', true)
  }
  async function handleLogin(credentials) {
    try {
      const result = await login(credentials)
      localStorage.setItem(storageKey, JSON.stringify(result))
      blogsService.setToken(result.token)
      setUser(result)
      notify(`Welcome ${result.name || result.username}`)
      return true
    } catch {
      notify('Invalid username or password', true)
      return false
    }
  }
  async function createBlog(input) {
    try {
      const saved = await blogsService.create(input)
      setBlogs(current => [...current, saved])
      formRef.current.hide()
      notify(`Added ${saved.title} by ${saved.author}`)
      return saved
    } catch (error) { handleFailure(error); return null }
  }
  async function likeBlog(blog) {
    try {
      const updated = await blogsService.update({ ...blog, likes: blog.likes + 1 })
      setBlogs(current => current.map(item => item.id === updated.id ? updated : item))
    } catch (error) { handleFailure(error) }
  }
  async function removeBlog(blog) {
    try {
      await blogsService.remove(blog.id)
      setBlogs(current => current.filter(item => item.id !== blog.id))
      notify(`Removed ${blog.title}`)
    } catch (error) { handleFailure(error) }
  }
  const sorted = [...blogs].sort((a, b) => b.likes - a.likes || a.title.localeCompare(b.title))
  return <main>
    <header><p className="eyebrow">FULL STACK OPEN · PART 5</p><h1>Blog List</h1></header>
    {notice && <div role={notice.error ? 'alert' : 'status'} className={`notice ${notice.error ? 'error' : ''}`}>{notice.text}</div>}
    {!user ? <LoginForm onLogin={handleLogin} /> : <>
      <p>{user.name || user.username} logged in <button onClick={logout}>logout</button></p>
      <Togglable buttonLabel="create new blog" ref={formRef}><BlogForm createBlog={createBlog} /></Togglable>
      <h2>Reading list</h2>
      {sorted.length === 0 && <p>No blogs yet. Add your first read.</p>}
      {sorted.map(blog => <Blog key={blog.id} blog={blog} user={user} onLike={likeBlog} onRemove={removeBlog} />)}
    </>}
  </main>
}
