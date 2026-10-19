// MusiX Service Worker - تشغيل الأوفلاين
const CACHE_NAME = 'musix-app-v1';
const SONGS_CACHE = 'musix-songs-v1';

// الملفات الأساسية للتطبيق (App Shell)
const APP_SHELL = [
  '/',
  '/icon.jpg',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

// تنشيط Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME && name !== SONGS_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // طلبات الأغاني المخزّنة — ابحث في cache الأغاني
  if (event.request.method === 'GET' && url.pathname.startsWith('/api/songs/') && url.pathname.endsWith('/stream')) {
    event.respondWith(
      caches.open(SONGS_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request.url);
        if (cached) return cached;
        try {
          const res = await fetch(event.request);
          if (res.ok) cache.put(event.request.url, res.clone());
          return res;
        } catch { return new Response('Offline', { status: 503 }); }
      })
    );
    return;
  }

  // باقي الطلبات — استراتيجية Cache First للتطبيق، Network First للـ API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request).then(r => r || new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } })))
    );
    return;
  }

  // App Shell — Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok && event.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});

// رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
