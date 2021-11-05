const CACHE_NAME = 'sw-cache-old';

const urlsToCache = [
  '/',
  '/index.html',
]

addEventListener('install', event => {
  console.log('old version service worker is installed')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
})

addEventListener('activate', event => {
  console.log('service-worker old version is running');
})