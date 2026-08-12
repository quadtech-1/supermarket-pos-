const CACHE_NAME = "my-store-pos-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ================================
// INSTALL
// ================================

self.addEventListener("install", function (event) {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(function (cache) {

        return cache.addAll(FILES_TO_CACHE);

      })
      .catch(function (error) {

        console.error(
          "Service Worker cache error:",
          error
        );

      })

  );

  self.skipWaiting();

});


// ================================
// ACTIVATE
// ================================

self.addEventListener("activate", function (event) {

  event.waitUntil(

    caches.keys()
      .then(function (cacheNames) {

        return Promise.all(

          cacheNames
            .filter(function (cacheName) {

              return cacheName !== CACHE_NAME;

            })
            .map(function (cacheName) {

              return caches.delete(cacheName);

            })

        );

      })

  );

  self.clients.claim();

});


// ================================
// FETCH
// ================================

self.addEventListener("fetch", function (event) {

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    caches.match(event.request)
      .then(function (cachedResponse) {

        // Use cached version first
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise load from network
        return fetch(event.request)
          .then(function (networkResponse) {

            // Save a copy for offline use
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(function (cache) {

                  cache.put(
                    event.request,
                    responseClone
                  );

                });

            }

            return networkResponse;

          });

      })
      .catch(function () {

        // If offline and page isn't cached
        return caches.match("./index.html");

      })

  );

});


// ================================
// MESSAGE
// ================================

self.addEventListener("message", function (event) {

  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {

    self.skipWaiting();

  }

});
