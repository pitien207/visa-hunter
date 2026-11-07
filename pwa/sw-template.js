/* Visa Hunter service worker — generated at build time from pwa/sw-template.js (see vite.config.ts). */
const VERSION = '__VERSION__'
const CACHE = `visa-hunter-${VERSION}`
const RUNTIME = 'visa-hunter-runtime'
const PRECACHE = __PRECACHE__

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('visa-hunter-') && k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(cacheName)
    await cache.put(request, response.clone())
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // The page: network first so new versions arrive, the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copy))
          return response
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  // Web fonts: keep a copy once loaded.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, RUNTIME))
    return
  }

  // Build files have content hashes in their names, so a cached copy is always right.
  if (url.origin === self.location.origin) event.respondWith(cacheFirst(request, RUNTIME))
})
