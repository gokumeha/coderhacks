import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import http from 'http'

// Custom Vite middleware to act as a CORS proxy for DroidCam
// This ensures the camera works even if the Express backend isn't running
function proxyDroidCam() {
  return {
    name: 'proxy-droidcam',
    configureServer(server: any) {
      server.middlewares.use('/api/proxy', (req: any, res: any) => {
        const urlParam = new URL('http://localhost' + req.url).searchParams.get('url');
        if (!urlParam) {
          res.statusCode = 400;
          return res.end('Missing URL');
        }
        http.get(urlParam, (proxyRes) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
          proxyRes.pipe(res);
        }).on('error', (err) => {
          res.statusCode = 500;
          res.end('Proxy error: ' + err.message);
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), proxyDroidCam()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },
})
