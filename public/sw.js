const CACHE_VERSION = "gymfocus-pwa-v2";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/site.webmanifest",
  "/favicon.ico",
  "/gymfocus-favicon-pack/favicon-192x192.png",
  "/gymfocus-favicon-pack/favicon-512x512.png",
  "/gymfocus-favicon-pack/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isCacheableAsset(request) {
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/auth/")) return false;

  return [
    "document",
    "font",
    "image",
    "script",
    "style",
  ].includes(request.destination);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(APP_SHELL_CACHE).then((cache) => {
            cache.put("/index.html", responseClone);
          });

          return response;
        })
        .catch(() =>
          caches.match("/index.html").then((cachedResponse) => cachedResponse),
        ),
    );
    return;
  }

  if (!isCacheableAsset(request)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();

            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    }),
  );
});
