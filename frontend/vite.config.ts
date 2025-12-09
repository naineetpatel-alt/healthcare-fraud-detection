import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    host: '0.0.0.0',
    hmr: {
      host: 'tpa-03.onezippy.ai',
      protocol: 'wss',
    },
  },
})
