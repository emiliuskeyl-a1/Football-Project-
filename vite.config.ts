import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This allows Vite to be accessed from a different host, like in your cloud environment.
    host: true,
    // Explicitly allow the host from the error message.
    allowedHosts: ['football-project-dasp.onrender.com'],
  }
})