import { test, expect } from '@playwright/test'
const backend = 'http://127.0.0.1:3006'
const owner = { username: 'demo-owner', name: 'Demo Owner', password: 'fictional-owner-password' }
const other = { username: 'demo-reader', name: 'Demo Reader', password: 'fictional-reader-password' }
async function login(page, user = owner) {
  await page.getByLabel('username', { exact: true }).fill(user.username)
  await page.getByLabel('password', { exact: true }).fill(user.password)
  await page.getByRole('button', { name: 'login', exact: true }).click()
  await expect(page.getByText(`${user.name} logged in`)).toBeVisible()
}
async function createBlog(page, title) {
  await page.getByRole('button', { name: 'create new blog', exact: true }).click()
  await page.getByLabel('title', { exact: true }).fill(title)
  await page.getByLabel('author', { exact: true }).fill('Demo Author')
  await page.getByLabel('url', { exact: true }).fill('https://example.com/blog')
  await page.getByRole('button', { name: 'create', exact: true }).click()
  const blog = page.getByTestId('blog').filter({ hasText: title })
  await expect(blog).toBeVisible()
  return blog
}
test.beforeEach(async ({ page, request }) => {
  expect((await request.post(`${backend}/api/testing/reset`)).status()).toBe(204)
  for (const user of [owner, other]) expect((await request.post(`${backend}/api/users`, { data: user })).status()).toBe(201)
  await page.goto('/')
})
test('5.17 login form is displayed by default', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
  await expect(page.getByLabel('username', { exact: true })).toBeVisible()
  await expect(page.getByLabel('password', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Reading list' })).toHaveCount(0)
})
test('5.18 login succeeds with correct credentials', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('button', { name: 'logout', exact: true })).toBeVisible()
})
test('5.18 wrong credentials show an error and keep blogs hidden', async ({ page }) => {
  await page.getByLabel('username', { exact: true }).fill(owner.username)
  await page.getByLabel('password', { exact: true }).fill('wrong')
  await page.getByRole('button', { name: 'login', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Invalid username or password')
  await expect(page.getByRole('heading', { name: 'Reading list' })).toHaveCount(0)
})
test.describe('when logged in', () => {
  test.beforeEach(async ({ page }) => { await login(page) })
  test('5.19 new blog is visible and creation form closes', async ({ page }) => {
    const blog = await createBlog(page, 'New reading')
    await expect(blog).toContainText('Demo Author')
    await expect(page.getByRole('button', { name: 'create new blog', exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Added New reading')
  })
  test('5.20 liking persists and retains creator details', async ({ page }) => {
    const blog = await createBlog(page, 'Like this')
    await blog.getByRole('button', { name: 'view', exact: true }).click()
    await blog.getByRole('button', { name: 'like', exact: true }).click()
    await expect(blog.getByTestId('likes')).toHaveText('1')
    await expect(blog).toContainText('Added by Demo Owner')
    await page.reload()
    await blog.getByRole('button', { name: 'view', exact: true }).click()
    await expect(blog.getByTestId('likes')).toHaveText('1')
  })
  test('5.21 creator can cancel then confirm deletion', async ({ page }) => {
    const blog = await createBlog(page, 'Remove this')
    await blog.getByRole('button', { name: 'view', exact: true }).click()
    await blog.getByRole('button', { name: 'remove', exact: true }).click()
    await blog.getByRole('button', { name: 'Keep blog', exact: true }).click()
    await expect(blog).toBeVisible()
    await blog.getByRole('button', { name: 'remove', exact: true }).click()
    await blog.getByRole('button', { name: 'Confirm removal', exact: true }).click()
    await expect(blog).toHaveCount(0)
    await page.reload()
    await expect(blog).toHaveCount(0)
  })
  test('5.22 only the creator sees removal controls', async ({ page }) => {
    const blog = await createBlog(page, 'Owner only')
    await blog.getByRole('button', { name: 'view', exact: true }).click()
    await expect(blog.getByRole('button', { name: 'remove', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'logout', exact: true }).click()
    await login(page, other)
    await blog.getByRole('button', { name: 'view', exact: true }).click()
    await expect(blog.getByRole('button', { name: 'remove', exact: true })).toHaveCount(0)
  })
  test('5.23 blogs sort by likes and reorder after a like', async ({ page }) => {
    await createBlog(page, 'Low')
    const high = await createBlog(page, 'High')
    const middle = await createBlog(page, 'Middle')
    for (const blog of [high, middle]) await blog.getByRole('button', { name: 'view', exact: true }).click()
    await middle.getByRole('button', { name: 'like', exact: true }).click()
    await expect(middle.getByTestId('likes')).toHaveText('1')
    for (const likes of ['1', '2']) {
      await high.getByRole('button', { name: 'like', exact: true }).click()
      await expect(high.getByTestId('likes')).toHaveText(likes)
    }
    await expect(page.getByTestId('blog').locator('strong')).toHaveText(['High', 'Middle', 'Low'])
    await middle.getByRole('button', { name: 'like', exact: true }).click()
    await expect(middle.getByTestId('likes')).toHaveText('2')
    await middle.getByRole('button', { name: 'like', exact: true }).click()
    await expect(middle.getByTestId('likes')).toHaveText('3')
    await expect(page.getByTestId('blog').locator('strong')).toHaveText(['Middle', 'High', 'Low'])
  })
  test('login survives reload and logout clears persistent session', async ({ page }) => {
    await page.reload()
    await expect(page.getByText('Demo Owner logged in')).toBeVisible()
    await page.getByRole('button', { name: 'logout', exact: true }).click()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
  })
})
