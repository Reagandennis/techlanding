const CACHE_NAME = 'techgetafrica-lms-v1';
const STATIC_CACHE_NAME = 'techgetafrica-static-v1';
const DYNAMIC_CACHE_NAME = 'techgetafrica-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  // Add your static assets here
];

// API routes that should be cached
const CACHEABLE_ROUTES = [
  '/api/courses',
  '/api/user/profile',
  '/api/notifications',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle navigation requests
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Clone response for caching
            const responseClone = response.clone();
            
            if (response.status === 200) {
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Serve cached page or offline page
            return caches.match(request)
              .then((cachedResponse) => {
                return cachedResponse || caches.match('/offline');
              });
          })
      );
      return;
    }

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        networkFirstStrategy(request)
      );
      return;
    }

    // Handle static assets
    if (isStaticAsset(request.url)) {
      event.respondWith(
        cacheFirstStrategy(request)
      );
      return;
    }

    // Handle images and media
    if (request.destination === 'image' || request.destination === 'video' || request.destination === 'audio') {
      event.respondWith(
        cacheFirstStrategy(request)
      );
      return;
    }

    // Default strategy for other requests
    event.respondWith(
      networkFirstStrategy(request)
    );
  }
});

// Network first strategy - good for API calls and dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      
      // Don't cache POST requests or requests with auth headers
      if (request.method === 'GET' && !request.headers.has('authorization')) {
        cache.put(request, responseClone);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache...', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for failed requests
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'You are currently offline. Some features may not be available.' 
        }),
        { 
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Cache first strategy - good for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch resource:', request.url, error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Check if URL is a static asset
function isStaticAsset(url) {
  return url.includes('/_next/static/') || 
         url.includes('/images/') || 
         url.includes('/icons/') ||
         url.includes('/fonts/') ||
         url.endsWith('.css') ||
         url.endsWith('.js') ||
         url.endsWith('.woff2') ||
         url.endsWith('.woff') ||
         url.endsWith('.ttf');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    
    event.waitUntil(
      // Handle any offline actions that were queued
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  // Implement background sync logic here
  // For example, sync course progress, submit quiz answers, etc.
  
  try {
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineActions() {
  // Get offline actions from IndexedDB
  return [];
}

async function processOfflineAction(action) {
  // Process individual offline action
  switch (action.type) {
    case 'course_progress':
      return fetch('/api/course/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
    
    case 'quiz_answer':
      return fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
    
    default:
      console.warn('Unknown offline action type:', action.type);
  }
}

async function removeOfflineAction(actionId) {
  // Remove processed action from IndexedDB
  console.log('Removing processed offline action:', actionId);
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from TechGetAfrica',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'general',
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'TechGetAfrica', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ cacheSize: size });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
  
  console.log('All caches cleared');
}