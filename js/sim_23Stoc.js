    // Theme Switcher Logic
    const themeBtn = document.getElementById('themeBtn');
    if (localStorage.getItem('site-theme') === 'light') {
      document.body.classList.add('light-mode');
    }
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
    });

    // "The Fun" Dropdown Toggle Logic
    const funDropdown = document.getElementById('funDropdown');
    const funBtn = document.getElementById('funBtn');

    funBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      funDropdown.classList.toggle('show');
    });

    window.addEventListener('click', () => {
      if (funDropdown.classList.contains('show')) {
        funDropdown.classList.remove('show');
      }
    });


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

    // KS Wall Mode: 3x5 Grid Toggle & Click-to-Inspect
    // const ksBtn = document.getElementById('ksBtn');
    const simCards = Array.from(document.querySelectorAll('.sim-card'));
    let isWallMode = false;

    function toggleWallMode(state) {
      isWallMode = typeof state === 'boolean' ? state : !isWallMode;
      document.body.classList.toggle('wall-mode', isWallMode);
      ksBtn.classList.toggle('active', isWallMode);
    }

    ksBtn.addEventListener('click', () => toggleWallMode());

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
       FEATURE 1: FULLSCREEN LIGHTBOX & KEYBOARD ARROWS
       ======================================================== */
    const mediaLightbox = document.getElementById('mediaLightbox');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');
    const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxTitle = document.getElementById('lightboxTitle');

    let currentLightboxIndex = -1;

    function openLightbox(index) {
      if (isWallMode) return;
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

      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([lightboxCaption]).catch(() => {});
      }
    }

    function closeLightbox() {
      mediaLightbox.classList.remove('active');
      currentLightboxIndex = -1;
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

    // High quality fallback generators when .py files are viewed on file:// protocols
    function getFallbackPyCode(cardId, fileName) {
      if (cardId === 'plot1') {
        return `# Numerical simulation: ${fileName}\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Trajectories of y' = lambda * y\nlambdas = [-1.5, -0.8, 0.5, 1.2]\nt = np.linspace(0, 3, 200)\ny0_vals = np.linspace(-2, 2, 7)\n\nplt.figure(figsize=(7, 4.2), facecolor='#0d1117')\nax = plt.axes()\nax.set_facecolor('#0d1117')\n\nfor lam in lambdas:\n    for y0 in y0_vals:\n        y = y0 * np.exp(lam * t)\n        plt.plot(t, y, alpha=0.75, lw=1.2)\n\nplt.title("Slope Field Trajectories: y' = λy", color='#c9d1d9')\nplt.xlabel("t", color='#8b949e'); plt.ylabel("y(t)", color='#8b949e')\nplt.grid(True, color='#30363d', linestyle='--', alpha=0.6)\nplt.tight_layout()\nplt.savefig("sim/expGD.png", dpi=300)\nplt.show()`;
      } else if (cardId === 'plot2') {
        return `# Transport Equation: ${fileName}\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Characteristic curves for u_t + b*u_x = 0\nb = 1.75\nt = np.linspace(0, 4, 150)\nx0_range = np.linspace(-4, 6, 21)\n\nfig, ax = plt.subplots(figsize=(7, 4.2), facecolor='#0d1117')\nax.set_facecolor('#0d1117')\n\nfor x0 in x0_range:\n    x = x0 + b * t\n    ax.plot(x, t, color='#58a6ff', alpha=0.85, lw=1.1)\n\nax.set_title("Planar Characteristics: x(t) = x0 + bt", color='#c9d1d9')\nax.set_xlabel("x", color='#8b949e'); ax.set_ylabel("t", color='#8b949e')\nax.grid(True, color='#30363d', linestyle=':', alpha=0.5)\nplt.tight_layout()\nplt.savefig("sim/charTE.png", dpi=300)\nplt.show()`;
      }
      return `# Python Simulation Generator for ${fileName}\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Generates vector field / spline geometry\nx = np.linspace(-3, 3, 250)\ny = np.cos(x) * np.exp(-0.1 * x**2)\n\nplt.figure(facecolor='#0d1117')\nplt.plot(x, y, color='#3fb950', lw=2)\nplt.title("Numerical Phase Projection", color='#c9d1d9')\nplt.show()`;
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

    document.querySelectorAll('.btn-view-code').forEach(btn => {
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
       Unified Global Keyboard Handler: Esc, ArrowLeft, ArrowRight
       ======================================================== */
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (terminalModal.classList.contains('active')) {
          closePythonTerminal();
        } else if (mediaLightbox.classList.contains('active')) {
          closeLightbox();
        } else if (isWallMode) {
          toggleWallMode(false);
        }
      } else if (mediaLightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          openLightbox(currentLightboxIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          openLightbox(currentLightboxIndex + 1);
        }
      }
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
          ? `rgba(35, 39, 45, ${opacity * 1.5})`
          : `rgba(63, 185, 80, ${opacity})`;
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


    




    /* ========================================================
       FEATURE: The background grid control using keyboard G
       ======================================================== */
    const gridModes = ['', 'grid-lines', 'grid-graph', 'grid-diag', 'grid-dots-lg', 'grid-off'];
let gridIdx = gridModes.indexOf(localStorage.getItem('site-grid') || '');
if (gridIdx < 0) gridIdx = 0;
if (gridModes[gridIdx]) document.body.classList.add(gridModes[gridIdx]);

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'g' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
  document.body.classList.remove('grid-lines', 'grid-graph', 'grid-diag', 'grid-dots-lg', 'grid-off');
  gridIdx = (gridIdx + 1) % gridModes.length;
  if (gridModes[gridIdx]) document.body.classList.add(gridModes[gridIdx]);
  localStorage.setItem('site-grid', gridModes[gridIdx]);
});