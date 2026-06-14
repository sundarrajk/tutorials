/* ================================================================
   UNIFIED DECK JS — shared across all presentations
   Architecture: hidden slides use display:none (zero DOM height).
   Active slide is display:flex in normal flow — page scrolls.
   Navigating always lands at page top with no offset issues.
   CSP-safe: no eval, no inline handlers, no dynamic code.
   ================================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var slides = Array.from(document.querySelectorAll('.slide'));
  var total  = slides.length;
  var cur    = 0;

  var elProg  = $('prog');
  var elCount = $('counter');
  var elPrev  = $('btn-prev');
  var elNext  = $('btn-next');
  var elJump  = $('jump');
  var elTheme = $('theme-btn');
  var elHtml  = document.documentElement;

  /* ── Theme ─────────────────────────────────────────────────── */
  var storedTheme = (function () {
    try { return localStorage.getItem('deck-theme') || 'dark'; }
    catch (e) { return 'dark'; }
  }());
  applyTheme(storedTheme);

  if (elTheme) {
    elTheme.addEventListener('click', function () {
      var next = elHtml.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('deck-theme', next); } catch (e) {}
    });
  }

  function applyTheme(t) {
    elHtml.setAttribute('data-theme', t);
    if (elTheme) elTheme.textContent = t === 'dark' ? '☀ Light' : '☾ Dark';
  }

  /* ── Jump menu ─────────────────────────────────────────────── */
  if (elJump) {
    slides.forEach(function (s, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = (i + 1) + '. ' + (s.dataset.title || 'Slide ' + (i + 1));
      elJump.appendChild(opt);
    });
    elJump.addEventListener('change', function (e) {
      goTo(parseInt(e.target.value, 10));
    });
  }

  /* ── Navigation ────────────────────────────────────────────── */
  function goTo(idx) {
    if (idx < 0 || idx >= total) return;

    /* Hide current slide completely — display:none gives it zero height,
       so the page immediately has no content to scroll past. */
    slides[cur].classList.remove('active');

    cur = idx;

    /* Show new slide — it becomes the only element in normal flow.
       Page height = this slide's content height. */
    slides[cur].classList.add('active');

    /* Scroll to absolute top. Because the old slide is now display:none,
       there is nothing above the new slide — top is always 0. */
    window.scrollTo(0, 0);

    /* Sync UI */
    if (elJump) elJump.value = cur;
    var pct = total > 1 ? (cur / (total - 1)) * 100 : 100;
    if (elProg)  elProg.style.width = pct + '%';
    if (elCount) elCount.textContent = (cur + 1) + ' / ' + total;
    if (elPrev)  elPrev.disabled = cur === 0;
    if (elNext)  elNext.disabled = cur === total - 1;
  }

  if (elPrev) elPrev.addEventListener('click', function () { goTo(cur - 1); });
  if (elNext) elNext.addEventListener('click', function () { goTo(cur + 1); });

  /* ── Keyboard ──────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault(); goTo(cur + 1); break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault(); goTo(cur - 1); break;
      case 'Home': goTo(0);         break;
      case 'End':  goTo(total - 1); break;
    }
  });

  /* ── Touch / swipe ─────────────────────────────────────────── */
  var tStartX = 0, tStartY = 0;
  document.addEventListener('touchstart', function (e) {
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tStartX;
    var dy = e.changedTouches[0].clientY - tStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      dx < 0 ? goTo(cur + 1) : goTo(cur - 1);
    }
  }, { passive: true });

  /* ── Boot ──────────────────────────────────────────────────── */
  goTo(0);

}());
