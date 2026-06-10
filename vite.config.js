import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Improve chunking for better performance
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React vendor chunk
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Chart vendor chunk
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          // Animation vendor chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          // UI icons vendor chunk
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          // Everything else goes to default vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependencies for faster loading
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'framer-motion', 'axios'],
  },
  // Ensure proper base URL for assets
  base: '/',
})
