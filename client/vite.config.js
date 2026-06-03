import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
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
        rotateStringArray: true,
        selfDefending: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
      }
    })
  ],
  build: {
    sourcemap: false, // Ensure source maps are strictly disabled for security
  }
})
