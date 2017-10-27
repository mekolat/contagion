/** @license

To the extent possible under law, the author(s) have dedicated all copyright
and related and neighboring rights to this software to the public domain
worldwide. This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along with
this software. If not, see <https://creativecommons.org/publicdomain/zero/1.0/>

 */

"use strict";

const REV: string = "{{git-rev}}";

const CACHE_NAME: string = "Contagion-" + REV;

const ESSENTIAL_FILES: [string] = [
    "./",
    "app.js",
    "default.css",
];

const MISC_FILES: [string] = [
    "app.webmanifest",
    "license.html",
    "LICENSE",
    "icons/base.svg",
    "favicon.ico",
];

self.addEventListener("install", (e: Event & {waitUntil: any}) : void => {
    console.log("[Service Worker] Install");
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) : Promise<void> => {
            console.log("[Service Worker] Caching app", CACHE_NAME);
            cache.addAll(MISC_FILES); // cache non-essential files later
            return cache.addAll(ESSENTIAL_FILES); // cache essential files now
        })
    );
});

self.addEventListener("activate", (e: Event & {waitUntil: any}) : void => {
    console.log("[Service Worker] Activate", CACHE_NAME);
    e.waitUntil(
        caches.keys().then((keyList: Array<any>) => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log("[Service Worker] Removing old cache", key);
                    return caches.delete(key);
                }
                return true;
            }));
        })
    );
    if ("clients" in self)
        (<any>self).clients.claim();
});

self.addEventListener("fetch", (e: Event & {respondWith: any, request: any}) => {
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
