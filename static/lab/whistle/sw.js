// Offline cache for the POC.
// ponytail: network first, cache as fallback, so edits show up at once; cache first if the model fetch gets slow
const CACHE = 'loki-whistle';
const FILES = ['./', 'worker.js', 'vendor/needle.js', 'vendor/needle.wasm', 'vendor/whistle.cact', '/style.css', '/terminal.js'];

self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request)),
  );
});
