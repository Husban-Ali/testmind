/* eslint-disable no-restricted-globals */

// Service Worker for Optima RS PWA
// Version 1.0.1 - Fixed duplicate messages and improved notification logging

const CACHE_NAME = 'optima-rs-v1.0.1';
const RUNTIME_CACHE = 'optima-rs-runtime-v1.0.1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache with network-first strategy
const API_CACHE_URLS = [
  '/api/auth/me',
  '/api/users',
  '/api/channels',
  '/api/projects'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // Return offline page if available
    return caches.match('/index.html');
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a custom offline response for API requests
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'You are currently offline. Please check your internet connection.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    );
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] ✅ Push notification received!', event);
  
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
      console.log('[SW] 📦 Push data:', JSON.stringify(data));
    } else {
      console.log('[SW] ⚠️  No data in push event');
    }
  } catch (error) {
    console.error('[SW] ❌ Error parsing push data:', error);
    data = {};
  }
  
  const type = data.type || 'message';
  console.log('[SW] 🔔 Notification type:', type);
  
  let title, body, icon, badge, tag, requireInteraction, actions, url;
  
  // Handle different notification types
  switch (type) {
    case 'message':
      title = data.title || 'New Message';
      body = data.body || 'You have a new message';
      icon = data.icon || '/icons/icon-192x192.png';
      badge = data.badge || '/icons/icon-72x72.png';
      tag = `message-${data.data?.channelId || Date.now()}`;
      url = data.data?.url || `/dashboard/channel/${data.data?.channelId}`;
      requireInteraction = false;
      actions = [];
      break;
      
    case 'call':
      title = data.title || 'Incoming Call';
      body = data.body || 'Someone is calling you';
      icon = data.icon || '/icons/icon-192x192.png';
      badge = data.badge || '/icons/icon-72x72.png';
      tag = `call-${data.data?.channelId || Date.now()}`;
      url = data.data?.url || `/dashboard/call/${data.data?.channelId}?type=${data.data?.callType || 'video'}`;
      requireInteraction = true; // Keep notification visible
      actions = [
        { action: 'accept', title: '✓ Accept', icon: '/icons/icon-72x72.png' },
        { action: 'reject', title: '✗ Reject', icon: '/icons/icon-72x72.png' }
      ];
      break;
      
    case 'test':
      title = data.title || 'Test Notification';
      body = data.body || 'This is a test';
      icon = data.icon || '/icons/icon-192x192.png';
      badge = data.badge || '/icons/icon-72x72.png';
      tag = 'test';
      url = data.data?.url || '/dashboard';
      requireInteraction = false;
      actions = [];
      break;
      
    default:
      title = data.title || 'Optima RS';
      body = data.body || 'You have a new notification';
      icon = data.icon || '/icons/icon-192x192.png';
      badge = data.badge || '/icons/icon-72x72.png';
      tag = 'notification';
      url = data.data?.url || '/dashboard';
      requireInteraction = false;
      actions = data.actions || [];
  }
  
  const options = {
    body,
    icon,
    badge,
    tag,
    requireInteraction,
    vibrate: type === 'call' ? [300, 100, 300, 100, 300] : [200, 100, 200],
    data: {
      url,
      type,
      ...data.data
    },
    actions
  };
  
  console.log('[SW] 📢 Showing notification:', title);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] ✅ Notification shown successfully');
      })
      .catch((error) => {
        console.error('[SW] ❌ Error showing notification:', error);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  const notificationType = data.type;
  
  // Handle notification actions
  if (action === 'accept') {
    // For call notifications - accept the call
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Try to focus existing window
          for (let client of clientList) {
            if (client.url.includes('/dashboard') && 'focus' in client) {
              client.focus();
              client.postMessage({
                type: 'CALL_ACCEPTED',
                data: data
              });
              return;
            }
          }
          // Open new window if no existing window found
          if (clients.openWindow) {
            return clients.openWindow(data.url).then(client => {
              if (client) {
                client.postMessage({
                  type: 'CALL_ACCEPTED',
                  data: data
                });
              }
            });
          }
        })
    );
    return;
  }
  
  if (action === 'reject') {
    // For call notifications - reject the call
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (let client of clientList) {
            if (client.url.includes('/dashboard')) {
              client.postMessage({
                type: 'CALL_REJECTED',
                data: data
              });
              return;
            }
          }
        })
    );
    return;
  }
  
  // Default click behavior - open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window
        for (let client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            // Navigate to the specific URL if provided
            if (data.url) {
              const baseUrl = new URL(client.url).origin;
              const targetUrl = baseUrl + data.url;
              return client.focus().then(() => {
                return client.navigate(targetUrl);
              });
            }
            return client.focus();
          }
        }
        // Open new window if no existing window found
        if (clients.openWindow) {
          return clients.openWindow(data.url || '/dashboard');
        }
      })
  );
});

// Handle background sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  console.log('[SW] Syncing messages...');
  // Implement message sync logic here
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});
