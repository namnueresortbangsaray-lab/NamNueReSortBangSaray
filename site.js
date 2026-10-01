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

  // ------------------------------------------------------------------------
  // Swipe tracks: progress indicator under each horizontal strip
  // ------------------------------------------------------------------------
  document.querySelectorAll('[data-track]').forEach(track => {
    const bar = track.nextElementSibling;
    if (!bar || !bar.classList.contains('track-progress')) return;
    const fill = bar.firstElementChild;
    let raf = 0;
    function update() {
      raf = 0;
      const max = track.scrollWidth - track.clientWidth;
      bar.style.visibility = max > 4 ? 'visible' : 'hidden';
      if (max <= 4) return;
      const w = track.clientWidth / track.scrollWidth;
      const f = track.scrollLeft / track.scrollWidth;
      fill.style.setProperty('--w', (w * 100).toFixed(2) + '%');
      fill.style.setProperty('--x', ((f / w) * 100).toFixed(2) + '%');
    }
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    track.addEventListener('trackchange', update);
    update();
  });

  // ------------------------------------------------------------------------
  // Amenities: on phones a 3-column icon grid; tapping an item shows its
  // description in one panel below (content stays in the DOM).
  // ------------------------------------------------------------------------
  const phoneMQ = window.matchMedia('(max-width: 767.98px)');
  document.querySelectorAll('[data-amenities]').forEach((grid, gi) => {
    const items = [...grid.querySelectorAll('.facilities-card, .facility-card-premium')];
    if (!items.length) return;
    const panel = document.createElement('div');
    panel.className = 'amenity-panel';
    panel.id = 'amenity-panel-' + gi;
    panel.setAttribute('aria-live', 'polite');
    grid.after(panel);

    function select(item) {
      items.forEach(it => it.setAttribute('aria-pressed', String(it === item)));
      const title = item.querySelector('h5');
      const desc = item.querySelector('p');
      panel.innerHTML = '';
      const strong = document.createElement('strong');
      strong.textContent = title ? title.textContent.trim() : '';
      const p = document.createElement('p');
      p.textContent = desc ? desc.textContent.trim() : '';
      panel.append(strong, p);
    }

    function setMode() {
      const on = phoneMQ.matches;
      items.forEach(it => {
        if (on) {
          it.setAttribute('role', 'button');
          it.setAttribute('tabindex', '0');
          it.setAttribute('aria-controls', panel.id);
        } else {
          ['role', 'tabindex', 'aria-controls', 'aria-pressed'].forEach(a => it.removeAttribute(a));
        }
      });
      if (on) select(items.find(it => it.getAttribute('aria-pressed') === 'true') || items[0]);
    }

    items.forEach(it => {
      it.addEventListener('click', () => { if (phoneMQ.matches) select(it); });
      it.addEventListener('keydown', e => {
        if (phoneMQ.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(it); }
      });
    });
    phoneMQ.addEventListener('change', setMode);
    setMode();
  });

  // ------------------------------------------------------------------------
  // Nearby places: category chips filter the strip/grid
  // ------------------------------------------------------------------------
  document.querySelectorAll('[data-place-filter]').forEach(group => {
    const track = document.getElementById('attractionsScrollRow');
    if (!track) return;
    const cards = [...track.children].filter(el => el.dataset.cat);
    group.addEventListener('click', e => {
      const chip = e.target.closest('[data-filter]');
      if (!chip) return;
      const f = chip.dataset.filter;
      group.querySelectorAll('[data-filter]').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      cards.forEach(card => {
        card.hidden = !(f === 'all' || card.dataset.cat === f);
        if (!card.hidden) card.classList.add('is-in');   // never leave a filtered card unrevealed
      });
      track.scrollTo({ left: 0, behavior: 'auto' });
      track.dispatchEvent(new Event('trackchange'));
    });
  });

  // ------------------------------------------------------------------------
  // Map: one tap to load on phones; loads by itself near the viewport on
  // desktop. Keeps the heavy Google iframe off the initial page load.
  // ------------------------------------------------------------------------
  document.querySelectorAll('[data-map-src]').forEach(box => {
    function load() {
      if (box.querySelector('iframe:not(noscript iframe)')) return;
      const f = document.createElement('iframe');
      f.src = box.dataset.mapSrc;
      f.title = box.dataset.mapTitle || 'Google Map';
      f.width = '100%';
      f.height = '380';
      f.style.border = '0';
      f.allowFullscreen = true;
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.querySelector('[data-map-load]')?.remove();
      box.classList.add('is-loaded');
      box.appendChild(f);
    }
    box.querySelector('[data-map-load]')?.addEventListener('click', load);
    if (desktopMQ.matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '300px' });
      io.observe(box);
    }
  });

  // ------------------------------------------------------------------------
  // Lightbox for [data-lightbox] photo groups: native <dialog> (focus trap,
  // Escape), swipe between photos, swipe down to close, close in thumb reach.
  // ------------------------------------------------------------------------
  document.querySelectorAll('[data-lightbox]').forEach(group => {
    const imgs = [...group.querySelectorAll('img')];
    if (!imgs.length || typeof HTMLDialogElement !== 'function') return;

    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'ภาพบรรยากาศ');
    dlg.innerHTML =
      '<div class="lb-count" aria-live="polite"></div>' +
      '<div class="lb-track"></div>' +
      '<div class="lb-bar">' +
      '<button type="button" class="lb-btn lb-prev" aria-label="ภาพก่อนหน้า"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>' +
      '<button type="button" class="lb-btn lb-close"><i class="bi bi-x-lg" aria-hidden="true"></i> ปิด</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="ภาพถัดไป"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>' +
      '</div>';
    const lbTrack = dlg.querySelector('.lb-track');
    const count = dlg.querySelector('.lb-count');
    const prev = dlg.querySelector('.lb-prev');
    const next = dlg.querySelector('.lb-next');

    imgs.forEach(img => {
      const slide = document.createElement('div');
      slide.className = 'lb-slide';
      const big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      if (img.srcset) big.srcset = img.srcset;
      big.sizes = '100vw';
      big.alt = img.alt;
      big.loading = 'lazy';
      big.decoding = 'async';
      slide.appendChild(big);
      lbTrack.appendChild(slide);
    });
    document.body.appendChild(dlg);

    let opener = null;
    const index = () => Math.round(lbTrack.scrollLeft / lbTrack.clientWidth);
    function sync() {
      const i = index();
      count.textContent = `${i + 1} / ${imgs.length}`;
      prev.disabled = i <= 0;
      next.disabled = i >= imgs.length - 1;
    }
    function go(i) {
      lbTrack.scrollTo({ left: i * lbTrack.clientWidth, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
    function open(i) {
      opener = document.activeElement;
      dlg.showModal();
      lockScroll(true);
      lbTrack.scrollTo({ left: i * lbTrack.clientWidth, behavior: 'auto' });
      sync();
      dlg.querySelector('.lb-close').focus();
    }
    function close() {
      if (dlg.open) dlg.close();
    }

    dlg.addEventListener('close', () => {
      lockScroll(false);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    });
    lbTrack.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    prev.addEventListener('click', () => go(index() - 1));
    next.addEventListener('click', () => go(index() + 1));
    dlg.querySelector('.lb-close').addEventListener('click', close);
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(index() - 1);
      if (e.key === 'ArrowRight') go(index() + 1);
    });

    // Swipe down to close (vertical drag that clearly beats horizontal)
    let sx = 0, sy = 0;
    lbTrack.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    lbTrack.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
    }, { passive: true });

    // Openers: each photo, plus any "see all" button in the same section
    imgs.forEach((img, i) => {
      const target = img.closest('.gallery-item-wrapper, .gallery-item') || img;
      target.setAttribute('role', 'button');
      target.setAttribute('tabindex', '0');
      target.setAttribute('aria-label', `ดูภาพขยาย: ${img.alt}`);
      target.addEventListener('click', () => open(i));
      target.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    const section = group.closest('section');
    if (section) section.querySelectorAll('[data-lightbox-open]').forEach(btn => btn.addEventListener('click', () => open(0)));
  });
})();
