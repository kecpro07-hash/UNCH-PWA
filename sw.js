const CACHE_NAME = 'unch-cache-v1';
const urlsToCache = [
  '/UNCH-PWA/',
  '/UNCH-PWA/index.html',
  '/UNCH-PWA/profile.html',
  '/UNCH-PWA/order.html',
  '/UNCH-PWA/orders.html',
  '/UNCH-PWA/reviews.html',
  '/UNCH-PWA/css/style.css',
  '/UNCH-PWA/js/app.js',
  '/UNCH-PWA/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  // Для API запросов - сеть или падение
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Нет подключения к интернету' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  
  // Для статики - кэш или сеть
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Кэшируем новые ресурсы
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});
