/* =========================================================================
   TOP GRASS — Fullscreen overlay menu
   ========================================================================= */
(function () {
  'use strict';
  const trigger = document.getElementById('menuTrigger');
  const overlay = document.getElementById('menuOverlay');
  if (!trigger || !overlay) return;

  const TG = window.TG || {};
  const links = Array.from(overlay.querySelectorAll('.menu__links a'));
  const aside = overlay.querySelector('.menu__aside');
  const hasGsap = !!window.gsap && !TG.reduced;
  let open = false;

  if (hasGsap) {
    gsap.set(links, { y: 38, opacity: 0 });
    gsap.set(aside, { y: 20, opacity: 0 });
  }

  function lockScroll(lock) {
    if (TG.lenis) { lock ? TG.lenis.stop() : TG.lenis.start(); }
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function openMenu() {
    open = true;
    document.body.classList.add('menu-open');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close menu');
    lockScroll(true);
    if (hasGsap) {
      gsap.to(links, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power3.out', delay: 0.25 });
      gsap.to(aside, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.55 });
    }
    if (links[0]) links[0].focus({ preventScroll: true });
  }

  function closeMenu() {
    open = false;
    document.body.classList.remove('menu-open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open menu');
    lockScroll(false);
    if (hasGsap) gsap.to(links, { y: 26, opacity: 0, duration: 0.3, ease: 'power2.in' });
    trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => (open ? closeMenu() : openMenu()));

  // Capture phase so Lenis is restarted BEFORE main.js's anchor scrollTo runs.
  links.forEach(a => a.addEventListener('click', () => { if (open) closeMenu(); }, true));

  addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeMenu(); });

  // Focus trap
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !open) return;
    const f = [trigger, ...links, ...overlay.querySelectorAll('.menu__aside a')];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Live hours in the aside
  const mh = document.getElementById('menuHours');
  if (mh) {
    const h = new Date().getHours();
    mh.textContent = (h >= 9 && h < 21) ? 'Open now · until 9 PM' : 'Opens 9 AM daily';
  }
})();
