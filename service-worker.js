// service-worker.js - Memórias Positivas do Ano
// Responsável pela instalação como PWA e pelo funcionamento offline.
// Os dados do usuário (notas e imagens) ficam no IndexedDB, não neste
// arquivo — este Service Worker cuida apenas dos arquivos estáticos
// (HTML/CSS/JS/ícones), permitindo abrir o app sem conexão.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `memorias-positivas-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    './',
    './index.html',
    './offline.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './js/app.js',
    './js/database.js',
    './js/storage.js',
    './js/backup.js',
    './js/sync.js',
    './js/pwa.js',
    './js/ui.js',
    './js/utils.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
            .catch((err) => console.warn('SW: falha ao pré-cachear', err))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    // Navegação de páginas: tenta rede primeiro, cai para cache e depois
    // para offline.html se nada estiver disponível.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match('./index.html'))
                .then((response) => response || caches.match('./offline.html'))
        );
        return;
    }

    // Demais recursos (CSS/JS/ícones): cache primeiro, atualiza em segundo plano
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const networkFetch = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || networkFetch;
        })
    );
});
