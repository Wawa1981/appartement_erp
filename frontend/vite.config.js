import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const port = Number(process.env.FRONTEND_HOST_PORT || process.env.PORT || 5175);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port,
    strictPort: true,
    watch: { usePolling: true },
    hmr: { host: "localhost", port, clientPort: port },
  },
});
