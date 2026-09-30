/* =====================================================================
   notesCommon.js
   Shared script for all five notes pages (notesDE, notesComp, ...).

   HOW TO LOAD (put this at the end of <body>, or keep the defer):
       <script src="js/notesCommon.js" defer></script>

   TABLE OF CONTENTS
     1. Small helpers (safe storage access)
     2. Theme toggle (light / dark)
     3. "Fun" dropdown menu
     4. "KS" hint tooltip (shown once per page per session)
     5. Contents sidebar + hover preview ("inspect mode")
     6. Sink animation (particles flowing into the S button)
     7. Floating buttons (jump-to-top, share) + footer positioning
     8. Startup

   ELEMENT IDs THIS SCRIPT EXPECTS IN EVERY PAGE
     themeBtn, funDropdown, funBtn, ksBtn, ksHintTooltip,
     contentsList, previewCardRight, previewHeaderTitle,
     previewBodyContent, stageOverlay, sinkCanvas, portalSwitch,
     btnJumpTop, btnSharePage, floatingCluster, siteFooter
   and one or more <section class="terminal-window" data-title="...">
   ===================================================================== */


/* =====================================================================
   1. SMALL HELPERS
   localStorage / sessionStorage can throw in private browsing or when
   blocked by the browser. These wrappers make sure that never breaks
   the rest of the page.
   ===================================================================== */

function safeGet(store, key) {
  try { return store.getItem(key); } catch (e) { return null; }
}

function safeSet(store, key, value) {
  try { store.setItem(key, value); } catch (e) { /* ignore */ }
}


/* =====================================================================
   2. THEME TOGGLE (light / dark)
   The choice is remembered in localStorage under "site-theme", so it
   is shared across all pages of the site.
   ===================================================================== */

const themeBtn = document.getElementById('themeBtn');

if (safeGet(localStorage, 'site-theme') === 'light') {
  document.body.classList.add('light-mode');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  safeSet(localStorage, 'site-theme', isLight ? 'light' : 'dark');
});


/* =====================================================================
   3. "FUN" DROPDOWN MENU
   Click the button to open/close. Clicking anywhere else closes it.
   ===================================================================== */

const funDropdown = document.getElementById('funDropdown');
const funBtn = document.getElementById('funBtn');

funBtn.addEventListener('click', (e) => {
  e.stopPropagation();                 // stop the window click below from instantly closing it
  funDropdown.classList.toggle('show');
});

window.addEventListener('click', () => {
  funDropdown.classList.remove('show');
});


/* =====================================================================
   4. "KS" HINT TOOLTIP
   A small "Tap for Content" bubble next to the KS badge.
     - Disappears automatically after 6 seconds.
     - Disappears early on hover/tap of the badge or bubble, or on any
       click elsewhere.
     - Remembered per page in sessionStorage (key uses the file name,
       e.g. "ks-tooltip-seen-notesDE.html"), so it shows once per page
       per browser session.
   ===================================================================== */

const ksHintTooltip = document.getElementById('ksHintTooltip');
const ksBtn = document.getElementById('ksBtn');

const currentPageKey =
  'ks-tooltip-seen-' + (window.location.pathname.split('/').pop() || 'index');

function dismissTooltip() {
  if (!ksHintTooltip || !ksHintTooltip.parentNode) return;
  safeSet(sessionStorage, currentPageKey, 'true');
  ksHintTooltip.classList.add('fade-out');
  setTimeout(() => {
    if (ksHintTooltip.parentNode) ksHintTooltip.remove();
  }, 350);                             // matches the CSS fade-out time
}

if (safeGet(sessionStorage, currentPageKey) === 'true') {
  // Already seen on this page in this session: remove it right away.
  if (ksHintTooltip) ksHintTooltip.remove();
} else if (ksHintTooltip) {
  const tooltipTimer = setTimeout(dismissTooltip, 6000);   // auto-dismiss

  const dismissNow = () => {
    clearTimeout(tooltipTimer);
    dismissTooltip();
  };

  ksBtn.addEventListener('mouseenter', dismissNow);
  ksBtn.addEventListener('touchstart', dismissNow, { passive: true });
  ksHintTooltip.addEventListener('mouseenter', dismissNow);
  ksHintTooltip.addEventListener('click', dismissNow);

  // Any click elsewhere on the page (fires only once)
  window.addEventListener('click', (e) => {
    if (e.target !== ksHintTooltip) dismissNow();
  }, { once: true });
}


/* =====================================================================
   5. CONTENTS SIDEBAR + HOVER PREVIEW ("inspect mode")
   Clicking the KS badge opens a sidebar listing every
   <section class="terminal-window"> on the page (title comes from its
   data-title attribute). Hovering/tapping an entry shows a preview card
   with that section's content; clicking it scrolls to the section.
   Esc, the KS badge, or clicking the dimmed backdrop closes it.
   ===================================================================== */

const contentsList = document.getElementById('contentsList');
const previewCardRight = document.getElementById('previewCardRight');
const previewHeaderTitle = document.getElementById('previewHeaderTitle');
const previewBodyContent = document.getElementById('previewBodyContent');
const stageOverlay = document.getElementById('stageOverlay');
const sections = document.querySelectorAll('.terminal-window');

let isInspectActive = false;

/* Show one section's content in the preview card and highlight its entry. */
function renderPreview(sec, idx, title) {
  previewHeaderTitle.textContent = `${idx + 1}. ${title}`;
  previewBodyContent.innerHTML = sec.querySelector('.terminal-body').innerHTML;
  previewCardRight.classList.add('visible');

  document.querySelectorAll('.contents-item').forEach(el => el.classList.remove('active'));
  const activeLi = contentsList.children[idx];
  if (activeLi) activeLi.classList.add('active');

  // Re-render maths (\( ... \)) inside the copied preview content
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([previewBodyContent]).catch(err => console.log(err));
  }
}

/* Build the numbered list of sections in the sidebar. */
function populateContents() {
  contentsList.innerHTML = '';

  sections.forEach((sec, idx) => {
    const title = sec.getAttribute('data-title') || `Topic ${idx + 1}`;

    const li = document.createElement('li');
    li.className = 'contents-item';
    li.innerHTML = `
      <span class="contents-index-num">${idx + 1}.</span>
      <span>${title}</span>
    `;

    li.addEventListener('mouseenter', () => renderPreview(sec, idx, title));
    li.addEventListener('touchstart', () => renderPreview(sec, idx, title), { passive: true });

    li.addEventListener('click', () => {
      renderPreview(sec, idx, title);

      const closeAndScroll = () => {
        toggleInspectMode(false);
        sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      // On phones wait briefly so the tap feels acknowledged first
      if (window.innerWidth <= 768) setTimeout(closeAndScroll, 300);
      else closeAndScroll();
    });

    contentsList.appendChild(li);
  });
}

/* Open / close inspect mode. Pass true/false to force, or nothing to flip. */
function toggleInspectMode(state) {
  isInspectActive = typeof state === 'boolean' ? state : !isInspectActive;
  document.body.classList.toggle('ks-inspect-active', isInspectActive);
  ksBtn.classList.toggle('active', isInspectActive);

  dismissTooltip();                    // the hint is no longer needed

  if (!isInspectActive) {
    previewCardRight.classList.remove('visible');
  } else {
    const firstSec = sections[0];
    if (firstSec) renderPreview(firstSec, 0, firstSec.getAttribute('data-title'));
  }
}

ksBtn.addEventListener('click', () => toggleInspectMode());
stageOverlay.addEventListener('click', () => toggleInspectMode(false));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isInspectActive) toggleInspectMode(false);
});

populateContents();


/* =====================================================================
   6. SINK ANIMATION
   Tiny particles drift inward and vanish at the S (portal) button in the
   bottom-right corner, drawn on <canvas id="sinkCanvas">.

   HOW THE CENTRE POINT WORKS
   The canvas is drawn in a fixed 360x360 "buffer", but CSS can display it
   smaller on phones (220px / 240px). getSinkOrigin() measures where the
   S button really is on screen and converts that to buffer coordinates
   (by multiplying by buffer size / displayed size), so the particles
   always converge exactly on the button, at any screen size.
   The result is cached in `sinkOrigin` and refreshed only when the layout
   can change (load, resize, scroll updates) instead of every frame.
   ===================================================================== */

const canvas = document.getElementById('sinkCanvas');
const ctx = canvas.getContext('2d');

const NUM_PARTICLES = 45;
const R_MAX = 210;                     // particles start this far from the centre
const R_MIN = 22;                      // ...and vanish at this distance

// Fallback centre (desktop layout: 360px canvas, button 24px from the edge
// with a 44px width -> centre is 360 - 24 - 22 from the top-left).
const DEFAULT_SINK_ORIGIN = { x: 360 - 24 - 22, y: 360 - 24 - 22 };

/* Centre of the S button, in canvas-buffer coordinates. */
function getSinkOrigin() {
  const portalSwitch = document.getElementById('portalSwitch');
  if (!portalSwitch) return { ...DEFAULT_SINK_ORIGIN };

  const pRect = portalSwitch.getBoundingClientRect();
  const sRect = canvas.getBoundingClientRect();

  // Hidden / not laid out yet: use the fallback
  if (!pRect.width || !sRect.width || !sRect.height) return { ...DEFAULT_SINK_ORIGIN };

  // CSS pixels -> canvas buffer pixels
  const scaleX = canvas.width / sRect.width;
  const scaleY = canvas.height / sRect.height;

  return {
    x: (pRect.left + pRect.width / 2 - sRect.left) * scaleX,
    y: (pRect.top + pRect.height / 2 - sRect.top) * scaleY
  };
}

let sinkOrigin = { ...DEFAULT_SINK_ORIGIN };

function refreshSinkOrigin() {
  sinkOrigin = getSinkOrigin();
}

class Particle {
  constructor() {
    this.reset();
    this.r = R_MIN + Math.random() * (R_MAX - R_MIN);   // start spread out
  }

  reset() {
    this.theta = Math.random() * Math.PI * 2;
    this.r = R_MAX;
    this.speed = 0.45 + Math.random() * 0.45;
  }

  update() {
    this.r -= this.speed;
    if (this.r <= R_MIN) this.reset();
  }

  draw(origin, isLight) {
    const x = origin.x + this.r * Math.cos(this.theta);
    const y = origin.y + this.r * Math.sin(this.theta);

    // Fade out during the last 35px before reaching the centre
    let opacity = 0.24;
    if (this.r - R_MIN < 35) opacity *= (this.r - R_MIN) / 35;

    ctx.fillStyle = isLight
      ? `rgba(35, 39, 45, ${opacity * 1.5})`
      : `rgba(63, 185, 80, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = [];
for (let i = 0; i < NUM_PARTICLES; i++) particles.push(new Particle());

function animateSink() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const isLight = document.body.classList.contains('light-mode');

  for (const p of particles) {
    p.update();
    p.draw(sinkOrigin, isLight);
  }
  requestAnimationFrame(animateSink);
}


/* =====================================================================
   7. FLOATING BUTTONS + FOOTER POSITIONING
   - Jump-to-top and Share buttons fade in after scrolling 120px.
   - When the footer scrolls into view, the button cluster and the sink
     canvas are lifted so they sit above the footer instead of over it.
   - Updates are batched to one per animation frame, so a fast mobile
     scroll does not trigger dozens of calculations.
   ===================================================================== */

const btnJumpTop = document.getElementById('btnJumpTop');
const btnSharePage = document.getElementById('btnSharePage');
const floatingCluster = document.getElementById('floatingCluster');
const siteFooter = document.getElementById('siteFooter');

let floatingUpdatePending = false;

function updateFloatingPosition() {

  // 1. Show / hide the jump-to-top and share buttons
  const show = window.scrollY > 120;
  btnJumpTop.classList.toggle('is-active', show);
  btnSharePage.classList.toggle('is-active', show);

  // 2. Visible viewport height. On mobile, innerHeight can be unreliable
  //    while the address bar slides; visualViewport tracks what is visible.
  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  // 3. Has the footer entered the viewport?
  const footerRect = siteFooter.getBoundingClientRect();
  const defaultBottom = window.innerWidth <= 600 ? 18 : 24;

  // 4. If so, lift the cluster (and canvas) by the amount of overlap
  if (footerRect.top < viewportHeight) {
    const overlap = viewportHeight - footerRect.top;
    floatingCluster.style.bottom = `${overlap + 24}px`;
    canvas.style.bottom = `${overlap}px`;
  } else {
    floatingCluster.style.bottom = `${defaultBottom}px`;
    canvas.style.bottom = '0px';
  }
}

/* Run updateFloatingPosition at most once per frame. The sink centre is
   re-measured at the same time, since the cluster may have just moved. */
function requestFloatingUpdate() {
  if (floatingUpdatePending) return;
  floatingUpdatePending = true;

  requestAnimationFrame(() => {
    floatingUpdatePending = false;
    updateFloatingPosition();
    refreshSinkOrigin();
  });
}

window.addEventListener('scroll', requestFloatingUpdate, { passive: true });
window.addEventListener('resize', requestFloatingUpdate);

// Mobile: catches the browser address bar appearing / disappearing
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', requestFloatingUpdate);
  window.visualViewport.addEventListener('scroll', requestFloatingUpdate);
}

btnJumpTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Share: uses the phone/OS share sheet when available, otherwise copies
   the link and shows "Link Copied!" in the button tooltip for ~2 seconds. */
btnSharePage.addEventListener('click', async () => {
  const shareData = { title: document.title, url: window.location.href };

  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(window.location.href); } catch (e) { /* ignore */ }
    btnSharePage.setAttribute('data-tooltip', 'Link Copied!');
    setTimeout(() => btnSharePage.setAttribute('data-tooltip', 'Share page'), 2200);
  }
});


/* =====================================================================
   8. STARTUP
   Position everything once, then start the animation. The extra
   "load" refresh catches the final layout after fonts/images arrive.
   ===================================================================== */

requestFloatingUpdate();
refreshSinkOrigin();
animateSink();
window.addEventListener('load', refreshSinkOrigin);


/* ====================================================================
   9. The background grid control using keyboard G
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
