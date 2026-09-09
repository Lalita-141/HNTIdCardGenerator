import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/employee-app': {
        target: 'http://172.20.1.56:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
