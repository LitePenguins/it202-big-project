var cacheName = 'hello-pwa';
var filesToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/index.js',
  '/images/charging.png'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
    console.log("install - before wait");
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
         console.log("install - in open");
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
//map will not work while offline
self.addEventListener('fetch', function(event) {
 console.log(event.request.url);

 event.respondWith(
   caches.match(event.request).then(function(response) {
     return response || fetch(event.request);
   })
 );
});
