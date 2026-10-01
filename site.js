/* ==========================================================================
   NAM NUE RESORT - shared site script (all pages)
   Small, dependency-free. Bootstrap bundle is only used for modal/carousel.
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js');

  // Copyright year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ------------------------------------------------------------------------
  // Scroll reveal (replaces AOS): opacity + translateY only, short stagger
  // ------------------------------------------------------------------------
  const revealEls = document.querySelectorAll('[data-aos]');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Math.min(parseInt(el.dataset.aosDelay || '0', 10), 240);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(el => io.observe(el));
  }

  // ------------------------------------------------------------------------
  // Navbar: transparent over hero, solid after scrolling
  // ------------------------------------------------------------------------
  const navbar = document.getElementById('mainNavbar');
  function updateNavbar() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ------------------------------------------------------------------------
  // Hero tagline "บ้าน ↔ Home" loop (homepage only)
  // ------------------------------------------------------------------------
  const taglineWrap = document.querySelector('.hero-tagline .hand-wrap');
  const wordCells = document.querySelectorAll('.hero-tagline .word-cell');
  const underlinePath = document.querySelector('.hero-tagline .hand-underline path');
  const heroTagline = document.querySelector('.hero-tagline');

  if (taglineWrap && wordCells.length > 1 && !reduceMotion.matches) {
    function cssMs(varName, fallbackMs) {
      const val = getComputedStyle(root).getPropertyValue(varName).trim();
      if (!val) return fallbackMs;
      if (val.endsWith('ms')) return parseFloat(val);
      if (val.endsWith('s')) return parseFloat(val) * 1000;
      return parseFloat(val) || fallbackMs;
    }

    const swapInterval = cssMs('--swap-interval', 4000);
    const wordTransition = cssMs('--word-transition', 700);
    const underlineDraw = cssMs('--underline-draw', 700);
    const overlapStagger = 150; // exit & enter overlap

    let currentIndex = 0;
    let timerId = null;
    let isPaused = false;
    let expectedNext = Date.now() + swapInterval;

    function performSwap() {
      const nextIndex = (currentIndex + 1) % wordCells.length;
      const currentCell = wordCells[currentIndex];
      const nextCell = wordCells[nextIndex];

      currentCell.classList.remove('is-active');
      currentCell.classList.add('is-exiting');

      setTimeout(() => {
        taglineWrap.classList.toggle('is-th', nextIndex === 0);
        taglineWrap.classList.toggle('is-en', nextIndex === 1);
        if (underlinePath) {
          underlinePath.style.animation = 'none';
          void underlinePath.getBoundingClientRect(); // restart the draw
          underlinePath.style.animation = `drawHandUnderline ${underlineDraw}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`;
        }
        nextCell.classList.remove('is-exiting');
        nextCell.classList.add('is-active');
      }, overlapStagger);

      setTimeout(() => {
        currentCell.classList.remove('is-exiting');
        currentIndex = nextIndex;
      }, wordTransition + overlapStagger);
    }

    // Drift-compensating timer driven by --swap-interval
    function step() {
      if (isPaused) return;
      performSwap();
      expectedNext += swapInterval;
      timerId = setTimeout(step, Math.max(0, expectedNext - Date.now()));
    }
    function pause() {
      isPaused = true;
      clearTimeout(timerId);
    }
    function resume() {
      if (!isPaused) return;
      isPaused = false;
      expectedNext = Date.now() + swapInterval;
      timerId = setTimeout(step, swapInterval);
    }

    heroTagline.addEventListener('mouseenter', pause);
    heroTagline.addEventListener('mouseleave', resume);
    heroTagline.addEventListener('touchstart', pause, { passive: true });
    heroTagline.addEventListener('touchend', resume, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));

    timerId = setTimeout(step, swapInterval);
  }
})();
