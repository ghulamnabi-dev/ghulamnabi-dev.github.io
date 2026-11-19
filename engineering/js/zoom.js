/* Click any screenshot or recording to see it full size. Esc, the Close button or a click outside closes it. */
(function () {
  'use strict';
  var media = [].slice.call(document.querySelectorAll('.shot img, .shot video, .card figure video'));
  if (!media.length) return;
  var style = document.createElement('style');
  style.textContent =
    '.zoomable{cursor:zoom-in}' +
    '.zhint{margin-left:.5em;white-space:nowrap;opacity:.75}' +
    '.zb{position:fixed;inset:0;z-index:200;display:none;overflow:auto;overscroll-behavior:contain;padding:60px clamp(12px,3vw,40px) 28px;background:rgba(6,6,7,.95);cursor:zoom-out;text-align:center}' +
    '.zb.on{display:block}' +
    '.zb img,.zb video{display:block;margin:0 auto;max-width:min(100%,1500px);height:auto;border-radius:10px;background:#fff;box-shadow:0 30px 80px -20px #000;cursor:default}' +
    '.zb video{max-height:calc(100vh - 150px);width:auto}' +
    '.zb p{margin:14px auto 0;max-width:70ch;text-align:center;font:400 15px/1.45 "Schibsted Grotesk",Arial,sans-serif;color:#b9b6ae}' +
    '.zb button{position:fixed;right:clamp(12px,3vw,40px);top:14px;padding:8px 16px;border-radius:999px;border:1px solid #3a3a41;background:#131315;color:#f4f1ea;font:600 14px/1 "Schibsted Grotesk",Arial,sans-serif;cursor:pointer}' +
    '.zb button:hover{background:#f4f1ea;color:#0b0b0c}';
  document.head.appendChild(style);

  var box = document.createElement('div'); box.className = 'zb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Enlarged view');
  box.innerHTML = '<button type="button">Close ✕</button><div></div><p></p>';
  document.body.appendChild(box);
  var btn = box.firstChild, slot = btn.nextSibling, cap = box.lastChild, last = null;

  var close = function () {
    if (!box.classList.contains('on')) return;
    box.classList.remove('on'); slot.innerHTML = ''; document.documentElement.style.overflow = '';
    if (last) last.focus();
  };
  var open = function (src) {
    var el;
    if (src.tagName === 'VIDEO') {
      el = document.createElement('video'); el.controls = true; el.muted = true; el.loop = true; el.autoplay = true; el.playsInline = true;
      el.poster = src.poster; el.innerHTML = src.innerHTML;
    } else { el = document.createElement('img'); el.src = src.currentSrc || src.src; el.alt = src.alt; }
    var fig = src.closest('figure'), fc = fig && fig.querySelector('figcaption');
    slot.innerHTML = ''; slot.appendChild(el);
    cap.textContent = fc ? fc.firstChild.textContent.trim() : '';
    last = src; box.classList.add('on'); document.documentElement.style.overflow = 'hidden'; btn.focus();
  };
  box.addEventListener('click', function (e) { if (e.target.tagName !== 'VIDEO' && e.target.tagName !== 'IMG') close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  media.forEach(function (m) {
    m.classList.add('zoomable'); m.tabIndex = 0; m.setAttribute('role', 'button');
    m.setAttribute('aria-label', 'Enlarge: ' + (m.getAttribute('aria-label') || m.alt || 'screenshot'));
    m.addEventListener('click', function () { open(m); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(m); } });
    var fc = m.closest('figure') && m.closest('figure').querySelector('figcaption');
    if (fc && !fc.querySelector('.zhint')) { var h = document.createElement('span'); h.className = 'zhint'; h.textContent = 'Click to enlarge.'; fc.appendChild(h); }
  });

  /* expanding "Under the hood" changes a card's height: let the stacking recalculate */
  [].slice.call(document.querySelectorAll('.hood')).forEach(function (d) {
    d.addEventListener('toggle', function () { window.dispatchEvent(new Event('resize')); });
  });
})();
