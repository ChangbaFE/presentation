const CACHE_NAME = 'sw-cache-new';

const urlsToCache = [
  '/',
  '/index.html',
]

addEventListener('install', event => {
  console.log('new version service worker is installed')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
})

addEventListener('activate', event => {
  console.log('service-worker new version is running');
})

self.addEventListener('activate', function(event) {
  var cacheAllowlist = ['sw-cache-new'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});