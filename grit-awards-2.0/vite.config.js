import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    // Disable source maps in production for security and performance
    sourcemap: false,
    
    // Target modern browsers for smaller bundle size
    target: 'es2015',
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Motion libraries
          'motion-vendor': ['framer-motion', 'react-intersection-observer'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-intersection-observer',
      '@supabase/supabase-js',
    ],
  },
})
