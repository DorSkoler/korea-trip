import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Korea Trip · May 2026',
        short_name: 'Korea',
        description: 'Personal itinerary for South Korea, May 8–22, 2026.',
        theme_color: '#0b1028',
        background_color: '#0b1028',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'he',
        dir: 'rtl',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,json,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/\.netlify\//],
        runtimeCaching: [
          {
            // Live Places API responses (cache 24h, offline fallback)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/places'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'live-places-v1',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 h
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Hero/background images and user-added imagery
            urlPattern: ({ url }) => url.pathname.startsWith('/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'trip-images-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // External maps (Naver/Google) — off-origin; only cache if hit
            urlPattern: /^https:\/\/(map\.naver\.com|www\.google\.com\/maps)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-maps-v1',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
