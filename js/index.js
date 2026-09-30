/* ========================================================
       1. BACKGROUND PROBABILITY DENSITY RIBBONS ANIMATION
       ======================================================== */
    const bgCanvas = document.getElementById('bgCanvas');
    const bgCtx = bgCanvas.getContext('2d');

    let bgWidth, bgHeight;
    function resizeBg() {
      bgWidth = bgCanvas.width = window.innerWidth;
      bgHeight = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBg);
    resizeBg();

    const NUM_RIBBONS = 5;
    const RESOLUTION = 120;
    let ribbonTime = 0;

    function animateRibbons() {
      bgCtx.clearRect(0, 0, bgWidth, bgHeight);
      ribbonTime += 0.005;

      const isLight = document.body.classList.contains('light-mode');

      for (let r = 0; r < NUM_RIBBONS; r++) {
        const baseY = bgHeight * (0.32 + r * 0.12);
        const mu1 = bgWidth * (0.32 + 0.20 * Math.sin(ribbonTime * 0.6 + r * 0.8));
        const sigma1 = bgWidth * (0.13 + 0.04 * Math.cos(ribbonTime * 0.4 + r));
        const mu2 = bgWidth * (0.68 + 0.18 * Math.cos(ribbonTime * 0.5 - r * 0.7));
        const sigma2 = bgWidth * (0.11 + 0.03 * Math.sin(ribbonTime * 0.7 + r));
        const amplitude = bgHeight * 0.17;

        bgCtx.beginPath();
        for (let i = 0; i <= RESOLUTION; i++) {
          const x = (i / RESOLUTION) * bgWidth;
          const g1 = Math.exp(-Math.pow(x - mu1, 2) / (2 * sigma1 * sigma1));
          const g2 = Math.exp(-Math.pow(x - mu2, 2) / (2 * sigma2 * sigma2));
          const density = (g1 * 0.65 + g2 * 0.55);
          const y = baseY - density * amplitude + Math.sin(x * 0.0035 + ribbonTime + r) * 5;

          if (i === 0) bgCtx.moveTo(x, y);
          else bgCtx.lineTo(x, y);
        }

        bgCtx.lineWidth = 1.1;
        bgCtx.strokeStyle = isLight 
          ? `rgba(30, 96, 145, ${0.11 + r * 0.025})` 
          : `rgba(88, 166, 255, ${0.10 + r * 0.025})`;
        bgCtx.stroke();

        bgCtx.lineTo(bgWidth, bgHeight);
        bgCtx.lineTo(0, bgHeight);
        bgCtx.closePath();
        bgCtx.fillStyle = isLight
          ? `rgba(43, 122, 62, 0.012)`
          : `rgba(63, 185, 80, 0.012)`;
        bgCtx.fill();
      }

      requestAnimationFrame(animateRibbons);
    }
    animateRibbons();

    /* ========================================================
       2. TYPEWRITER INTRO SEQUENCE + SESSION STORAGE
       ======================================================== */
    const introOverlay = document.getElementById('welcomeIntro');
    const welcomeText = document.getElementById('welcomeText');
    const ksText = document.getElementById('ksText');
    const cursor1 = document.getElementById('cursor1');
    const cursor2 = document.getElementById('cursor2');
    const flyingKs = document.getElementById('flyingKs');
    const targetBadge = document.getElementById('ksBtn');

    if (sessionStorage.getItem('introPlayed')) {
      introOverlay.style.display = 'none';
    } else {
      const phrase = "welcome";
      let charIdx = 0;

      function typeWelcome() {
        if (charIdx < phrase.length) {
          welcomeText.textContent += phrase[charIdx];
          charIdx++;
          setTimeout(typeWelcome, 110);
        } else {
          cursor1.style.display = 'none';
          cursor2.style.display = 'inline-block';
          setTimeout(typeKS, 350);
        }
      }

      function typeKS() {
        ksText.textContent = "K";
        setTimeout(() => {
          ksText.textContent = "KS";
          cursor2.style.display = 'none';
          setTimeout(launchKsToBadge, 500);
        }, 160);
      }

      function launchKsToBadge() {
        const ksRect = ksText.getBoundingClientRect();
        const badgeRect = targetBadge.getBoundingClientRect();

        flyingKs.style.display = 'flex';
        flyingKs.style.left = `${ksRect.left}px`;
        flyingKs.style.top = `${ksRect.top}px`;
        flyingKs.style.transform = 'scale(1.4)';

        document.getElementById('typeLine1').style.transition = 'opacity 0.4s ease';
        document.getElementById('typeLine1').style.opacity = '0';
        ksText.style.visibility = 'hidden';

        setTimeout(() => {
          flyingKs.style.transform = `translate(${badgeRect.left - ksRect.left}px, ${badgeRect.top - ksRect.top}px) scale(1)`;
          introOverlay.style.opacity = '0';

          setTimeout(() => {
            introOverlay.style.display = 'none';
            flyingKs.style.display = 'none';
            sessionStorage.setItem('introPlayed', 'true');
          }, 850);
        }, 120);
      }

      setTimeout(typeWelcome, 400);
    }

    /* ========================================================
       3. VECTOR FIELD SINK (-x, -y) TARGETING THE '~' SWITCH
       ======================================================== */
    const sinkCanvas = document.getElementById('sinkCanvas');
    const sinkCtx = sinkCanvas.getContext('2d');
    const portalSwitch = document.getElementById('portalSwitch');

    const numParticles = 45;
    const particles = [];
    const R_max = 210;
    const r_min = 22;

    function resizeSinkCanvas() {
      // sinkCanvas.width = 360;
      // sinkCanvas.height = 360;
      const rect = sinkCanvas.getBoundingClientRect();
      sinkCanvas.width = rect.width;
      sinkCanvas.height = rect.height;
    }
    resizeSinkCanvas();
    window.addEventListener('resize', resizeSinkCanvas);

    // Calculate center dynamically by reading the exact viewport coordinates of the portal switch
    function getSinkOrigin() {
      if (!portalSwitch) return { x: 360 - 24 - 22, y: 360 - 24 - 22 };
      const pRect = portalSwitch.getBoundingClientRect();
      const sRect = sinkCanvas.getBoundingClientRect();
      return {
        x: (pRect.left + pRect.width / 2) - sRect.left,
        y: (pRect.top + pRect.height / 2) - sRect.top
      };
    }

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
        const fadeDist = 35;
        let opacity = 0.24;
        if (this.r - r_min < fadeDist) {
          opacity *= (this.r - r_min) / fadeDist;
        }

        sinkCtx.fillStyle = document.body.classList.contains('light-mode') 
          ? `rgba(35, 39, 45, ${opacity * 1.5})` 
          : `rgba(63, 185, 80, ${opacity})`;

        sinkCtx.beginPath();
        sinkCtx.arc(x, y, 1.2, 0, Math.PI * 2);
        sinkCtx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) particles.push(new Particle());

    function animateSink() {
      sinkCtx.clearRect(0, 0, sinkCanvas.width, sinkCanvas.height);
      const origin = getSinkOrigin();

      for (let p of particles) {
        p.update();
        p.draw(origin);
      }
      requestAnimationFrame(animateSink);
    }
    animateSink();

    /* ========================================================
       4. SCROLL SPY, ACTIVE TAB & DYNAMIC DOCKING
       ======================================================== */
    const sectionsObs = document.querySelectorAll('.page-section');
    const navItems = {
      'resume': document.getElementById('nav-resume'),
      'projects': document.getElementById('nav-projects'),
      'fun': document.getElementById('funBtn')
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          const id = entry.target.id;
          Object.values(navItems).forEach(btn => btn && btn.classList.remove('active-tab'));
          if (navItems[id]) {
            navItems[id].classList.add('active-tab');
          }
        }
      });
    }, {
      root: null,
      threshold: 0.25,
      rootMargin: "0px 0px -60px 0px"
    });

    sectionsObs.forEach(sec => scrollObserver.observe(sec));

    // Floating Cluster: Appear past ME section & adjust above footer
    const floatingCluster = document.getElementById('floatingCluster');
    const btnJumpTop = document.getElementById('btnJumpTop');
    const btnSharePage = document.getElementById('btnSharePage');
    const siteFooter = document.getElementById('siteFooter');

    let floatingUpdatePending = false;

    function updateFloatingPosition() {

        const meSection = document.getElementById('me');
        const meBottom = meSection
          ? meSection.getBoundingClientRect().bottom
          : 300;

           // Reveal Jump-To-Top and Share after scrolling past ME

        if (meBottom < 100) {
          btnJumpTop.classList.add('is-active');
          btnSharePage.classList.add('is-active');
        } else {
          btnJumpTop.classList.remove('is-active');
          btnSharePage.classList.remove('is-active');
        }


          // Use the actual visible viewport on mobile when available
    
        const viewportHeight =
         window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;


  // Lift cluster and shift canvas when nearing the bottom footer banner

  const footerRect = siteFooter.getBoundingClientRect();

  if (footerRect.top < viewportHeight) {

    const overlap = viewportHeight - footerRect.top;

    floatingCluster.style.bottom = `${overlap + 20}px`;
    sinkCanvas.style.bottom = `${overlap}px`;

  } else {

    floatingCluster.style.bottom =
      window.innerWidth <= 600 ? '18px' : '24px';

    sinkCanvas.style.bottom = '0px';

  }

}


function requestFloatingUpdate() {

  if (floatingUpdatePending) return;

  floatingUpdatePending = true;

  requestAnimationFrame(() => {

    floatingUpdatePending = false;
    updateFloatingPosition();

  });

}


window.addEventListener('scroll', requestFloatingUpdate, {
  passive: true
});

window.addEventListener('resize', requestFloatingUpdate);

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

requestFloatingUpdate();

    // Jump to top smooth scroll
    btnJumpTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Native Web Share / Clipboard Copy with Tooltip Feedback
    btnSharePage.addEventListener('click', async () => {
      const shareData = {
        title: 'Kalaap Sadhu | Portfolio',
        text: 'Explore quantitative finance, stochastic calculus notes, and interactive estimation games.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (e) {
          console.log('Share canceled');
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        btnSharePage.setAttribute('data-tooltip', 'Link Copied!');
        setTimeout(() => {
          btnSharePage.setAttribute('data-tooltip', 'Share page');
        }, 2200);
      }
    });

    /* ========================================================
       5. THEME TOGGLE & TASK VIEW LOGIC
       ======================================================== */
    const themeBtn = document.getElementById('themeBtn');
    if (localStorage.getItem('site-theme') === 'light') {
      document.body.classList.add('light-mode');
    }

    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
      renderMiniScene();
    });

    const funDropdown = document.getElementById('funDropdown');
    const funBtn = document.getElementById('funBtn');

    funBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      funDropdown.classList.toggle('show');
      if (contactDropdown && contactDropdown.classList.contains('show')) {
        contactDropdown.classList.remove('show');
      }
    });

    const contactDropdown = document.getElementById('contactDropdown');
    const contactBtn = document.getElementById('contactBtn');

    if (contactBtn && contactDropdown) {
      contactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        contactDropdown.classList.toggle('show');
        if (funDropdown && funDropdown.classList.contains('show')) {
          funDropdown.classList.remove('show');
        }
      });
    }

    window.addEventListener('click', () => {
      if (funDropdown && funDropdown.classList.contains('show')) funDropdown.classList.remove('show');
      if (contactDropdown && contactDropdown.classList.contains('show')) contactDropdown.classList.remove('show');
    });

    const dropdownGamesLink = document.getElementById('dropdownGamesLink');
    if (dropdownGamesLink) {
      dropdownGamesLink.addEventListener('click', () => {
        funDropdown.classList.remove('show');
      });
    }

    const ksBtn = document.getElementById('ksBtn');
    const taskViewOverlay = document.getElementById('taskViewOverlay');
    const taskViewGrid = document.getElementById('taskViewGrid');
    const sections = document.querySelectorAll('.terminal-window');
    let isTaskViewActive = false;

    function buildTaskView() {
      taskViewGrid.innerHTML = '';
      sections.forEach(sec => {
        const title = sec.getAttribute('data-title') || 'Terminal Window';
        const card = document.createElement('div');
        card.className = 'task-preview-card';
        card.innerHTML = `
          <div class="preview-header">
            <span class="shape-green-square" style="width:8px; height:8px;"></span>
            <span style="margin-left: 6px;">${title}</span>
          </div>
          <div class="preview-body-content">
            ${sec.querySelector('.terminal-body').innerHTML}
          </div>
        `;
        card.addEventListener('click', () => {
          closeTaskView();
          setTimeout(() => {
            sec.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });
        taskViewGrid.appendChild(card);
      });
    }

    function openTaskView() {
      buildTaskView();
      isTaskViewActive = true;
      taskViewOverlay.classList.add('active');
      document.body.classList.add('task-view-active');
      ksBtn.classList.add('active');
    }

    function closeTaskView() {
      isTaskViewActive = false;
      taskViewOverlay.classList.remove('active');
      document.body.classList.remove('task-view-active');
      ksBtn.classList.remove('active');
    }

    ksBtn.addEventListener('click', () => {
      if (isTaskViewActive) closeTaskView();
      else openTaskView();
    });

    taskViewOverlay.addEventListener('click', (e) => {
      if (e.target === taskViewOverlay) closeTaskView();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isTaskViewActive) closeTaskView();
    });

    /* ========================================================
       6. EXTRA MODAL CONTROLS
       ======================================================== */
    const modalOverlay = document.getElementById('extra-modal-overlay');
    const modalTitle = document.getElementById('modal-project-title');
    const commentInput = document.getElementById('extra-comment-input');

    function openExtraModal(btn, projectTitleId) {
      const triggeringElement = document.getElementById(projectTitleId);
      if (triggeringElement) {
        modalTitle.innerText = triggeringElement.innerText;
      }

      commentInput.value = '';

      if (btn) {
        const storyPanel = document.getElementById('panel-story');
        const whyPanel = document.getElementById('panel-why');
        const takeawayPanel = document.getElementById('panel-takeaway');
        const branchesPanel = document.getElementById('panel-custom1');

        if (storyPanel && btn.dataset.story) storyPanel.innerHTML = btn.dataset.story;
        if (whyPanel && btn.dataset.why) whyPanel.innerHTML = btn.dataset.why;
        if (takeawayPanel && btn.dataset.takeaway) takeawayPanel.innerHTML = btn.dataset.takeaway;
        if (branchesPanel && btn.dataset.branches) branchesPanel.innerHTML = btn.dataset.branches;

        if (window.MathJax && MathJax.typesetPromise) {
          MathJax.typesetPromise([storyPanel, whyPanel, takeawayPanel, branchesPanel]);
        }
      }

      const allTabs = document.querySelectorAll('.extra-tab-link');
      const allPanels = document.querySelectorAll('.extra-tab-panel');
      allTabs.forEach(t => t.classList.remove('active'));
      allPanels.forEach(p => p.classList.remove('active'));

      const defaultTab = document.querySelector('.extra-tab-link[data-panel="panel-story"]');
      const defaultPanel = document.getElementById('panel-story');
      if (defaultTab) defaultTab.classList.add('active');
      if (defaultPanel) defaultPanel.classList.add('active');

      modalOverlay.classList.add('is-visible');
    }

    function closeExtraModal() {
      modalOverlay.classList.remove('is-visible');
    }

    const extraTabsContainer = document.querySelector('.extra-tabs');
    if (extraTabsContainer) {
      extraTabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('extra-tab-link')) {
          const allTabs = document.querySelectorAll('.extra-tab-link');
          const allPanels = document.querySelectorAll('.extra-tab-panel');

          allTabs.forEach(t => t.classList.remove('active'));
          allPanels.forEach(p => p.classList.remove('active'));

          e.target.classList.add('active');
          const targetPanel = document.getElementById(e.target.dataset.panel);
          if (targetPanel) targetPanel.classList.add('active');
        }
      });
    }

    function postExtraComment() {
      const comment = commentInput.value.trim();
      const activeProject = modalTitle.innerText;
      if (comment) {
        const subject = encodeURIComponent(`Comment on project: ${activeProject}`);
        const body = encodeURIComponent(`Project: ${activeProject}\n\nComment:\n${comment}`);
        window.location.href = `mailto:kalaap.ks@gmail.com?subject=${subject}&body=${body}`;
      }
    }

    /* ========================================================
       7. MINIATURE AUTOPILOT GAME DEMO (Alternates K <-> S)
       ======================================================== */
    const miniShapeCanvas = document.getElementById('miniShapeCanvas');
    const miniShapeCtx = miniShapeCanvas.getContext('2d');

    const miniDrawCanvas = document.getElementById('miniDrawCanvas');
    const miniDrawCtx = miniDrawCanvas.getContext('2d');

    const miniMathCanvas = document.getElementById('miniMathCanvas');
    const miniMathCtx = miniMathCanvas.getContext('2d');

    // Dedicated offscreen mask for exact mathematical domain \Omega
    const miniMaskCanvas = document.createElement('canvas');
    miniMaskCanvas.width = 260;
    miniMaskCanvas.height = 260;
    const miniMaskCtx = miniMaskCanvas.getContext('2d');

    const MW = 260;
    const MH = 260;
    const S = MW / 480; // Scale coordinate factor from 480x480 to 260x260

    let currentMiniShape = 'K'; // Starts on K, alternates to S

    function drawCurrentShapePath(ctx) {
      ctx.beginPath();
      if (currentMiniShape === 'K') {
        ctx.moveTo(90 * S, 60 * S);
        ctx.lineTo(165 * S, 60 * S);
        ctx.lineTo(165 * S, 205 * S);
        ctx.lineTo(315 * S, 60 * S);
        ctx.lineTo(410 * S, 60 * S);
        ctx.lineTo(240 * S, 240 * S);
        ctx.lineTo(415 * S, 420 * S);
        ctx.lineTo(315 * S, 420 * S);
        ctx.lineTo(165 * S, 270 * S);
        ctx.lineTo(165 * S, 420 * S);
        ctx.lineTo(90 * S, 420 * S);
        ctx.closePath();
      } else {
        // Shape 'S' exactly from game1.html
        ctx.moveTo(110 * S, 60 * S);
        ctx.lineTo(390 * S, 60 * S);
        ctx.lineTo(390 * S, 190 * S);
        ctx.lineTo(200 * S, 190 * S);
        ctx.lineTo(200 * S, 230 * S);
        ctx.lineTo(390 * S, 230 * S);
        ctx.lineTo(390 * S, 420 * S);
        ctx.lineTo(110 * S, 420 * S);
        ctx.lineTo(110 * S, 290 * S);
        ctx.lineTo(300 * S, 290 * S);
        ctx.lineTo(300 * S, 250 * S);
        ctx.lineTo(110 * S, 250 * S);
        ctx.closePath();
      }
    }

    function renderMiniScene() {
      const isLight = document.body.classList.contains('light-mode');
      const strokeColor = isLight ? '#23272d' : '#c9d1d9';
      const fillColor = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)';

      miniShapeCtx.clearRect(0, 0, MW, MH);
      miniMaskCtx.clearRect(0, 0, MW, MH);

      // Binary mask: Solid fill strictly for mathematical domain hits
      miniMaskCtx.fillStyle = '#ffffff';
      drawCurrentShapePath(miniMaskCtx);
      miniMaskCtx.fill();

      // Visual shape: Aesthetic outline & subtle fill (Gridless L3)
      miniShapeCtx.strokeStyle = strokeColor;
      miniShapeCtx.fillStyle = fillColor;
      miniShapeCtx.lineWidth = 2;
      drawCurrentShapePath(miniShapeCtx);
      miniShapeCtx.stroke();
      miniShapeCtx.fill();
    }
    renderMiniScene();

    // Autopilot State Machine
    let miniTarget = Math.floor(Math.random() * 70) + 15;
    let demoState = 'paint'; // 'paint' | 'sample' | 'verdict' | 'pause'
    let sweepProgress = 0;
    let miniSamples = [];
    let miniNOmega = 0;
    let miniNShaded = 0;
    let demoTimer = 0;
    let isVisibleOnScreen = true;

    // Power saving: pause simulator when scrolled out of view
    const demoObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { isVisibleOnScreen = e.isIntersecting; });
    }, { threshold: 0.1 });
    demoObserver.observe(document.getElementById('game-showcase'));

    function resetDemoLoop() {
      // Alternate between K and S
      currentMiniShape = (currentMiniShape === 'K') ? 'S' : 'K';

      document.getElementById('miniTerminalTitle').textContent = 
        `[${currentMiniShape}] • Click to Play`;
      document.getElementById('miniDescText').innerHTML = ''
        // `Rejection sampling over Topological <strong>Shape '${currentMiniShape}'</strong>. The live engine samples uniform points and determines empirical area coverage by simple green/(red+green) logic (Monte-Carlo).`;

      renderMiniScene();

      miniTarget = Math.floor(Math.random() * 70) + 15;
      document.getElementById('miniTargetVal').textContent = `${miniTarget}%`;
      document.getElementById('miniPHatVal').textContent = `0.0%`;
      document.getElementById('miniNSamples').textContent = `0 pts`;
      document.getElementById('miniErrVal').textContent = `--%`;
      document.getElementById('miniVerdictBadge').textContent = '   Shading target area...';
      document.getElementById('miniVerdictBadge').style.borderColor = 'var(--green)';
      document.getElementById('miniVerdictBadge').style.color = 'var(--green)';

      miniDrawCtx.clearRect(0, 0, MW, MH);
      miniMathCtx.clearRect(0, 0, MW, MH);

      sweepProgress = 0;
      miniSamples = [];
      miniNOmega = 0;
      miniNShaded = 0;
      demoTimer = 0;
      demoState = 'paint';
    }

    function runMiniMonteCarloSampling() {
      const maskImg = miniMaskCtx.getImageData(0, 0, MW, MH).data;
      const drawImg = miniDrawCtx.getImageData(0, 0, MW, MH).data;
      const N = 1000;
      miniSamples = [];
      miniNOmega = 0;
      miniNShaded = 0;

      for (let i = 0; i < N; i++) {
        const x = Math.floor(Math.random() * MW);
        const y = Math.floor(Math.random() * MH);
        const idx = (y * MW + x) * 4 + 3;

        const inDom = maskImg[idx] > 100;
        const inShd = inDom && (drawImg[idx] > 20);

        if (inDom) miniNOmega++;
        if (inShd) miniNShaded++;

        miniSamples.push({ x, y, inDom, inShd });
      }
    }

    let sampleIdx = 0;

    function miniDemoTick() {
      if (!isVisibleOnScreen) {
        requestAnimationFrame(miniDemoTick);
        return;
      }

      if (demoState === 'paint') {
        // 3x Slower brush sweep (0.010 per frame vs 0.035)
        sweepProgress += 0.004;
        const cutoffY = (60 + (360 * (miniTarget / 100)) * Math.min(sweepProgress, 1)) * S;

        miniDrawCtx.save();
        miniDrawCtx.lineWidth = 18 * S;
        miniDrawCtx.lineCap = 'round';
        miniDrawCtx.lineJoin = 'round';
        miniDrawCtx.strokeStyle = 'rgba(140, 220, 255, 0.55)';

        miniDrawCtx.beginPath();
        if (currentMiniShape === 'K') {
          miniDrawCtx.moveTo(110 * S, 70 * S);
          miniDrawCtx.lineTo(150 * S, Math.min(cutoffY, 410 * S));
          miniDrawCtx.stroke();

          if (cutoffY > 150 * S) {
            miniDrawCtx.beginPath();
            miniDrawCtx.moveTo(165 * S, 205 * S);
            miniDrawCtx.lineTo(Math.min(300 * S, 165 * S + (cutoffY - 150 * S)), cutoffY);
            miniDrawCtx.stroke();
          }
        } else {
          // Shape 'S' programmatic shading
          miniDrawCtx.moveTo(130 * S, 80 * S);
          miniDrawCtx.lineTo(Math.min(370 * S, (130 + 240 * sweepProgress) * S), 80 * S);
          if (cutoffY > 140 * S) {
            miniDrawCtx.lineTo(370 * S, Math.min(cutoffY, 180 * S));
            miniDrawCtx.lineTo(Math.max(130 * S, 370 * S - (cutoffY - 140 * S)), 210 * S);
          }
          if (cutoffY > 260 * S) {
            miniDrawCtx.lineTo(370 * S, 240 * S);
            miniDrawCtx.lineTo(370 * S, Math.min(cutoffY, 400 * S));
            miniDrawCtx.lineTo(130 * S, 400 * S);
          }
          miniDrawCtx.stroke();
        }
        miniDrawCtx.restore();

        if (sweepProgress >= 1) {
          runMiniMonteCarloSampling();
          sampleIdx = 0;
          demoState = 'sample';
          document.getElementById('miniVerdictBadge').textContent = '⚡ Monte Carlo sampling...';
        }
      } else if (demoState === 'sample') {
        // 3x Slower Monte Carlo Rain: 10 dots/frame (batch of 10 instead of 35)
        const batch = 10;
        const limit = Math.min(sampleIdx + batch, miniSamples.length);

        for (; sampleIdx < limit; sampleIdx++) {
          const pt = miniSamples[sampleIdx];
          miniMathCtx.beginPath();
          miniMathCtx.arc(pt.x, pt.y, 1.3, 0, Math.PI * 2);

          if (!pt.inDom) {
            miniMathCtx.fillStyle = 'rgba(139, 148, 158, 0.20)'; // Grey proposals
          } else if (pt.inShd) {
            miniMathCtx.fillStyle = '#3fb950'; // Vibrant Green hit
          } else {
            miniMathCtx.fillStyle = 'rgba(255, 95, 86, 0.85)'; // Bright Red miss
          }
          miniMathCtx.fill();
        }

        const currentN = sampleIdx;
        const currentP = miniNOmega > 0 ? ((miniNShaded / miniNOmega) * 100).toFixed(1) : '0.0';
        document.getElementById('miniNSamples').textContent = `${currentN} pts`;
        document.getElementById('miniPHatVal').textContent = `${currentP}%`;

        if (sampleIdx >= miniSamples.length) {
          demoState = 'verdict';
          demoTimer = 0;
        }
      } else if (demoState === 'verdict') {
        const estimated = miniNOmega > 0 ? ((miniNShaded / miniNOmega) * 100).toFixed(1) : '0.0';
        const err = Math.abs(parseFloat(estimated) - miniTarget).toFixed(1);
        document.getElementById('miniErrVal').textContent = `${err}%`;

        const badge = document.getElementById('miniVerdictBadge');
        if (parseFloat(err) <= 4.0) {
          badge.textContent = `   Bullseye! (Error: ${err}%)`;
          badge.style.color = 'var(--green)';
          badge.style.borderColor = 'var(--green)';
        } else if (parseFloat(err) <= 8.0) {
          badge.textContent = `   Solid Accuracy! (Error: ${err}%)`;
          badge.style.color = 'var(--accent)';
          badge.style.borderColor = 'var(--accent)';
        } else {
          badge.textContent = `Off mark (Error: ${err}%)`;
          badge.style.color = 'var(--red)';
          badge.style.borderColor = 'var(--red)';
        }

        demoState = 'pause';
      } else if (demoState === 'pause') {
        demoTimer++;
        // Extended hold time: ~4 seconds (240 frames) for readable comprehension
        if (demoTimer > 240) {
          resetDemoLoop();
        }
      }

      requestAnimationFrame(miniDemoTick);
    }

    resetDemoLoop();
    requestAnimationFrame(miniDemoTick);