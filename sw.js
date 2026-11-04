/* PliPag - Service Worker
 * - Guarda a página, os ícones e as bibliotecas externas para o app abrir sem internet.
 * - NÃO interfere nas chamadas ao servidor (Apps Script/POST): elas passam direto pela rede,
 *   e o próprio app cuida do modo offline (IndexedDB).
 */
const VERSAO = 'plipag-v3';
const CACHE = VERSAO;

// Arquivos do próprio site guardados na instalação (se algum não existir, é ignorado)
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './plipag-192x192.png',
  './nota/index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.all(ARQUIVOS.map(function(url) {
        return cache.add(url).catch(function() {});
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(nomes) {
      return Promise.all(nomes.filter(function(n) { return n !== CACHE; }).map(function(n) { return caches.delete(n); }));
    }).then(function() { return self.clients.claim(); })
  );
});

function guardar(request, response) {
  if (response && (response.ok || response.type === 'opaque')) {
    const copia = response.clone();
    caches.open(CACHE).then(function(cache) { return cache.put(request, copia); }).catch(function() {});
  }
  return response;
}

self.addEventListener('fetch', function(event) {
  const request = event.request;

  // Só trata leituras (GET). Gravações e chamadas ao Apps Script (POST) seguem direto para a rede.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.hostname === 'script.google.com' || url.hostname.endsWith('.googleusercontent.com')) return;

  // Do próprio site: tenta a rede primeiro (pega a versão nova) e, sem internet, usa o que está guardado
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then(function(resp) {
        return guardar(request, resp);
      }).catch(function() {
        return caches.match(request, { ignoreSearch: true }).then(function(achado) {
          if (achado) return achado;
          if (request.mode === 'navigate') {
            return caches.match('./index.html').then(function(pag) {
              return pag || caches.match('./');
            });
          }
          return undefined;
        }).then(function(r) {
          return r || new Response('', { status: 503, statusText: 'Sem conexão' });
        });
      })
    );
    return;
  }

  // Bibliotecas externas (Tailwind, Font Awesome, Chart.js...): usa o guardado e atualiza em segundo plano
  event.respondWith(
    caches.match(request).then(function(achado) {
      const rede = fetch(request).then(function(resp) {
        return guardar(request, resp);
      }).catch(function() { return undefined; });
      return achado || rede.then(function(r) {
        return r || new Response('', { status: 503, statusText: 'Sem conexão' });
      });
    })
  );
});
