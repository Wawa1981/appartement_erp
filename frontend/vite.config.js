import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,           // Écoute sur 0.0.0.0 (important pour Docker)
    // 5175 = Appartement ERP (5173 = eternalkidsart_web)
    port: 5175,
    strictPort: true,
    watch: {
      usePolling: true,   // Nécessaire pour le hot-reload dans Docker (surtout sur Windows/Mac)
    },
    hmr: {
      host: 'localhost',  // Pour que le navigateur se connecte correctement depuis l'hôte
    },
  },
})
