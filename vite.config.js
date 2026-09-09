import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Electron loads the production renderer from file://, so bundled assets
  // must resolve relative to dist/index.html instead of the drive root.
  base: './',
  plugins: [react(), tailwindcss()],
})
