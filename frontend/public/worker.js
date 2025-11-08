self.addEventListener('push', function(event) {
  if (!event.data) return;

  alert(event.data)

  let data = {};
  try {
    data = event.data.json();
  } catch (err) {
    console.error('❌ Invalid push payload:', err);
    return;
  }

  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/apple-touch-icon-152x152.png',
    badge: '/icon-72x72.png',
    data: {
      url: data.url || '/', // optional redirect URL
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// optional: handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url;

  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
