import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-v1',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/v1' || req.url === '/v1/') {
            req.url = '/v1/index.html';
          }
          next();
        });
      },
    },
  ],
})
