
function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
}

/* True when a key press should be ignored (typing in a field, or a browser shortcut). */
function shouldIgnoreKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const t = e.target;
  return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable));
}

// Theme: light / dark (also the L key)
const themeBtn = document.getElementById('themeBtn');
if (safeGet('site-theme') === 'light') {
  document.body.classList.add('light-mode');
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  safeSet('site-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}
themeBtn.addEventListener('click', toggleTheme);

// "The Fun" dropdown
const funDropdown = document.getElementById('funDropdown');
const funBtn = document.getElementById('funBtn');

if (funBtn && funDropdown) {
  funBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    funDropdown.classList.toggle('show');
  });

  window.addEventListener('click', () => {
    if (funDropdown.classList.contains('show')) funDropdown.classList.remove('show');
  });
}


    // ========================================================
    // 6-SECOND KS HINT TOOLTIP (PAGE-SPECIFIC SESSION STORAGE)
    // ========================================================
    const ksHintTooltip = document.getElementById('ksHintTooltip');
    const ksBtn = document.getElementById('ksBtn');
    const currentPageKey = 'ks-tooltip-seen-' + (window.location.pathname.split('/').pop() || 'simulated');

    function dismissTooltip() {
      if (!ksHintTooltip || !ksHintTooltip.parentNode) return;
      sessionStorage.setItem(currentPageKey, 'true');
      ksHintTooltip.classList.add('fade-out');
      setTimeout(() => {
        if (ksHintTooltip.parentNode) ksHintTooltip.remove();
      }, 350);
    }

    if (sessionStorage.getItem(currentPageKey) === 'true') {
      if (ksHintTooltip) ksHintTooltip.remove();
    } else if (ksHintTooltip) {
      const tooltipTimer = setTimeout(dismissTooltip, 6000);
      ksBtn.addEventListener('mouseenter', () => { clearTimeout(tooltipTimer); dismissTooltip(); });
      ksBtn.addEventListener('touchstart', () => { clearTimeout(tooltipTimer); dismissTooltip(); }, { passive: true });
      ksHintTooltip.addEventListener('mouseenter', () => { clearTimeout(tooltipTimer); dismissTooltip(); });
      ksHintTooltip.addEventListener('click', () => { clearTimeout(tooltipTimer); dismissTooltip(); });

      window.addEventListener('click', (e) => {
        if (e.target !== ksHintTooltip) {
          clearTimeout(tooltipTimer);
          dismissTooltip();
        }
      }, { once: true });
    }

    // KS Wall Mode: compact grid of every plot, click one to jump to it
    const simCards = Array.from(document.querySelectorAll('.sim-card'));
    const wallHint = document.getElementById('wallHint');
    let isWallMode = false;

    function toggleWallMode(state) {
      isWallMode = typeof state === 'boolean' ? state : !isWallMode;
      document.body.classList.toggle('wall-mode', isWallMode);
      ksBtn.classList.toggle('active', isWallMode);
    }

    ksBtn.addEventListener('click', () => toggleWallMode());
    if (wallHint) wallHint.addEventListener('click', () => toggleWallMode(false));   // same as Esc

    /* --------------------------------------------------------
       AUTOMATIC NUMBERING
       The number of a plot is simply its position on the page,
       so shuffling cards in the HTML renumbers them (plot_01.png,
       plot_02.png ...) everywhere: the card, the lightbox, the
       Index on the Simulations page and the digits+Enter jump.
       -------------------------------------------------------- */
    function plotLabel(n) {
      const width = Math.max(2, String(simCards.length).length);
      return 'plot_' + String(n).padStart(width, '0') + '.png';
    }

    simCards.forEach((card, i) => {
      card.id = 'plot-' + (i + 1);
      const title = card.querySelector('.sim-card-header-title');
      if (!title) return;
      let label = title.querySelector('.plot-label');
      if (!label) {
        // older markup: "<span arrow></span> plot_01.png"  ->  wrap the text so it can be renumbered
        Array.from(title.childNodes).filter(n => n.nodeType === 3).forEach(n => n.remove());
        label = document.createElement('span');
        label.className = 'plot-label';
        title.appendChild(label);
      }
      label.textContent = plotLabel(i + 1);
    });

    simCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (!isWallMode) return;
        if (e.target.closest('a') || e.target.closest('.btn-view-code')) return;

        toggleWallMode(false);
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      });
    });

    /* ========================================================
       FEATURE 1: LIGHTBOX (nearly full page) & KEYBOARD ARROWS
       ======================================================== */
    const mediaLightbox = document.getElementById('mediaLightbox');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxCodeBtn = document.getElementById('lightboxCodeBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');
    const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxTitle = document.getElementById('lightboxTitle');

    let currentLightboxIndex = -1;

    function setHash(h) {
      try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch (e) {}
    }

    function openLightbox(index) {
      if (isWallMode || !simCards.length) return;
      currentLightboxIndex = (index + simCards.length) % simCards.length;
      const card = simCards[currentLightboxIndex];
      const media = card.querySelector('.sim-media').firstElementChild;
      const titleText = card.querySelector('.sim-card-header-title').textContent.trim();
      const h3El = card.querySelector('.sim-card-body h3');

      lightboxTitle.innerHTML = `<span class="card-header-arrow"></span> ${titleText}`;
      lightboxCaption.innerHTML = h3El ? h3El.innerHTML : '';
      lightboxMediaContainer.innerHTML = '';
      lightboxMediaContainer.appendChild(media.cloneNode(true));

      mediaLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      setHash('plot-' + (currentLightboxIndex + 1));   // shareable link to this plot

      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([lightboxCaption]).catch(() => {});
      }
    }

    function closeLightbox() {
      mediaLightbox.classList.remove('active');
      currentLightboxIndex = -1;
      setHash('');
      if (!terminalModal.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }

    simCards.forEach((card, index) => {
      const mediaWrap = card.querySelector('.sim-media');
      mediaWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(index);
      });
    });

    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(currentLightboxIndex - 1);
    });
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(currentLightboxIndex + 1);
    });

    // The "/." code button also lives in the lightbox (the card's own button is hidden behind it)
    if (lightboxCodeBtn) {
      lightboxCodeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentLightboxIndex >= 0) openPythonTerminal(simCards[currentLightboxIndex]);
      });
    }

    mediaLightbox.addEventListener('click', (e) => {
      if (e.target === mediaLightbox) closeLightbox();
    });

    /* ========================================================
       FEATURE 2: PYTHON CODE VIEWER TERMINAL (.py loader)
       ======================================================== */
    const terminalModal = document.getElementById('terminalModal');
    const termCloseDot = document.getElementById('termCloseDot');
    const termHeaderTitle = document.getElementById('termHeaderTitle');
    const terminalContentArea = document.getElementById('terminalContentArea');
    const termCopyBtn = document.getElementById('termCopyBtn');
    let rawLoadedCode = '';

    // Bulletproof Python Syntax Highlighter:
    // 1. Escapes HTML entities first so <, >, & cannot break the DOM.
    // 2. Uses unique safe delimiters for generated HTML tags so strings never wrap class names.
    function highlightPython(code) {
      if (!code) return '';

      // Step 1: Sanitize raw input first
      let safe = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Delimiters that will never appear in python code
      const O = '___SPAN_START_';
      const M = '___CLASS_';
      const C = '___SPAN_END___';

      // Step 2: Combined single-pass tokenizer matching comments, multiline strings, standard strings, keywords, built-ins, and numbers
      const masterRegex = /(#[^\r\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(import|from|as|def|return|if|else|elif|for|while|in|with|class|lambda|try|except|finally|pass|break|continue|yield|None|True|False|and|or|not|is)\b|\b([a-zA-Z_]\w*)(?=\s*\()|\b(\d+(?:\.\d+)?)\b/g;

      safe = safe.replace(masterRegex, (match, comment, str, kw, fn, num) => {
        if (comment) return `${O}${M}code-comment___>${comment}${C}`;
        if (str)     return `${O}${M}code-string___>${str}${C}`;
        if (kw)      return `${O}${M}code-keyword___>${kw}${C}`;
        if (fn)      return `${O}${M}code-fn___>${fn}${C}`;
        if (num)     return `${O}${M}code-num___>${num}${C}`;
        return match;
      });

      // Step 3: Convert internal tokens back to actual HTML spans in one clean transformation
      safe = safe
        .split(`${O}${M}`).join('<span class="')
        .split('___>').join('">')
        .split(C).join('</span>');

      return safe;
    }

    // Shown when the .py file cannot be fetched (opened as file://, or the file is missing)
    function getFallbackPyCode(cardId, fileName) {
      return `# Could not load ${fileName}\n# Either the page is opened straight from a file (browsers block that),\n# or the file is not at the path given in data-code-file.\n# Serve the site (GitHub Pages, "python -m http.server", VS Code Live Server) and try again.`;
    }

    async function openPythonTerminal(card) {
      const codeFile = card.getAttribute('data-code-file') || 'sim/script.py';
      const fileName = codeFile.split('/').pop();
      termHeaderTitle.textContent = `${fileName} — Python Visualizer`;
      terminalContentArea.innerHTML = '<code># Fetching ' + fileName + '...</code>';
      rawLoadedCode = '';

      terminalModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      try {
        const response = await fetch(codeFile);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const codeText = await response.text();
        rawLoadedCode = codeText;
        terminalContentArea.innerHTML = `<code>${highlightPython(codeText)}</code>`;
      } catch (err) {
        // Fallback gracefully if running on local file:// origin
        const fallback = getFallbackPyCode(card.id, fileName);
        rawLoadedCode = fallback;
        terminalContentArea.innerHTML = `<code>${highlightPython(fallback)}</code>`;
      }
    }

    function closePythonTerminal() {
      terminalModal.classList.remove('active');
      if (!mediaLightbox.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }

    document.querySelectorAll('.sim-card .btn-view-code').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.sim-card');
        openPythonTerminal(card);
      });
    });

    termCloseDot.addEventListener('click', closePythonTerminal);

    terminalModal.addEventListener('click', (e) => {
      if (e.target === terminalModal) closePythonTerminal();
    });

    termCopyBtn.addEventListener('click', async () => {
      if (!rawLoadedCode) return;
      try {
        await navigator.clipboard.writeText(rawLoadedCode);
        termCopyBtn.textContent = 'Copied!';
        setTimeout(() => termCopyBtn.textContent = 'Copy Code', 2000);
      } catch (e) {
        termCopyBtn.textContent = 'Failed';
      }
    });


/* ========================================================
       Unified Global Keyboard Handler
         Esc            close code viewer > close lightbox > clear number > leave KS mode
         Left / Right   previous / next plot in the lightbox
         L              light / dark          G   next background grid
         digits + Enter jump to that plot (10 Enter = plot_10)
       ======================================================== */
    const gotoPill = document.getElementById('gotoPill');
    let gotoBuf = '';
    let gotoTimer = null;

    function clearGoto() {
      gotoBuf = '';
      clearTimeout(gotoTimer);
      if (gotoPill) gotoPill.classList.remove('show');
    }

    function showGoto(text, keepMs) {
      if (!gotoPill) return;
      gotoPill.textContent = text;
      gotoPill.classList.add('show');
      clearTimeout(gotoTimer);
      gotoTimer = setTimeout(clearGoto, keepMs || 4000);
    }

    function goToPlot(n) {
      if (n < 1 || n > simCards.length) {
        gotoBuf = '';
        showGoto('No plot ' + n + ' on this page (1 to ' + simCards.length + ')', 1800);
        return;
      }
      clearGoto();
      if (mediaLightbox.classList.contains('active')) {
        openLightbox(n - 1);
        return;
      }
      if (isWallMode) toggleWallMode(false);
      const card = simCards[n - 1];
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('flash');
        setTimeout(() => card.classList.remove('flash'), 1800);
      }, isWallMode ? 120 : 0);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (terminalModal.classList.contains('active')) {
          closePythonTerminal();
        } else if (mediaLightbox.classList.contains('active')) {
          closeLightbox();
        } else if (gotoBuf) {
          clearGoto();
        } else if (isWallMode) {
          toggleWallMode(false);
        }
        return;
      }

      if (shouldIgnoreKey(e)) return;

      if (mediaLightbox.classList.contains('active') && !terminalModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          openLightbox(currentLightboxIndex - 1);
          return;
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          openLightbox(currentLightboxIndex + 1);
          return;
        }
      }

      if (terminalModal.classList.contains('active')) return;

      if (/^[0-9]$/.test(e.key)) {
        if (gotoBuf.length < 3) gotoBuf += e.key;
        showGoto('Go to plot  ' + gotoBuf + '_   (Enter)');
        return;
      }

      if (gotoBuf && e.key === 'Backspace') {
        e.preventDefault();
        gotoBuf = gotoBuf.slice(0, -1);
        if (gotoBuf) showGoto('Go to plot  ' + gotoBuf + '_   (Enter)');
        else clearGoto();
        return;
      }

      if (gotoBuf && e.key === 'Enter') {
        e.preventDefault();
        goToPlot(parseInt(gotoBuf, 10));
        return;
      }

      const k = e.key.toLowerCase();
      if (k === 'l') toggleTheme();
      else if (k === 'g') cycleGrid();
    });

    /* =========================================================
       FIX #1: Outward Source Animation Canvas Setup
       Canvas backing-store size now tracks the VISUAL viewport
       (window.visualViewport) instead of the layout viewport
       (window.innerWidth/innerHeight), and is re-synced on
       visualViewport's own 'resize' event too — this is what
       keeps it accurate while the mobile browser chrome
       (address bar) is animating in/out.
       ========================================================= */
    const srcCanvas = document.getElementById('sourceCanvas');
    const srcCtx = srcCanvas.getContext('2d');
    const numParticles = 48;
    const particles = [];
    const R_max = 210; 
    const r_min = 22;  

    function getViewportSize() {
      const vv = window.visualViewport;
      return {
        width: vv ? vv.width : window.innerWidth,
        height: vv ? vv.height : window.innerHeight
      };
    }

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = getViewportSize();
      srcCanvas.width = width * dpr;
      srcCanvas.height = height * dpr;
      srcCtx.resetTransform();
      srcCtx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    if (window.visualViewport) {
      // Fires when the mobile toolbar shows/hides, on pinch-zoom, etc.
      window.visualViewport.addEventListener('resize', resizeCanvas);
    }
    resizeCanvas();

    class SourceParticle {
      constructor() {
        this.reset();
        this.r = r_min + Math.random() * (R_max - r_min);
      }
      reset() {
        this.theta = Math.random() * Math.PI * 2;
        this.r = r_min;
        this.speed = 0.5 + Math.random() * 0.5;
      }
      update() {
        this.r += this.speed;
        if (this.r >= R_max) this.reset();
      }
      draw(origin) {
        const x = origin.x + this.r * Math.cos(this.theta);
        const y = origin.y + this.r * Math.sin(this.theta);
        let opacity = 0.28;
        if (this.r - r_min < 25) opacity *= (this.r - r_min) / 25;
        else if (R_max - this.r < 45) opacity *= (R_max - this.r) / 45;

        srcCtx.fillStyle = document.body.classList.contains('light-mode')
          ? `rgba(38, 42, 24, ${opacity * 1.5})`
          : `rgba(140, 177, 116, ${opacity})`;
        srcCtx.beginPath();
        srcCtx.arc(x, y, 1.25, 0, Math.PI * 2);
        srcCtx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) particles.push(new SourceParticle());

    const portalSwitch = document.getElementById('portalSwitch');
    const btnJumpTop = document.getElementById('btnJumpTop');
    const btnSharePage = document.getElementById('btnSharePage');
    const floatingCluster = document.getElementById('floatingCluster');
    const siteFooter = document.getElementById('siteFooter');

    /* =========================================================
       FIX #2: Single unified rAF loop (Smooth & Zero-Lag)
       Previously the particle animation and the floating-cluster
       position update ran in two SEPARATE requestAnimationFrame
       loops. Because the cluster's position was written via
       style.transform in one loop and then portalSwitch's
       geometry was read via getBoundingClientRect() in the
       other, the browser was forced into extra synchronous
       layout recalculations (read-after-write thrashing) —
       much more costly on phones than on a laptop.

       Now everything happens in one loop, per frame, in two
       clearly separated phases: all READS first, then all
       WRITES. Both phases also use the same visual-viewport
       dimensions, so the particle ring and the cluster/footer
       collision logic never disagree about where the screen
       actually ends.
       ========================================================= */
    function mainLoop() {
      // ---- READ PHASE ----
      const { width: vpWidth, height: vpHeight } = getViewportSize();
      const scrollY = window.scrollY;
      const footerRect = siteFooter.getBoundingClientRect();

      let origin = { x: vpWidth - 46, y: vpHeight - 46 };
      if (portalSwitch) {
        const rect = portalSwitch.getBoundingClientRect();
        origin = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }

      // ---- WRITE PHASE ----
      if (scrollY > 120) {
        btnJumpTop.classList.add('is-active');
        btnSharePage.classList.add('is-active');
      } else {
        btnJumpTop.classList.remove('is-active');
        btnSharePage.classList.remove('is-active');
      }

      if (footerRect.top < vpHeight) {
        const overlap = vpHeight - footerRect.top;
        floatingCluster.style.transform = `translate3d(0, -${overlap}px, 0)`;
      } else {
        floatingCluster.style.transform = 'translate3d(0, 0, 0)';
      }

      srcCtx.clearRect(0, 0, vpWidth, vpHeight);
      for (let p of particles) {
        p.update();
        p.draw(origin);
      }

      requestAnimationFrame(mainLoop);
    }
    requestAnimationFrame(mainLoop);

    // Button Actions
    btnJumpTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnSharePage.addEventListener('click', async () => {
      const shareData = {
        title: document.title,
        url: window.location.href
      };
      if (navigator.share) {
        try { 
          await navigator.share(shareData); 
        } catch (e) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        btnSharePage.setAttribute('data-tooltip', 'Link Copied!');
        setTimeout(() => btnSharePage.setAttribute('data-tooltip', 'Share page'), 2200);
      }
    });


    





/* ====================================================================
   BACKGROUND GRIDS: press G or tap the G button in the top bar
   Rolls through: dots > lines > graph paper > diagonal > large dots >
   scan lines (grey-brown with dense horizontal lines) > off
   ==================================================================== */
const gridModes = ['', 'grid-lines', 'grid-graph', 'grid-diag', 'grid-dots-lg', 'grid-scan', 'grid-off'];
const gridNames = ['dots', 'lines', 'graph paper', 'diagonal', 'large dots', 'scan lines', 'off'];
const gridBtn = document.getElementById('gridBtn');

let gridIdx = gridModes.indexOf(safeGet('site-grid') || '');
if (gridIdx < 0) gridIdx = 0;
if (gridModes[gridIdx]) document.body.classList.add(gridModes[gridIdx]);

function updateGridBtnTitle() {
  if (gridBtn) gridBtn.title = 'Background grid: ' + gridNames[gridIdx] + ' (click or press G for next)';
}
updateGridBtnTitle();

function cycleGrid() {
  document.body.classList.remove(...gridModes.filter(Boolean));
  gridIdx = (gridIdx + 1) % gridModes.length;
  if (gridModes[gridIdx]) document.body.classList.add(gridModes[gridIdx]);
  safeSet('site-grid', gridModes[gridIdx]);
  updateGridBtnTitle();
}

if (gridBtn) gridBtn.addEventListener('click', cycleGrid);


/* ====================================================================
   A link like sim2D.html#plot-3 opens that plot straight away
   (the Index of the Simulations page uses these links)
   ==================================================================== */
function openFromHash() {
  const m = /^#plot-(\d+)$/.exec(window.location.hash);
  if (!m) return;
  const n = parseInt(m[1], 10);
  if (n < 1 || n > simCards.length) return;
  simCards[n - 1].scrollIntoView({ block: 'center' });
  openLightbox(n - 1);
}
openFromHash();
window.addEventListener('hashchange', () => {
  if (!mediaLightbox.classList.contains('active')) openFromHash();
});
