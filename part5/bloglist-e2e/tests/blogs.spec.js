import { test, expect } from '@playwright/test'
const backend = 'http://127.0.0.1:3006'
const owner = { username: 'demo-owner', name: 'Demo Owner', password: 'fictional-owner-password' }
const other = { username: 'demo-reader', name: 'Demo Reader', password: 'fictional-reader-password' }
async function login(page, user = owner) {
  await page.getByRole('link', { name: 'login', exact: true }).click()
  await page.getByLabel('username', { exact: true }).fill(user.username)
  await page.getByLabel('password', { exact: true }).fill(user.password)
  await page.getByRole('button', { name: 'login', exact: true }).click()
  await expect(page.getByText(`${user.name} logged in`)).toBeVisible()
}
async function createBlog(page, title) {
  await page.getByRole('link', { name: 'create new blog', exact: true }).click()
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
test('public list and separate login route replace the earlier default login screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Reading list' })).toBeVisible()
  await page.getByRole('link', { name: 'login', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
  await expect(page.getByLabel('username', { exact: true })).toBeVisible()
  await expect(page.getByLabel('password', { exact: true })).toBeVisible()
})
test('5.18 login succeeds with correct credentials', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('button', { name: 'logout', exact: true })).toBeVisible()
})
test('5.18 wrong credentials show an error on the login route', async ({ page }) => {
  await page.getByRole('link', { name: 'login', exact: true }).click()
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
    await expect(page.getByRole('link', { name: 'create new blog', exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Added New reading')
  })
  test('5.20 liking persists and retains creator details', async ({ page }) => {
    const row = await createBlog(page, 'Like this')
    await row.getByRole('link').click()
    const blog = page.getByTestId('blog-details')
    await blog.getByRole('button', { name: 'like', exact: true }).click()
    await expect(blog.getByTestId('likes')).toHaveText('1')
    await expect(blog).toContainText('Added by Demo Owner')
    await page.reload()
    await expect(blog.getByTestId('likes')).toHaveText('1')
  })
  test('5.21 creator can cancel then confirm deletion', async ({ page }) => {
    const row = await createBlog(page, 'Remove this')
    await row.getByRole('link').click()
    const blog = page.getByTestId('blog-details')
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
    const row = await createBlog(page, 'Owner only')
    await row.getByRole('link').click()
    const blog = page.getByTestId('blog-details')
    await expect(blog.getByRole('button', { name: 'remove', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'logout', exact: true }).click()
    await login(page, other)
    await page.getByTestId('blog').filter({ hasText: 'Owner only' }).getByRole('link').click()
    await expect(blog.getByRole('button', { name: 'remove', exact: true })).toHaveCount(0)
  })
  test('sorted list updates after routed likes', async ({ page }) => {
    await createBlog(page, 'Low')
    await createBlog(page, 'High')
    await createBlog(page, 'Middle')
    async function like(title, count) {
      await page.getByTestId('blog').filter({ hasText: title }).getByRole('link').click()
      const details = page.getByTestId('blog-details')
      for (let value = 1; value <= count; value++) {
        await details.getByRole('button', { name: 'like', exact: true }).click()
        await expect(details.getByTestId('likes')).toHaveText(String(value))
      }
      await page.getByRole('link', { name: 'blogs', exact: true }).click()
    }
    await like('High', 2)
    await like('Middle', 1)
    await expect(page.getByTestId('blog').locator('strong')).toHaveText(['High', 'Middle', 'Low'])
  })
  test('login survives reload and logout clears persistent session', async ({ page }) => {
    await page.reload()
    await expect(page.getByText('Demo Owner logged in')).toBeVisible()
    await page.getByRole('button', { name: 'logout', exact: true }).click()
    await page.reload()
    await expect(page.getByRole('link', { name: 'login', exact: true })).toBeVisible()
  })
})

test('anonymous visitors can read a blog but cannot like or remove it', async ({ page, request }) => {
  const result = await request.post(`${backend}/api/login`, { data: { username: owner.username, password: owner.password } })
  const { token } = await result.json()
  const created = await request.post(`${backend}/api/blogs`, { headers: { Authorization: `Bearer ${token}` }, data: { title: 'Public reading', author: 'Demo Author', url: 'https://example.com/public', likes: 3 } })
  const blog = await created.json()
  await page.goto(`/blogs/${blog.id}`)
  const details = page.getByTestId('blog-details')
  await expect(details.getByRole('heading', { name: 'Public reading' })).toBeVisible()
  await expect(details.getByTestId('likes')).toHaveText('3')
  await expect(details.getByRole('button')).toHaveCount(0)
  expect((await request.put(`${backend}/api/blogs/${blog.id}`, { data: { likes: 4 } })).status()).toBe(401)
})

test('styled login, creation, notification, and detail views render', async ({ page }, testInfo) => {
  await page.getByRole('link', { name: 'login', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true })
  await page.getByLabel('username', { exact: true }).fill(owner.username)
  await page.getByLabel('password', { exact: true }).fill(owner.password)
  await page.getByRole('button', { name: 'login', exact: true }).click()
  await expect(page.getByText('Demo Owner logged in')).toBeVisible()
  await page.getByRole('link', { name: 'create new blog', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('create.png'), fullPage: true })
  await page.getByLabel('title', { exact: true }).fill('A clearer reading list')
  await page.getByLabel('author', { exact: true }).fill('Demo Author')
  await page.getByLabel('url', { exact: true }).fill('https://example.com/reading')
  await page.getByRole('button', { name: 'create', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Added A clearer reading list')
  await page.getByRole('link', { name: 'A clearer reading list', exact: true }).click()
  await expect(page.getByTestId('blog-details')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('details.png'), fullPage: true })
})
