import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  base: '/Tailender-Tracks/',
  plugins: [react(), basicSsl()],
  server: {
    host: true // Expose to local network automatically
  }
})
