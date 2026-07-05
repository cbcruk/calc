import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // mathjs is intentionally isolated into a lazy chunk (see hooks/useEditor),
    // so its size is expected and non-blocking.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React in its own chunk so it caches across app changes.
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
