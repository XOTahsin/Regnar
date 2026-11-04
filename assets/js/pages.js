(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cfg=window.REGNAR_CONFIG||{};let lang='en',wa=String(cfg.whatsappNumber||'').replace(/\D/g,'');
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function setLang(l){lang=l;document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';$('#en').hidden=l==='ar';$('#ar').hidden=l!=='ar';$('#lang').textContent=l==='ar'?'EN':'عربي';$('#back').textContent=l==='ar'?'→ العودة إلى ريجنار':'← Back to REGNAR';set('regnar-lang',l);waLink();observe()}
function setTheme(m){document.body.classList.toggle('dark',m==='dark');$('#theme').textContent=m==='dark'?'☀':'☾';set('regnar-theme',JSON.stringify(m))}
function waLink(){const msg=lang==='ar'?'مرحباً ريجنار، لدي سؤال.':'Hello REGNAR, I have a question.';$$('[data-wa]').forEach(a=>{if(wa.length>=8){a.href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg);a.target='_blank';a.rel='noopener'}else a.style.display='none'})}
$('#lang').onclick=()=>setLang(lang==='en'?'ar':'en');$('#theme').onclick=()=>setTheme(document.body.classList.contains('dark')?'light':'dark');
setTheme(String(get('regnar-theme')||'').replace(/"/g,'')==='dark'?'dark':'light');$('#yr').textContent=new Date().getFullYear();
/* reveal + toc highlight */
const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:0}):null;
const spy='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.target.id)$$('.toc a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-20% 0px -60% 0px',threshold:0}):null;
function observe(){$$('.rv').forEach(el=>{if(!io)el.classList.add('in');else if(el.offsetParent!==null)io.observe(el)});$$('.card').forEach(el=>{if(spy&&el.offsetParent!==null)spy.observe(el)})}
addEventListener('scroll',()=>{const h=document.documentElement;$('#progress').style.width=(scrollY/(h.scrollHeight-innerHeight||1)*100)+'%'},{passive:true});
/* pick up the live WhatsApp number from the store settings */
if(cfg.supabaseUrl)fetch(cfg.supabaseUrl+'/rest/v1/store_settings?id=eq.global&select=content',{headers:{apikey:cfg.supabasePublishableKey}}).then(r=>r.json()).then(d=>{const n=String(d?.[0]?.content?.whatsapp_number||'').replace(/\D/g,'');if(n.length>=8){wa=n;waLink()}}).catch(()=>{});
setLang(get('regnar-lang')==='ar'?'ar':'en');
})();
