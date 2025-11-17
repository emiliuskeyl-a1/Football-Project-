import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // This makes the server accessible externally
    host: '0.0.0.0',
    // This explicitly allows requests from your Render deployment URL
    allowedHosts: [
      '.onrender.com'
    ],
  },
});
