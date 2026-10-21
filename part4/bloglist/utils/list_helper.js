export const dummy = (_blogs) => 1
export const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)
export const favoriteBlog = (blogs) => blogs.reduce((best, blog) => !best || blog.likes > best.likes ? blog : best, null)
function authorTotals(blogs, field) {
  const totals = new Map()
  for (const blog of blogs) totals.set(blog.author, (totals.get(blog.author) || 0) + (field === 'blogs' ? 1 : blog.likes))
  let winner = null
  for (const [author, count] of totals) if (!winner || count > winner[field]) winner = { author, [field]: count }
  return winner
}
export const mostBlogs = (blogs) => authorTotals(blogs, 'blogs')
export const mostLikes = (blogs) => authorTotals(blogs, 'likes')
