const CACHE='isingil-v1.0.0-13';
self.skipWaiting();
const FILES=['./','./index.html','./style.css','./app.js','./views.js','./icons.js','./assets/branding/isingil-app-icon.svg','./assets/branding/isingil-wordmark.svg','./domain.js','./db.js','./io.js','./invoice-template.js','./favicon.svg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./vendor/pdf-lib.min.js','./vendor/fontkit.umd.min.js','./vendor/jszip.min.js','./vendor/NotoSansJP.ttf'];
FILES.push(...FILES.filter(f=>/^\.\/[^/]+\.(js|css)$/.test(f)).map(f=>f+'?release=13'));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('isingil-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{if(!r.ok)throw Error('Offline');return r}).catch(()=>caches.match('./index.html')));return}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)))});
