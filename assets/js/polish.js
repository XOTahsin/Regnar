(()=>{
const $=s=>document.querySelector(s),on=(e,f)=>window.addEventListener(e,f,{passive:true});
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* header shadow + back-to-top */
const head=$('#header');let tick=false,up;
function onScroll(){if(tick)return;tick=true;requestAnimationFrame(()=>{const y=scrollY;head?.classList.toggle('scrolled',y>10);up?.classList.toggle('show',y>700);tick=false})}
/* floating WhatsApp + up button (number read from the live contact link) */
const fab=document.createElement('div');fab.className='fab';
fab.innerHTML='<button class="up" aria-label="Back to top"><svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg></button><a id="fabWa" href="#" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.1c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.2-3.6-.8-3-1.2-4.9-4.3-5.05-4.5-.15-.2-1.2-1.6-1.2-3s.75-2.1 1-2.4c.25-.3.55-.35.75-.35h.55c.2 0 .4 0 .6.45.2.5.7 1.7.75 1.8.05.1.1.25 0 .4-.1.2-.15.3-.3.45-.15.2-.3.35-.4.5-.15.15-.3.3-.15.6.15.3.7 1.15 1.5 1.85 1 .9 1.9 1.2 2.2 1.3.3.15.45.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.25.65-.15.25.1 1.65.8 1.95.95.3.15.5.2.55.3.1.1.1.6-.15 1.3z"/></svg></a>';
document.body.appendChild(fab);up=fab.querySelector('.up');
up.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
function syncWa(){const a=$('#contactWa'),f=$('#fabWa');if(a&&f&&a.href&&a.href.indexOf('wa.me')>-1)f.href=a.href}
new MutationObserver(syncWa).observe($('#contactWa')||document.body,{attributes:true,attributeFilter:['href']});syncWa();setTimeout(syncWa,1500);
/* modal state class (hides FAB, locks background) */
const modal=$('#modal');if(modal)new MutationObserver(()=>document.body.classList.toggle('modal-open',modal.classList.contains('open'))).observe(modal,{attributes:true,attributeFilter:['class']});
/* scroll reveal */
const io='IntersectionObserver'in window&&!reduce?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.06}):null;
function reveal(root){root.querySelectorAll?.('.section-title,.cat,.product,.value,.brand-story-inner,.custom-inner,.contact,.footer-main').forEach(el=>{if(el.classList.contains('rv'))return;el.classList.add('rv');const sib=[...el.parentNode.children].indexOf(el);el.style.setProperty('--d',Math.min(sib%4,3));if(io)io.observe(el);else el.classList.add('in')})}
reveal(document);
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches('.cat,.product'))reveal({querySelectorAll:()=>[n]});else reveal(n)}}))).observe(document.body,{childList:true,subtree:true});
/* tabs: keep active chip in view after tap */
$('#tabs')?.addEventListener('click',()=>setTimeout(()=>$('#tabs .active')?.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}),30));
/* menu: close on outside tap, lock scroll */
const menu=$('#menu');menu?.addEventListener('click',()=>setTimeout(()=>{document.body.style.overflow=head.classList.contains('menu-open')?'hidden':''},0));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{document.body.style.overflow=''}));
/* sheet: swipe down on the handle area to close */
const dlg=document.querySelector('.dialog');let sy=null;
dlg?.addEventListener('touchstart',e=>{sy=dlg.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
dlg?.addEventListener('touchend',e=>{if(sy!==null&&e.changedTouches[0].clientY-sy>110)$('#close')?.click();sy=null},{passive:true});
on('scroll',onScroll);onScroll();
})();
