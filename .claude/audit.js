(() => {
  const vw = innerWidth, vh = innerHeight, H = document.documentElement.scrollHeight;
  const label = e => (e.id ? '#' + e.id : (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : e.tagName)).slice(0, 26);
  const blocks = [...document.querySelectorAll('body > *')]
    .filter(e => e.offsetHeight > 0 && getComputedStyle(e).position !== 'fixed')
    .map(e => [label(e), +(e.offsetHeight / vh).toFixed(2)])
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const small = [];
  document.querySelectorAll('a[href],button,input,select,textarea,[role=button]').forEach(e => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!r.width || !r.height || cs.visibility === 'hidden' || e.closest('.modal,.collapse:not(.show)')) return;
    if (r.width < 44 || r.height < 44) small.push(`${(e.textContent.trim() || e.getAttribute('aria-label') || label(e)).replace(/\s+/g, ' ').slice(0, 22)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  const over = [];
  document.querySelectorAll('body *').forEach(e => {
    const r = e.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1) && !e.closest('.carousel-inner,.modal')) {
      let p = e.parentElement, clipped = false;
      while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o !== 'visible') { clipped = true; break; } p = p.parentElement; }
      if (!clipped) over.push(`${label(e)} ${Math.round(r.left)}..${Math.round(r.right)}`);
    }
  });
  const cta = [...document.querySelectorAll('[data-bs-target="#phoneModal"],a[href^="tel:"],a[href*="line.me"]')]
    .map(e => ({ e, r: e.getBoundingClientRect() })).filter(o => o.r.height > 0 && !o.e.closest('.collapse:not(.show),.modal'))
    .map(o => +((o.r.top + scrollY) / vh).toFixed(2)).sort((a, b) => a - b)[0];
  return { page: location.pathname, viewport: `${vw}x${vh}`, screens: +(H / vh).toFixed(1), docWidth: document.documentElement.scrollWidth,
    biggest: blocks, smallTargets: small.length, smallSample: small.slice(0, 12), overflow: over.slice(0, 8), firstInPageCTAatScreen: cta ?? 'none (nav menu only)' };
})()
