/* aero.js — behaviour for the "coastal" look. Does nothing unless html.look-aero is set.
   Builds the hero water (caustic shimmer + sheen) and a few glossy bubbles, and pauses
   them whenever the hero is off screen. Under reduced motion only the still water is built. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('look-aero')) return;
  var hero = document.getElementById('top');
  if (!hero) return;   /* resume page: the look is pure CSS there */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(cls, parent) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); if (parent) parent.appendChild(d); return d; }

  /* water below the horizon: two caustic layers on a tilted plane, plus a soft sheen */
  var water = el('aero-water');
  var plane = el('aero-water-plane', water);
  el('aero-caustic', plane);
  el('aero-caustic b', plane);
  var sheen = el('aero-sheen');
  hero.insertBefore(sheen, hero.firstChild);
  hero.insertBefore(water, hero.firstChild);
  /* the horizon glint goes just before the name, so it shows through the glow behind the text */
  hero.insertBefore(el('aero-horizon'), hero.querySelector('#hero-text'));

  /* bubbles: few, small, at the edges so they never cross the name */
  if (!reduce) {
    var wrap = el('aero-bubbles');
    var spots = [
      { x: 5, s: 14, d: 24, w: 0, p: 0.55, sw: 16 },
      { x: 9.5, s: 26, d: 31, w: 9, p: 0.5, sw: -12 },
      { x: 15, s: 9, d: 20, w: 4, p: 0.6, sw: 10 },
      { x: 84, s: 18, d: 27, w: 2, p: 0.55, sw: -14 },
      { x: 90, s: 11, d: 22, w: 13, p: 0.6, sw: 12 },
      { x: 95, s: 30, d: 35, w: 6, p: 0.42, sw: -18 },
      { x: 77, s: 8, d: 19, w: 17, p: 0.6, sw: 8 }
    ];
    spots.forEach(function (b) {
      var s = el('aero-bubble', wrap);
      s.style.cssText = 'left:' + b.x + '%;width:' + b.s + 'px;height:' + b.s + 'px;--dur:' + b.d + 's;--delay:-' + b.w + 's;--peak:' + b.p + ';--sway:' + b.sw + 'px';
    });
    hero.insertBefore(wrap, hero.querySelector('#hero-text'));
  }

  /* pause the moving water and bubbles while the hero is off screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hero.classList.toggle('aero-paused', !entries[0].isIntersecting);
    }).observe(hero);
  }
})();
