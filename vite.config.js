import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        globPatterns: [
          "**/*.{js,css,html}",
          "icons.svg",
          "favicon.svg",
        ],
        ignoreURLParametersMatching: [/^v$/],
        importScripts: ["/push-sw.js"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "library-images-v1",
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true,
              },
            },
          },
        ],
      },

      manifest: {
        name: "Бібліотека",
        short_name: "Бібліотека",

        description: "Моя домашня бібліотека",

        theme_color: "#18181b",
        background_color: "#18181b",

        display: "standalone",

        start_url: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});