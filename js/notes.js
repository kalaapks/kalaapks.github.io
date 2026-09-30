const themeBtn = document.getElementById('themeBtn');
    if (localStorage.getItem('site-theme') === 'light') {
      document.body.classList.add('light-mode');
    }
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
    });

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
          ? `rgba(35, 39, 45, ${opacity * 1.5})` 
          : `rgba(63, 185, 80, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < numParticles; i++) particles.push(new Particle());

    function animateSink() {
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
      FEATURE. The background grid control using keyboard G
   ==================================================================== */
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