/* gn-4200.github.io: three small behaviours, no dependencies.
 * 1. The hero "bench" plays the three products' loops in turn; the tabs show progress and switch on click.
 * 2. Loops elsewhere play only while on screen (and never by themselves under reduced motion).
 * 3. Walkthroughs load YouTube (privacy-enhanced, youtube-nocookie.com) only when someone presses play.
 */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = 'IntersectionObserver' in window;

  /* 1. bench */
  var bench = document.querySelector('[data-bench]');
  if (bench) {
    var video = bench.querySelector('video');
    var tabs = [].slice.call(bench.querySelectorAll('[data-clip]'));
    var current = 0;
    var visible = true;
    var source = function (tab, ext) { return tab.getAttribute('data-clip') + '.' + ext; };
    var show = function (i, play) {
      current = (i + tabs.length) % tabs.length;
      var tab = tabs[current];
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', n === current ? 'true' : 'false'); t.style.removeProperty('--progress'); });
      bench.setAttribute('data-project', tab.getAttribute('data-project'));
      video.setAttribute('aria-label', tab.getAttribute('data-label'));
      video.poster = tab.getAttribute('data-clip') + '-poster.jpg';
      video.innerHTML = '<source src="' + source(tab, 'webm') + '" type="video/webm"><source src="' + source(tab, 'mp4') + '" type="video/mp4">';
      video.load();
      if (play && !reduce && visible) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    };
    video.addEventListener('timeupdate', function () {
      if (video.duration) tabs[current].style.setProperty('--progress', (100 * video.currentTime / video.duration).toFixed(1) + '%');
    });
    video.addEventListener('ended', function () { show(current + 1, true); });
    tabs.forEach(function (t, n) { t.addEventListener('click', function () { show(n, true); }); });
    if (reduce) { video.controls = true; video.loop = true; }
    if (seen) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (reduce) return;
        if (visible) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else video.pause();
      }, { threshold: 0.25 }).observe(video);
    }
    show(0, true);
  }

  /* 2. loops */
  var loops = [].slice.call(document.querySelectorAll('video[data-loop]'));
  loops.forEach(function (v) {
    if (reduce) { v.controls = true; v.removeAttribute('autoplay'); return; }
    if (!seen) { v.play(); return; }
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    }, { threshold: 0.3 }).observe(v);
  });

  /* 3. walkthroughs */
  [].slice.call(document.querySelectorAll('[data-youtube]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-youtube');
      var box = document.getElementById(btn.getAttribute('data-target') || '') || btn.closest('.watch__box');
      if (!box) { window.open('https://youtu.be/' + id, '_blank', 'noopener'); return; }
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = btn.getAttribute('data-title') || 'Walkthrough video';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(f);
      if (btn.closest('.band')) box.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      f.focus();
    });
  });
})();
