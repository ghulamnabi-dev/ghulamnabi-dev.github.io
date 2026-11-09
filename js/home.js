/* gn-4200.github.io home page. No dependencies.
 * 1. Cursor intro: three cursors in the projects' colours place the opening (once per session).
 * 2. The hero "bench" plays the three products' loops in turn.
 * 3. Loops play only while on screen; walkthroughs load YouTube (no-cookie) only on request.
 * 4. Project cards stack as you scroll; small touches: reveal, tilt, pointer grid, clock, progress, copy.
 * Everything is skipped or simplified under prefers-reduced-motion, and the page reads fine without this file.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var play = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };

  /* 1. cursor intro */
  (function () {
    if (root.getAttribute('data-intro') !== 'pending') return;
    var items = $$('.it');
    var who = [['TechZone', '#ffd400'], ['PhoneBook', '#7d74ff'], ['Mohalla', '#3ddc97']];
    var layer = document.createElement('div');
    layer.className = 'cursors'; layer.setAttribute('aria-hidden', 'true');
    var W = window.innerWidth, H = window.innerHeight, timers = [], over = false;
    var curs = who.map(function (w, i) {
      var c = document.createElement('div');
      c.className = 'cur'; c.style.setProperty('--c', w[1]);
      c.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 3l16 7.5-7 1.6L9.5 21z"/></svg><span>' + w[0] + '</span>';
      var start = [[-60, H * .3], [W + 40, H * .55], [W * .5, H + 40]][i];
      c.style.setProperty('--x', start[0] + 'px'); c.style.setProperty('--y', start[1] + 'px');
      layer.appendChild(c); return c;
    });
    document.body.appendChild(layer);
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    var finish = function () {
      if (over) return; over = true;
      timers.forEach(clearTimeout);
      items.forEach(function (it) { it.classList.add('on'); });
      curs.forEach(function (c) { c.classList.remove('on'); });
      setTimeout(function () { root.removeAttribute('data-intro'); layer.remove(); }, 480);
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, finish); });
    };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, finish, { passive: true }); });
    requestAnimationFrame(function () {
      curs.forEach(function (c) { c.classList.add('on'); });
      items.forEach(function (it, n) {
        later(function () {
          var r = it.getBoundingClientRect(), c = curs[n % curs.length];
          c.style.setProperty('--x', Math.min(W - 120, r.left + Math.min(r.width * .5, 260)) + 'px');
          c.style.setProperty('--y', Math.min(H - 40, Math.max(70, r.top + Math.min(r.height * .5, 90))) + 'px');
          later(function () { it.classList.add('on'); }, 330);
        }, 120 + n * 340);
      });
      later(function () {
        /* each cursor comes to rest on its own project's tab */
        var tabs = $$('.bench__tab');
        curs.forEach(function (c, i) {
          var r = tabs[i] ? tabs[i].getBoundingClientRect() : null, ok = r && r.top < H - 30;
          c.style.setProperty('--x', (ok ? r.left + Math.min(r.width - 90, 130) : W * (.25 + .25 * i)) + 'px');
          c.style.setProperty('--y', (ok ? r.top + 2 : H + 60) + 'px');
        });
        later(finish, 800);
      }, 120 + items.length * 340 + 420);
    });
  })();

  /* 2. bench */
  var bench = document.querySelector('[data-bench]');
  if (bench) {
    var video = bench.querySelector('video');
    var tabs = $$('[data-clip]', bench);
    var current = 0, visible = true;
    var show = function (i, go) {
      current = (i + tabs.length) % tabs.length;
      var tab = tabs[current], clip = tab.getAttribute('data-clip');
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', n === current ? 'true' : 'false'); t.style.removeProperty('--progress'); });
      bench.setAttribute('data-project', tab.getAttribute('data-project'));
      root.style.setProperty('--dot', { tz: '#ffd400', pb: '#7d74ff', mo: '#3ddc97' }[tab.getAttribute('data-project')]);
      video.setAttribute('aria-label', tab.getAttribute('data-label'));
      video.poster = clip + '-poster.jpg';
      video.innerHTML = '<source src="' + clip + '.webm" type="video/webm"><source src="' + clip + '.mp4" type="video/mp4">';
      video.load();
      if (go && !reduce && visible) play(video);
    };
    video.addEventListener('timeupdate', function () {
      if (video.duration) tabs[current].style.setProperty('--progress', (100 * video.currentTime / video.duration).toFixed(1) + '%');
    });
    video.addEventListener('ended', function () { show(current + 1, true); });
    tabs.forEach(function (t, n) { t.addEventListener('click', function () { show(n, true); }); });
    if (reduce) { video.controls = true; video.loop = true; }
    if (io) new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (reduce) return;
      if (visible) play(video); else video.pause();
    }, { threshold: 0.25 }).observe(video);
    show(0, true);
  }

  /* 3. loops and walkthroughs */
  $$('video[data-loop]').forEach(function (v) {
    if (reduce) { v.controls = true; return; }
    if (!io) { play(v); return; }
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(v); else v.pause(); }, { threshold: 0.3 }).observe(v);
  });
  $$('[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-youtube');
      var box = document.getElementById(btn.getAttribute('data-target') || '');
      if (!box) { window.open('https://youtu.be/' + id, '_blank', 'noopener'); return; }
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = btn.getAttribute('data-title') || 'Walkthrough video';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.innerHTML = ''; box.appendChild(f);
      box.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      f.focus();
    });
  });

  /* 4a. stacking cards: each card sticks once it has been read to its end */
  var cards = $$('.card');
  var stick = function () {
    var ok = window.innerWidth > 960 && !reduce;
    cards.forEach(function (c, i) {
      if (!ok) { c.style.position = ''; c.style.top = ''; return; }
      c.style.position = 'sticky';
      c.style.top = Math.min(76 + i * 14, window.innerHeight - c.offsetHeight - 16) + 'px';
    });
  };
  if (cards.length) {
    stick(); window.addEventListener('resize', stick); window.addEventListener('load', stick);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(stick);
  }

  /* 4b. reveal */
  if (io && !reduce) {
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(function (el) { seen.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  /* 4c. radar illustration for the flood project: speckled backscatter, a river, and the land that went dark */
  (function () {
    var fig = document.querySelector('[data-radar]'); if (!fig) return;
    var cv = fig.querySelector('canvas'), ctx = cv.getContext('2d'); if (!ctx) return;
    var W = cv.width, H = cv.height, btns = $$('button', fig), seed = 7, auto = !reduce, mode = 0;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var frames = [0, 1, 2].map(function () { return ctx.createImageData(W, H); });
    var put = function (f, i, r, g, b) { f.data[i] = r; f.data[i + 1] = g; f.data[i + 2] = b; f.data[i + 3] = 255; };
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var yc = H * (.5 + .17 * Math.sin(x * .011 + .6) + .06 * Math.sin(x * .034)), d = Math.abs(y - yc);
      var river = d < 5 + 2 * Math.sin(x * .05);
      var reach = 16 + 46 * (.5 + .5 * Math.sin(x * .017 + 1.3)) + 14 * Math.sin(x * .061 + y * .04) + 7 * Math.sin(x * .21 + y * .17) * Math.sin(y * .29 - x * .05) + 5 * rnd();
      var flood = d < reach && (y > yc || d < reach * .45);
      var u = x * .93 + y * .37, v = y * .93 - x * .37, cu = Math.floor(u / (38 + 22 * Math.sin(Math.floor(v / 61) * 1.9))), cv2 = Math.floor(v / 61);
      var field = .47 + .17 * Math.sin(cu * 12.9898 + cv2 * 78.233) * Math.cos(cu * 4.1 - cv2 * 2.3) + .05 * Math.sin(x * .09) * Math.sin(y * .07);
      var sp = .45 - .5 * Math.log(1 - rnd() * .86), i = 4 * (y * W + x);
      var gb = Math.min(255, (river ? .05 : field) * sp * 300), ga = Math.min(255, (river || flood ? .05 : field) * sp * 300);
      put(frames[0], i, gb, gb, gb); put(frames[1], i, ga, ga, ga);
      if (flood && !river) put(frames[2], i, 61 + ga, 190 + ga * .3, 151); else put(frames[2], i, ga * .5, ga * .5, ga * .5);
    }
    var show = function (m) {
      mode = m; ctx.putImageData(frames[m], 0, 0);
      btns.forEach(function (b, n) { b.setAttribute('aria-pressed', n === m ? 'true' : 'false'); });
    };
    btns.forEach(function (b, n) { b.addEventListener('click', function () { auto = false; show(n); }); });
    show(reduce ? 2 : 0);
    var on = !io;
    if (io) new IntersectionObserver(function (es) { on = es[0].isIntersecting; }, { threshold: .4 }).observe(cv);
    setInterval(function () { if (auto && on) show((mode + 1) % 3); }, 2200);
  })();

  /* 4d. scroll progress, Lahore clock, copy address */
  var bar = document.querySelector('.progress'), top = document.querySelector('.top'), tick = false, lastY = 0;
  if (bar) window.addEventListener('scroll', function () {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      /* the top bar steps aside while reading down and returns on the way up */
      if (top && Math.abs(y - lastY) > 6) { top.classList.toggle('away', y > lastY && y > 320); lastY = y; }
      tick = false;
    });
  }, { passive: true });
  var clock = document.querySelector('[data-clock]');
  if (clock && window.Intl) {
    var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' });
    var now = function () { clock.textContent = 'Lahore ' + fmt.format(new Date()); };
    now(); setInterval(now, 20000);
  }
  var copy = document.querySelector('[data-copy]');
  if (copy && navigator.clipboard) copy.addEventListener('click', function () {
    navigator.clipboard.writeText(copy.getAttribute('data-copy')).then(function () {
      var old = copy.textContent; copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = old; }, 1600);
    }, function () {});
  }); else if (copy) copy.hidden = true;
})();
