import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Static files in public/ that the service worker should also keep offline. */
const PUBLIC_PRECACHE = ['manifest.webmanifest', 'favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']

/**
 * PWA (M9): writes dist/sw.js from pwa/sw-template.js with the list of built files,
 * so the whole game works offline after the first visit. No extra dependency needed.
 */
function serviceWorker(): Plugin {
  return {
    name: 'visa-hunter-sw',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map') && f !== 'index.html')
      const precache = ['./', ...[...files, ...PUBLIC_PRECACHE].map((f) => `./${f}`)]
      const version = createHash('sha256').update(files.sort().join('|')).digest('hex').slice(0, 10)
      const source = readFileSync('pwa/sw-template.js', 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(precache, null, 2))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

/** Long-lived vendor chunks: game updates don't force re-downloading three.js or the physics engine. */
const VENDOR_CHUNKS: [string, RegExp][] = [
  // (+ Vite's tiny preload helper, so the title screen never depends on the big chunks)
  ['react', /node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store)\/|vite\/preload-helper/],
  ['three', /node_modules\/(three|three-stdlib|three-mesh-bvh|@react-three\/(fiber|drei)|@monogrid|troika-[^/]+|camera-controls|maath|meshline|stats-gl|suspend-react|its-fine)\//],
  ['physics', /node_modules\/(@dimforge|@react-three\/rapier)\//],
]

export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorker()],
  // host: true exposes the dev server on your LAN so you can open it on a phone.
  server: { host: true },
  preview: { host: true },
  build: {
    // The physics engine ships its WebAssembly inlined (~2 MB); that's expected.
    chunkSizeWarningLimit: 2400,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // A group also pulls in its dependencies, so the more basic libraries claim their modules first.
          groups: VENDOR_CHUNKS.map(([name, test], i) => ({ name, test, priority: VENDOR_CHUNKS.length - i })),
        },
      },
    },
  },
})
