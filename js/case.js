/* Case-study pages: a contents rail built from the section headings, the current section
   highlighted as you read, and a reading-progress line. The page reads fine without this file. */
(function () {
  'use strict';
  var article = document.querySelector('.article'); if (!article) return;
  var heads = [].slice.call(article.querySelectorAll('section > h2'));
  var top = document.querySelector('.case-top');
  document.body.setAttribute('data-p', /band--pb/.test(top.className) ? 'pb' : /band--mo/.test(top.className) ? 'mo' : 'tz');

  var toc = document.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', 'On this page');
  toc.innerHTML = '<p>On this page</p>' + heads.map(function (h, i) {
    return '<a href="#' + h.id + '"><span>' + ('0' + (i + 1)).slice(-2) + '</span>' + h.textContent + '</a>';
  }).join('') + '<a class="toc__back" href="../../#work">← All work</a>';
  article.insertBefore(toc, article.firstChild);
  var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));

  var all = document.querySelector('[data-all]');
  if (all) all.addEventListener('click', function () {
    var ds = [].slice.call(document.querySelectorAll('.tech details')), open = ds.some(function (d) { return !d.open; });
    ds.forEach(function (d) { d.open = open; }); all.textContent = open ? 'Close all' : 'Open all';
  });

  var bar = document.createElement('div'); bar.className = 'r-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var tick = false;
  var update = function () {
    tick = false;
    var r = article.getBoundingClientRect(), span = r.height - window.innerHeight * .6;
    bar.style.setProperty('--p', Math.max(0, Math.min(1, (-r.top + window.innerHeight * .4) / span)).toFixed(4));
    var cur = 0;
    heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < window.innerHeight * .38) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  };
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update); update();
})();
