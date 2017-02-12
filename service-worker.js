var cacheName = "Contagion-{{git-rev}}";
var essentialFiles = [
    "/",
    "/app.js",
    "/default.css",
    "/normalize.css",
];
var miscFiles = [
    "/manifest.json",
    "/license.html",
    "/LICENSE",
    "/favicon.ico",
    "/icons/512.svg",
    "/icons/512.png",
    "/icons/256.png",
    "/icons/144.png",
    "/icons/128.png",
    "/icons/64.png",
    "/icons/48.png",
    "/icons/32.png",
];

self.addEventListener("install", function(e) {
    console.log("[ServiceWorker] Install");
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log("[ServiceWorker] Caching app", cacheName);
            cache.addAll(miscFiles); // cache non-essential files later
            return cache.addAll(essentialFiles); // cache essential files now
        })
    );
});

self.addEventListener("activate", function(e) {
    console.log("[ServiceWorker] Activate", cacheName);
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
            return response || fetch(e.request).then(function(response){
                console.warn("[Service Worker] Not found in cache", e.request.url);
                return response;
            });
        })
    );
});
