/**
 * В dev запросы на /api проксируются на backend (localhost:3001).
 * Без этого и без запущенного backend XML-товары и заказы не работают.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
