// SVS Console offline cache. Bump CACHE on every release so phones pull fresh files.
const CACHE='svs-v19';
const ASSETS=['./','./index.html','./app.html','./links.html','./404.html','./manifest.json','./icon-192.png','./icon-512.png','./icon.svg','./favicon.ico'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // network-first so updates land, fall back to cache when offline
  e.respondWith(
    fetch(e.request).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./app.html')||caches.match('./index.html')))
  );
});
