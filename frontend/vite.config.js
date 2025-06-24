// frontend/vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const isDev = mode === "development";
  const certDir = path.resolve(__dirname, "../certs");

  const httpsOptions = isDev
      ? {
        key: fs.readFileSync(path.join(certDir, "key.pem")),
        cert: fs.readFileSync(path.join(certDir, "cert.pem")),
      }
      : undefined;

  return {
    plugins: [react()],
    server: {
      host: true,
      https: httpsOptions,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://localhost:8443",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: "gruppe1iot-dev.local",
      https: httpsOptions,
    },
  };
});
