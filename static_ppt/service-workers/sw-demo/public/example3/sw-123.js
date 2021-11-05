const CACHE_NAME = 'cache-v1';
const cacheUrls = [
  '1.js',
  '2.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(cacheUrls);
      })
  )
})

self.addEventListener('fetch', event => {
  if (event.request.url.endsWith('1.js')) {
    // Requests for 1.js will result in the SW firing off a fetch() request,
    // which will be reflected in the DevTools Network panel.
    event.respondWith(fetch(event.request));
  } else if (event.request.url.endsWith('2.js')) {
    // Requests for 2.js will result in the SW constructing a new Response object,
    // so there won't be an additional network request in the DevTools Network panel.
    event.respondWith(new Response('// no-op'));
  }

  // Requests for anything else won't trigger event.respondWith(), so there won't be
  // any SW interaction reflected in the DevTools Network panel.
});