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
  // Scroll lock shared by the menu and the lightbox
  // ------------------------------------------------------------------------
  function lockScroll(on) {
    root.classList.toggle('scroll-locked', on);
  }

  // ------------------------------------------------------------------------
  // Mobile menu: full screen, closes on link tap / Escape / outside tap,
  // traps focus, locks scroll, restores focus to the toggle.
  // ------------------------------------------------------------------------
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navbarNav');
  const desktopMQ = window.matchMedia('(min-width: 992px)');

  if (navToggle && navMenu) {
    const focusables = () => [navToggle, ...navMenu.querySelectorAll('a[href], button')];

    function setMenu(open, { restoreFocus = true } = {}) {
      navMenu.classList.toggle('show', open);
      document.body.classList.toggle('menu-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
      lockScroll(open);
      if (open) {
        const first = navMenu.querySelector('.nav-link');
        if (first) first.focus({ preventScroll: true });
      } else if (restoreFocus) {
        navToggle.focus({ preventScroll: true });
      }
    }
    const isOpen = () => navMenu.classList.contains('show');

    navToggle.addEventListener('click', () => setMenu(!isOpen()));

    // Any link/button inside the menu closes it (the booking button then
    // opens its modal through Bootstrap's data API as before).
    navMenu.addEventListener('click', e => {
      if (e.target === navMenu) return setMenu(false);           // outside tap
      if (e.target.closest('a, button')) setMenu(false, { restoreFocus: false });
    });

    document.addEventListener('keydown', e => {
      if (!isOpen()) return;
      if (e.key === 'Escape') {
        setMenu(false);
      } else if (e.key === 'Tab') {
        const items = focusables();
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    desktopMQ.addEventListener('change', e => { if (e.matches && isOpen()) setMenu(false, { restoreFocus: false }); });
  }

  // ------------------------------------------------------------------------
  // Sticky action bar (mobile/tablet): chat / call / book, one tap anywhere.
  // TODO(LINE): set the resort's LINE link (e.g. 'https://line.me/R/ti/p/@xxxx')
  // to swap the chat button from Facebook to LINE. Left empty on purpose:
  // never invent contact details.
  // ------------------------------------------------------------------------
  const LINE_URL = '';
  const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100063506773137';
  const PHONE = { href: 'tel:0897491101', label: '089-749-1101 (คุณนก)' };

  if (document.getElementById('phoneModal')) {
    const bar = document.createElement('nav');
    bar.className = 'action-bar';
    bar.setAttribute('aria-label', 'ติดต่อและจองห้องพัก');
    const chat = LINE_URL
      ? `<a class="ab-icon is-line" href="${LINE_URL}" target="_blank" rel="noopener noreferrer" aria-label="แชท LINE"><i class="bi bi-line" aria-hidden="true"></i><span>LINE</span></a>`
      : `<a class="ab-icon" href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" aria-label="ทักแชท Facebook Page"><i class="bi bi-messenger" aria-hidden="true"></i><span>แชท</span></a>`;
    bar.innerHTML = chat +
      `<a class="ab-icon" href="${PHONE.href}" aria-label="โทร ${PHONE.label}"><i class="bi bi-telephone" aria-hidden="true"></i><span>โทร</span></a>` +
      `<button class="ab-primary" type="button" data-bs-toggle="modal" data-bs-target="#phoneModal"><i class="bi bi-calendar3" aria-hidden="true"></i>จองห้องพัก</button>`;
    document.body.appendChild(bar);
    document.body.classList.add('has-action-bar');

    // On the homepage it appears once the hero (which has its own CTAs)
    // scrolls away; room pages have no hero CTA, so it shows right away.
    const hero = document.querySelector('.hero-section');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
      }, { rootMargin: '-35% 0px 0px 0px' }).observe(hero);
    } else {
      bar.classList.add('is-visible');
    }
  }

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
