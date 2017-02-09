var cacheName = "Contagion1";
var filesToCache = [
  "/",
  "/index.html",
  "/license.html",
  "/LICENSE",
  "/app.min.js",
  "/default.css",
  "/normalize.css",
  "/favicon.ico",
  "/icons/512.svg",
  "/icons/256.png",
  "/icons/128.png",
  "/icons/64.png",
  "/icons/48.png",
  "/icons/32.png",
];

self.addEventListener("install", function(e) {
  console.log("[ServiceWorker] Install");
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("[ServiceWorker] Caching app");
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("activate", function(e) {
  console.log("[ServiceWorker] Activate");
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log("[ServiceWorker] Removing old cache", key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  console.log("[Service Worker] Fetch", e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
