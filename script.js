const menu=document.getElementById('menu');
const nav=document.getElementById('navlinks');
menu.addEventListener('click',()=>nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const tracks=[
  {title:'Sailor Song',artist:'Gigi Perez',label:'SAILOR',src:'audio/Gigi Perez - Sailor Song.mp3'},
  {title:'Beauty And A Beat',artist:'Justin Bieber',label:'BEAT',src:'audio/Justin Bieber - Beauty And A Beat.mp3'},
  {title:'Immortals',artist:'Fall Out Boy',label:'IMMORTALS',src:'audio/Fall Out Boy - Immortals.mp3'},
  {title:'Without Me',artist:'Eminem',label:'WITHOUT',src:'audio/Eminem - Without Me.mp3'},
  {title:"Don't Look Back In Anger",artist:'Oasis',label:'OASIS',src:'audio/Oasis - Dont Look Back In Anger.mp3'}
];

const audio=document.getElementById('audio-player');
const vinyl=document.getElementById('vinyl');
const turntable=document.querySelector('.turntable');
const tonearm=document.querySelector('.tonearm');
const titleEl=document.getElementById('track-title');
const artistEl=document.getElementById('track-artist');
const labelEl=document.getElementById('record-label');
const countEl=document.getElementById('track-count');
const playBtn=document.getElementById('play-track');
const progressBar=document.getElementById('track-progress');
const currentTimeEl=document.getElementById('track-current-time');
const durationEl=document.getElementById('track-duration');
const recordArtistEl=document.getElementById('record-artist');
const statusDot=document.querySelector('.playing-dot');

let trackIndex=0;
let playing=false;
let changing=false;

function setPlaying(value){
  playing=value;
  vinyl.classList.toggle('spinning',value);
  tonearm.classList.toggle('playing',value);
  playBtn.textContent=value?'Ⅱ':'▶';
  playBtn.setAttribute('aria-label',value?'Pause music':'Play music');
  statusDot.classList.toggle('is-playing',value);
}

function updateTrackText(){
  const track=tracks[trackIndex];
  titleEl.textContent=track.title;
  artistEl.textContent=track.artist;
  labelEl.textContent=track.title;
  recordArtistEl.textContent=track.artist;
  countEl.textContent=String(trackIndex+1).padStart(2,'0')+' / '+String(tracks.length).padStart(2,'0');
}

function loadTrack(){
  const track=tracks[trackIndex];
  audio.pause();
  audio.src=track.src;
  audio.load();
  progressBar.value=0;
  progressBar.style.setProperty('--progress','0%');
  currentTimeEl.textContent='00:00';
  durationEl.textContent='00:00';
  updateTrackText();
  setPlaying(false);
}

async function playCurrent(){
  try{
    await audio.play();
    setPlaying(true);
  }catch(error){
    console.warn('Audio playback could not start:',error);
    setPlaying(false);
  }
}

function changeRecord(direction){
  if(changing) return;
  changing=true;
  const resume=playing;
  setPlaying(false);
  audio.pause();
  turntable.classList.remove('record-arriving');
  turntable.classList.add('record-changing');

  // Let the old record visibly leave the platter before swapping its label/audio.
  window.setTimeout(()=>{
    trackIndex=(trackIndex+direction+tracks.length)%tracks.length;
    loadTrack();
    turntable.classList.remove('record-changing');
    // Force a fresh animation cycle for the new record.
    void vinyl.offsetWidth;
    turntable.classList.add('record-arriving');

    window.setTimeout(()=>{
      turntable.classList.remove('record-arriving');
      changing=false;
      if(resume) playCurrent();
    },650);
  },560);
}

document.getElementById('next-track').addEventListener('click',()=>changeRecord(1));
document.getElementById('prev-track').addEventListener('click',()=>changeRecord(-1));
playBtn.addEventListener('click',()=>{
  if(changing) return;
  if(playing){
    audio.pause();
    setPlaying(false);
  }else{
    playCurrent();
  }
});
function formatTime(seconds){
  if(!Number.isFinite(seconds)) return '00:00';
  const mins=Math.floor(seconds/60);
  const secs=Math.floor(seconds%60);
  return String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
}

audio.addEventListener('loadedmetadata',()=>{
  durationEl.textContent=formatTime(audio.duration);
  progressBar.value=0;
  progressBar.style.setProperty('--progress','0%');
});
audio.addEventListener('timeupdate',()=>{
  if(audio.duration){
    progressBar.value=Math.round((audio.currentTime/audio.duration)*1000);
    progressBar.style.setProperty('--progress',(audio.currentTime/audio.duration*100)+'%');
    currentTimeEl.textContent=formatTime(audio.currentTime);
  }
});
progressBar.addEventListener('input',()=>{
  if(audio.duration){
    audio.currentTime=(Number(progressBar.value)/1000)*audio.duration;
  }
});
audio.addEventListener('ended',()=>changeRecord(1));
audio.addEventListener('pause',()=>{ if(playing) setPlaying(false); });
audio.addEventListener('play',()=>setPlaying(true));

loadTrack();


/* =========================================================
   ILHAM — PREMIUM INTERACTION LAYER
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer:coarse)').matches;

  // Scroll progress.
  const progressBar=document.createElement('div'); progressBar.className='scroll-progress'; document.body.append(progressBar);
  const navEl=document.querySelector('.nav');
  let lastY=scrollY;
  function onScroll(){
    const max=document.documentElement.scrollHeight-innerHeight;
    progressBar.style.width=(max>0?(scrollY/max)*100:0)+'%';
    if(navEl){navEl.classList.toggle('nav-scrolled',scrollY>35); if(scrollY>lastY+8 && scrollY>160) navEl.classList.add('nav-hidden'); if(scrollY<lastY-8) navEl.classList.remove('nav-hidden');}
    lastY=scrollY;
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Reveal elements as they enter the viewport.
  // Keep whole sections visible at every zoom level; animate their contents instead.
  const targets=[...document.querySelectorAll('.section-head,.photo-card,.hobby-card,.record-player,.film-feature,.film-copy,.travel-feature,.travel-gallery figure,.travel-details,.contact-main,.manifesto p')];
  targets.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--delay',(i%4)*70+'ms')});
  if(reduce){targets.forEach(el=>el.classList.add('revealed'))}
  else {const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');io.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -8%'});targets.forEach(el=>io.observe(el));}

  // Active section in the top navigation.
  // Use the real document position instead of offsetTop so nested/positioned
  // elements cannot make the active marker jump to the wrong section.
  const links=[...document.querySelectorAll('#navlinks a[href^="#"]')];
  const sections=links
    .map(a=>({link:a,section:document.querySelector(a.getAttribute('href'))}))
    .filter(item=>item.section);

  let activeNavTick=false;
  function updateActiveNav(){
    if(activeNavTick) return;
    activeNavTick=true;

    requestAnimationFrame(()=>{
      activeNavTick=false;
      const marker=scrollY + Math.min(innerHeight * .34, 260);
      let current=sections[0];
      let closestDistance=Infinity;

      for(const item of sections){
        const top=item.section.getBoundingClientRect().top + scrollY;
        const distance=marker-top;

        // Section is active once the marker has entered it.
        if(distance >= 0 && distance < closestDistance){
          current=item;
          closestDistance=distance;
        }
      }

      links.forEach(a=>a.classList.remove('active'));
      if(current) current.link.classList.add('active');
    });
  }

  if(sections.length){
    addEventListener('scroll',updateActiveNav,{passive:true});
    addEventListener('resize',updateActiveNav);
    addEventListener('load',updateActiveNav);
    updateActiveNav();
  }

  // Subtle hero depth on pointer movement.
  const heroImage=document.querySelector('.hero-image');
  if(heroImage && !isTouch && !reduce){addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*6;heroImage.style.transform=`translate3d(${x}px,${y}px,0)`},{passive:true});}

  // Add staggered reveal to gallery cards.
  document.querySelectorAll('.photo-grid,.hobby-grid,.film-layout').forEach(grid=>{
    [...grid.children].forEach((child,i)=>child.style.setProperty('--delay',(i*100)+'ms'));
  });

  // Keyboard polish for the mobile menu.
  const menuBtn=document.getElementById('menu');
  if(menuBtn) menuBtn.addEventListener('keydown',e=>{if(e.key==='Escape') document.getElementById('navlinks')?.classList.remove('open')});
})();

/* =========================================================
   ILHAM — EXTRA MICRO INTERACTIONS
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const profile = document.getElementById('profile-photo');
  const fallback = document.querySelector('.profile-fallback');

  // The ZIP currently has no img/profile.* file. If the user adds
  // img/profile.jpg, it appears automatically without any HTML edit.
  if(profile){
    profile.addEventListener('load',()=>{ if(fallback) fallback.style.display='none'; });
    profile.addEventListener('error',()=>{ profile.style.display='none'; if(fallback) fallback.style.zIndex='3'; });
  }

  // Tiny image tilt on desktop for game/film cards.
  if(!reduce && matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.game-card-landscape,.film-posters figure').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-3;
        const ry=((e.clientX-r.left)/r.width-.5)*3;
        card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
  }
})();


/* =========================================================
   PHOTO LIGHTBOX — every portfolio image can be opened larger
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const images=[...document.querySelectorAll('main img')].filter(img=>!img.closest('.sunset-scene'));
  if(!images.length) return;
  const box=document.createElement('div');
  box.className='photo-lightbox';
  box.innerHTML='<button class="lightbox-close" aria-label="Tutup">×</button><button class="lightbox-prev" aria-label="Foto sebelumnya">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" aria-label="Foto berikutnya">›</button><div class="lightbox-count"></div>';
  document.body.appendChild(box);
  const view=box.querySelector('figure img'), cap=box.querySelector('figcaption'), count=box.querySelector('.lightbox-count');
  let current=0;
  function show(i){
    current=(i+images.length)%images.length;
    const source=images[current];
    view.src=source.currentSrc||source.src;
    view.alt=source.alt||'Portfolio image';
    cap.textContent=source.alt||'';
    count.textContent=String(current+1).padStart(2,'0')+' / '+String(images.length).padStart(2,'0');
    box.classList.add('open');
    document.body.classList.add('lightbox-open');
  }
  function close(){box.classList.remove('open');document.body.classList.remove('lightbox-open');view.src='';}
  images.forEach((img,i)=>{
    img.classList.add('is-clickable-photo');
    img.setAttribute('tabindex','0');
    img.setAttribute('role','button');
    img.setAttribute('aria-label',(img.alt||'Buka foto')+' — lihat lebih besar');
    img.addEventListener('click',()=>show(i));
    img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(i)}});
  });
  box.querySelector('.lightbox-close').onclick=close;
  box.querySelector('.lightbox-prev').onclick=()=>show(current-1);
  box.querySelector('.lightbox-next').onclick=()=>show(current+1);
  box.addEventListener('click',e=>{if(e.target===box) close();});
  addEventListener('keydown',e=>{
    if(!box.classList.contains('open')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') show(current-1);
    if(e.key==='ArrowRight') show(current+1);
  });
  let startX=0;
  box.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});
  box.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45) show(current+(dx<0?1:-1));},{passive:true});
})();


/* =========================================================
   GAME IMAGE SLIDERS — MLBB / PUBG
   ========================================================= */
(function(){
  document.querySelectorAll('[data-game-slider]').forEach(slider=>{
    const slides=[...slider.querySelectorAll('.game-slide')];
    const prev=slider.querySelector('.game-arrow-prev');
    const next=slider.querySelector('.game-arrow-next');
    const current=slider.querySelector('.game-slider-count span');
    let index=0;
    function show(nextIndex, direction=1){
      index=(nextIndex+slides.length)%slides.length;
      slides.forEach((slide,i)=>{
        slide.classList.toggle('is-active',i===index);
        slide.style.transform=i===index?'translateX(0) scale(1)':`translateX(${direction>0?26:-26}px) scale(.985)`;
      });
      if(current) current.textContent=String(index+1).padStart(2,'0');
    }
    prev?.addEventListener('click',()=>show(index-1,-1));
    next?.addEventListener('click',()=>show(index+1,1));
    slider.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft') show(index-1,-1);
      if(e.key==='ArrowRight') show(index+1,1);
    });
    slider.setAttribute('tabindex','0');
  });
})();


/* =========================================================
   FAHREZI — BILINGUAL INTERFACE (ID / EN)
   ========================================================= */
(function(){
  const root=document.documentElement;
  const buttons=[...document.querySelectorAll('.lang-btn')];
  if(!buttons.length) return;

  const translations={
    id:{
      nav:['TENTANG','FOTOGRAFI','PERJALANAN','GAME','MUSIK','FILM','KONTAK'],
      cta:"MARI TERHUBUNG ↗",
      heroDesc:"Mengumpulkan golden hour, dunia virtual,<br>cerita di layar & suara yang selalu tinggal.",
      explore:"JELAJAHI ARSIP <b>↓</b>",
      heroProfile:"FAHREZI / PROFIL",
      scroll:"Scroll ↓",
      aboutIndex:"01 / TENTANG SAYA",
      aboutEyebrow:"HAI, SAYA FAHREZI",
      aboutTitle:"Di antara yang<br><em>nyata</em> & imajinasi.",
      aboutText:"Saya siswa kelas 12 SMK Mandiri, jurusan Rekayasa Perangkat Lunak (RPL). Saya suka memotret momen, mencoba hal baru, bermain game, menonton film, dan mendengarkan musik. Website ini menjadi tempat kecil untuk menyimpan hal-hal yang saya suka dan terus saya eksplorasi.",
      nice:"senang bertemu<span>✳</span>",
      photoIndex:"02 / MELALUI LENSA",
      photoTitle:"Mengejar <em>cahaya.</em>",
      photoDesc:"Momen kecil, langit hangat,<br>dan tempat yang layak diingat.",
      travelIndex:"03 / DI LUAR SANA",
      travelTitle:"Tempat &amp; <em>perjalanan.</em>",
      travelDesc:"Jalan baru, sudut tenang,<br>dan pemandangan yang layak ditempuh.",
      gameIndex:"04 / Rank No.1",
      gameTitle:"Ruang <em>game.</em>",
      gameDesc:"Rank untuk dikejar, Quest yang perlu diselesaikan, dan Cerita yang layak dimainkan.",
      musicIndex:"05 / SOUNDTRACK",
      musicTitle:"Sedang <em>berputar.</em>",
      musicDesc:"Pemutar musik kecil untuk lagu-lagu yang mewarnai momen.",
      filmIndex:"06 / LAYAR",
      filmTitle:"TOP <em>03 FAV</em>",
      filmDesc:"Cerita, frame, dan tempat fiksi yang terus tinggal di kepala.",
      filmTitle2:"John Wick<br>selalu <em>punya gaya.</em>",
      filmText:"John Wick jadi salah satu film favorit saya karena aksinya yang intens, suasananya yang gelap, dan gaya pertarungannya yang khas. Di sini saya menyimpan film yang saya suka, adegan yang paling saya ingat, dan tontonan yang ingin saya nikmati lagi.",
      contactIndex:"07 / SAPA",
      contactEyebrow:"PUNYA LAGU BAGUS ATAU TEMPAT DENGAN PEMANDANGAN?",
      contactTitle:"Tetap<br>terhubung.",
      back:"KEMBALI KE ATAS ↑",
      photoNote:"FOTO PRIBADI — ARSIP FAHREZI.",
      filmWatch:"DAFTAR TONTON PRIBADI",
    },
    en:{
      nav:['ABOUT','PHOTOGRAPHY','TRAVELING','GAME','MUSIC','FILM','CONTACT'],
      cta:"LET'S CONNECT ↗",
      heroDesc:"Collecting golden hours, virtual worlds,<br>stories on screen & sounds that stay.",
      explore:"EXPLORE THE ARCHIVE <b>↓</b>",
      heroProfile:"FAHREZI / PROFILE",
      scroll:"SCROLL ↓",
      aboutIndex:"01 / THE PERSON",
      aboutEyebrow:"HEY, I'M FAHREZI",
      aboutTitle:"Somewhere between<br>the <em>real</em> & the imagined.",
      aboutText:"I'm a Grade 12 student at SMK Mandiri, majoring in Software Engineering (RPL). I enjoy capturing moments, trying new things, playing games, watching films, and listening to music. This is my little corner of the internet — a collection of things I enjoy and keep exploring.",
      nice:"nice to meet you<span>✳</span>",
      photoIndex:"02 / THROUGH MY LENS",
      photoTitle:"Chasing the <em>light.</em>",
      photoDesc:"Little moments, warm skies,<br>and places worth remembering.",
      travelIndex:"03 / OUT THERE",
      travelTitle:"Places &amp; <em>passages.</em>",
      travelDesc:"New streets, quiet corners,<br>and views worth the journey.",
      gameIndex:"04 / Rank No.1",
      gameTitle:"Game <em>room.</em>",
      gameDesc:"Ranks to chase, quests to complete, and Stories worth playing.",
      musicIndex:"05 / SOUNDTRACK",
      musicTitle:"Now <em>spinning.</em>",
      musicDesc:"A little record player for the songs that color the moments.",
      filmIndex:"06 / THE SCREEN",
      filmTitle:"TOP<em>03 FAV</em>",
      filmDesc:"Stories, frames, and fictional places that stay in my head.",
      filmTitle2:"John Wick<br>has a <em>style of its own.</em>",
      filmText:"John Wick is one of the films I enjoy for its action, dark atmosphere, and distinctive style. This section is for films I enjoy, scenes that stick with me, and movies I would gladly watch again.",
      contactIndex:"07 / SAY HELLO",
      contactEyebrow:"GOT A GOOD SONG OR A PLACE WITH A VIEW?",
      contactTitle:"Let's stay<br>in touch.",
      back:"BACK TO TOP ↑",
      photoNote:"PERSONAL PHOTOGRAPHS — FAHREZI ARCHIVE.",
      filmWatch:"PERSONAL WATCHLIST",
    }
  };

  const map={
    'nav a:nth-child(1)':'nav.0','nav a:nth-child(2)':'nav.1','nav a:nth-child(3)':'nav.2','nav a:nth-child(4)':'nav.3','nav a:nth-child(5)':'nav.4','nav a:nth-child(6)':'nav.5','nav a:nth-child(7)':'nav.6',
    '.nav-cta':'cta','.hero .eyebrow':'heroEyebrow','.hero-desc':'heroDesc','.round-link':'explore','.hero-image .image-label span:first-child':'heroProfile','.hero-foot span:last-child':'scroll',
    '#about .section-index':'aboutIndex','#about .eyebrow':'aboutEyebrow','#about h2':'aboutTitle','#about .intro-bottom p':'aboutText','#about .signature':'nice',
    '#photography .section-index':'photoIndex','#photography h2':'photoTitle','#photography .section-head>p':'photoDesc','#photography .gallery-note':'photoNote',
    '#traveling .section-index':'travelIndex','#traveling h2':'travelTitle','#traveling .section-head>p':'travelDesc',
    '#game .section-index':'gameIndex','#game h2':'gameTitle','#game .section-head>p':'gameDesc',
    '#musik .section-index':'musicIndex','#musik h2':'musicTitle','#musik .section-head>p':'musicDesc',
    '#film .section-index':'filmIndex','#film h2':'filmTitle','#film .section-head>p':'filmDesc','#film .film-copy .eyebrow':'filmEyebrow','#film .film-copy h3':'filmTitle2','#film .film-copy>p':'filmText','#film .film-feature-caption span:first-child':'filmWatch','#film .film-feature-caption span:last-child':'filmCurated',
    '#contact .section-index':'contactIndex','#contact .contact-main .eyebrow':'contactEyebrow','#contact h2':'contactTitle','#contact-bottom .x':'x'
  };

  function apply(lang){
    const t=translations[lang];
    root.lang=lang;
    Object.entries(map).forEach(([selector,key])=>{
      if(key==='x') return;
      const el=document.querySelector(selector);
      if(el && t[key]!==undefined) el.innerHTML=t[key];
    });
    buttons.forEach(b=>b.classList.toggle('is-active',b.dataset.lang===lang));
    try{localStorage.setItem('fahrezi-language',lang)}catch(e){}
  }
  buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang)));
  let saved='id';
  try{saved=localStorage.getItem('fahrezi-language')||'id'}catch(e){}
  apply(saved);
})();


/* Contact form: keep it backend-free and open a prefilled email draft. */
(function(){
  const form=document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    const data=new FormData(form);
    const name=(data.get('name')||'').trim();
    const email=(data.get('email')||'').trim();
    const message=(data.get('message')||'').trim();
    const subject=encodeURIComponent('Pesan dari '+name+' — Fahrezi Portfolio');
    const body=encodeURIComponent('Nama: '+name+'\nEmail: '+email+'\n\n'+message);
    window.location.href='mailto:hello@example.com?subject='+subject+'&body='+body;
  });
})();
