// Offline cache for the POC.
// Pages and glue go network first, so edits show up at once. vendor/ (engine, models, ~37 MB)
// goes cache first, so a reload never fetches them again.
// ponytail: vendor files are never changed in place; replacing one means bumping CACHE
const CACHE = 'loki-whistle';
const FILES = ['./', 'worker.js', 'vendor/needle.js', 'vendor/needle.wasm', 'vendor/whistle.cact', '/style.css', '/terminal.js'];

self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith((async () => {
    if (e.request.url.includes('/lab/whistle/vendor/')) {
      const hit = await caches.match(e.request);
      if (hit) return hit;
    }
    try {
      const r = await fetch(e.request);
      if (r.ok) {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return r;
    } catch (err) {
      return (await caches.match(e.request)) || Promise.reject(err);
    }
  })());
});
