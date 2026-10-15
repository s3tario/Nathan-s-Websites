/* fluid.js — motion layer shared by index.html and resume.html.
   Load after vendor/lenis.min.js. Exposes window.fluid.scrollTo(target). */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasViewTransitions = 'CSSViewTransitionRule' in window;
  var lenis = null;

  /* ---------- smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }

  function scrollTo(target, opts) {
    opts = opts || {};
    var offset = opts.offset == null ? -72 : opts.offset;
    if (lenis) {
      lenis.scrollTo(target, { offset: target === 0 ? 0 : offset, duration: 1.4, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else {
      var y = typeof target === 'number' ? target
        : target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  window.fluid = { scrollTo: scrollTo, lenis: lenis, reduce: reduce };

  /* in-page links glide to their section (skip links still move focus) */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    scrollTo(el.id === 'top' ? 0 : el);
    if (a.classList.contains('skip')) { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  /* ---------- page transitions (fallback when the browser lacks view transitions) ---------- */
  if (!reduce && !hasViewTransitions) {
    root.classList.add('page-entering');
    setTimeout(function () { root.classList.remove('page-entering'); }, 700);
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!/\.html(\?|#|$)/.test(href) || /^[a-z]+:/i.test(href)) return;
      e.preventDefault();
      root.classList.add('page-leaving');
      setTimeout(function () { window.location.href = a.href; }, 260);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('page-leaving'); });
  }

  /* ---------- theme switch: new theme opens out of the toggle ---------- */
  /* pages call fluid.themeSwitch(button, applyFn) instead of applying directly */
  window.fluid.themeSwitch = function (btn, apply) {
    if (reduce || !document.startViewTransition) { apply(); return; }
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty('--tx', x + 'px');
    root.style.setProperty('--ty', y + 'px');
    root.style.setProperty('--tr', radius + 'px');
    root.classList.add('theme-switching');
    var t = document.startViewTransition(apply);
    t.finished.finally(function () { root.classList.remove('theme-switching'); });
  };

  /* ---------- reveals: parts of a section arrive one after another ---------- */
  function stagger() {
    var groups = new Map();
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var p = el.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach(function (els) {
      els.forEach(function (el, i) { if (i) el.style.setProperty('--rd', Math.min(i * 90, 360) + 'ms'); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', stagger); else stagger();
})();
