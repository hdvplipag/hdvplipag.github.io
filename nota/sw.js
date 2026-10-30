// Service worker do app "PliPag Notas" (escopo: /nota/)
// A página é sempre buscada na internet primeiro (assim as atualizações chegam na hora);
// o cache só serve de reserva quando estiver sem conexão. O Apps Script nunca passa pelo cache.
const CACHE_NAME = 'plipag-notas-v1';
const ARQUIVOS = [
  './index.html',
  './manifest.json',
  './nota-192x192.png',
  './nota-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;                        // POST do Apps Script passa direto
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // CDNs e Apps Script passam direto
  if (!url.pathname.startsWith('/nota/')) return;

  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copia)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
