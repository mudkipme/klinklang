import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/(api|oauth|fedi)/.*': {
        target: 'http://localhost:3000'
      }
    },
    host: '0.0.0.0',
    port: 3001
  },
  build: {
    outDir: 'build'
  }
})
