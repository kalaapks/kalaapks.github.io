const themeBtn = document.getElementById('themeBtn');
    if (localStorage.getItem('site-theme') === 'light') {
      document.body.classList.add('light-mode');
    }
    function toggleTheme() {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      try { localStorage.setItem('site-theme', isLight ? 'light' : 'dark'); } catch (e) {}
    }
    themeBtn.addEventListener('click', toggleTheme);

    const funDropdown = document.getElementById('funDropdown');
    const funBtn = document.getElementById('funBtn');
    funBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      funDropdown.classList.toggle('show');
    });
    window.addEventListener('click', () => {
      if (funDropdown.classList.contains('show')) funDropdown.classList.remove('show');
    });

    const ksBtn = document.getElementById('ksBtn');
    const wallOverlay = document.getElementById('wallOverlay');
    let isWallMode = false;

    function toggleWallMode(state) {
      isWallMode = typeof state === 'boolean' ? state : !isWallMode;
      document.body.classList.toggle('wall-mode', isWallMode);
      ksBtn.classList.toggle('active', isWallMode);
      if (isWallMode) {
        wallOverlay.scrollTop = 0;
      }
    }

    ksBtn.addEventListener('click', () => toggleWallMode());
    wallOverlay.addEventListener('click', (e) => {
      if (e.target === wallOverlay) toggleWallMode(false);
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isWallMode) toggleWallMode(false);
    });

    const canvas = document.getElementById('sinkCanvas');
    const ctx = canvas.getContext('2d');
    const numParticles = 45;
    const particles = [];
    const R_max = 210;
    const r_min = 22;

    class Particle {
      constructor() {
        this.reset();
        this.r = r_min + Math.random() * (R_max - r_min);
      }
      reset() {
        this.theta = Math.random() * Math.PI * 2;
        this.r = R_max;
        this.speed = 0.45 + Math.random() * 0.45;
      }
      update() {
        this.r -= this.speed;
        if (this.r <= r_min) this.reset();
      }
      draw(origin) {
        const x = origin.x + this.r * Math.cos(this.theta);
        const y = origin.y + this.r * Math.sin(this.theta);
        let opacity = 0.24;
        if (this.r - r_min < 35) opacity *= (this.r - r_min) / 35;
        ctx.fillStyle = document.body.classList.contains('light-mode') 
          ? `rgba(38, 42, 24, ${opacity * 1.5})` 
          : `rgba(140, 177, 116, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < numParticles; i++) particles.push(new Particle());

    function animateSink() {
      // Academic mode: no animation at all (canvas is hidden), just idle
      if (document.body.classList.contains('academic-mode')) {
        requestAnimationFrame(animateSink);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const origin = { x: 360 - 24 - 22, y: 360 - 24 - 22 };
      for (let p of particles) {
        p.update();
        p.draw(origin);
      }
      requestAnimationFrame(animateSink);
    }
    animateSink();

    function getSinkOrigin() {
      const portalSwitch = document.getElementById('portalSwitch');
      const sinkCanvas = document.getElementById('sinkCanvas');
      if (!portalSwitch || !sinkCanvas) return { x: 360 - 24 - 22, y: 360 - 24 - 22 };
      
      const pRect = portalSwitch.getBoundingClientRect();
      const sRect = sinkCanvas.getBoundingClientRect();
      return {
        x: (pRect.left + pRect.width / 2) - sRect.left,
        y: (pRect.top + pRect.height / 2) - sRect.top
      };
    }







  /* =========================================================
   Floating Actions + Footer Positioning
   ========================================================= */
    
    const btnJumpTop = document.getElementById('btnJumpTop');
    const btnSharePage = document.getElementById('btnSharePage');
    const floatingCluster = document.getElementById('floatingCluster');
    const siteFooter = document.getElementById('siteFooter');


let floatingUpdatePending = false;


function updateFloatingPosition() {

  /* -------------------------------------------------------
     1. Reveal / hide Jump-To-Top and Share buttons
     ------------------------------------------------------- */

  if (window.scrollY > 120) {

    btnJumpTop.classList.add('is-active');
    btnSharePage.classList.add('is-active');

  } else {

    btnJumpTop.classList.remove('is-active');
    btnSharePage.classList.remove('is-active');

  }


  /* -------------------------------------------------------
     2. Determine the ACTUAL visible viewport height

     On mobile browsers, window.innerHeight can temporarily
     represent a changing layout viewport while the browser
     address bar is moving.

     visualViewport.height tracks the visible viewport.
     ------------------------------------------------------- */

  const viewportHeight =
    window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;


  /* -------------------------------------------------------
     3. Check whether the footer has entered the viewport
     ------------------------------------------------------- */

  const footerRect = siteFooter.getBoundingClientRect();

  const defaultBottom =
    window.innerWidth <= 600 ? 18 : 24;


  /* -------------------------------------------------------
     4. Move the floating controls above the footer
     ------------------------------------------------------- */

  if (footerRect.top < viewportHeight) {

    const overlap = viewportHeight - footerRect.top;

    floatingCluster.style.bottom =
      `${overlap + 24}px`;

    if (canvas) {
      canvas.style.bottom =
        `${overlap}px`;
    }

  } else {

    floatingCluster.style.bottom =
      `${defaultBottom}px`;

    if (canvas) {
      canvas.style.bottom = '0px';
    }

  }

}


/* =========================================================
   Request one update per animation frame

   This prevents dozens of position calculations from being
   triggered during a single mobile scroll gesture.
   ========================================================= */

function requestFloatingUpdate() {

  if (floatingUpdatePending) return;

  floatingUpdatePending = true;

  requestAnimationFrame(() => {

    floatingUpdatePending = false;

    updateFloatingPosition();

  });

}


/* =========================================================
   Normal page scrolling
   ========================================================= */

window.addEventListener(
  'scroll',
  requestFloatingUpdate,
  { passive: true }
);


/* =========================================================
   Browser / viewport resizing
   ========================================================= */

window.addEventListener(
  'resize',
  requestFloatingUpdate
);


/* =========================================================
   Mobile visual viewport changes

   This catches the browser address-bar appearing /
   disappearing while the user scrolls.
   ========================================================= */

if (window.visualViewport) {

  window.visualViewport.addEventListener(
    'resize',
    requestFloatingUpdate
  );

  window.visualViewport.addEventListener(
    'scroll',
    requestFloatingUpdate
  );

}


/* =========================================================
   Initial position when the page loads
   ========================================================= */

requestFloatingUpdate();



    btnJumpTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnSharePage.addEventListener('click', async () => {
      const shareData = {
        title: document.title,
        url: window.location.href
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (e) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        btnSharePage.setAttribute('data-tooltip', 'Link Copied!');
        setTimeout(() => btnSharePage.setAttribute('data-tooltip', 'Share page'), 2200);
      }
    });


    /* ====================================================================
      KEYBOARD SHORTCUTS
        L  light / dark          G  next background grid
        A  academic mode         Q C D P S M  open that topic page directly
                                 (Quant, Computing, Differential Eq., Prob&Stat,
                                  Stochastic, Multivariable calculus)
   ==================================================================== */
    function shouldIgnoreKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return true;
      const t = e.target;
      return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable));
    }

    document.addEventListener('keydown', (e) => {
      if (shouldIgnoreKey(e)) return;
      const k = e.key.toLowerCase();

      if (k === 'l') { toggleTheme(); return; }
      if (k === 'g') { cycleGrid(); return; }
      if (k === 'a') { toggleAcademic(); return; }

      // topic shortcuts: do exactly what clicking the card does
      const card = document.querySelector('.topic-card[data-key="' + k + '"]');
      if (card) window.location.href = card.getAttribute('href');
    });

    /* ====================================================================
      BACKGROUND GRIDS: press G or tap the G button in the top bar
      (dots > lines > graph > diagonal > large dots > scan lines > off)
   ==================================================================== */
    const gridModes = ['', 'grid-lines', 'grid-graph', 'grid-diag', 'grid-dots-lg', 'grid-scan', 'grid-off'];
    const gridNames = ['dots', 'lines', 'graph paper', 'diagonal', 'large dots', 'scan lines', 'off'];
    const gridBtn = document.getElementById('gridBtn');

    let gridIdx = -1;
    try { gridIdx = gridModes.indexOf(localStorage.getItem('site-grid') || ''); } catch (e) {}
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
      try { localStorage.setItem('site-grid', gridModes[gridIdx]); } catch (e) {}
      updateGridBtnTitle();
    }

    if (gridBtn) gridBtn.addEventListener('click', cycleGrid);

    /* ====================================================================
      ACADEMIC MODE (A): plain list of the six topics. Under each title an
      "Index" opens the list of every table inside that topic's page.
      The list is read from the topic page itself every time (fetch + parse),
      so renaming / reordering tables in notesComp.html etc. updates it with
      no edits here. Links go to  <page>#<table id>  (same id rule as
      notesCommon.js: missing id -> table-<n>, repeated id -> id-2, id-3 ...).
   ==================================================================== */
    const amTopics = document.getElementById('amTopics');
    const indexCache = {};

    function cleanText(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

    async function loadTopicIndex(href) {
      if (indexCache[href]) return indexCache[href];
      const res = await fetch(href, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');

      const used = new Set();
      const items = [];
      doc.querySelectorAll('.terminal-window').forEach((sec, i) => {
        let id = sec.getAttribute('id') || ('table-' + (i + 1));
        const base = id;
        let n = 2;
        while (used.has(id)) id = base + '-' + (n++);
        used.add(id);

        const t = sec.querySelector('.doc-link-title');
        const title = cleanText(t ? t.textContent : '') || cleanText(sec.getAttribute('data-title')) || ('Table ' + (i + 1));
        items.push({ id, title });
      });

      indexCache[href] = items;
      return items;
    }

    function noteItem(text) {
      const li = document.createElement('li');
      li.className = 'am-index-note';
      li.textContent = text;
      return li;
    }

    async function fillIndex(list, href) {
      list.innerHTML = '';
      list.appendChild(noteItem('Loading...'));
      try {
        const items = await loadTopicIndex(href);
        list.innerHTML = '';
        if (!items.length) { list.appendChild(noteItem('No tables yet.')); return; }
        items.forEach(it => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = href + '#' + it.id;
          a.textContent = it.title;
          li.appendChild(a);
          list.appendChild(li);
        });
      } catch (err) {
        list.innerHTML = '';
        const li = noteItem('Could not read ' + href + ' from here (the Index loads when the site is served from a web server, not from a local file).');
        list.appendChild(li);
      }
    }

    function buildAcademicList() {
      amTopics.innerHTML = '';
      document.querySelectorAll('.notes-stack .topic-card').forEach(card => {
        const href = card.getAttribute('href');
        const titleEl = card.querySelector('.topic-title');
        const title = cleanText(titleEl ? titleEl.textContent : href);

        const art = document.createElement('article');
        art.className = 'am-topic';

        const h = document.createElement('h2');
        h.className = 'am-topic-title';
        const link = document.createElement('a');
        link.href = href;
        link.textContent = title;
        h.appendChild(link);

        const wrap = document.createElement('div');
        wrap.className = 'am-index';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'am-index-toggle';
        btn.textContent = 'Index';
        btn.setAttribute('aria-expanded', 'false');
        const list = document.createElement('ol');
        list.className = 'am-index-list';
        list.hidden = true;

        let loaded = false;
        btn.addEventListener('click', () => {
          const open = list.hidden;
          list.hidden = !open;
          btn.setAttribute('aria-expanded', String(open));
          if (open && !loaded) { loaded = true; fillIndex(list, href); }
        });

        wrap.appendChild(btn);
        wrap.appendChild(list);
        art.appendChild(h);
        art.appendChild(wrap);
        amTopics.appendChild(art);
      });
    }

    function toggleAcademic() {
      const on = document.body.classList.toggle('academic-mode');
      try { localStorage.setItem('notes-academic', on ? 'on' : 'off'); } catch (e) {}
      if (on) {
        if (typeof toggleWallMode === 'function') toggleWallMode(false);
        buildAcademicList();
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (!on) requestFloatingUpdate();
    }

    const academicBtn = document.getElementById('academicBtn');
    const amThemeBtn = document.getElementById('amThemeBtn');
    const exitAcademicBtn = document.getElementById('exitAcademicBtn');
    if (academicBtn) academicBtn.addEventListener('click', toggleAcademic);
    if (amThemeBtn) amThemeBtn.addEventListener('click', toggleTheme);
    if (exitAcademicBtn) exitAcademicBtn.addEventListener('click', toggleAcademic);

    // Already in academic mode when the page loads (remembered from last time)
    if (document.body.classList.contains('academic-mode')) buildAcademicList();
