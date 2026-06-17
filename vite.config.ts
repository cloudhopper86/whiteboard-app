import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  },
  define: {
    // react-draggable and re-resizable reference process.env at runtime
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.DRAGGABLE_DEBUG': JSON.stringify(false),
  },
})
