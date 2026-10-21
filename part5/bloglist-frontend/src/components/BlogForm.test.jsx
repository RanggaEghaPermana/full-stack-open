import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm.jsx'
test('submits entered title, author and URL to parent and clears after success', async () => {
  const createBlog = vi.fn().mockResolvedValue({ id: 'new' })
  const user = userEvent.setup()
  render(<BlogForm createBlog={createBlog} />)
  await user.type(screen.getByLabelText('title'), 'Intentional tests')
  await user.type(screen.getByLabelText('author'), 'Demo Writer')
  await user.type(screen.getByLabelText('url'), 'https://example.com/tests')
  await user.click(screen.getByRole('button', { name: 'create', exact: true }))
  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog).toHaveBeenCalledWith({ title: 'Intentional tests', author: 'Demo Writer', url: 'https://example.com/tests' })
  expect(screen.getByLabelText('title')).toHaveValue('')
})
test('keeps entered content after a failed operation', async () => {
  const user = userEvent.setup()
  render(<BlogForm createBlog={vi.fn().mockResolvedValue(null)} />)
  await user.type(screen.getByLabelText('title'), 'Retry this')
  await user.type(screen.getByLabelText('url'), 'https://example.com/retry')
  await user.click(screen.getByRole('button', { name: 'create', exact: true }))
  expect(screen.getByLabelText('title')).toHaveValue('Retry this')
})
