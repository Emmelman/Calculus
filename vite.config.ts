import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Vite config: React + PWA. The dev server proxies /api to the optional
// OpenRouter helper server (server/index.mjs) so the kid-facing app and the
// LLM helper share one origin during development.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "mascot.svg"],
      manifest: {
        name: "Умножариум",
        short_name: "Умножариум",
        description: "Весёлый тренажёр таблицы умножения для детей",
        lang: "ru",
        theme_color: "#6c5ce7",
        background_color: "#1b1340",
        display: "standalone",
        orientation: "any",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.HELPER_URL ?? "http://localhost:8799",
        changeOrigin: true,
      },
    },
  },
  // The built-app preview must proxy /api too, otherwise the helper 404s and
  // the app silently falls back to its offline templates (a "clunky" helper).
  preview: {
    host: true,
    port: 4175,
    proxy: {
      "/api": {
        target: process.env.HELPER_URL ?? "http://localhost:8799",
        changeOrigin: true,
      },
    },
  },
});
