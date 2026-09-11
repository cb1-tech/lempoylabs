const CACHE = 'itala-pwa-v40';
const CORE = ['./', './index.html', './reminders.js?v=39', './journey-redesign.js?v=39', './insights.js?v=39', './history-redesign.js?v=39', './backup.js?v=40', './settings-redesign.js?v=40', './exec-9b619c4f-777e-4707-9c73-d066cbbbb662.png?v=1', './exec-d424a48f-0dee-4b4c-8889-98cd9cf3d09e.png?v=1', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', 'https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location.href).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
    const open = list[0];
    return open ? open.focus().then(() => open.navigate(target)) : clients.openWindow(target);
  }));
});
