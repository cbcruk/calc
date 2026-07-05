import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<user>.github.io/calc/ on GitHub Pages, so every mode
// (build, dev, preview) uses the '/calc/' base to stay consistent. If a custom
// domain is added later, change this to '/'.
export default defineConfig({
  base: '/calc/',
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
