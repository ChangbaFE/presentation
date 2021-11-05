self.addEventListener('install', event => {
  console.log('V1 installing…');

  // 缓存一张照片
  event.waitUntil(
    caches.open('static-v1').then(cache => cache.add('./images/hex.jpeg'))
  );
});

self.addEventListener('activate', event => {
  console.log('V1 now ready to handle fetches!');
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 拦截 sansiro.jpeg 并将它替换为 hex.jpeg
  if (url.origin == location.origin && url.pathname.endsWith('sansiro.jpeg')) {
    event.respondWith(caches.match('./images/hex.jpeg'));
  }
});