import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Peticiones a /api van al backend .NET; así no hay CORS ni preflight.
      "/api": {
        target: "http://localhost:5052",
        changeOrigin: true,
      },
    },
  },
});
