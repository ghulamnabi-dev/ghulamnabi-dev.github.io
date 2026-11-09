/* the page is built live by three cursors. Layout drags out frames, Type types, Colour floods fills.
 * The opening builds on load; every later section builds when it scrolls into view.
 * Skipped entirely under prefers-reduced-motion and after the first run in a session ("Replay build" resets it).
 */
(function () {
  'use strict';
  var root = document.documentElement;
  window.__buildAlive = true;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var AGENTS = [{ n: 'Layout', c: '#5b8fd0' }, { n: 'Type', c: '#d2a52a' }, { n: 'Colour', c: '#3fb488' }];
  var building = root.classList.contains('build');

  /* top bar: a "Building" note while the cursors work, and a way to watch it again */
  var bar = $('.top .wrap'), nav = $('.top nav'), chip = null;
  if (building) {
    var file = document.createElement('div'); file.className = 'b-file';
    file.innerHTML = '<span class="b-chip">Building</span>';
    bar.insertBefore(file, nav); chip = file.firstChild;
  }
  var replay = document.createElement('button'); replay.type = 'button'; replay.className = 'b-replay'; replay.textContent = 'Replay build';
  replay.addEventListener('click', function () { try { sessionStorage.removeItem('built'); } catch (e) {} window.scrollTo(0, 0); location.reload(); });
  nav.appendChild(replay);
  if (!building) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var layer = document.createElement('div'); layer.className = 'b-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer);
  var skip = false, pend = [], K = .58;                         /* overall pace: lower is faster */
  var d = function (ms) { return Math.round(ms * K); };
  var sleep = function (ms) {
    return new Promise(function (r) {
      if (skip || ms <= 0) return r();
      var t = setTimeout(r, d(ms)); pend.push(function () { clearTimeout(t); r(); });
    });
  };
  var ag = AGENTS.map(function (a) {
    var cur = document.createElement('div'); cur.className = 'b-cur'; cur.style.setProperty('--c', a.c);
    cur.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 3l16 7.5-7 1.6L9.5 21z"/></svg><span>' + a.n + '</span>';
    var box = document.createElement('div'); box.className = 'b-box'; box.style.setProperty('--c', a.c); box.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
    layer.appendChild(box); layer.appendChild(cur);
    return { el: cur, box: box, x: 0, y: 0, shown: false, q: [], busy: false, idle: 0 };
  });
  var L = ag[0], T = ag[1], C = ag[2];

  var rectOf = function (el) { var r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }; };
  var go = function (a, x, y, ms, linear) {
    a.x = x; a.y = y; a.el.classList.toggle('lin', !!linear);
    a.el.style.transitionDuration = (skip ? 0 : d(ms)) + 'ms, 300ms'; a.el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    return sleep(ms);
  };
  var appear = function (a, r) {
    clearTimeout(a.idle);
    if (a.shown) return;
    var sx = r.x + r.w / 2 < window.innerWidth / 2 ? -50 : window.innerWidth + 10, sy = r.y + Math.min(r.h / 2, 160);
    a.el.style.transitionDuration = '0ms, 0ms'; a.el.style.transform = 'translate(' + sx + 'px,' + sy + 'px)'; a.x = sx; a.y = sy;
    void a.el.offsetWidth; a.el.classList.add('on'); a.shown = true;
  };
  var clean = function (el) { ['clipPath', 'webkitClipPath', 'transition', 'transform', 'opacity'].forEach(function (p) { el.style[p] = ''; }); };

  /* one build: fly in, drag out the frame, then reveal the content in the way that suits it */
  async function build(a, el, kind, name) {
    if (el.classList.contains('b-on')) return;
    var r = rectOf(el); appear(a, r);
    await go(a, r.x, r.y, Math.max(200, Math.min(480, Math.hypot(r.x - a.x, r.y - a.y) * .55)));
    var b = a.box, ms = Math.max(240, Math.min(520, (r.w + Math.min(r.h, 700)) * .26));
    b.style.transition = 'none'; b.style.left = r.x + 'px'; b.style.top = r.y + 'px'; b.style.width = '0px'; b.style.height = '0px';
    b.lastChild.textContent = name; b.classList.add('on'); void b.offsetWidth;
    b.style.transition = 'width ' + d(ms) + 'ms cubic-bezier(.3,.7,.2,1), height ' + d(ms) + 'ms cubic-bezier(.3,.7,.2,1), opacity .25s';
    b.style.width = r.w + 'px'; b.style.height = r.h + 'px';
    await go(a, r.x + r.w, r.y + r.h, ms);
    b.lastChild.textContent = name + '  ' + Math.round(r.w) + ' × ' + Math.round(r.h);
    var t = 460;
    if (kind === 'type') {
      var n = Math.max(6, Math.min(40, el.textContent.trim().length)); t = Math.min(900, 68 * n);
      el.style.clipPath = 'inset(-25% 100% -25% -6%)'; el.classList.add('b-on'); void el.offsetWidth;
      await go(a, r.x, r.y + r.h * .62, 160);
      el.style.transition = 'clip-path ' + d(t) + 'ms steps(' + n + ')'; el.style.clipPath = 'inset(-25% -6% -25% -6%)';
      await go(a, r.x + r.w, r.y + r.h * .62, t, true);
    } else if (kind === 'fill') {
      var px = Math.min(r.w * .3, 420), py = Math.min(r.h * .3, 240);
      await go(a, r.x + px, r.y + py, 220); a.el.classList.add('click'); await sleep(110); a.el.classList.remove('click');
      t = 950; el.style.clipPath = 'circle(0px at ' + px + 'px ' + py + 'px)'; el.classList.add('b-on'); void el.offsetWidth;
      el.style.transition = 'clip-path ' + d(t) + 'ms cubic-bezier(.5,0,.2,1)'; el.style.clipPath = 'circle(' + Math.ceil(Math.hypot(r.w, r.h)) + 'px at ' + px + 'px ' + py + 'px)';
      b.classList.remove('on'); await sleep(t);
    } else if (kind === 'drop') {
      el.style.opacity = '0'; el.style.transform = 'translateY(14px) scale(.965)'; el.classList.add('b-on'); void el.offsetWidth;
      el.style.transition = 'opacity ' + d(450) + 'ms, transform ' + d(520) + 'ms cubic-bezier(.2,.8,.2,1)'; el.style.opacity = '1'; el.style.transform = 'none'; t = 520; await sleep(t);
    } else {
      el.style.clipPath = 'inset(-5% 100% -5% -3%)'; el.classList.add('b-on'); void el.offsetWidth;
      el.style.transition = 'clip-path ' + d(t) + 'ms cubic-bezier(.3,.7,.2,1)'; el.style.clipPath = 'inset(-5% -3% -5% -3%)'; await sleep(t);
    }
    clean(el); b.classList.remove('on');
  }
  var rest = function (a) { a.idle = setTimeout(function () { a.el.classList.remove('on'); a.shown = false; }, 400); };
  async function run(a) {
    if (a.busy) return; a.busy = true;
    while (a.q.length) { var t = a.q.shift(); await build(a, t.el, t.kind, t.name); }
    a.busy = false; rest(a);
  }
  var enqueue = function (a, el, kind, name) {
    a.q.push({ el: el, kind: kind, name: name });
    while (a.q.length > 3) a.q.shift().el.classList.add('b-on');   /* scrolled past too fast: just show it */
    run(a);
  };

  /* the opening */
  async function hero() {
    var h1 = $('.hero h1'), bail = function () { skip = true; pend.forEach(function (f) { f(); }); pend = []; };
    var evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    evs.forEach(function (e) { window.addEventListener(e, bail, { passive: true }); });
    if (window.scrollY > 40 || location.hash) bail();
    await sleep(350);
    await build(T, h1, 'type', 'Name');
    await Promise.all([
      (async function () { await build(T, $('.lede'), 'wipe', 'Statement'); await build(T, $('.facts'), 'wipe', 'Facts'); })(),
      (async function () { await sleep(120); await build(L, $('.bench'), 'drop', 'Preview'); })(),
      (async function () { await sleep(700); await build(C, $('.hero .links'), 'drop', 'Actions'); })()
    ]);
    $$('.hero .it').forEach(function (el) { el.classList.add('b-on'); clean(el); });
    evs.forEach(function (e) { window.removeEventListener(e, bail); });
    skip = false; ag.forEach(function (a) { a.box.classList.remove('on'); rest(a); });
    chip.classList.add('gone'); setTimeout(function () { chip.parentNode.remove(); }, 450);
    try { sessionStorage.setItem('built', '1'); } catch (e) {}
  }

  /* everything below builds as it scrolls into view */
  function below() {
    var flip = 0;
    var plan = function (el) {
      if (el.classList.contains('card')) return [C, 'fill', $('h3', el).textContent.trim()];
      if (el.classList.contains('flood')) return [C, 'fill', 'Sentinel Flux Core'];
      if (el.classList.contains('contact')) return [L, 'wipe', 'Contact'];
      if (el.classList.contains('head')) return [T, 'wipe', 'Heading'];
      if (el.classList.contains('two')) return [L, 'wipe', 'Education'];
      var h = $('h3', el), name = h ? h.firstChild.textContent.trim() : 'Row';
      return [(flip++ % 2) ? L : T, 'wipe', name];
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var p = plan(e.target); enqueue(p[0], e.target, p[1], p[2]);
      });
    }, { threshold: .08, rootMargin: '0px 0px -10% 0px' });
    $$('.head, .card, .flood, .row, .two, .contact').forEach(function (el) { io.observe(el); });
  }

  if (!('IntersectionObserver' in window)) { root.classList.remove('build'); return; }
  hero().then(below);
})();

/* the dot after the name follows the previewed project, in the dimmer palette */
(function () {
  var bench = document.querySelector('[data-bench]'); if (!bench) return;
  var map = { tz: '#d2a52a', pb: '#7a73d6', mo: '#3fb488' };
  var set = function () { document.documentElement.style.setProperty('--dot', map[bench.getAttribute('data-project')] || map.tz); };
  new MutationObserver(set).observe(bench, { attributes: true, attributeFilter: ['data-project'] }); set();
})();
