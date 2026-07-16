import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/' locally and on Vercel; on GitHub Pages the workflow sets BASE_PATH
// to '/<repo>/' so assets and routes resolve under the project subpath.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
