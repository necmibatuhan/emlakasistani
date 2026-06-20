import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kapora — Emlak Asistanı',
        short_name: 'Kapora',
        description: 'Emlak danışmanları için AI satış asistanı',
        theme_color: '#10B981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/dashboard',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/dashboard\/priorities/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'priorities-cache',
              expiration: { maxAgeSeconds: 300 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\/api\/leads/,
            handler: 'NetworkFirst',
            options: { cacheName: 'leads-cache' }
          }
        ]
      }
    }),
    obfuscatorPlugin({
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: [/node_modules/],
      apply: 'build', // Only obfuscate in production build
      debugger: true, // Enable debugger statements logic in obfuscator
      options: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false, // Prevent DevTools/F12 freezing the app completely
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        rotateStringArray: false,
        selfDefending: false,
        stringArray: false,
        unicodeEscapeSequence: false
      }
    })
  ],
  build: {
    sourcemap: false, // Ensure source maps are strictly disabled for security
  }
})
