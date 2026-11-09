/* On phones, longer detail is folded away behind a small button, so each block shows the essentials first.
 * Larger screens show everything, and so does the page without JavaScript (nothing is hidden in the HTML).
 * The CSS in build.css does the hiding below 760px; this file only wraps the parts and handles the tap.
 */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };

  function fold(parts, label) {
    parts = parts.filter(Boolean);
    if (!parts.length) return null;
    var wrap = document.createElement('div'); wrap.className = 'fold';
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'fold__btn'; btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span>' + label + '</span><i aria-hidden="true">↓</i>';
    var body = document.createElement('div'); body.className = 'fold__body';
    parts[0].parentNode.insertBefore(wrap, parts[0]);
    parts.forEach(function (p) { body.appendChild(p); });
    wrap.appendChild(btn); wrap.appendChild(body);
    if (parts[0].classList.contains('it')) { parts[0].classList.remove('it'); wrap.classList.add('it'); }   /* the opening builds the wrapper */
    btn.addEventListener('click', function () {
      var open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.firstChild.textContent = open ? 'Show less' : label;
      var row = wrap.closest('.row'); if (row) row.classList.toggle('row--open', open);
      window.dispatchEvent(new Event('resize'));           /* the stacked cards re-measure */
    });
    return wrap;
  }

  fold([$('.hero .facts')], 'About me');
  $$('.card').forEach(function (c) { fold([$('.card__grid > div > ul', c), $('.hood', c), $('.card__stack', c)], 'Details'); });
  fold($$('.flood__grid > div > p:not(.flood__kind):not(.flood__lede)'), 'More');
  $$('.row').forEach(function (r) { fold($$('p', r), 'More'); });
})();
