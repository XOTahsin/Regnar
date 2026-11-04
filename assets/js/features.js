/* REGNAR features: room preview, frame builder, photo-to-frame, quiz, wishlist, wall builder,
   size guide, share, install, dark mode, customer photos, bundles, tracking. */
const R=()=>window.REGNAR,cfg=window.REGNAR_CONFIG||{};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ar=()=>R()?.lang==='ar',L=(e,a)=>ar()?a:e,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const cur=x=>R().currency(x);
const offer=()=>{const c=R()?.content||{};return{q:Number(c.offer_bundle_qty)||0,pc:Number(c.offer_bundle_pct)||0,fd:Number(c.offer_free_delivery)||0}};
const minPrice=p=>Math.min(...R().sizes(p).map(s=>Number(s.price_aed??p.price_aed)||0));

/* ---------- tracking (anonymous counts) ---------- */
const sid=(()=>{try{let s=sessionStorage.getItem('rg-sid');if(!s){s=Math.random().toString(36).slice(2,12);sessionStorage.setItem('rg-sid',s)}return s}catch(e){return 'x'}})();
function track(event,product_id,label){try{R()?.db.from('analytics_events').insert({event,product_id:product_id||null,label:label?String(label).slice(0,110):null,sid}).then(()=>{},()=>{})}catch(e){}}

/* ---------- frames ---------- */
const FR={black:'#0e0f10',gold:'linear-gradient(135deg,#e2cf9f,#a88f5e 55%,#caa86e)',white:'#f2eee6',oak:'linear-gradient(135deg,#d2ac7c,#a77f52)',silver:'linear-gradient(135deg,#d9dcdf,#9ea2a7)',walnut:'linear-gradient(135deg,#6b4a35,#4a3123)'};
function frameOf(name){const n=String(name||'').toLowerCase();if(/gold|ذهب/.test(n))return 'gold';if(/white|أبيض|ابيض/.test(n))return 'white';if(/oak|wood|natural|خشب|طبيع/.test(n))return 'oak';if(/silver|فض/.test(n))return 'silver';if(/walnut|جوز/.test(n))return 'walnut';return 'black'}
const FR_LABEL={black:['Black','أسود'],gold:['Gold','ذهبي'],white:['White','أبيض'],oak:['Oak','بلوط'],silver:['Silver','فضي'],walnut:['Walnut','جوز']};
function dims(text){const t=String(text||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));const m=t.match(/(\d+(?:[.,]\d+)?)\s*(?:[x×*]|by)\s*(\d+(?:[.,]\d+)?)/i);return m?[parseFloat(m[1].replace(',','.')),parseFloat(m[2].replace(',','.'))]:null}

/* ---------- overlay helper ---------- */
let openOv=0;
function overlay(html,cls=''){const o=document.createElement('div');o.className='ov '+cls;o.innerHTML='<div class="ov-sheet" role="dialog" aria-modal="true"><button class="ov-x" aria-label="Close">×</button>'+html+'</div>';document.body.appendChild(o);document.body.style.overflow='hidden';openOv++;requestAnimationFrame(()=>o.classList.add('show'));
 const close=()=>{o.classList.remove('show');setTimeout(()=>{o.remove();openOv--;if(!openOv&&!$('#modal.open'))document.body.style.overflow=''},260);document.removeEventListener('keydown',esck,true)};
 const esck=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();close()}};document.addEventListener('keydown',esck,true);
 o.addEventListener('click',e=>{if(e.target===o||e.target.closest('.ov-x'))close()});
 let sy=null;const sh=$('.ov-sheet',o);sh.addEventListener('touchstart',e=>{sy=sh.scrollTop<=0?e.touches[0].clientY:null},{passive:true});sh.addEventListener('touchend',e=>{if(sy!==null&&e.changedTouches[0].clientY-sy>130&&innerWidth<700)close();sy=null},{passive:true});
 o.close=close;return o}

/* ---------- ROOM PREVIEW ---------- */
const WALLS=['#e9e2d4','#cfd6d2','#3b3f44','#d9c3b0'];
function sceneSVG(room,wall){const dark=wall==='#3b3f44',floor=dark?'#2a2623':'#b9a285',base=dark?'#2f3337':'#d8d0c2',tone=dark?'#e8e0d1':'#2a2a2a';
 const common=`<rect width="1000" height="720" fill="${wall}"/><rect y="640" width="1000" height="80" fill="${floor}"/><rect y="632" width="1000" height="10" fill="${base}"/><rect y="640" width="1000" height="6" fill="#0002"/>`;
 const plant=`<g transform="translate(860 470)"><rect x="-26" y="100" width="52" height="70" rx="6" fill="#7a5a43"/><path d="M0 100 C-70 40 -40 -30 0 -50 C40 -30 70 40 0 100Z" fill="#5b7a5a"/><path d="M0 100 C-20 30 -10 -10 0 -50 C10 -10 20 30 0 100Z" fill="#6f9470"/></g>`;
 if(room==='bed')return common+`<rect x="180" y="400" width="640" height="240" rx="10" fill="#f1ece2"/><rect x="200" y="330" width="600" height="110" rx="14" fill="#a89a86"/><rect x="190" y="410" width="620" height="80" rx="14" fill="#e6dfd1"/><rect x="215" y="360" width="240" height="70" rx="22" fill="#fbf8f2"/><rect x="545" y="360" width="240" height="70" rx="22" fill="#fbf8f2"/><rect x="190" y="470" width="620" height="170" rx="8" fill="#cbbfa9"/><rect x="100" y="520" width="70" height="120" rx="6" fill="#8b6d52"/><rect x="830" y="520" width="70" height="120" rx="6" fill="#8b6d52"/>`+plant.replace('860 470','940 470');
 if(room==='office')return common+`<rect x="200" y="400" width="600" height="26" rx="4" fill="#8b6d52"/><rect x="220" y="426" width="22" height="214" fill="#6e553f"/><rect x="758" y="426" width="22" height="214" fill="#6e553f"/><rect x="420" y="300" width="160" height="100" rx="6" fill="#1a1c1d"/><rect x="494" y="400" width="12" height="0" fill="#000"/><rect x="540" y="380" width="30" height="20" fill="#333"/><rect x="415" y="480" width="170" height="40" rx="14" fill="${tone}" opacity=".85"/><rect x="440" y="520" width="14" height="120" fill="${tone}" opacity=".85"/><rect x="546" y="520" width="14" height="120" fill="${tone}" opacity=".85"/>`+plant.replace('860 470','130 470');
 return common+`<rect x="130" y="470" width="740" height="170" rx="22" fill="#8a8f86"/><rect x="150" y="355" width="700" height="150" rx="28" fill="#9aa097"/><rect x="100" y="430" width="70" height="210" rx="26" fill="#7d8279"/><rect x="830" y="430" width="70" height="210" rx="26" fill="#7d8279"/><rect x="200" y="400" width="190" height="90" rx="18" fill="#c9a878" opacity=".9"/><rect x="610" y="400" width="190" height="90" rx="18" fill="#e7e0d2"/><rect x="160" y="636" width="680" height="10" rx="5" fill="#0003"/>`+plant;}
function openRoom(o){const src=o.src,[w,h]=o.dims||[50,70];let room=o.room||'sofa',wall=WALLS[0],finish=o.finish||'black';
 const ov=overlay(`<div class="rp"><h3>${L('See it on your wall','شاهدها على جدارك')}</h3><p class="mut">${L('Real proportions: the wall is about 3 m wide. Artwork shown at','النِسَب حقيقية: عرض الجدار حوالي ٣ أمتار. حجم العمل')} <b>${w} × ${h} cm</b>.</p><div class="rp-stage" id="rpStage"></div><div class="rp-ctrl"><div class="chips" id="rpRoom"></div><div class="chips" id="rpWall"></div><div class="chips" id="rpFrame"></div></div></div>`,'ov-wide');
 const stage=$('#rpStage',ov);
 function draw(){const s=3.333,pw=w*s,ph=h*s;const anchor=room==='bed'?300:room==='office'?290:297;const top=Math.max(14,anchor-ph);const pad=Math.max(5,Math.min(14,pw/45));
  stage.innerHTML=`<svg viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid slice">${sceneSVG(room,wall)}</svg><div class="rp-art" style="left:${(500-pw/2)/10}%;top:${top/7.2}%;width:${pw/10}%;height:${ph/7.2}%;--fr:${FR[finish]};padding:${pad/ (pw/100)}%"><span class="rp-mat"><img src="${esc(src)}" alt=""></span></div>`}
 const chips=(id,items,get,set)=>{const el=$(id,ov);el.innerHTML=items.map(([k,l,sw])=>`<button type="button" class="${get()===k?'on':''}" data-k="${k}">${sw?`<i style="background:${sw}"></i>`:''}${l}</button>`).join('');el.onclick=e=>{const b=e.target.closest('button');if(!b)return;set(b.dataset.k);chips(id,items,get,set);draw()}};
 chips('#rpRoom',[['sofa',L('Living room','صالة')],['bed',L('Bedroom','غرفة نوم')],['office',L('Office','مكتب')]],()=>room,v=>room=v);
 chips('#rpWall',WALLS.map(c=>[c,'',c]),()=>wall,v=>wall=v);
 chips('#rpFrame',Object.keys(FR).map(k=>[k,L(FR_LABEL[k][0],FR_LABEL[k][1]),null]),()=>finish,v=>finish=v);
 draw();track('room_preview',o.pid,room)}

/* ---------- PRODUCT MODAL ENHANCEMENTS ---------- */
let modalReady=false;
function buildModal(){const img=$('#detailImage');if(!img)return;
 if(!modalReady){modalReady=true;const info=$('.dialog-info');
  const tools=document.createElement('div');tools.className='dlg-tools';tools.innerHTML='<button type="button" id="btnShare"></button><button type="button" id="btnHeart" class="hrt" aria-label="Wishlist"></button>';
  const price=$('.detail-price-row');info.insertBefore(tools,price);
  const tl=document.createElement('div');tl.id='dlgTimeline';tl.className='tl';$('#detailEnquire').before(tl);
  const lim=document.createElement('div');lim.id='dlgLimited';price.before(lim);
  $('#btnShare').onclick=()=>share(R().active);
  $('#btnHeart').onclick=()=>toggleWish(R().active?.id);
  img.style.cursor='zoom-in';img.addEventListener('click',()=>zoomBox(img.src));
  $('#detailSize').addEventListener('change',paintTL);
  const de=$('.dialog-image');let sx=null;de.addEventListener('touchstart',e=>{sx=e.touches.length===1?e.touches[0].clientX:null},{passive:true});de.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)<50)return;const bs=$$('#detailGallery button');if(bs.length<2)return;let i=bs.findIndex(b=>b.classList.contains('active'));i=(i+(dx<0?1:-1)+bs.length)%bs.length;bs[i].click()},{passive:true});
 }
 const p=R().active;if(!p)return;paintTL();
 $('#btnShare').textContent='↗ '+L('Share','مشاركة');
 paintHeart();paintLimited(p);track('view_product',p.id,R().title(p))}
function paintTL(){const p=R().active,el=$('#dlgTimeline');if(!el||!p)return;const mto=p.status==='made_to_order'||$('#detailSize').value==='custom',oos=p.status==='out_of_stock';const days=mto?L(cfg.deliveryMade||'7–10 days',cfg.deliveryMadeAr||cfg.deliveryMade):L(cfg.deliveryReady||'2–4 days',cfg.deliveryReadyAr||cfg.deliveryReady);
 el.innerHTML=oos?`<b>${L('Currently out of stock','غير متوفر حالياً')}</b> · ${L('Ask us about the next batch','اسألنا عن الدفعة القادمة')}`:`<div class="tl-row"><span><i>1</i>${L('Enquire','استفسر')}</span><span><i>2</i>${mto?L('Made for you','يُجهّز لك'):L('Framed & packed','يُؤطَّر ويُغلَّف')}</span><span><i>3</i>${L('Delivered','يصل إليك')}</span></div><small>${L('Estimated','التقدير')}: <b>${esc(days)}</b> ${offer().fd?'· '+L('Free delivery over','توصيل مجاني فوق')+' '+cur(offer().fd):''}</small>`}
function limitedLeft(p){const v=p.limited_left??cfg.limited?.[p.id];return v&&Number(v)>0?Number(v):0}
function paintLimited(p){const n=limitedLeft(p),el=$('#dlgLimited');if(el)el.innerHTML=n?`<span class="ltd">${L('Limited edition','إصدار محدود')} · ${L('only','بقي')} ${n} ${L('left','فقط')}</span>`:''}
function paintHeart(){const p=R().active,b=$('#btnHeart');if(!b||!p)return;const on=wish().includes(p.id);b.classList.toggle('on',on);b.textContent=on?'♥':'♡'}

/* ---------- ZOOM LIGHTBOX (pinch / double-tap / drag) ---------- */
function zoomBox(src){const o=overlay(`<div class="zb"><img src="${esc(src)}" alt="" draggable="false"></div><p class="zb-hint">${L('Pinch or double-tap to zoom','قرّب بإصبعين أو بنقرتين')}</p>`,'ov-zoom');const box=$('.zb',o),im=$('img',box);let s=1,x=0,y=0;const pts=new Map();let d0=0,s0=1;
 const apply=()=>{s=Math.max(1,Math.min(5,s));if(s===1){x=0;y=0}im.style.transform=`translate(${x}px,${y}px) scale(${s})`};
 box.addEventListener('pointerdown',e=>{box.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const[a,b]=[...pts.values()];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);s0=s}});
 box.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const prev=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const[a,b]=[...pts.values()];s=s0*Math.hypot(a[0]-b[0],a[1]-b[1])/d0;apply()}else if(s>1){x+=e.clientX-prev[0];y+=e.clientY-prev[1];apply()}});
 const up=e=>pts.delete(e.pointerId);box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);
 box.addEventListener('dblclick',()=>{s=s>1?1:2.6;apply()});box.addEventListener('wheel',e=>{e.preventDefault();s*=e.deltaY<0?1.15:.87;apply()},{passive:false})}

/* ---------- SIZE GUIDE ---------- */
function openGuide(p){let list=[];if(p)R().sizes(p).forEach(s=>{const d=dims(s.label_en||s.label_ar);if(d)list.push({d,label:ar()&&s.label_ar?s.label_ar:s.label_en})});
 if(!list.length)list=[[21,30],[30,42],[40,50],[50,70],[70,100]].map(d=>({d,label:d.join(' × ')+' cm'}));
 const H=170,sc=200/H*1.0,ph=H*sc,pxs=list.map(o=>({w:o.d[0]*sc,h:o.d[1]*sc,label:o.label}));const W=60+pxs.reduce((a,o)=>a+o.w+18,0);
 const person=`<g><circle cx="26" cy="${ph-H*sc+16}" r="14" fill="#8a8579"/><rect x="12" y="${ph-H*sc+32}" width="28" height="${H*sc*.42}" rx="12" fill="#8a8579"/><rect x="14" y="${ph-H*sc+32+H*sc*.4}" width="10" height="${H*sc*.42}" fill="#7a766b"/><rect x="28" y="${ph-H*sc+32+H*sc*.4}" width="10" height="${H*sc*.42}" fill="#7a766b"/></g>`;
 let cx=70;const frames=pxs.map(o=>{const r=`<g><rect x="${cx}" y="${ph-o.h-Math.min(60,ph-o.h)*0}" width="${o.w}" height="${o.h}" fill="#f2ede2" stroke="#b39a70" stroke-width="3"/><text x="${cx+o.w/2}" y="${ph+16}" text-anchor="middle" font-size="11" fill="#77766f">${esc(o.label)}</text></g>`;cx+=o.w+18;return r}).join('');
 overlay(`<h3>${L('Size guide','دليل المقاسات')}</h3><p class="mut">${L('Every frame drawn to scale next to a 170 cm person.','كل إطار مرسوم بالمقياس بجانب شخص طوله ١٧٠ سم.')}</p><div class="sg"><svg viewBox="0 0 ${Math.max(W,320)} ${ph+34}" style="min-width:${Math.max(W,320)}px;height:${ph+34}px"><line x1="0" y1="${ph}" x2="${Math.max(W,320)}" y2="${ph}" stroke="#0003"/>${person}${frames}</svg></div><p class="mut">${L('Tip: leave about 15–25 cm between the frame and the top of the sofa or table.','نصيحة: اترك نحو ١٥–٢٥ سم بين الإطار وأعلى الأريكة أو الطاولة.')}</p>`,'')}

/* ---------- SHARE ---------- */
async function share(p){if(!p)return;const url=location.origin+'/?p='+encodeURIComponent(p.id);track('share',p.id);try{if(navigator.share){await navigator.share({title:R().title(p)+' · REGNAR',text:L('Look at this frame from REGNAR','شاهد هذا الإطار من ريجنار'),url});return}}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(url);R().toast(L('Link copied','تم نسخ الرابط'))}catch(e){prompt('Copy',url)}}

/* ---------- WISHLIST ---------- */
const wish=()=>store.get('regnar-wish',[]);
function toggleWish(id){if(!id)return;let w=wish();const had=w.includes(id);w=had?w.filter(x=>x!==id):[...w,id];store.set('regnar-wish',w);if(!had)track('wishlist_add',id);syncHearts();paintHeart();const b=$('#wishCount');b.textContent=w.length||'';b.hidden=!w.length;if(!had&&!reduce){const h=$('#wishBtn');h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop')}if($('#wishList'))paintWish()}
function syncHearts(){const w=wish();$$('[data-heart]').forEach(b=>{const on=w.includes(b.dataset.heart);b.classList.toggle('on',on);b.textContent=on?'♥':'♡'})}
function bundleInfo(items){const {q,pc}=offer();const sub=items.reduce((a,p)=>a+minPrice(p),0);let save=0;if(q&&pc&&items.length>=q)save=Math.round(sub*pc/100);const total=sub-save;let msg='';if(q&&pc){msg=items.length>=q?`🎉 ${L('Bundle offer applied','تم تطبيق عرض الباقة')}: −${cur(save)}`:`${L('Add','أضف')} ${q-items.length} ${L('more for','للحصول على')} ${pc}% ${L('off','خصم')}`}
 const fd=offer().fd;if(fd)msg+=(msg?'<br>':'')+(total>=fd?'🚚 '+L('Free delivery unlocked','التوصيل مجاني'):`🚚 ${L('Add','أضف')} ${cur(fd-total)} ${L('more for free delivery','للتوصيل المجاني')}`);return{sub,save,total,msg}}
function paintWish(){const items=wish().map(id=>R().products.find(p=>p.id===id)).filter(Boolean),el=$('#wishList');if(!el)return;
 if(!items.length){el.innerHTML=`<p class="mut">${L('Tap the ♡ on any design to save it here.','اضغط ♡ على أي تصميم لحفظه هنا.')}</p>`;return}
 const b=bundleInfo(items);el.innerHTML=items.map(p=>`<div class="wl"><img src="${esc(R().thumb(p.cover_path))}" alt=""><div><b>${esc(R().title(p))}</b><small>${L('from','ابتداءً من')} ${cur(minPrice(p))}</small></div><button type="button" data-open="${esc(p.id)}" class="mini">${L('View','عرض')}</button><button type="button" data-rm="${esc(p.id)}" aria-label="Remove">×</button></div>`).join('')+`<div class="wl-sum"><div>${L('Subtotal','المجموع')} <b>${cur(b.sub)}</b></div>${b.save?`<div>${L('Bundle saving','وفر الباقة')} <b>−${cur(b.save)}</b></div>`:''}<div class="big">${L('Estimated total','الإجمالي التقديري')} <b>${cur(b.total)}</b></div><small>${b.msg}</small></div><button type="button" class="cta wide" id="wishSend">${L('Send my favourites on WhatsApp','أرسل مفضلتي عبر واتساب')}</button>`}
function openWish(){const o=overlay(`<h3>♥ ${L('My favourites','مفضلتي')}</h3><div id="wishList"></div>`,'ov-side');paintWish();o.addEventListener('click',e=>{const rm=e.target.closest('[data-rm]');if(rm){toggleWish(rm.dataset.rm);return}if(e.target.closest('[data-open]')){o.close()}if(e.target.closest('#wishSend')){const items=wish().map(id=>R().products.find(p=>p.id===id)).filter(Boolean),b=bundleInfo(items);track('whatsapp_click',null,'wishlist');R().wa(L('Hello REGNAR, these are my favourites:\n','مرحباً ريجنار، هذه تصاميمي المفضلة:\n')+items.map((p,i)=>`${i+1}. ${R().title(p)} — ${L('from','من')} ${cur(minPrice(p))}`).join('\n')+`\n${L('Estimated total','الإجمالي التقديري')}: ${cur(b.total)}\n${L('Please confirm availability and delivery.','يرجى تأكيد التوفر والتوصيل.')}`)}})}

/* ---------- MOOD QUIZ ---------- */
const MOODS={calm:/calm|minimal|soft|nature|landscape|sea|ocean|sky|green|blue|mountain|zen|هدوء|طبيع|بحر|جبل/i,bold:/abstract|modern|bold|colou?r|pop|geometric|contrast|art|تجريد|حديث|جريء/i,cozy:/warm|cozy|home|family|photo|vintage|flower|floral|coffee|دافئ|عائل|زهور|قهوة/i,elegant:/calligraphy|gold|luxury|classic|arabic|black|white|line|خط|ذهب|فاخر|كلاسيك|عربي/i};
const ROOMS={living:/living|sofa|lounge|abstract|modern|landscape/i,bed:/bed|calm|soft|nature|minimal|floral/i,office:/office|motivat|work|modern|minimal|abstract|calligraphy/i,kids:/kid|child|fun|animal|cartoon/i};
const TONES={warm:/warm|gold|orange|brown|sand|red|earth|دافئ|ذهب/i,cool:/blue|green|sea|ocean|cool|sky|mint|أزرق|أخضر/i,neutral:/neutral|beige|white|minimal|grey|gray|line|محايد|أبيض/i,dark:/black|dark|night|noir|moody|أسود|داكن/i};
function openQuiz(){const steps=[{k:'mood',q:L('What feeling do you want on your wall?','ما الإحساس الذي تريده على جدارك؟'),o:[['calm',L('Calm & airy','هادئ ومريح')],['bold',L('Bold & expressive','جريء ومعبّر')],['cozy',L('Warm & cozy','دافئ وحميم')],['elegant',L('Elegant & refined','أنيق وراقٍ')]]},{k:'room',q:L('Which room is it for?','لأي غرفة؟'),o:[['living',L('Living room','الصالة')],['bed',L('Bedroom','غرفة النوم')],['office',L('Office','المكتب')],['kids',L('Kids / other','أطفال / أخرى')]]},{k:'tone',q:L('Your colour mood?','ألوانك المفضلة؟'),o:[['warm',L('Warm tones','ألوان دافئة')],['cool',L('Cool tones','ألوان باردة')],['neutral',L('Neutral','محايدة')],['dark',L('Dark & moody','داكنة')]]}];let i=0;const ans={};
 const o=overlay('<div id="qz"></div>','ov-quiz');const box=$('#qz',o);
 const show=()=>{if(i>=steps.length)return result();const s=steps[i];box.innerHTML=`<div class="qz-bar"><i style="width:${(i/steps.length)*100}%"></i></div><small class="mut">${i+1} / ${steps.length}</small><h3>${s.q}</h3><div class="qz-opts">${s.o.map(([k,l])=>`<button type="button" data-k="${k}">${l}</button>`).join('')}</div>`};
 box.addEventListener('click',e=>{const b=e.target.closest('.qz-opts button');if(b){ans[steps[i].k]=b.dataset.k;i++;show()}const op=e.target.closest('[data-open]');if(op)o.close()});
 function result(){const prods=R().products.filter(p=>p.status!=='draft');const sc=prods.map(p=>{const txt=[p.title_en,p.title_ar,p.description_en,p.description_ar,p.categories?.name_en,p.categories?.name_ar,(p.finishes||[]).join(' ')].join(' ');let s=0;if(MOODS[ans.mood].test(txt))s+=3;if(ROOMS[ans.room].test(txt))s+=2;if(TONES[ans.tone].test(txt))s+=2;if(p.is_featured)s+=.6;if(p.is_top_rated)s+=.8;s+=Math.min(.5,(Number(p.sales_count)||0)/100);return{p,s}}).sort((a,b)=>b.s-a.s).slice(0,4);track('quiz_complete',null,Object.values(ans).join('/'));
  box.innerHTML=`<div class="qz-bar"><i style="width:100%"></i></div><h3>${L('Your picks','اختياراتك')}</h3>${sc.length?`<div class="qz-res">${sc.map(({p})=>`<button type="button" class="qr" data-open="${esc(p.id)}"><img src="${esc(R().thumb(p.cover_path))}" alt=""><b>${esc(R().title(p))}</b><small>${L('from','من')} ${cur(minPrice(p))}</small></button>`).join('')}</div>`:`<p class="mut">${L('Our collection is being prepared. Message us and we will recommend pieces for you.','المجموعة قيد الإعداد. راسلنا وسنقترح عليك قطعاً مناسبة.')}</p>`}<div class="qz-actions"><button type="button" class="cta" id="qzWa">${L('Ask REGNAR to style my wall','اطلب من ريجنار تنسيق جداري')}</button><button type="button" class="under" id="qzAgain">${L('Retake','أعد الاختبار')}</button></div>`;
  $('#qzAgain',box).onclick=()=>{i=0;show()};$('#qzWa',box).onclick=()=>{track('whatsapp_click',null,'quiz');R().wa(L('Hello REGNAR, I took your mood quiz.\nMood: ','مرحباً ريجنار، أجريت اختبار الأسلوب.\nالإحساس: ')+ans.mood+L('\nRoom: ','\nالغرفة: ')+ans.room+L('\nColours: ','\nالألوان: ')+ans.tone+L('\nCan you suggest pieces?','\nهل تقترحون قطعاً مناسبة؟'))}}
 show()}

/* ---------- GALLERY WALL BUILDER ---------- */
function openWall(){let picks=[];const o=overlay(`<h3>${L('Build your gallery wall','صمّم جدارك الفني')}</h3><p class="mut">${L('Tap designs to add (max 5), drag to arrange.','اضغط لإضافة التصاميم (٥ كحد أقصى) واسحب للترتيب.')}</p><div class="gw" id="gw"><p class="gw-empty">${L('Your wall is empty','جدارك فارغ')}</p></div><div class="gw-tray" id="gwTray"></div><div class="gw-sum" id="gwSum"></div><div class="gw-actions"><button type="button" class="under" id="gwAuto">${L('Auto-arrange','ترتيب تلقائي')}</button><button type="button" class="cta" id="gwSend">${L('Send this wall on WhatsApp','أرسل هذا الجدار عبر واتساب')}</button></div>`,'ov-wide');
 const wall=$('#gw',o),tray=$('#gwTray',o),prods=R().products.filter(p=>p.status!=='draft');
 tray.innerHTML=prods.length?prods.map(p=>`<button type="button" data-add="${esc(p.id)}"><img src="${esc(R().thumb(p.cover_path))}" alt="${esc(R().title(p))}"></button>`).join(''):`<p class="mut">${L('Designs will appear here.','ستظهر التصاميم هنا.')}</p>`;
 const POS=[[50,52,34],[22,40,24],[78,40,24],[30,72,20],[70,72,20]];
 function paint(){wall.innerHTML=picks.length?picks.map((k,idx)=>{const p=prods.find(x=>x.id===k.id);return`<div class="gw-it" data-i="${idx}" style="left:${k.x}%;top:${k.y}%;width:${k.w}%"><span class="gw-fr"><img src="${esc(R().thumb(p.cover_path))}" alt="" draggable="false"></span><button type="button" class="gw-x" data-x="${idx}" aria-label="Remove">×</button></div>`}).join(''):`<p class="gw-empty">${L('Your wall is empty','جدارك فارغ')}</p>`;
  const items=picks.map(k=>prods.find(x=>x.id===k.id)),b=bundleInfo(items);$('#gwSum',o).innerHTML=items.length?`<b>${items.length} ${L('frames','إطارات')} · ${cur(b.total)}</b><br><small>${b.msg}</small>`:''}
 const auto=()=>{picks.forEach((k,i)=>{const [x,y,w]=POS[i];k.x=x;k.y=y;k.w=w});paint()};
 tray.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;if(picks.length>=5){R().toast(L('Wall is full (5 frames)','الجدار ممتلئ (٥ إطارات)'));return}picks.push({id:b.dataset.add,x:50,y:50,w:24});auto()});
 $('#gwAuto',o).onclick=auto;
 let drag=null;wall.addEventListener('pointerdown',e=>{const x=e.target.closest('[data-x]');if(x){picks.splice(+x.dataset.x,1);auto();return}const it=e.target.closest('.gw-it');if(!it)return;it.setPointerCapture(e.pointerId);drag={i:+it.dataset.i,el:it,r:wall.getBoundingClientRect()}});
 wall.addEventListener('pointermove',e=>{if(!drag)return;const k=picks[drag.i];k.x=Math.max(8,Math.min(92,(e.clientX-drag.r.left)/drag.r.width*100));k.y=Math.max(10,Math.min(90,(e.clientY-drag.r.top)/drag.r.height*100));drag.el.style.left=k.x+'%';drag.el.style.top=k.y+'%'});
 const end=()=>{drag=null};wall.addEventListener('pointerup',end);wall.addEventListener('pointercancel',end);
 $('#gwSend',o).onclick=()=>{if(!picks.length){R().toast(L('Add at least one design','أضف تصميماً واحداً على الأقل'));return}const items=picks.map(k=>prods.find(x=>x.id===k.id)),b=bundleInfo(items);track('whatsapp_click',null,'wall');R().wa(L('Hello REGNAR, I planned a gallery wall:\n','مرحباً ريجنار، خططت لجدار فني:\n')+items.map((p,i)=>`${i+1}. ${R().title(p)}`).join('\n')+`\n${L('Estimated total','الإجمالي التقديري')}: ${cur(b.total)}\n${L('Please advise sizes and frames.','يرجى اقتراح المقاسات والإطارات.')}`)}}

/* ---------- PHOTO-TO-FRAME (custom form) ---------- */
function setupPhotoFrame(){const form=$('#customForm');if(!form||$('#pfBox'))return;const box=document.createElement('div');box.id='pfBox';box.className='pf';
 box.innerHTML=`<label class="pf-drop"><input type="file" id="pfFile" accept="image/*" hidden><span id="pfHint">📷 ${L('Upload your photo to preview it framed','ارفع صورتك لمعاينتها داخل إطار')}</span></label><div class="pf-prev" id="pfPrev" hidden><div class="pf-frame" id="pfFrame"><span class="fb-mat"><img id="pfImg" alt=""></span></div></div><div class="chips" id="pfChips" hidden></div><button type="button" class="under" id="pfRoom" hidden>🖼 ${L('See it on a wall','شاهدها على جدار')}</button>`;
 form.insertBefore(box,form.firstElementChild);let fk='black',url=null;const notes=form.elements.notes,TAG='\n[Photo frame: ';
 const chips=()=>{$('#pfChips').innerHTML=Object.keys(FR).map(k=>`<button type="button" class="${fk===k?'on':''}" data-k="${k}"><i style="background:${FR[k]}"></i>${L(FR_LABEL[k][0],FR_LABEL[k][1])}</button>`).join('')};
 const note=()=>{if(!url)return;const base=notes.value.split(TAG)[0].trim();notes.value=(base+TAG+FR_LABEL[fk][0]+' frame · I will send the photo here on WhatsApp]').trim()};
 $('#pfFile').onchange=e=>{const f=e.target.files[0];if(!f)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(f);const im=$('#pfImg');im.onload=()=>{const r=im.naturalWidth/im.naturalHeight;$('#pfFrame').style.aspectRatio=r>=1?'4/3':'3/4';im.style.aspectRatio=r>=1?'4/3':'3/4'};im.src=url;$('#pfPrev').hidden=false;$('#pfChips').hidden=false;$('#pfRoom').hidden=false;$('#pfHint').textContent='📷 '+f.name.slice(0,28)+' · '+L('tap to change','اضغط للتغيير');chips();paint();note();track('photo_frame')};
 const paint=()=>$('#pfFrame').style.setProperty('--fr',FR[fk]);
 $('#pfChips').onclick=e=>{const b=e.target.closest('button');if(!b)return;fk=b.dataset.k;chips();paint();note()};
 $('#pfRoom').onclick=()=>{const d=dims(form.elements.size.value)||[50,70];openRoom({src:url,dims:d,finish:fk})};
 form.addEventListener('input',e=>{if(e.target===notes)return});form.addEventListener('reset',()=>{url=null})}

/* ---------- OFFER BAR (controlled from Admin → Storefront → Offers) ---------- */
function relabel(){let ob=$('#offerBar');const {q,pc,fd}=offer();const parts=[];if(q&&pc)parts.push(`✦ ${L('Any','أي')} ${q} ${L('designs','تصاميم')} · ${pc}% ${L('off','خصم')}`);if(fd)parts.push(`🚚 ${L('Free delivery over','توصيل مجاني فوق')} ${cur(fd)}`);
 if(!parts.length){ob?.remove();return}
 if(!ob){const t=$('#collection .tools');if(!t)return;ob=document.createElement('div');ob.id='offerBar';ob.className='offer';t.before(ob)}
 ob.innerHTML=parts.map(x=>`<span>${x}</span>`).join('')}

/* ---------- CUSTOMER PHOTOS ---------- */
function setupCommunity(){const list=R().content.customer_photos||cfg.customerPhotos||[];let s=$('#community');if(!Array.isArray(list)||!list.length){s?.remove();return}
 if(!s){s=document.createElement('section');s.id='community';s.className='section wrap';($('#contact')||$('main')).before(s)}
 s.innerHTML=`<div class="section-title"><div><h2>${L('In your homes.','في بيوتكم.')}</h2></div><p>${L('Real walls, real customers.','جدران حقيقية من عملائنا.')}</p></div><div class="comm">${list.map(c=>{const u=c.url||(c.path?R().img(c.path):'');return `<figure><img loading="lazy" decoding="async" src="${esc(u)}" alt="${esc(c.caption||'')}"><figcaption><b>${esc(c.name||'')}</b>${c.caption?'<small>'+esc(c.caption)+'</small>':''}</figcaption></figure>`}).join('')}</div>`}

/* ---------- CARDS: hearts, limited badge, 2nd image ---------- */
function decorate(card){if(card.dataset.dec)return;card.dataset.dec=1;const id=card.dataset.product,p=R().products.find(x=>x.id===id);if(!p)return;const im=card.querySelector('.product-image');if(!im)return;
 const main=im.querySelector('.product-main-img');if(main){const pz=document.createElement('div');pz.className='pz';main.before(pz);pz.appendChild(main)}
 const h=document.createElement('button');h.type='button';h.className='heart';h.dataset.heart=id;h.setAttribute('aria-label','Wishlist');h.textContent=wish().includes(id)?'♥':'♡';h.classList.toggle('on',wish().includes(id));im.appendChild(h);
 const n=limitedLeft(p);if(n){const t=card.querySelector('.product-tags');if(t)t.insertAdjacentHTML('beforeend',`<span class="tag ltd-tag">${L('Limited','محدود')} · ${n}</span>`)}
 const paths=R().galleryPaths(p);if(paths.length>1){card._paths=paths;const dots=document.createElement('span');dots.className='pdots';dots.innerHTML=paths.slice(0,6).map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('');im.appendChild(dots);card.dataset.pi=0}}
/* slide to image i (dir 1 = from right, -1 = from left) */
function go(card,i,dir=1,ms=900){const paths=card._paths;if(!paths||card._busy)return;const pz=card.querySelector('.pz'),old=pz?.querySelector('.product-main-img');if(!old)return;card._busy=true;
 const nx=document.createElement('img');nx.alt=old.alt;nx.decoding='async';nx.className='slide-img';nx.dataset.full=R().img(paths[i]);
 const fin=()=>{card._busy=false};nx.onerror=fin;
 nx.onload=()=>{nx.classList.add('ready');nx.style.transform=`translateX(${dir*100}%)`;pz.appendChild(nx);void nx.offsetWidth;const tr=`transform ${ms}ms cubic-bezier(.65,0,.25,1)`;old.style.transition=nx.style.transition=tr;old.style.transform=`translateX(${-dir*100}%)`;nx.style.transform='translateX(0)';
  setTimeout(()=>{old.remove();nx.classList.remove('slide-img');nx.classList.add('product-main-img');nx.style.transition='';nx.style.transform='';card.dataset.pi=i;$$('.pdots i',card).forEach((d,n)=>d.classList.toggle('on',n===i));card._busy=false},ms+40)};
 nx.src=R().thumb(paths[i])}
function resetCard(card){const paths=card._paths;if(!paths||card.dataset.pi==='0'&&!card._busy)return;const pz=card.querySelector('.pz');if(!pz)return;[...pz.querySelectorAll('img')].forEach((x,n,arr)=>{if(n<arr.length-1)x.remove()});const m=pz.querySelector('img');if(m){m.style.transition='';m.style.transform='';m.classList.remove('slide-img');m.classList.add('product-main-img','ready');m.src=R().thumb(paths[0])}card.dataset.pi=0;card._busy=false;$$('.pdots i',card).forEach((d,n)=>d.classList.toggle('on',n===0))}
function decorateAll(){$$('.product[data-product]').forEach(decorate)}
document.addEventListener('click',e=>{const h=e.target.closest('[data-heart]');if(h){e.stopImmediatePropagation();e.preventDefault();toggleWish(h.dataset.heart)}},true);
/* hover: slow zoom (CSS) + glide through the design's photos one by one */
const hov=matchMedia('(hover:hover)');
document.addEventListener('mouseover',e=>{if(!hov.matches||reduce)return;const c=e.target.closest?.('.product[data-product]');if(!c||c._hov||!c._paths)return;c._hov=1;c._paths.forEach(p=>{const i=new Image();i.src=R().thumb(p)});
 const tick=()=>{if(!c._hov)return;const n=c._paths.length,i=(Number(c.dataset.pi||0)+1)%n;go(c,i,1)};c._t0=setTimeout(()=>{tick();c._ti=setInterval(tick,2100)},900)});
document.addEventListener('mouseout',e=>{const c=e.target.closest?.('.product[data-product]');if(!c||!c._hov||c.contains(e.relatedTarget))return;c._hov=0;clearTimeout(c._t0);clearInterval(c._ti);setTimeout(()=>{if(!c._hov)resetCard(c)},950)});
/* touch: swipe a card sideways */
let tx=null;document.addEventListener('touchstart',e=>{const c=e.target.closest?.('.product-image');tx=c?{x:e.touches[0].clientX,y:e.touches[0].clientY,c:c.closest('.product')}:null},{passive:true});
document.addEventListener('touchend',e=>{if(!tx)return;const dx=e.changedTouches[0].clientX-tx.x,dy=e.changedTouches[0].clientY-tx.y,c=tx.c;tx=null;if(Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy)*1.5||!c._paths)return;const n=c._paths.length,d=dx<0?1:-1;go(c,(Number(c.dataset.pi||0)+d+n)%n,d,450)},{passive:true});

/* ---------- HEADER BUTTONS: wishlist + theme ---------- */
function setupHeader(){const a=$('.actions');if(!a||$('#wishBtn'))return;const w=document.createElement('button');w.id='wishBtn';w.className='hbtn';w.setAttribute('aria-label','Favourites');w.innerHTML='♡<span id="wishCount" hidden></span>';w.onclick=openWish;const t=document.createElement('button');t.id='themeBtn';t.className='hbtn';t.setAttribute('aria-label','Theme');t.onclick=()=>setTheme(document.body.classList.contains('dark')?'light':'dark');a.insertBefore(t,a.firstChild);a.insertBefore(w,a.firstChild);const c=wish().length;$('#wishCount').textContent=c||'';$('#wishCount').hidden=!c}
function setTheme(m){document.body.classList.toggle('dark',m==='dark');store.set('regnar-theme',m);const t=$('#themeBtn');if(t)t.textContent=m==='dark'?'☀':'☾';document.querySelector('meta[name=theme-color]')?.setAttribute('content',m==='dark'?'#141516':'#f5f1e9')}

/* ---------- INSTALL (PWA) ---------- */
let deferred=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;showInstall()});
function showInstall(){if($('#installBtn')||matchMedia('(display-mode:standalone)').matches)return;const l=$('.footer-links div:last-child');if(!l)return;const b=document.createElement('a');b.id='installBtn';b.href='#';b.textContent=L('Install app','تثبيت التطبيق');b.onclick=async e=>{e.preventDefault();if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;b.remove();track('install')}};l.appendChild(b)}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

/* ---------- HERO: gentle sway + design swap ---------- */
function heroLoop(){if(reduce)return;setInterval(()=>{if(document.hidden)return;const prods=R().products.filter(p=>p.status!=='draft');const hangs=$$('#heroVisual .hang button.frame');if(prods.length<=hangs.length||!hangs.length)return;const f=hangs[Math.floor(Math.random()*hangs.length)],im=$('img',f);if(!im)return;const shown=hangs.map(b=>b.dataset.open),pool=prods.filter(p=>!shown.includes(p.id));if(!pool.length)return;const p=pool[Math.floor(Math.random()*pool.length)];im.style.opacity=0;setTimeout(()=>{im.classList.remove('ready');im.onload=()=>im.classList.add('ready');im.style.opacity='';im.src=R().thumb(p.cover_path);f.dataset.open=p.id;f.setAttribute('aria-label',R().title(p))},500)},5200)}

/* ---------- tracking hooks ---------- */
document.addEventListener('click',e=>{const a=e.target.closest('#detailEnquire');if(a)track('whatsapp_click',R().active?.id,'product');if(e.target.closest('#fabWa,#contactWa'))track('whatsapp_click',null,'contact');if(e.target.closest('#contactIg'))track('whatsapp_click',null,'instagram')},true);
document.addEventListener('submit',e=>{if(e.target.id==='customForm')track('whatsapp_click',null,'custom')},true);

/* ---------- boot ---------- */
function boot(){setTheme(store.get('regnar-theme','light'));setupHeader();setupPhotoFrame();
 const modal=$('#modal');new MutationObserver(()=>{if(modal.classList.contains('open'))buildModal()}).observe(modal,{attributes:true,attributeFilter:['class']});
 new MutationObserver(()=>{decorateAll()}).observe(document.body,{childList:true,subtree:true});
 new MutationObserver(()=>{relabel();setupHeader();setupCommunity();paintHeart();$('#installBtn')&&($('#installBtn').textContent=L('Install app','تثبيت التطبيق'));setupPhotoFrame()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 let tries=0;const t=setInterval(()=>{tries++;const ready=R().products.length||Object.keys(R().content||{}).length||tries>30;decorateAll();if(ready){setupCommunity();syncHearts();relabel();clearInterval(t);const pid=new URLSearchParams(location.search).get('p');if(pid){const p=R().products.find(x=>x.id===pid);if(p)R().openProduct(p)}}},400);
 heroLoop();if(deferred)showInstall();
 if(/iphone|ipad/i.test(navigator.userAgent)&&!navigator.standalone&&!store.get('regnar-ios-tip',false)){/* iOS: no install prompt API; shown only in footer text */const l=$('.footer-links div:last-child');if(l){const s=document.createElement('a');s.href='#';s.textContent=L('Add to Home Screen','أضف إلى الشاشة الرئيسية');s.onclick=e=>{e.preventDefault();R().toast(L('Tap Share, then “Add to Home Screen”','اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية»'))};l.appendChild(s)}}}
(function wait(){window.REGNAR&&document.getElementById('modal')?boot():setTimeout(wait,60)})();
