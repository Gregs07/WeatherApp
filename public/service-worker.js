// Define a cache name
const CACHE_NAME = 'weather-app-cache-v1';

// Cache the static assets and API requests
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/home-page.js',
  'https://api.weatherapi.com/v1/forecast.json', // External API URL to cache
];

// Install event: Cache the defined URLs when the service worker is installed
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: Clean up old caches when a new version of the service worker is activated
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached content when offline or return from network
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Returning cached response for', event.request.url);
          return cachedResponse;
        }

        // If no cached response, fetch from the network
        return fetch(event.request).then((response) => {
          // If the response is valid, cache it for future requests
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        });
      })
  );
});
