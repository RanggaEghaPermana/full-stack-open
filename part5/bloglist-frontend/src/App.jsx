import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import blogsService from './services/blogs.js'
import login from './services/login.js'
import BlogDetails from './components/BlogDetails.jsx'
import { Navigation, FormSurface, Notice } from './components/StyledUI.jsx'
import BlogForm from './components/BlogForm.jsx'
import LoginForm from './components/LoginForm.jsx'
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
  const navigate = useNavigate()
  function notify(text, error = false) {
    clearTimeout(timer.current)
    setNotice({ text, error })
    timer.current = setTimeout(() => setNotice(null), 5000)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    blogsService.setToken(user?.token ?? null)
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
    navigate('/')
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
      navigate('/')
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
      navigate('/')
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
      navigate('/')
    } catch (error) { handleFailure(error) }
  }
  const sorted = [...blogs].sort((a, b) => b.likes - a.likes || a.title.localeCompare(b.title))
  return <main>
    <header><p className="eyebrow">FULL STACK OPEN · PART 5</p><h1>Blog List</h1></header>
    <Navigation aria-label="Main navigation">
      <NavLink to="/" end>blogs</NavLink>
      {user ? <><NavLink to="/create">create new blog</NavLink><span className="session">{user.name || user.username} logged in <button onClick={logout}>logout</button></span></> : <NavLink to="/login">login</NavLink>}
    </Navigation>
    {notice && <Notice role={notice.error ? 'alert' : 'status'} $error={notice.error}>{notice.text}</Notice>}
    <Routes>
      <Route path="/" element={<section><h2>Reading list</h2>
        {sorted.length === 0 && <p>No blogs yet. Add your first read.</p>}
        {sorted.map(blog => <article className="blog" data-testid="blog" key={blog.id}>
          <strong><Link to={`/blogs/${blog.id}`}>{blog.title}</Link></strong> <span>{blog.author}</span>
          <p>likes {blog.likes}</p>
        </article>)}
      </section>} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <FormSurface><LoginForm onLogin={handleLogin} /></FormSurface>} />
      <Route path="/create" element={user ? <FormSurface><BlogForm createBlog={createBlog} /><Link to="/">cancel</Link></FormSurface> : <Navigate to="/login" replace />} />
      <Route path="/blogs/:id" element={<BlogRoute blogs={blogs} user={user} onLike={likeBlog} onRemove={removeBlog} />} />
      <Route path="*" element={<section><h2>Page not found</h2><Link to="/">Back to blogs</Link></section>} />
    </Routes>
  </main>
}
function BlogRoute({ blogs, ...props }) {
  const { id } = useParams()
  return <BlogDetails key={id} blog={blogs.find(blog => blog.id === id)} {...props} />
}
