import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/' || url === '/OpenDesignTesting/pixeltrail/' || url === '/OpenDesignTesting/pixeltrail') {
            req.url = '/source.html';
          }
          next();
        });
      }
    }
  ],
  base: '/OpenDesignTesting/pixeltrail/',
  build: {
    rollupOptions: {
      input: {
        main: './source.html'
      }
    }
  }
})
