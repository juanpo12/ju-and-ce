// Service worker de la libreta: solo notificaciones push, nada de caché.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nuestra libreta', {
      body: data.body,
      icon: '/iconos/icono-192.png',
      badge: '/iconos/icono-192.png',
      tag: data.tag || 'mimo',
      renotify: true,
      data: { url: data.url || '/' },
    }),
  );
});

// Tocar la notificación abre la app (o la trae al frente si ya estaba abierta).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ('focus' in v) {
          v.navigate?.(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
