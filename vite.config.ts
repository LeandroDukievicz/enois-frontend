import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Strip trailing /api from VITE_API_BACKEND since the proxy path already has /api
  const backendBase = process.env.BACKEND_TARGET
    ?? (env.VITE_API_BACKEND ?? 'http://localhost:8081/api').replace(/\/api\/?$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: backendBase,
          changeOrigin: true,
        },
      },
    },
  }
})
