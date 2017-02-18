"use strict";

const cacheName = "Contagion-{{git-rev}}",
    essentialFiles = [
        "./",
        "app.min.js",
        "default.css",
    ],
    miscFiles = [
        "manifest.json",
        "license.html",
        "LICENSE",
        "icons/base.svg",
        "favicon.ico",
    ];

self.addEventListener("install", e => {
    console.log("[Service Worker] Install");
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log("[Service Worker] Caching app", cacheName);
            cache.addAll(miscFiles); // cache non-essential files later
            return cache.addAll(essentialFiles); // cache essential files now
        })
    );
});

self.addEventListener("activate", e => {
    console.log("[Service Worker] Activate", cacheName);
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== cacheName) {
                    console.log("[Service Worker] Removing old cache", key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener("fetch", e => {
    console.log("[Service Worker] Fetch", e.request.url);
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request).then(response => {
                console.warn("[Service Worker] Not found in cache", e.request.url);
                return response;
            });
        })
    );
});
