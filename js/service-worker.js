const cacheName = 'pwa-v1';

const contentToCache = [
  '/pwa/index.html',
  '/pwa/css/styles.css',
  '/pwa/js/knockout-3.5.1.js',
  '/pwa/js/localforge-1.10.0.js',
  '/pwa/js/application.js',
  '/pwa/js/main-screen.js',
  '/pwa/images/android-chrome-192x192.png',
  '/pwa/images/android-chrome-512x512.png',
  '/pwa/images/apple-touch-icon.png',
  '/pwa/images/favicon.ico',
  '/pwa/images/favicon-16x16.png',
  '/pwa/images/favicon-32x32.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(contentToCache);
  })());
});

self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const hit = await caches.match(e.request);
    if (hit) return hit;

    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    cache.put(e.request, response.clone());
    return response;
  })());
});
