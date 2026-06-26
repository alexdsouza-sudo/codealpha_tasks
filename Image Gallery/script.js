/* ─────────────────────────────────────────────
   LUMINARY — Gallery Script
   Features: filter by category, lightbox with
   keyboard nav, touch/swipe support, focus trap
───────────────────────────────────────────── */

(() => {
  'use strict';

  // ── DOM refs ───────────────────────────────
  const gallery     = document.getElementById('gallery');
  const emptyState  = document.getElementById('emptyState');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const lightbox    = document.getElementById('lightbox');
  const lbBackdrop  = document.getElementById('lbBackdrop');
  const lbImg       = document.getElementById('lbImg');
  const lbTitle     = document.getElementById('lbTitle');
  const lbSub       = document.getElementById('lbSub');
  const lbCategory  = document.getElementById('lbCategory');
  const lbCounter   = document.getElementById('lbCounter');
  const lbClose     = document.getElementById('lbClose');
  const lbPrev      = document.getElementById('lbPrev');
  const lbNext      = document.getElementById('lbNext');

  // ── State ──────────────────────────────────
  let allItems      = [];   // all .gallery-item elements (ordered)
  let visibleItems  = [];   // currently visible items (filtered)
  let currentIndex  = -1;   // index in visibleItems
  let activeFilter  = 'all';

  // ── Build item registry ───────────────────
  function buildRegistry() {
    allItems = [...gallery.querySelectorAll('.gallery-item')];
    allItems.forEach((item, i) => item.dataset.index = i);
  }

  // ── Filter ─────────────────────────────────
  function applyFilter(filter) {
    activeFilter = filter;

    allItems.forEach(item => {
      const cat = item.dataset.category;
      if (filter === 'all' || cat === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    visibleItems = allItems.filter(i => !i.classList.contains('hidden'));

    emptyState.hidden = visibleItems.length > 0;
    gallery.hidden    = visibleItems.length === 0;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  // ── Lightbox open ──────────────────────────
  function openLightbox(item) {
    currentIndex = visibleItems.indexOf(item);
    renderLightbox();

    lightbox.hidden = false;
    lbBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus management
    requestAnimationFrame(() => lbClose.focus());
  }

  function renderLightbox() {
    const item  = visibleItems[currentIndex];
    if (!item) return;

    const img   = item.querySelector('img');
    const h3    = item.querySelector('h3');
    const p     = item.querySelector('p');
    const label = item.querySelector('.overlay-label');

    // Animate image swap
    lbImg.style.opacity = '0';
    lbImg.style.transform = 'scale(0.97)';

    lbImg.onload = () => {
      lbImg.style.transition = 'opacity 300ms ease, transform 300ms ease';
      lbImg.style.opacity = '1';
      lbImg.style.transform = 'scale(1)';
    };

    lbImg.src  = img.src.replace('w=800', 'w=1400');
    lbImg.alt  = img.alt;

    lbTitle.textContent    = h3  ? h3.textContent  : '';
    lbSub.textContent      = p   ? p.textContent   : '';
    lbCategory.textContent = label ? label.textContent : '';
    lbCounter.textContent  = `${currentIndex + 1} / ${visibleItems.length}`;

    lbPrev.disabled = currentIndex === 0;
    lbNext.disabled = currentIndex === visibleItems.length - 1;
  }

  // ── Lightbox close ─────────────────────────
  function closeLightbox() {
    lightbox.hidden = true;
    lbBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';

    // Return focus to the triggering item
    if (currentIndex >= 0 && visibleItems[currentIndex]) {
      visibleItems[currentIndex].querySelector('.expand-btn')?.focus();
    }
    currentIndex = -1;
  }

  // ── Navigation ─────────────────────────────
  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderLightbox();
    }
  }

  function showNext() {
    if (currentIndex < visibleItems.length - 1) {
      currentIndex++;
      renderLightbox();
    }
  }

  // ── Event Listeners ────────────────────────

  // Open on expand button
  gallery.addEventListener('click', e => {
    const btn  = e.target.closest('.expand-btn');
    const item = e.target.closest('.gallery-item');
    if (btn && item) {
      e.stopPropagation();
      openLightbox(item);
      return;
    }
    // Also open on item click
    if (item) openLightbox(item);
  });

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
  lbNext.addEventListener('click', e => { e.stopPropagation(); showNext(); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    switch (e.key) {
      case 'Escape':      closeLightbox(); break;
      case 'ArrowLeft':   showPrev();      break;
      case 'ArrowRight':  showNext();      break;
      case 'ArrowUp':     showPrev();      break;
      case 'ArrowDown':   showNext();      break;
    }
  });

  // Focus trap inside lightbox
  lightbox.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = [...lightbox.querySelectorAll('button:not(:disabled)')];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { last.focus(); e.preventDefault(); }
    } else {
      if (document.activeElement === last)  { first.focus(); e.preventDefault(); }
    }
  });

  // ── Touch / Swipe Support ──────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx < 0 ? showNext() : showPrev();
    }
  }, { passive: true });

  // ── Init ───────────────────────────────────
  buildRegistry();
  visibleItems = [...allItems];

})();s