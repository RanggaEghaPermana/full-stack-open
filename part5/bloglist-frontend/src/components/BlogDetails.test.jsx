import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogDetails from './BlogDetails.jsx'
const blog = { id: 'demo', title: 'Testing with intent', author: 'Demo Author', url: 'https://example.com/intent', likes: 7, user: { username: 'owner', name: 'Demo Owner' } }
function setup(user) {
  const onLike = vi.fn(), onRemove = vi.fn()
  render(<BlogDetails blog={blog} user={user} onLike={onLike} onRemove={onRemove} />)
  return { onLike, onRemove, actions: userEvent.setup() }
}
test('anonymous visitors see all information and no mutation buttons', () => {
  setup(null)
  expect(screen.getByRole('heading', { name: blog.title })).toBeVisible()
  expect(screen.getByText('by Demo Author')).toBeVisible()
  expect(screen.getByRole('link', { name: blog.url })).toBeVisible()
  expect(screen.getByTestId('likes')).toHaveTextContent('7')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
test('signed-in noncreator sees only like; two clicks call handler twice', async () => {
  const { actions, onLike } = setup({ username: 'reader' })
  expect(screen.getAllByRole('button')).toHaveLength(1)
  await actions.click(screen.getByRole('button', { name: 'like', exact: true }))
  await actions.click(screen.getByRole('button', { name: 'like', exact: true }))
  expect(onLike).toHaveBeenCalledTimes(2)
  expect(onLike).toHaveBeenLastCalledWith(blog)
  expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument()
})
test('creator sees like and remove; deletion requires confirmation and supports cancel', async () => {
  const { actions, onRemove } = setup({ username: 'owner' })
  expect(screen.getByRole('button', { name: 'like', exact: true })).toBeVisible()
  await actions.click(screen.getByRole('button', { name: 'remove', exact: true }))
  expect(onRemove).not.toHaveBeenCalled()
  await actions.click(screen.getByRole('button', { name: 'Keep blog' }))
  await actions.click(screen.getByRole('button', { name: 'remove', exact: true }))
  await actions.click(screen.getByRole('button', { name: 'Confirm removal' }))
  expect(onRemove).toHaveBeenCalledWith(blog)
})
