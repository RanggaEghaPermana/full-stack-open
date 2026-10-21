import axios from 'axios'
let token = null
const setToken = (value) => { token = value }
const headers = () => ({ Authorization: `Bearer ${token}` })
const getAll = async () => (await axios.get('/api/blogs')).data
const create = async (blog) => (await axios.post('/api/blogs', blog, { headers: headers() }, { headers: headers() })).data
const update = async (blog) => (await axios.put(`/api/blogs/${blog.id}`, {
  title: blog.title, author: blog.author, url: blog.url, user: blog.user.id, likes: blog.likes,
}, { headers: headers() })).data
const remove = async (id) => { await axios.delete(`/api/blogs/${id}`, { headers: headers() }) }
export default { setToken, getAll, create, update, remove }
