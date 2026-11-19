import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base './' permite publicar la app en cualquier ruta (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'AquaCheck',
        short_name: 'AquaCheck',
        description: 'Prepárate para un corte de agua: cuánto te dura el agua, recordatorios y contactos oficiales.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#F3F8FC',
        theme_color: '#0B5FA5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallbackDenylist: [/^\/robots\.txt$/, /^\/sitemap\.xml$/], // los buscadores reciben estos archivos tal cual, no la app
      },
    }),
  ],
})
