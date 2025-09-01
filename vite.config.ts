import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  
  // Development server configuration
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: false, // Don't auto-open browser since we're in Docker
    hmr: {
      port: 3001,
      host: 'localhost'
    },
    proxy: {
      // Proxy Claude Code WebSocket
      '/claude-code': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true
      },
      // Proxy Docker API
      '/api/docker': {
        target: 'http://localhost:2376',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/docker/, '')
      },
      // Proxy preview server
      '/preview': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/preview/, '')
      }
    },
    watch: {
      usePolling: true, // Required for Docker volumes
      interval: 1000
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          monaco: ['@monaco-editor/react'],
          ui: ['lucide-react', 'framer-motion'],
          utils: ['zustand', 'fuse.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores')
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV_MODE__: JSON.stringify(process.env.NODE_ENV === 'development')
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@monaco-editor/react',
      'lucide-react',
      'zustand',
      'fuse.js',
      'socket.io-client'
    ],
    exclude: [
      '@anthropic/claude-code'
    ]
  },

  // Worker configuration for Web Workers
  worker: {
    format: 'es',
    plugins: []
  },

  // Preview configuration (for production builds)
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: true
  },

  // Test configuration (if using Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: true
  },

  // ESBuild configuration
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});