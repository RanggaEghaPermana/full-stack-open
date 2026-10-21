import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': process.env.BLOG_API_TARGET || 'http://127.0.0.1:3005' } },
  test: { environment: 'jsdom', setupFiles: './testSetup.js' },
})
