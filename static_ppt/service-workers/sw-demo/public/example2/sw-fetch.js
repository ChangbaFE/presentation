var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  './',
  './styles/main.css',
  './script/main.js'
];

self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 优先使用缓存，如果没有命中，则发起网络请求并缓存新的请求和响应
self.addEventListener('fetch', function(event) {
  if(!event.request.url.startsWith('http')) {
    // 针对一个报错 —— Uncaught (in promise) TypeError: Request scheme 'chrome-extension' is unsupported
    // skip request
    return
  }
  event.respondWith(
    // 该方法查询请求然后返回 Service Worker 创建的任何缓存数据。
    caches.match(event.request)
      .then(function(response) {
        // 若有缓存，则返回
        if (response) {
          return response;
        }

        // 复制请求。请求是一个流且只能被使用一次。因为之前已经通过缓存使用过一次了，所以为了在浏览器中使用 fetch，需要复制下该请求。
        var fetchRequest = event.request.clone();

        // 没有找到缓存。所以我们需要执行 fetch 以发起请求并返回请求数据。
        return fetch(fetchRequest).then(
          function(response) {
            // 检测返回数据是否有效
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 复制返回数据，因为它也是流。因为我们想要浏览器和缓存一样使用返回数据，所以必须复制它。这样就有两个流
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // 把请求添加到缓存中以备之后的查询用
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

