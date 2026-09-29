var CACHE = 'gyaankosh-v1';
var ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'questions.js', 'manifest.webmanifest', 'img/icon-192.png', 'img/icon-512.png',
  'img/dashboard.jpg', 'img/signbackground.jpg', 'img/difficultyselectionbackground.jpg', 'img/easybackground.jpg', 'img/mediumbackground.jpg', 'img/hardbackground.jpg', 'img/profilebackground.jpg', 'img/leaderboardbackground.jpg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (r) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); return r; }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('index.html'); }); }));
});
