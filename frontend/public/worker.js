self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
      console.log('Parsed JSON payload:', data);
    } catch (err) {
      console.error('Failed to parse JSON. Raw data:', event.data.text());
      // Fallback: show raw text
      data = { title: 'Notification', body: event.data.text() || 'You have a message.' };
    }
  } else {
    console.warn('Push received with no data');
    return;
  }

  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/apple-touch-icon-152x152.png',
    badge: '/icon-72x72.png',
    data: { url: data.url || '/' },
    tag: 'admin-notification', // prevents duplicates
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});