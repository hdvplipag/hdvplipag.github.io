const CACHE_NAME = 'plipag-v2';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './plipag-192x192.png',
  './plipag-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo service worker a assumir o controle imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

