// MusiX - Self-unregistering Service Worker
// هذا الملف يلغي أي Service Worker قديم وينظف الكاش
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // حذف كل الكاش القديم
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      // إلغاء تسجيل نفسه
      await self.registration.unregister();
      // إخبار كل العملاء بإعادة التحميل
      const clients = await self.clients.claim();
      const allClients = await self.clients.matchAll();
      allClients.forEach(client => client.postMessage({ type: 'UNREGISTERED' }));
    })()
  );
});

// تمرير كل الطلبات للشبكة مباشرة (بدون كاش)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })));
});
