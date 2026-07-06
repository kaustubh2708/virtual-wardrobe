import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Virtual Wardrobe',
        short_name: 'Wardrobe',
        description: 'Your AI-powered personal wardrobe & stylist',
        theme_color: '#1a1a1a',
        background_color: '#f5f2ee',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Keep the heavy ONNX background-removal runtime out of the SW precache —
        // it's dynamically imported and only needed when the user removes a
        // background, so it shouldn't bloat every install.
        globIgnores: ['**/ort*', '**/*.wasm'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
