const CACHE='pocket-budget-v2';
const SHELL=['./','./index.html','./style.css','./flex.js','./app.js','./seed.json','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pocket-budget-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async cache=>{try{const response=await fetch(e.request);if(response.ok)await cache.put(e.request,response.clone());return response}catch(error){const saved=await cache.match(e.request);if(saved)return saved;throw error}}))});
