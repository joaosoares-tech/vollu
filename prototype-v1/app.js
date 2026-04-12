/* ============================================================
   VOLLU.app — Application Logic
   Handles: navigation, search, drag-drop, scroll reveals, 
   keyboard shortcuts
   ============================================================ */

(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 1. NAVBAR SCROLL EFFECT
  // ──────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > 12) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Initial check

  // ──────────────────────────────────────────────
  // 2. COMMAND PALETTE SEARCH
  // ──────────────────────────────────────────────
  const searchInput = document.getElementById('search-input');
  const toolCards = document.querySelectorAll('.tool-card');

  // CMD + Space to focus search
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
      e.preventDefault();
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Escape to blur
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
      searchInput.value = '';
      filterTools('');
    }
  });

  // Live search filtering
  searchInput.addEventListener('input', function () {
    filterTools(this.value.trim().toLowerCase());
  });

  function filterTools(query) {
    toolCards.forEach(function (card) {
      const title = card.querySelector('.tool-card__title').textContent.toLowerCase();
      const desc = card.querySelector('.tool-card__desc').textContent.toLowerCase();
      const matches = !query || title.includes(query) || desc.includes(query);
      
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      if (matches) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.opacity = '0.15';
        card.style.transform = 'translateY(4px)';
        card.style.pointerEvents = 'none';
      }
    });
  }

  // ──────────────────────────────────────────────
  // 3. DRAG & DROP UPLOAD ZONE
  // ──────────────────────────────────────────────
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const chooseBtn = document.getElementById('choose-file-btn');

  // Prevent default drag behaviors on the whole page
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight on drag over
  ['dragenter', 'dragover'].forEach(function (eventName) {
    dropArea.addEventListener(eventName, function () {
      dropArea.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(function (eventName) {
    dropArea.addEventListener(eventName, function () {
      dropArea.classList.remove('dragover');
    }, false);
  });

  // Handle dropped files
  dropArea.addEventListener('drop', function (e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, false);

  // Click to upload
  chooseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    fileInput.click();
  });

  dropArea.addEventListener('click', function () {
    fileInput.click();
  });

  // Enter / Space on drop area
  dropArea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', function () {
    handleFiles(this.files);
  });

  function handleFiles(files) {
    if (!files || files.length === 0) return;

    const names = Array.from(files).map(function (f) { return f.name; }).join(', ');
    
    // Visual feedback
    const title = dropArea.querySelector('.upload-zone__title');
    const originalText = title.textContent;
    
    title.textContent = files.length === 1
      ? files[0].name
      : files.length + ' files selected';
    title.style.color = 'var(--color-brand)';

    // Pulse animation
    dropArea.style.borderColor = 'var(--color-brand)';
    dropArea.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';

    setTimeout(function () {
      title.textContent = originalText;
      title.style.color = '';
      dropArea.style.borderColor = '';
      dropArea.style.boxShadow = '';
    }, 3000);

    console.log('[VOLLU] Files received:', names);
  }

  // ──────────────────────────────────────────────
  // 4. INTERSECTION OBSERVER — SCROLL REVEALS
  // ──────────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback — just show everything
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ──────────────────────────────────────────────
  // 5. TOOL CARD CLICK
  // ──────────────────────────────────────────────
  toolCards.forEach(function (card) {
    card.addEventListener('click', function () {
      const toolName = this.querySelector('.tool-card__title').textContent;
      console.log('[VOLLU] Tool selected:', toolName);
      
      // Visual feedback ripple
      this.style.transform = 'scale(0.98)';
      setTimeout(function () {
        card.style.transform = '';
      }, 150);
    });
  });

  // ──────────────────────────────────────────────
  // 6. LANGUAGE SELECTOR
  // ──────────────────────────────────────────────
  const langSelector = document.getElementById('lang-selector');
  const langActive = langSelector.querySelector('.lang-selector__active');
  const langAlt = langSelector.querySelector('.lang-selector__text');

  langSelector.addEventListener('click', function () {
    const current = langActive.textContent;
    const alt = langAlt.textContent;
    langActive.textContent = alt;
    langAlt.textContent = current;
    console.log('[VOLLU] Language switched to:', alt);
  });

  // ──────────────────────────────────────────────
  // 7. SMOOTH ENTRANCE TIMING
  // ──────────────────────────────────────────────
  // Mark body as loaded for CSS transitions
  document.body.classList.add('loaded');

})();
