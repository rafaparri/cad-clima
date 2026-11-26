/* CAD Clima 2D: funciona sin conexión una vez instalada */
const V='cadclima-v1';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
const LIBS=['lib/libredwg-web.js','lib/libredwg-web.wasm','lib/pdf.min.mjs','lib/pdf.worker.min.mjs'];
self.addEventListener('install',ev=>{ev.waitUntil(caches.open(V).then(c=>c.addAll(CORE).then(()=>Promise.allSettled(LIBS.map(u=>c.add(u))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',ev=>{ev.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',ev=>{
  const r=ev.request,u=new URL(r.url),lib=u.pathname.includes('/lib/')||u.hostname==='cdn.jsdelivr.net';
  if(r.method==='HEAD'&&lib){ev.respondWith(caches.match(u.href).then(m=>m?new Response(null,{status:200}):fetch(r)));return}
  if(r.method!=='GET')return;
  if(lib){ev.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})));return}
  if(u.origin!==location.origin)return;
  /* la aplicación: primero la red (para recibir actualizaciones), si no hay conexión, la copia guardada */
  ev.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
