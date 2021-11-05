## 展示要点

### CacheStorage

* Cache 缓存的是 Request / Response 键值对
* 打开缓存
* 添加缓存
* 通过 waitUntil 和 promise 确认缓存是否成功

### fetch，网络代理

* 监听 fetch 事件
* 通过 respondWith 拦截 HTTP 请求，这个方法接受一个 promise，通过返回一个 Response、network error 或者 Fetch的方式resolve。

### 可以体验一下 service worker 的更新操作

* 新的 SW 安装之后会进入等待状态，需要等待旧版本的 SW 废止后，新的 SW 才会激活
* 可以关闭所有的网页让旧版 SW 中止，之后浏览器会将 SW 替换为新版
* 或者打开 DevTools，开启 update on reload，然后刷新页面就可以了