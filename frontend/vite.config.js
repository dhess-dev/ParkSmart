import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert"; // New: For local HTTPS certificates

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true, // Serve Vite frontend over HTTPS
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "https://localhost:8443", // Updated to https
        changeOrigin: true,
        secure: false, // Allow self-signed certificates during development
      },
    },
  },
});
