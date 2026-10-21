import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  globalTimeout: 5 * 60 * 1000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5186', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node ../../part4/bloglist/scripts/e2e-server.js', url: 'http://127.0.0.1:3006/api/blogs', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm --prefix ../bloglist-frontend run dev:e2e', url: 'http://127.0.0.1:5186', env: { BLOG_API_TARGET: 'http://127.0.0.1:3006' }, reuseExistingServer: false },
  ],
})
