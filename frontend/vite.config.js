import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const backend = { target: env.VITE_BACKEND_URL || 'http://127.0.0.1:8000', changeOrigin: true }

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app'],
      proxy: {
        '/api': backend,
        '/media': backend,
        '/django-admin': backend,
        '/static': backend,
      },
    },
  }
})
