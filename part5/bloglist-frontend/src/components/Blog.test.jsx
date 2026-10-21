import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog.jsx'
const blog = { id: 'demo-blog', title: 'Testing with intent', author: 'Demo Author', url: 'https://example.com/intent', likes: 7, user: { username: 'owner', name: 'Demo Owner' } }
function setup(user = { username: 'owner' }) {
  const onLike = vi.fn()
  const onRemove = vi.fn()
  render(<Blog blog={blog} user={user} onLike={onLike} onRemove={onRemove} />)
  return { onLike, onRemove, user: userEvent.setup() }
}
test('title and author are shown; URL and likes are hidden initially', () => {
  setup()
  expect(screen.getByText(blog.title)).toBeVisible()
  expect(screen.getByText(blog.author)).toBeVisible()
  expect(screen.queryByText(blog.url)).not.toBeInTheDocument()
  expect(screen.queryByTestId('likes')).not.toBeInTheDocument()
})
test('view reveals URL, likes, and creator; hide closes details', async () => {
  const { user } = setup()
  await user.click(screen.getByRole('button', { name: 'view' }))
  expect(screen.getByRole('link', { name: blog.url })).toBeVisible()
  expect(screen.getByTestId('likes')).toHaveTextContent('7')
  expect(screen.getByText('Added by Demo Owner')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'hide' }))
  expect(screen.queryByTestId('likes')).not.toBeInTheDocument()
})
test('two like clicks call the received handler twice with the blog', async () => {
  const { user, onLike } = setup()
  await user.click(screen.getByRole('button', { name: 'view' }))
  await user.click(screen.getByRole('button', { name: 'like', exact: true }))
  await user.click(screen.getByRole('button', { name: 'like', exact: true }))
  expect(onLike).toHaveBeenCalledTimes(2)
  expect(onLike).toHaveBeenLastCalledWith(blog)
})
test('only the creator sees remove and confirmation can be cancelled', async () => {
  const { user, onRemove } = setup()
  await user.click(screen.getByRole('button', { name: 'view' }))
  await user.click(screen.getByRole('button', { name: 'remove', exact: true }))
  expect(onRemove).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Keep blog' }))
  expect(screen.queryByRole('group', { name: 'Confirm removal' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'remove', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Confirm removal' }))
  expect(onRemove).toHaveBeenCalledWith(blog)
})
test('another user cannot see removal controls', async () => {
  const { user } = setup({ username: 'reader' })
  await user.click(screen.getByRole('button', { name: 'view' }))
  expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument()
})
