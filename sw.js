const cacheName = 'zyad-public-v5-2';
const revision = '?v=20261104r4';
const assets = [
  './', 'studio/', 'studio/studio.js', 'studio/studio.css', 'manifest.webmanifest', 'assets/favicon.svg', 'assets/app-180.png',
  'assets/app-192.png', 'assets/app-512.png', 'assets/ornament.svg', 'assets/qr.png',
  ...['main.js', 'style.css', 'card.js', 'planner.js', 'templates.js', 'design.js']
    .flatMap(file => ['assets/' + file, 'assets/' + file + revision]),
  ...['royal', 'modern', 'night', 'heritage', 'desert', 'pearl']
    .map(id => 'images/templates/' + id + '.webp'),
  'data/config.json', 'data/history.json'
];
const allowed = new Set(assets.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('zyad-public-') && key !== cacheName)
    .map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const root = new URL(self.registration.scope);
  if (url.origin !== root.origin) return;
  if (event.request.mode === 'navigate' &&
      [root.pathname, root.pathname + 'index.html'].includes(url.pathname)) {
    url.href = root.href;
  } else if (['data/config.json', 'data/history.json', 'images/templates/']
    .some(path => url.pathname.startsWith(root.pathname + path))) {
    url.search = '';
  }
  if (!allowed.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type === 'basic') await cache.put(url.href, response.clone());
      return response;
    } catch (error) {
      const saved = await cache.match(url.href);
      if (saved) return saved;
      throw error;
    }
  })());
});
