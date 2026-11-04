/* REGNAR visual effects: loader, hero wall light, ghost text, category overlays,
   title reveals, tilt, product reel, counters, heart burst, ripples */
const R=()=>window.REGNAR,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ar=()=>R()?.lang==='ar',L=(e,a)=>ar()?a:e,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,hov=matchMedia('(hover:hover)');
const t0=performance.now();
function hideLoader(){const go=()=>{document.documentElement.classList.add('loaded');try{sessionStorage.setItem('rg-seen','1')}catch(e){}};const wait=Math.max(0,1500-(performance.now()-t0));setTimeout(go,wait)}
setTimeout(()=>document.documentElement.classList.add('loaded'),5200);

/* hero: light beam + shadows follow scroll and pointer */
function heroLight(){const h=$('.hero2');if(!h||reduce)return;let px=0,sy=0,tick=false;const upd=()=>{tick=false;h.style.setProperty('--sx',(px*16+Math.min(14,sy/60)).toFixed(1));h.style.setProperty('--beam',(px*6+sy/90).toFixed(1)+'deg');h.style.setProperty('--py',Math.min(sy,600))};
 const req=()=>{if(!tick){tick=true;requestAnimationFrame(upd)}};addEventListener('scroll',()=>{sy=scrollY;req()},{passive:true});h.addEventListener('pointermove',e=>{const r=h.getBoundingClientRect();px=((e.clientX-r.left)/r.width-.5)*2;req()});upd()}

/* ghost outline text bands */
function ghosts(){const mk=(after,rev)=>{if(!after||after.nextElementSibling?.classList.contains('ghost'))return;const g=document.createElement('div');g.className='ghost'+(rev?' rev':'');g.setAttribute('aria-hidden','true');const t='REGNAR <i>✳</i> FRAME ART <i>✳</i> ';g.innerHTML='<div class="ghost-track">'+'<span>'+t.repeat(4)+'</span>'.repeat(1)+'<span>'+t.repeat(4)+'</span></div>';after.after(g)};
 mk($('#categories')||null,false);mk($('.brand-story'),true)}

/* category cards: photo-through gradient + grain */
function catFx(){$$('.cat').forEach(c=>{if(c.querySelector('.cat-fx'))return;const fx=document.createElement('span');fx.className='cat-fx';c.appendChild(fx);
 if(!c.querySelector('.cat-image')){const slug=c.dataset.cat,cat=R().categories.find(x=>x.slug===slug),p=cat&&R().products.find(x=>x.category_id===cat.id&&x.status!=='draft');if(p){c.classList.add('photo');fx.style.setProperty('--ph','url("'+R().thumb(p.cover_path).replace(/"/g,'%22')+'")')}}})}

/* titles: reveal */
function titles(){const io='IntersectionObserver'in window&&!reduce?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.2}):null;
 $$('.section-title h2,.custom h2,.contact h2,.brand-story-copy h2,#community h2').forEach(h=>{if(h.classList.contains('tr'))return;h.classList.add('tr');io?io.observe(h):h.classList.add('in')})}

/* tilt + glare */
function tilt(){if(!hov.matches||reduce)return;let raf=0;document.addEventListener('pointermove',e=>{const el=e.target.closest?.('.product-image,.cat');$$('.tilting').forEach(x=>{if(x!==el){x.classList.remove('tilting');x.style.removeProperty('--rx');x.style.removeProperty('--ry')}});if(!el)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.classList.add('tilting');el.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg');el.style.setProperty('--ry',((x-.5)*9).toFixed(2)+'deg');el.style.setProperty('--gx',(x*100).toFixed(0)+'%');el.style.setProperty('--gy',(y*100).toFixed(0)+'%')})});
 document.addEventListener('pointerleave',()=>$$('.tilting').forEach(x=>{x.classList.remove('tilting');x.style.removeProperty('--rx');x.style.removeProperty('--ry')}),true)}

/* product reel + counters */
function reel(){const prods=R().products.filter(p=>p.status!=='draft');let s=$('#reel');if(!prods.length){s?.remove();return}
 const strip=$('.strip');if(!strip)return;if(!s){s=document.createElement('section');s.id='reel';s.innerHTML='<div class="reel-track" id="reelTrack"></div><div class="counters wrap" id="counters"></div>';strip.after(s)}
 const reps=Math.max(1,Math.ceil(10/prods.length)),list=Array.from({length:reps},()=>prods).flat();
 const item=p=>`<button type="button" class="ri" data-open="${esc(p.id)}"><img loading="lazy" decoding="async" src="${esc(R().thumb(p.cover_path))}" alt="${esc(R().title(p))}"><span>${esc(R().title(p))}</span></button>`;
 const html=list.map(item).join('');const tr=$('#reelTrack',s);tr.innerHTML='<div class="reel-set">'+html+'</div><div class="reel-set" aria-hidden="true">'+html+'</div>';tr.style.setProperty('--dur',Math.max(30,list.length*5)+'s');
 const sold=prods.reduce((a,p)=>a+(Number(p.sales_count)||0),0),cats=new Set(prods.map(p=>p.category_id).filter(Boolean)).size;
 const stats=[[prods.length,L('Designs','تصميم')],[cats,L('Collections','مجموعة')]];if(sold>0)stats.push([sold,L('Frames sold','إطار مباع')]);
 $('#counters',s).innerHTML=stats.map(([n,l])=>`<div class="ct"><b data-n="${n}">0</b><span>${l}</span></div>`).join('');
 const run=el=>{const n=Number(el.dataset.n),d=1400,t=performance.now();const f=now=>{const k=Math.min(1,(now-t)/d),e=1-Math.pow(1-k,3);el.textContent=Math.round(n*e).toLocaleString(ar()?'ar-AE':'en-AE')+(k>=1&&n>=50?'+':'');if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
 const els=$$('.ct b',s);if(reduce||!('IntersectionObserver'in window)){els.forEach(e=>e.textContent=Number(e.dataset.n))}else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target)}}),{threshold:.6});els.forEach(e=>io.observe(e))}}

/* heart burst */
window.addEventListener('click',e=>{const h=e.target.closest?.('[data-heart],#btnHeart');if(!h||reduce)return;let id=h.dataset.heart||R().active?.id;try{if((JSON.parse(localStorage.getItem('regnar-wish'))||[]).includes(id))return}catch(x){}
 const r=h.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;for(let i=0;i<9;i++){const s=document.createElement('span');s.className='burst';s.textContent='♥';const a=(i/9)*Math.PI*2+Math.random()*.5,d=34+Math.random()*34;s.style.cssText=`left:${cx}px;top:${cy}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-14}px;font-size:${10+Math.random()*10}px;animation-delay:${Math.random()*60}ms`;document.body.appendChild(s);setTimeout(()=>s.remove(),900)}},true);
/* ripples */
document.addEventListener('pointerdown',e=>{const b=e.target.closest?.('.cta,.chips button,.dlg-tools button,.tabs button,.wa,.qz-opts button');if(!b||reduce)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement('span');s.className='ripple';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),650)});

function all(){catFx();titles()}
(function boot(){if(!window.REGNAR||!$('#modal'))return setTimeout(boot,60);heroLight();tilt();let n=0;const t=setInterval(()=>{n++;const ready=R().products.length||Object.keys(R().content||{}).length||n>30;if(ready){clearInterval(t);reel();all();hideLoader()}},300);
 new MutationObserver(()=>{catFx();titles()}).observe(document.body,{childList:true,subtree:true});
 new MutationObserver(()=>{reel()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']})})();
