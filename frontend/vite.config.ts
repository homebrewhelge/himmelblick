import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 'react'/'react-dom' werden bewusst nicht separat gechunkt: sie werden
        // eager im Entry-Point importiert und landen ohnehin im Hauptbundle —
        // ein eigener Chunk dafür blieb leer.
        manualChunks: {
          'vendor-charts': ['recharts'],
          'vendor-map': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
})
