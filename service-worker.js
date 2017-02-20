"use strict";

/** @define {string} */
const REV = "{{git-rev}}";

/** @const {!string} */
const CACHE_NAME = "Contagion-" + REV;

/** @const {!Array<!string>} */
const ESSENTIAL_FILES = [
    "./",
    "app.min.js",
    "default.css",
];

/** @const {!Array<!string>} */
const MISC_FILES = [
    "manifest.json",
    "license.html",
    "LICENSE",
    "icons/base.svg",
    "favicon.ico",
];

self.addEventListener("install", e => {
    console.log("[Service Worker] Install");
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker] Caching app", CACHE_NAME);
            cache.addAll(MISC_FILES); // cache non-essential files later
            return cache.addAll(ESSENTIAL_FILES); // cache essential files now
        })
    );
});

self.addEventListener("activate", e => {
    console.log("[Service Worker] Activate", CACHE_NAME);
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log("[Service Worker] Removing old cache", key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return "clients" in self ? self.clients.claim() : false;
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
