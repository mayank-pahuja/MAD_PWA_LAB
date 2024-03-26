const CACHE_NAME = 'ecommerce-pwa-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/script.js',
    '/assets/images',
    // Add more URLs of assets to cache as needed
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        checkResponse(event.request).catch(function () {
            console.log("Fetch from cache successful!");
            return returnFromCache(event.request);
        })
    );
    console.log("Fetch successful!");
    event.waitUntil(addToCache(event.request));
});

self.addEventListener("sync", (event) => {
    if (event.tag === "syncMessage") {
        console.log("Sync successful!");
    }
});

// Push event listener
self.addEventListener("push", function (event) {
    if (event && event.data) {
    try {
    var data = event.data.json();
    if (data && data.method === "pushMessage") {
    console.log("Push notification sent");
    self.registration.showNotification("Ecommerce website", { body: data.message
    });
    }
    } catch (error) {
    console.error("Error parsing push data:", error);
    }
    }
    });


function checkResponse(request) {
    return new Promise(function (fulfill, reject) {
        fetch(request)
            .then(function (response) {
                if (response.status !== 404) {
                    fulfill(response);
                } else {
                    reject(new Error("Response not found"));
                }
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

function returnFromCache(request) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status == 404) {
                return cache.match("offline.html");
            } else {
                return matching;
            }
        });
    });
}

function addToCache(request) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response.clone()).then(function () {
                return response;
            });
        });
    });
}
