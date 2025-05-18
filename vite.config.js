import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add any aliases if needed
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep PDF.js worker in a separate chunk
          'pdf.worker': ['pdfjs-dist/build/pdf.worker']
        }
      }
    }
  },
  optimizeDeps: {
    // Make sure these are included in the optimization
    include: ['pdfjs-dist']
  }
})
