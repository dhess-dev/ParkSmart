import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // <-- define `env` properly

  return {
    plugins: [react(), mkcert()],
    server: {
      https: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://localhost:8443",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
