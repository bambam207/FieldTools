self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('field-tools-cache').then(cache => {
      return cache.addAll([
        './index.html',
        './style.css',
        './app.js',
        './manifest.json',
        './icon-192.png',
        './icon-512.png',
        './D744E2B6-1AB3-466B-A4E8-A64711BD01F5.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== 'field-tools-cache')
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});