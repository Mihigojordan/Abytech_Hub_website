/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();

// ==========================================
// TYPES
// ==========================================

interface PushPayload {
  title?: string;
  body?: string;
  message?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  notificationId?: string;
  url?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  data?: {
    url?: string;
    notificationId?: string;
    [key: string]: any;
  };
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[] | number;
  renotify?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];
}

// ==========================================
// INDEXEDDB — BADGE PERSISTENCE
// ==========================================



const DB_NAME = 'NotificationDB';
const DB_VERSION = 2; // ← bumped to force onupgradeneeded on stale installs
const STORE_NAME = 'meta';
const UNREAD_KEY = 'unreadCount';

// Always open a fresh connection — never cache the IDBDatabase instance
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Delete old store if it exists under a different name (e.g. old 'unreadCount' store)
      if (db.objectStoreNames.contains('unreadCount')) {
        db.deleteObjectStore('unreadCount');
      }

      // Create the correct store if missing
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log('✅ [DB] Object store created:', STORE_NAME);
      }
    };

    // Handle blocked (another tab has an older version open)
    request.onblocked = () => {
      console.warn('⚠️ [DB] Database upgrade blocked by another tab');
    };
  });
}

async function getUnreadCount(): Promise<number> {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      // Guard: verify store exists before transacting
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve(0);
        return;
      }
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(UNREAD_KEY);
      req.onsuccess = () => {
        db.close(); // always close after use
        resolve(req.result ?? 0);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.error('❌ [Badge] getUnreadCount failed:', err);
    return 0;
  }
}

async function setUnreadCount(count: number): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve();
        return;
      }
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(Math.max(0, count), UNREAD_KEY);
      req.onsuccess = () => {
        db.close();
        resolve();
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.error('❌ [Badge] setUnreadCount failed:', err);
  }
}

async function incrementUnreadCount(): Promise<number> {
  const next = (await getUnreadCount()) + 1;
  await setUnreadCount(next);
  return next;
}

async function decrementUnreadCount(): Promise<number> {
  const next = Math.max(0, (await getUnreadCount()) - 1);
  await setUnreadCount(next);
  return next;
}

// ==========================================
// BADGE API
// ==========================================

async function syncBadge(count: number): Promise<void> {
  try {
    if ('setAppBadge' in self.navigator) {
      if (count > 0) {
        await (self.navigator as any).setAppBadge(count);
      } else {
        await (self.navigator as any).clearAppBadge();
      }
      console.log(`✅ [Badge] Set to ${count}`);
    }
  } catch (err) {
    console.error('❌ [Badge] syncBadge failed:', err);
  }
}

// ==========================================
// BROADCAST TO ALL CLIENTS
// ==========================================

async function broadcastToClients(message: object): Promise<void> {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage(message);
  }
}

// ==========================================
// CACHING STRATEGIES
// ==========================================

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 })],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 })],
  }),
);

// ==========================================
// PUSH HANDLER
// ==========================================

self.addEventListener('push', (event: PushEvent) => {
  event.waitUntil(
    (async () => {
      // ── Parse payload ──
      let data: PushPayload = {};

      if (event.data) {
        try {
          data = event.data.json();
        } catch {
          // Firefox sometimes sends plain text
          data = { title: 'Notification', body: event.data.text() };
        }
      }

      const title = data.title || 'Abytech Hub';

      const options: ExtendedNotificationOptions = {
        body: data.body || data.message || 'You have a new notification',
        icon: data.icon || '/pwa-192x192.png',
        badge: data.badge || '/pwa-72x72.png',
        tag: data.tag || data.notificationId || 'default-tag',
        renotify: true,
        requireInteraction: data.requireInteraction ?? false,
        silent: false,
        vibrate: data.vibrate || [300, 100, 300],
        timestamp: Date.now(),
        // Everything the click handler needs lives here
        data: {
          url: data.data?.url || data.url || '/',
          notificationId: data.data?.notificationId || data.notificationId || null,
        },
      };

      if (data.actions?.length) {
        options.actions = data.actions;
      }
      console.warn('NIFAD_+<+> :',options)

      try {
        await self.registration.showNotification(title, options);
        const newCount = await incrementUnreadCount();
        await syncBadge(newCount);

        // Let the open tab know a push arrived so it can refresh notifications
        await broadcastToClients({ type: 'PUSH_RECEIVED', notificationId: options.data?.notificationId });

        console.log('✅ [SW] Notification shown, badge =', newCount);
      } catch (err) {
        console.error('❌ [SW] Failed to show notification:', err);
      }
    })(),
  );
});

// ==========================================
// NOTIFICATION CLICK HANDLER
// ==========================================

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const { url, notificationId } = event.notification.data ?? {};

  // Append notificationId as query param so the app can auto-mark it read
  const destination = notificationId
    ? `${url || '/'}?notificationId=${notificationId}`
    : url || '/';

  console.log('🖱️ [SW] Notification clicked, opening:', destination, '| action:', event.action);

  event.waitUntil(
    (async () => {
      try {
        // Decrement badge
        const newCount = await decrementUnreadCount();
        await syncBadge(newCount);

        // Try to focus an existing tab at the same path
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const targetPath = new URL(destination, self.location.origin).pathname;

        for (const client of clients) {
          if (new URL(client.url).pathname === targetPath && 'focus' in client) {
            await client.focus();
            // Tell the focused tab to navigate if needed
            client.postMessage({ type: 'NAVIGATE', url: destination });
            return;
          }
        }

        // No matching tab — open a new one
        await self.clients.openWindow(destination);
      } catch (err) {
        console.error('❌ [SW] notificationclick error:', err);
      }
    })(),
  );
});

// ==========================================
// NOTIFICATION CLOSE HANDLER
// ==========================================

self.addEventListener('notificationclose', (event: NotificationEvent) => {
  const { notificationId } = event.notification.data ?? {};
  console.log('🚫 [SW] Notification dismissed, id:', notificationId);

  event.waitUntil(
    (async () => {
      const newCount = await decrementUnreadCount();
      await syncBadge(newCount);
    })(),
  );
});

// ==========================================
// MESSAGE HANDLER (from app clients)
// ==========================================

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { type, count } = event.data ?? {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    // App sends current unread count → sync badge
    case 'UPDATE_BADGE':
      event.waitUntil(
        (async () => {
          await setUnreadCount(count ?? 0);
          await syncBadge(count ?? 0);
        })(),
      );
      break;

    // App marks a single notification read
    case 'NOTIFICATION_READ':
      event.waitUntil(
        (async () => {
          const newCount = await decrementUnreadCount();
          await syncBadge(newCount);
        })(),
      );
      break;

    // App marks all notifications read
    case 'NOTIFICATIONS_ALL_READ':
      event.waitUntil(
        (async () => {
          await setUnreadCount(0);
          await syncBadge(0);
        })(),
      );
      break;

    default:
      console.warn('⚠️ [SW] Unknown message type:', type);
  }
});

// ==========================================
// BACKGROUND SYNC
// ==========================================

self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      (async () => {
        console.log('🔄 [SW] Background sync: sync-notifications');
        // Re-broadcast so open tabs can refetch
        await broadcastToClients({ type: 'SYNC_NOTIFICATIONS' });
      })(),
    );
  }
});

// ==========================================
// LIFECYCLE
// ==========================================

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('⚙️ [SW] Installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('✅ [SW] Activated');
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const count = await getUnreadCount();
      await syncBadge(count);
      console.log('✅ [SW] Claimed clients, badge restored to', count);
    })(),
  );
});

console.log('🚀 [SW] Initialized');