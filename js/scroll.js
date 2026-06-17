/* =========================================================================
   TOP GRASS — Scrollytelling scenes (ScrollTrigger)
   Horizontal pinned collection + responsive gating
   ========================================================================= */
(function () {
  'use strict';
  const TG = window.TG || {};
  if (!window.gsap || !window.ScrollTrigger || TG.reduced) return;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // ---- Desktop: horizontal pinned collection ----
  mm.add('(min-width: 901px)', () => {
    const track = document.getElementById('colTrack');
    if (!track) return;
    const panels = gsap.utils.toArray('.collection__panel');
    const products = gsap.utils.toArray('.collection__panel[data-cat]');
    const colNum = document.getElementById('colNum');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

    // Active-panel detection runs on the TWEEN's frames (follows the scrub
    // smoothing exactly, so it settles correctly even after the scroll stops).
    function updateActive() {
      const center = window.innerWidth / 2;
      let active = null;
      panels.forEach(p => {
        const r = p.getBoundingClientRect();
        if (r.left <= center && r.right >= center) active = p;
      });
      if (!active || active.classList.contains('is-active')) return;
      panels.forEach(p => p.classList.remove('is-active'));
      active.classList.add('is-active');
      const v = active.querySelector('.panel__video');
      if (v) v.play().catch(() => {});
      products.forEach(p => {
        if (p !== active) { const vv = p.querySelector('.panel__video'); if (vv) vv.pause(); }
      });
      const n = active.getAttribute('data-num');
      if (colNum && n) colNum.textContent = n;
    }

    gsap.to(track, {
      x: () => -dist(), ease: 'none', onUpdate: updateActive,
      scrollTrigger: {
        trigger: '.collection', start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        refreshPriority: 1   // refresh BEFORE downstream triggers so they account for the pin spacer
      }
    });
  });

  // Keep ScrollTrigger measurements correct once everything has loaded.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
