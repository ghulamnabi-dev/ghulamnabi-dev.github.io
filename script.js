/* Ghulam Nabi — portfolio
   1. Keeps the rail's section index in step with the reading position.
   2. Cursor intro on the opening: three small labelled cursors place the
      name, the statement, the profile block and the actions, then leave.
      Runs once per browser session; never with reduced motion. The flag
      is set in <head> before first paint, so there is no flash either way. */

(function () {
  'use strict';

  /* ---------- 1. section index ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.rail-nav a'));
  var targets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    var current = null;
    var setCurrent = function (id) {
      if (id === current) return;
      current = id;
      navLinks.forEach(function (a) { a.classList.toggle('current', a.getAttribute('href') === '#' + id); });
    };
    var spy = new IntersectionObserver(function (entries) {
      // choose the visible section closest to the top of the viewport
      var best = null;
      entries.forEach(function (e) { if (e.isIntersecting) { if (!best || e.boundingClientRect.top < best.boundingClientRect.top) best = e; } });
      if (best) setCurrent(best.target.id);
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- 2. cursor intro ---------- */
  var root = document.documentElement;
  if (root.getAttribute('data-intro') !== 'pending') return;

  var layer = document.querySelector('.cursor-layer');
  var stage = document.querySelector('.open');
  var items = Array.prototype.slice.call(document.querySelectorAll('.intro-item'))
    .sort(function (a, b) { return +a.dataset.intro - +b.dataset.intro; });
  if (!layer || !stage || !items.length) { finish(); return; }

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3l16 7.5-7 1.6L9.5 21z"/></svg>';
  var agents = [
    { name: 'layout',  color: '#7cc4ff' },
    { name: 'type',    color: '#e3b65a' },
    { name: 'content', color: '#8fd19e' }
  ];

  var box = stage.getBoundingClientRect();
  var cursors = agents.map(function (a, i) {
    var el = document.createElement('div');
    el.className = 'cursor';
    el.style.setProperty('--c', a.color);
    el.innerHTML = ARROW + '<span class="label">' + a.name + '</span>';
    var sx = i === 0 ? -60 : i === 1 ? box.width + 40 : box.width * 0.55;
    var sy = i === 2 ? box.height + 30 : box.height * (0.25 + 0.3 * i);
    el.style.setProperty('--x', sx + 'px');
    el.style.setProperty('--y', sy + 'px');
    layer.appendChild(el);
    return el;
  });

  root.setAttribute('data-intro', 'running');

  function moveTo(cursor, target) {
    var s = stage.getBoundingClientRect();
    var r = target.getBoundingClientRect();
    var x = r.left - s.left + Math.min(24, r.width * 0.06);
    var y = r.top - s.top + Math.min(16, r.height * 0.3);
    cursor.style.setProperty('--x', x + 'px');
    cursor.style.setProperty('--y', y + 'px');
  }

  var step = 0;
  var STEP_MS = 380;  // between placements
  var FLY_MS = 330;   // travel before the element appears

  requestAnimationFrame(function () {
    cursors.forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, 60 * i); });
    setTimeout(place, 260);
  });

  function place() {
    if (step >= items.length) { done(); return; }
    var target = items[step];
    var cursor = cursors[step % cursors.length];
    var agent = agents[step % agents.length];
    moveTo(cursor, target);
    target.style.setProperty('--ring', agent.color);
    setTimeout(function () {
      target.classList.add('placing', 'placed');
      setTimeout(function () { target.classList.remove('placing'); }, 380);
    }, FLY_MS);
    step += 1;
    setTimeout(place, STEP_MS);
  }

  function done() {
    var s = stage.getBoundingClientRect();
    cursors.forEach(function (c, i) {
      c.style.setProperty('--x', (s.width * (0.2 + 0.3 * i)) + 'px');
      c.style.setProperty('--y', (s.height + 20) + 'px');
    });
    setTimeout(function () {
      cursors.forEach(function (c) { c.classList.remove('on'); });
      setTimeout(finish, 350);
    }, 520);
  }

  function finish() {
    root.removeAttribute('data-intro');
    items.forEach(function (it) { it.classList.remove('placed', 'placing'); it.style.removeProperty('--ring'); });
    if (layer) layer.innerHTML = '';
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) { /* ignore */ }
  }

  // Whatever happens, everything is readable after 5 s.
  setTimeout(function () { if (root.getAttribute('data-intro')) finish(); }, 5000);
})();
