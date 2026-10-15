/* motion.js — the expressive layer. Load with `defer` after fluid.js.
   Does nothing for visitors who ask for reduced motion. Pointer effects
   (cursor, magnets, spotlight, tilt, lotus hover) only run with a mouse or trackpad. */
(function () {
  'use strict';
  var root = document.documentElement;
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  if (mq('(prefers-reduced-motion: reduce)')) return;
  var fine = mq('(hover: hover) and (pointer: fine)');
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var lenis = window.fluid && window.fluid.lenis;

  /* shared pointer state */
  var ptr = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.seen = true;
  }, { passive: true });

  /* ---------- scroll progress ---------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var barFill = bar.firstChild;

  /* ---------- cursor halo: the normal cursor stays, a thin ring and glow trail it ---------- */
  var ring, rx = ptr.x, ry = ptr.y;
  if (fine) {
    ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    var HOVER = 'a, button, [role="button"], .hv-card, .proj-row, label, summary';
    document.addEventListener('pointerover', function (e) {
      ring.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(HOVER)));
    });
    document.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { root.classList.remove('cursor-on'); });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') root.classList.add('cursor-on');
    }, { passive: true });
  }

  /* ---------- magnetic controls ---------- */
  if (fine) {
    $$('.hv-cta, .hv-ghost, .hv-social, .hv-copy, .hv-brd, .hv-white, [data-navcta], #theme-toggle').forEach(function (el) {
      el.classList.add('magnetic');
      var pull = el.id === 'theme-toggle' ? 0.35 : 0.28;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = clamp((e.clientX - (r.left + r.width / 2)) * pull, -14, 14);
        var dy = clamp((e.clientY - (r.top + r.height / 2)) * pull * 1.2, -10, 10);
        el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = '0px 0px'; });
    });
  }

  /* ---------- glass cards: spotlight + glowing edge; small cards tilt ---------- */
  if (fine) {
    var cards = $$('[style*="background: var(--glass)"]').filter(function (el) { return el.offsetWidth > 180; });
    cards.forEach(function (card) {
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      var spot = document.createElement('span');
      spot.className = 'spot'; spot.setAttribute('aria-hidden', 'true');
      card.insertBefore(spot, card.firstChild);
      card.classList.add('spot-host');
      var tilt = card.classList.contains('hv-card');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--sx', x + 'px');
        card.style.setProperty('--sy', y + 'px');
        card.classList.add('spot-on');
        if (tilt) {
          var ry_ = ((x / r.width) - 0.5) * 12, rx_ = (0.5 - (y / r.height)) * 10;
          card.style.setProperty('transform', 'perspective(800px) rotateX(' + rx_.toFixed(2) + 'deg) rotateY(' + ry_.toFixed(2) + 'deg) translateY(-6px)', 'important');
        }
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('spot-on');
        if (tilt) card.style.removeProperty('transform');
      });
    });
  }

  /* ---------- headings: split into letters that rise in; their rule draws in ---------- */
  var esc = function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c; };
  var splitIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('split-in');
      var rule = en.target.nextElementSibling;
      if (rule && rule.classList.contains('rule-draw')) rule.classList.add('split-in');
      splitIO.unobserve(en.target);
    });
  }, { threshold: 0.4, rootMargin: '0px 0px -8% 0px' });
  $$('section h2').forEach(function (h) {
    var text = h.textContent.trim();
    if (!text) return;
    var k = 0;
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map(function (word) {
      return '<span class="sw" aria-hidden="true">' + word.split('').map(function (c) {
        return '<span class="sc" style="--i:' + (k++) + '">' + esc(c) + '</span>';
      }).join('') + '</span>';
    }).join(' ');
    h.classList.add('split');
    var rule = h.nextElementSibling;
    if (rule && /height:\s*1px/.test(rule.getAttribute('style') || '')) rule.classList.add('rule-draw');
    splitIO.observe(h);
  });

  /* ---------- images unveil with a wipe ---------- */
  var wipeIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('wipe-in'); wipeIO.unobserve(en.target); } });
  }, { threshold: 0.2 });
  function addWipe(el, delay) {
    el.classList.add('wipe');
    if (delay) el.style.setProperty('--wd', delay + 'ms');
    wipeIO.observe(el);
  }
  $$('#about img[src*="nate-professional"]').forEach(function (img) { addWipe(img, 0); });
  /* about thumbnails arrive after the photo loader fills them */
  $$('#about .slot').forEach(function (slot, i) {
    var mo = new MutationObserver(function () {
      if (slot.querySelector('img')) { addWipe(slot, 200 + i * 120); mo.disconnect(); }
    });
    if (slot.querySelector('img')) addWipe(slot, 200 + i * 120); else mo.observe(slot, { childList: true });
  });

  /* ---------- lists cascade in ---------- */
  function cascade(el, pop) {
    if (!el) return;
    el.classList.add('cascade'); if (pop) el.classList.add('pop');
    Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--k', i); });
  }
  $$('#recognition .g2 > div').forEach(function (col) { cascade(col); });
  var pills = $$('#about span').filter(function (s) { return s.textContent.trim() === 'Volleyball'; })[0];
  if (pills) cascade(pills.parentElement, true);
  var social = document.querySelector('#about a.hv-social');
  if (social) cascade(social.parentElement, true);
  var contactGrid = document.querySelector('#contact .hv-card');
  if (contactGrid) cascade(contactGrid.parentElement);

  /* ---------- copy buttons pulse when they copy ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (!b) return;
    b.classList.remove('copied-pulse'); void b.offsetWidth; b.classList.add('copied-pulse');
    setTimeout(function () { b.classList.remove('copied-pulse'); }, 800);
  });

  /* ---------- experience timeline ---------- */
  var tl = null;
  var expBox = document.querySelector('#experience [style*="background: var(--glass)"]');
  if (expBox) {
    if (getComputedStyle(expBox).position === 'static') expBox.style.position = 'relative';
    expBox.classList.add('has-tl');
    var rail = document.createElement('div');
    rail.className = 'tl'; rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<span class="tl-fill"></span>';
    expBox.appendChild(rail);
    var rows = $$('.exp-row', expBox);
    var dots = rows.map(function () { var d = document.createElement('span'); d.className = 'tl-dot'; rail.appendChild(d); return d; });
    tl = { box: expBox, rail: rail, fill: rail.firstChild, rows: rows, dots: dots, at: [] };
    var layoutTl = function () {
      var padL = parseFloat(getComputedStyle(expBox).paddingLeft) || 24;
      rail.style.left = (padL / 2) + 'px';
      var railTop = rail.offsetTop, railH = rail.offsetHeight || 1;
      tl.at = rows.map(function (row, i) {
        var y = row.offsetTop + 44 - railTop;
        dots[i].style.top = y + 'px';
        return clamp(y / railH, 0, 1);
      });
    };
    layoutTl();
    window.addEventListener('resize', layoutTl);
    window.addEventListener('load', layoutTl);
  }

  /* ---------- marquee: JS-driven so it speeds up and leans with scroll ---------- */
  var marquee = [
    { el: document.getElementById('row-companies'), dir: 1, secs: 34 },
    { el: document.getElementById('row-tools'), dir: -1, secs: 42 }
  ].filter(function (m) { return m.el; });
  var mqWrap = document.getElementById('marquee-wrap'), mqHover = false, mqGate = 1, skew = 0;
  marquee.forEach(function (m) { m.el.style.animation = 'none'; m.off = 0; });
  if (mqWrap) {
    mqWrap.addEventListener('mouseenter', function () { mqHover = true; });
    mqWrap.addEventListener('mouseleave', function () { mqHover = false; });
  }

  /* ---------- anaeio lotus turns with the scroll ---------- */
  var lotusImg = document.querySelector('#anaeio img[src*="anaeio-lotus"]');

  /* ---------- hero lotus: hover pushes dots away and lights them; clicks send a ripple ---------- */
  var hero = document.getElementById('top');
  var canvas = document.getElementById('lotus');
  var FX = window.lotusFX = { x: -9999, y: -9999, s: 0, tx: -9999, ty: -9999, ts: 0, ripples: [] };
  if (hero && canvas) {
    if (fine) {
      hero.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        FX.tx = e.clientX - r.left; FX.ty = e.clientY - r.top; FX.ts = 1;
        if (FX.s < 0.02) { FX.x = FX.tx; FX.y = FX.ty; }
      });
      hero.addEventListener('pointerleave', function () { FX.ts = 0; });
    }
    hero.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var r = canvas.getBoundingClientRect();
      FX.ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      if (FX.ripples.length > 4) FX.ripples.shift();
    });
  }

  /* ---------- one loop for everything that follows scroll or pointer ---------- */
  var lastY = window.scrollY, lastT = performance.now(), vel = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(64, now - lastT) / 1000; lastT = now;
    var y = window.scrollY, vh = innerHeight;
    var v = lenis ? lenis.velocity : (y - lastY) / Math.max(dt, 0.001) / 60;
    lastY = y;
    vel = lerp(vel, v || 0, 0.15);

    /* progress */
    var max = document.documentElement.scrollHeight - vh;
    barFill.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')';

    /* cursor */
    if (ring) {
      rx = lerp(rx, ptr.x, 0.22); ry = lerp(ry, ptr.y, 0.22);
      ring.style.translate = rx.toFixed(1) + 'px ' + ry.toFixed(1) + 'px';
    }

    /* hero lotus pointer easing; old ripples expire */
    FX.s = lerp(FX.s, FX.ts, 0.07);
    FX.x = lerp(FX.x, FX.tx, 0.16); FX.y = lerp(FX.y, FX.ty, 0.16);
    while (FX.ripples.length && now - FX.ripples[0].t > 1800) FX.ripples.shift();

    /* marquee */
    if (marquee.length) {
      mqGate = lerp(mqGate, mqHover ? 0 : 1, 0.08);
      var boost = 1 + Math.min(Math.abs(vel) * 0.35, 7);
      skew = lerp(skew, clamp(-vel * 0.5, -7, 7), 0.1);
      marquee.forEach(function (m) {
        var half = m.el.scrollWidth / 2;
        if (!half) return;
        m.off = (m.off + (half / m.secs) * boost * mqGate * dt) % half;
        var x = m.dir > 0 ? -half + m.off : -m.off;
        m.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
      });
    }

    /* timeline */
    if (tl) {
      var r = tl.rail.getBoundingClientRect();
      var p = clamp((vh * 0.62 - r.top) / (r.height || 1), 0, 1);
      tl.fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      for (var i = 0; i < tl.dots.length; i++) tl.dots[i].classList.toggle('on', p >= tl.at[i] - 0.005);
    }

    /* anaeio lotus */
    if (lotusImg) {
      var lr = lotusImg.getBoundingClientRect();
      if (lr.bottom > -100 && lr.top < vh + 100) {
        var lp = clamp(1 - (lr.top + lr.height / 2) / vh, -0.2, 1.2) - 0.5;
        lotusImg.style.rotate = (lp * 36).toFixed(2) + 'deg';
        lotusImg.style.translate = '0 ' + (-lp * 46).toFixed(1) + 'px';
        lotusImg.style.scale = (1 + Math.abs(vel) * 0.004).toFixed(3);
      }
    }
  }
  requestAnimationFrame(frame);
})();
