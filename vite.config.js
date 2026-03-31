import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Using relative base for better GitHub Pages compatibility
  base: './',
  // base: '/BookmarksNavegadores/',
})
