import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: { proxy: { '/server': { ws: true, target: 'ws://localhost:5172' } } },
  preview: { proxy: {} },
})
