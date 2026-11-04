const V='regnar-v6',CORE=['/','/assets/css/store.css','/assets/css/polish.css','/assets/css/features.css','/assets/css/fx.css','/assets/js/fx.js','/assets/js/store.js','/assets/js/polish.js','/assets/js/features.js','/assets/regnar-logo.png','/config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
 if(u.pathname.startsWith('/admin')||u.hostname.endsWith('supabase.co')&&!u.pathname.includes('/storage/'))return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(k=>k.put(r,c));return x}).catch(()=>caches.match(r).then(x=>x||caches.match('/'))));return}
 e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(k=>k.put(r,c))}return x}).catch(()=>hit);return hit||net}))});
