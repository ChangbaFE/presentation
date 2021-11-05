## 展示要点

1、浏览器能力检测和注册时机

```js
if ('serviceWorker' in navigator) {
  // Service Worker 是为了提升用户的首屏访问体验，所以在页面完全加载之后再进行 Service Worker 的注册，避免与页面内容抢占网络资源
  window.addEventListener('load', function () {
    // navigator.serviceWorker.register('service-worker.js', { scope: './' })
  }
}
```

2、注册 Service Worker

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js', {scope: './'})
  .then(function(registration) {
    document.querySelector('#status').textContent = 'succeeded';
  }).catch(function(error) {
    document.querySelector('#status').textContent = error;
  });
} else {
  // The current browser doesn't support service workers.
  let aElement = document.createElement('a');
  aElement.href = `
     http://www.chromium.org/blink/serviceworker/service-worker-faq
  `;
  aElement.textContent = 'unavailable';
  document.querySelector('#status').appendChild(aElement);
}
```

3、Service Worker 的监听事件，install activate

4、install 失败的一些情况 ——

* 没有使用HTTPS
* scope 指定的超过了限制

3、DevTools 里的 Service Worker

4、在 Chrome 中 跳转到 `chrome://inspect/#service-workers` 查看 Service Worker 是否已启用