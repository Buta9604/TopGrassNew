/* =========================================================================
   TOP GRASS — Interactions
   Custom cursor · age gate · Lenis smooth scroll · GSAP reveals · tilt
   ========================================================================= */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  window.TG = { reduced, isTouch, lenis: null };

  /* ---------- AGE GATE + ENTRY ---------- */
  const gate = document.getElementById('ageGate');
  const KEY = 'tg_age_ok';
  const acknowledged = sessionStorage.getItem(KEY) === '1';
  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    document.body.style.overflow = '';
    dispatchEvent(new Event('tg:enter'));
  }
  if (acknowledged && gate) gate.classList.add('hide');
  document.body.style.overflow = 'hidden'; // locked through preloader / gate
  document.getElementById('ageYes')?.addEventListener('click', () => {
    sessionStorage.setItem(KEY, '1');
    gate.classList.add('hide');
    enter();
  });

  /* ---------- PRELOADER ---------- */
  const pre = document.getElementById('preloader');
  if (pre) {
    const num = document.getElementById('preNum');
    const dur = reduced ? 250 : 1150;
    let t0 = null;
    function tick(now) {
      if (t0 === null) t0 = now;
      const k = Math.min(1, (now - t0) / dur);
      if (num) num.textContent = Math.round(k * 100);
      pre.style.setProperty('--pp', k);
      if (k < 1) requestAnimationFrame(tick);
      else { pre.classList.add('done'); if (acknowledged) enter(); }
    }
    requestAnimationFrame(tick);
  } else if (acknowledged) {
    enter();
  }

  /* ---------- REDUCED MOTION: pause hero video (poster shows instead) ---------- */
  if (reduced) {
    const hv = document.getElementById('heroVideo');
    if (hv) { hv.removeAttribute('autoplay'); hv.pause(); }
  }

  /* ---------- CUSTOM CURSOR ---------- */
  if (!isTouch && !reduced) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const hoverables = 'a, button, [data-cursor], .cat-card, .pick, model-viewer';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* ---------- COLLECTION PANELS → STORE ---------- */
  const STORE = 'https://topgrassli.com/store';
  document.querySelectorAll('.collection__panel[data-cat]').forEach(p => {
    p.addEventListener('click', e => { if (e.target.closest('a')) return; window.open(STORE, '_blank', 'noopener'); });
  });

  /* ---------- HOVER-VIDEO CARDS ---------- */
  if (!isTouch) {
    document.querySelectorAll('.cat-card__video').forEach(v => {
      const card = v.closest('.cat-card');
      if (!card) return;
      card.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
      card.addEventListener('mouseleave', () => { v.pause(); });
    });
  }

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    window.TG.lenis = lenis;
  }
  // Anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { offset: -20 }) : t.scrollIntoView({ behavior: 'smooth' });
      document.body.classList.remove('nav-open');
    });
  });

  /* burger replaced by fullscreen overlay menu — see js/menu.js */

  /* ---------- GSAP REVEALS ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero intro (plays on entry, after preloader/age-gate)
    gsap.set('.hero h1 .line > span', { yPercent: 110 });
    gsap.set('.hero .reveal', { opacity: 0, y: 30 });
    function playHeroIntro() {
      gsap.timeline()
        .to('.hero h1 .line > span', { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' })
        .to('.hero .reveal', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=0.7');
    }
    addEventListener('tg:enter', playHeroIntro);
    if (entered) playHeroIntro();

    // Generic reveals
    gsap.utils.toArray('.reveal:not(.hero .reveal)').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 44 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    // Hero parallax on content
    gsap.to('.hero__content', { yPercent: 18, opacity: 0.4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Story words light up as the statement scrolls through the reading zone.
    // Driven by the heading's LIVE viewport position so it is immune to the
    // pinned-collection spacer that throws off cached ScrollTrigger start/end.
    const big = document.querySelector('[data-words]');
    if (big) {
      const html = big.innerHTML;
      big.innerHTML = html.replace(/(<em>.*?<\/em>|[^\s<]+)(?=\s|$)/g, m => `<span class="story__word">${m} </span>`);
      const words = gsap.utils.toArray('.story__word');
      const updateStory = () => {
        const r = big.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.55)));
        const lit = Math.round(p * words.length);
        words.forEach((el, j) => el.classList.toggle('lit', j < lit));
      };
      if (lenis) lenis.on('scroll', updateStory);
      addEventListener('scroll', updateStory, { passive: true });
      addEventListener('resize', updateStory);
      updateStory();
    }

    // Number counters — IntersectionObserver (live position, immune to pin spacer)
    const counterEls = gsap.utils.toArray('[data-count]');
    if (counterEls.length && 'IntersectionObserver' in window) {
      const cio = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          cio.unobserve(en.target);
          const el = en.target;
          const target = +el.dataset.count;
          const suffix = el.textContent.replace(/[0-9]/g, '');
          const obj = { v: 0 };
          gsap.to(obj, { v: target, duration: 1.8, ease: 'power2.out',
            onUpdate: () => el.textContent = Math.round(obj.v) + suffix.replace(/^[0-9]*/, '') });
        });
      }, { threshold: 0.6 });
      counterEls.forEach(el => cio.observe(el));
    }

    // Clip-path image reveals (cinematic unmask)
    gsap.utils.toArray('.cat-card__media img, .cat-card__viewer--img img, .pick__img img').forEach(img => {
      gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.out',
        scrollTrigger: { trigger: img, start: 'top 90%' }
      });
    });

    // Signature 3D parallax float
    if (document.querySelector('.signature__viewer')) {
      gsap.to('.signature__viewer', { yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: '.signature', start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    // Eyebrow text-scramble on enter
    const SCR = '▚▞ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·✦';
    function scramble(el) {
      const final = el.dataset.final || el.textContent;
      el.dataset.final = final;
      let frame = 0; const total = 16;
      const iv = setInterval(() => {
        const reveal = Math.floor((frame / total) * final.length);
        el.textContent = final.split('').map((c, i) =>
          (c === ' ' || i < reveal) ? final[i] : SCR[(Math.floor(frame * 7) + i * 3) % SCR.length]
        ).join('');
        if (frame++ >= total) { clearInterval(iv); el.textContent = final; }
      }, 38);
    }
    document.querySelectorAll('.eyebrow').forEach(el => {
      if (el.closest('.hero')) return;
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => scramble(el) });
    });
  }

  /* ---------- 3D TILT (cards) ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const strength = card.classList.contains('cat-card--feature') ? 4 : 8;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  }

  /* ---------- CURSOR SPOTLIGHT ---------- */
  const spotlight = document.getElementById('spotlight');
  if (spotlight && !isTouch && !reduced) {
    addEventListener('mousemove', e => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
      if (!spotlight.classList.contains('on')) spotlight.classList.add('on');
    }, { passive: true });
  }

  /* ---------- MARQUEE VELOCITY SKEW ---------- */
  const marqueeInner = document.getElementById('marqueeInner');
  if (marqueeInner && !reduced) {
    let mVel = 0, lastY = window.scrollY;
    if (lenis) lenis.on('scroll', ({ velocity }) => { mVel = velocity; });
    else addEventListener('scroll', () => { mVel = window.scrollY - lastY; lastY = window.scrollY; }, { passive: true });
    (function loop() {
      mVel *= 0.9;
      const skew = Math.max(-7, Math.min(7, mVel * -0.35));
      marqueeInner.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- LIVE OPEN/CLOSED STATUS ---------- */
  (function () {
    const el = document.getElementById('liveStatus');
    const dot = document.getElementById('liveDot');
    if (!el) return;
    const h = new Date().getHours();
    const open = h >= 9 && h < 21;
    el.textContent = open ? 'Open now · until 9 PM' : (h < 9 ? 'Opens today at 9 AM' : 'Closed · opens 9 AM');
    if (dot && !open) { dot.style.background = '#c0563b'; dot.style.boxShadow = '0 0 10px #c0563b'; }
  })();

  /* ---------- AMBIENT SOUND ---------- */
  (function () {
    const btn = document.getElementById('soundToggle');
    const amb = document.getElementById('ambient');
    if (!btn || !amb) return;
    let raf;
    function fadeTo(target, done) {
      cancelAnimationFrame(raf);
      (function step() {
        const d = target - amb.volume;
        if (Math.abs(d) < 0.02) { amb.volume = Math.max(0, Math.min(1, target)); if (done) done(); return; }
        amb.volume = Math.max(0, Math.min(1, amb.volume + d * 0.08));
        raf = requestAnimationFrame(step);
      })();
    }
    amb.volume = 0;
    btn.addEventListener('click', () => {
      if (amb.paused) {
        amb.play().then(() => { btn.classList.add('playing'); fadeTo(0.3); }).catch(() => {});
      } else {
        fadeTo(0, () => amb.pause());
        btn.classList.remove('playing');
      }
    });
  })();

  /* ---------- PRODUCT REQUESTS ---------- */
  (function () {
    const form = document.getElementById('requestForm');
    if (!form) return;
    // ▼ Paste your Formspree endpoint here to receive requests by email + dashboard,
    //   e.g. 'https://formspree.io/f/abcdwxyz'. Leave '' to store locally for now.
    const ENDPOINT = '';
    const btn = form.querySelector('button');
    const ta = form.querySelector('textarea');
    const original = btn.innerHTML;
    let busy = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const value = ta.value.trim();
      if (!value || busy) return;
      busy = true; btn.disabled = true; btn.innerHTML = 'Sending…';
      try {
        if (ENDPOINT) {
          const res = await fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
          if (!res.ok) throw new Error('bad');
        } else {
          // No endpoint yet — keep a local copy so nothing is lost.
          const saved = JSON.parse(localStorage.getItem('tg_requests') || '[]');
          saved.push({ at: new Date().toISOString(), request: value });
          localStorage.setItem('tg_requests', JSON.stringify(saved));
        }
        form.classList.add('sent');
        btn.innerHTML = 'Request received ✓';
        ta.value = '';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = original; form.classList.remove('sent'); busy = false; }, 3200);
      } catch (err) {
        btn.innerHTML = 'Try again';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = original; busy = false; }, 2600);
      }
    });
  })();

  /* ---------- NEWSLETTER ---------- */
  document.getElementById('signupForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = 'Welcome ✓';
    e.target.querySelector('input').value = '';
    setTimeout(() => btn.innerHTML = 'Join <span class="arrow">→</span>', 2600);
  });
})();
