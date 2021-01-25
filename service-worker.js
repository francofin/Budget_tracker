const APP_PREFIX = 'my-site-cache-';
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-"+ VERSION;

const FILES_TO_CACHE = [
    "./index.html",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    "./css/style.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
  ];


// FIles to Cache
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(chache) {
            console.log('installing cache: ' + CACHE_NAME)
            return caches.addAll(FILES_TO_CACHE);
        })
    );
});

// Respond with cahce responses
self.addEventListener("fetch", function(event) {
    // cache all request to api routes
    if(event.request.url.includes("/api")) {
        event.respondsWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(event.request)
                .then(response => { 
                    // Good response clone it and store it in the cache
                    if(response.status === 200) {
                        cache.put(event.request.url, response.clone())
                    }

                    return response;
                })
                .catch(err => {
                    // Failed network request
                    return cache.match(event.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }

    event.respondsWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request).then(function(response) {
                if(response) {
                    return response;
                } else if (event.request.headers.get("accept").includes("text/html")) {
                    return cahces.match("/");
                }
            });
        })
    );
});