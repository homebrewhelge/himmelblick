const CACHE_NAME = 'himmelblick-v1'
const STATIC_ASSETS = ['/', '/index.html']

// Beim Install statische Assets cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Veraltete Caches beim Activate löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: Netzwerk zuerst, Cache als Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event

  // API-Anfragen nicht cachen (nur für Offline-Fallback)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached ?? new Response(
          JSON.stringify({ error: 'Offline — keine zwischengespeicherten Daten verfügbar' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        ))
      )
    )
    return
  }

  // Statische Ressourcen: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
        }
        return response
      })
    })
  )
})
