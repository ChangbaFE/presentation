addEventListener('install', event => {
  console.log('Service worker installed');
})

addEventListener('activate', event => {
  console.log('Service worker activated');
})