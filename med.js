/* med.js — builds the hero scenery for the "Mediterranean" look. Does nothing unless
   html.look-med is set, and nothing on the resume page (no #top: the look is pure CSS there).
   Adds, under the lotus: the plunge pool (water, a still and a drifting light web, entry steps,
   coping shadow) and the olive shade. The shade is built in dark too; CSS hides it there, and
   switching to light replays its fade-in, like the sun coming out.
   Pauses both moving layers whenever the hero is off screen. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('look-med')) return;

  /* warm the cache with both themes' textures once the page has loaded, so the first theme switch
     (a 0.7s circle reveal) never shows flat colour while the stone and shade are still downloading */
  addEventListener('load', function () {
    ['stone-light', 'stone-dark', 'leaf-shade'].forEach(function (n) {
      var i = new Image(); i.decoding = 'async'; i.src = 'assets/med/' + n + '.webp';
    });
  });

  var hero = document.getElementById('top');
  if (!hero) return;

  function el(cls, parent) { var d = document.createElement('div'); d.className = cls; if (parent) parent.appendChild(d); return d; }

  /* olive shade: two patches of the same leaf texture */
  var shade = el('med-shade');
  shade.setAttribute('aria-hidden', 'true');
  el('med-shade-a', shade);
  el('med-shade-b', shade);

  /* the pool: water, light web (still + drifting), steps above the web, coping shadow on top */
  var pool = el('med-pool');
  pool.setAttribute('aria-hidden', 'true');
  var water = el('med-water', pool);
  el('med-caustic still', water);
  el('med-caustic drift', water);
  el('med-steps', water);
  el('med-rim', water);

  /* bottom of the stack: pool first, the shade over it, then the classic glow, lotus and veil */
  hero.insertBefore(shade, hero.firstChild);
  hero.insertBefore(pool, hero.firstChild);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      /* a busy frame can deliver several entries at once: the newest one is the current state */
      hero.classList.toggle('med-paused', !entries[entries.length - 1].isIntersecting);
    }).observe(hero);
  }
})();
