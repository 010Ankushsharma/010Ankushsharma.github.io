(function () {
  'use strict';

  /* ─────────────────────────────────────
     LOADER
  ───────────────────────────────────── */
  const loader = document.getElementById('loader');
  const loaderStatus = document.getElementById('loaderStatus');
  const loadMsgs = ['Initializing...', 'Loading assets...', 'Drawing character...', 'Ready.'];
  let lmi = 0;
  const lmTimer = setInterval(() => {
    lmi++;
    if (lmi < loadMsgs.length) loaderStatus.textContent = loadMsgs[lmi];
    else clearInterval(lmTimer);
  }, 600);
  window.addEventListener('load', () => {
    setTimeout(() => { loader.classList.add('gone'); document.body.style.overflow = ''; }, 2600);
  });
  document.body.style.overflow = 'hidden';

  /* ─────────────────────────────────────
     CURSOR
  ───────────────────────────────────── */
  const cur = document.getElementById('cursor');
  let cx = -100, cy = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });

  /* ─────────────────────────────────────
     SCROLL BAR
  ───────────────────────────────────── */
  const sb = document.getElementById('scrollBar');
  const onScroll = () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    sb.style.width = pct + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─────────────────────────────────────
     NAV
  ───────────────────────────────────── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const nls = document.querySelectorAll('.nl');

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50), { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  nls.forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href[0] === '#') {
        e.preventDefault();
        const t = document.querySelector(href);
        if (t) window.scrollTo({ top: t.offsetTop - 65, behavior: 'smooth' });
        burger.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  });

  // Active section
  const secs = document.querySelectorAll('section[id]');
  const hlNav = () => {
    let cur = '';
    secs.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
    nls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  window.addEventListener('scroll', hlNav, { passive: true }); hlNav();

  /* ─────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────── */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const d = +(el.getAttribute('data-delay') || 0);
      setTimeout(() => {
        el.classList.add('visible');
        el.querySelectorAll('.bar-f[data-w]').forEach(f => {
          f.style.width = f.getAttribute('data-w') + '%';
        });
      }, d);
      ro.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => ro.observe(el));

  /* ─────────────────────────────────────
     COUNTERS
  ───────────────────────────────────── */
  const co = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.getAttribute('data-count');
      const t0 = performance.now();
      const step = now => {
        const p = Math.min((now - t0) / 1600, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      };
      requestAnimationFrame(step);
      co.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

  /* ─────────────────────────────────────
     CONTACT FORM
  ───────────────────────────────────── */
  const ctForm = document.getElementById('ctForm');
  const formOk = document.getElementById('formOk');
  const fsubmit = document.getElementById('fsubmit');
  if (ctForm) {
    ctForm.addEventListener('submit', e => {
      e.preventDefault();
      fsubmit.querySelector('.ft').textContent = 'Sending...';
      fsubmit.disabled = true;
      setTimeout(() => {
        ctForm.style.opacity = '0'; ctForm.style.pointerEvents = 'none';
        formOk.classList.add('show');
        setTimeout(() => {
          ctForm.reset(); ctForm.style.opacity = ''; ctForm.style.pointerEvents = '';
          formOk.classList.remove('show');
          fsubmit.querySelector('.ft').textContent = 'Send Message';
          fsubmit.disabled = false;
        }, 4000);
      }, 900);
    });
  }

  /* ─────────────────────────────────────
     FOOTER
  ───────────────────────────────────── */
  document.getElementById('yr').textContent = new Date().getFullYear();
  document.getElementById('footerTop').addEventListener('click', e => {
    e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─────────────────────────────────────
     CHARACTER — REALISTIC WALKING MASCOT
     Looks like Ankush: dark hair, glasses,
     beard stubble, arms-crossed rest pose,
     polo shirt, casual jeans
  ───────────────────────────────────── */
  const mascot = document.getElementById('mascot');
  const mCanvas = document.getElementById('mascotCanvas');
  const mCtx = mCanvas.getContext('2d');
  const bubble = document.getElementById('mascotBubble');
  if (!mascot || !mCanvas) return;

  const W = 64, H = 96;
  mCanvas.width = W; mCanvas.height = H;

  // Position & physics
  let px = 80, py = window.innerHeight - 110;
  let vx = 0, vy = 0;
  let tx = px, ty = py;
  let facingRight = true;
  let isFollowing = false;
  let followEnd = 0;
  let bubbleTimer = null;
  let isJumping = false;
  let jumpVy = 0;
  const groundY = () => window.innerHeight - 110;

  // Walking anim
  let walkFrame = 0;
  let walkTick = 0;
  const WALK_SPD = 6;

  // Bubble messages
  const bubbleMsgs = [
    'Hi! 👋', "What's up?", 'Need a dev? 😄',
    '<AS/>', 'AI is cool 🤖', "Let's collab!",
    'Flutter 💙', 'Java ☕', '50+ projects 🚀',
    'Click me again!'
  ];

  // ── Draw character ──
  function drawChar(frame, facing, blinking) {
    mCtx.clearRect(0, 0, W, H);
    mCtx.save();

    // Mirror for direction
    if (!facing) {
      mCtx.translate(W, 0); mCtx.scale(-1, 1);
    }

    // Walking offsets
    const walkCycle = [0, -2, 0, 2];
    const armSwing  = [3, 6, 3, -3, -6, -3];
    const legSwing  = [8, 14, 8, -8, -14, -8];
    const bodyBob   = [0, -1, -2, -1, 0, 1];
    const fi = frame % 6;
    const bob = bodyBob[fi];
    const arm = armSwing[fi];
    const leg = legSwing[fi];

    const bx = W / 2; // base x

    // ── Shadow ──
    // (handled by DOM div)

    // ── SHOES ──
    mCtx.fillStyle = '#1a1a1a';
    // left shoe
    mCtx.beginPath();
    mCtx.ellipse(bx - 8 - leg * 0.3, H - 6, 8, 5, 0, 0, Math.PI * 2);
    mCtx.fill();
    // right shoe
    mCtx.beginPath();
    mCtx.ellipse(bx + 8 + leg * 0.3, H - 6, 8, 5, 0, 0, Math.PI * 2);
    mCtx.fill();

    // ── JEANS / LEGS ──
    mCtx.strokeStyle = '#2a3550';
    mCtx.lineWidth = 7;
    mCtx.lineCap = 'round';
    // left leg
    mCtx.beginPath();
    mCtx.moveTo(bx - 5, H - 36 + bob);
    mCtx.lineTo(bx - 8 - leg * 0.35, H - 8);
    mCtx.stroke();
    // right leg
    mCtx.beginPath();
    mCtx.moveTo(bx + 5, H - 36 + bob);
    mCtx.lineTo(bx + 8 + leg * 0.35, H - 8);
    mCtx.stroke();
    // jeans highlight
    mCtx.strokeStyle = '#3a4560';
    mCtx.lineWidth = 2;
    mCtx.beginPath();
    mCtx.moveTo(bx - 5, H - 36 + bob);
    mCtx.lineTo(bx - 8 - leg * 0.35, H - 8);
    mCtx.stroke();
    mCtx.beginPath();
    mCtx.moveTo(bx + 5, H - 36 + bob);
    mCtx.lineTo(bx + 8 + leg * 0.35, H - 8);
    mCtx.stroke();

    // ── BODY / POLO SHIRT ──
    const bodyTop = H - 72 + bob;
    // shirt base (grey/charcoal textured polo)
    mCtx.fillStyle = '#2c2c2c';
    mCtx.beginPath();
    mCtx.roundRect(bx - 13, bodyTop, 26, 38, [4, 4, 8, 8]);
    mCtx.fill();
    // shirt collar V
    mCtx.fillStyle = '#222';
    mCtx.beginPath();
    mCtx.moveTo(bx - 4, bodyTop);
    mCtx.lineTo(bx, bodyTop + 9);
    mCtx.lineTo(bx + 4, bodyTop);
    mCtx.closePath();
    mCtx.fill();
    // polo texture lines (woven look)
    mCtx.strokeStyle = 'rgba(255,255,255,0.04)';
    mCtx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      mCtx.beginPath();
      mCtx.moveTo(bx - 13, bodyTop + 5 + i * 7);
      mCtx.lineTo(bx + 13, bodyTop + 5 + i * 7);
      mCtx.stroke();
    }
    // shirt button
    mCtx.fillStyle = '#444';
    mCtx.beginPath(); mCtx.arc(bx, bodyTop + 14, 1.5, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.arc(bx, bodyTop + 20, 1.5, 0, Math.PI * 2); mCtx.fill();

    // ── ARMS ──
    mCtx.strokeStyle = '#c8a882'; // skin
    mCtx.lineWidth = 5;
    mCtx.lineCap = 'round';
    // right arm (swings forward)
    mCtx.beginPath();
    mCtx.moveTo(bx + 13, bodyTop + 8);
    mCtx.quadraticCurveTo(bx + 20, bodyTop + 18 + arm * 0.5, bx + 15, bodyTop + 30 + arm * 0.4);
    mCtx.stroke();
    // left arm
    mCtx.beginPath();
    mCtx.moveTo(bx - 13, bodyTop + 8);
    mCtx.quadraticCurveTo(bx - 20, bodyTop + 18 - arm * 0.5, bx - 15, bodyTop + 30 - arm * 0.4);
    mCtx.stroke();
    // shirt sleeves over arms
    mCtx.strokeStyle = '#2c2c2c';
    mCtx.lineWidth = 7;
    mCtx.beginPath();
    mCtx.moveTo(bx + 13, bodyTop + 4);
    mCtx.lineTo(bx + 18, bodyTop + 16);
    mCtx.stroke();
    mCtx.beginPath();
    mCtx.moveTo(bx - 13, bodyTop + 4);
    mCtx.lineTo(bx - 18, bodyTop + 16);
    mCtx.stroke();
    // hands
    mCtx.fillStyle = '#c8a882';
    mCtx.beginPath(); mCtx.arc(bx + 15, bodyTop + 31 + arm * 0.4, 4, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.arc(bx - 15, bodyTop + 31 - arm * 0.4, 4, 0, Math.PI * 2); mCtx.fill();

    // ── NECK ──
    mCtx.fillStyle = '#c8a882';
    mCtx.fillRect(bx - 4, bodyTop - 6, 8, 10);

    // ── HEAD ──
    const hy = bodyTop - 26 + bob;
    // head shape — slightly oval, Indian skin tone
    mCtx.fillStyle = '#c8a882';
    mCtx.beginPath();
    mCtx.ellipse(bx, hy, 14, 16, 0, 0, Math.PI * 2);
    mCtx.fill();
    // cheeks subtle
    mCtx.fillStyle = 'rgba(180,100,80,0.12)';
    mCtx.beginPath(); mCtx.ellipse(bx - 8, hy + 3, 5, 4, 0, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.ellipse(bx + 8, hy + 3, 5, 4, 0, 0, Math.PI * 2); mCtx.fill();

    // ── HAIR — dark wavy/curly ──
    mCtx.fillStyle = '#111118';
    // main hair mass
    mCtx.beginPath();
    mCtx.moveTo(bx - 14, hy - 4);
    mCtx.bezierCurveTo(bx - 16, hy - 18, bx - 8, hy - 24, bx, hy - 22);
    mCtx.bezierCurveTo(bx + 8, hy - 24, bx + 16, hy - 18, bx + 14, hy - 4);
    mCtx.fill();
    // wavy strands
    mCtx.strokeStyle = '#1a1a22';
    mCtx.lineWidth = 2.5;
    mCtx.lineCap = 'round';
    // strand 1
    mCtx.beginPath();
    mCtx.moveTo(bx - 10, hy - 22);
    mCtx.bezierCurveTo(bx - 14, hy - 18, bx - 12, hy - 12, bx - 10, hy - 10);
    mCtx.stroke();
    // strand 2
    mCtx.beginPath();
    mCtx.moveTo(bx, hy - 24);
    mCtx.bezierCurveTo(bx + 3, hy - 18, bx + 1, hy - 14, bx - 2, hy - 10);
    mCtx.stroke();
    // slight front wave
    mCtx.strokeStyle = '#0a0a10';
    mCtx.lineWidth = 3;
    mCtx.beginPath();
    mCtx.moveTo(bx - 8, hy - 10);
    mCtx.bezierCurveTo(bx - 4, hy - 14, bx + 2, hy - 12, bx + 5, hy - 9);
    mCtx.stroke();

    // ── EARS ──
    mCtx.fillStyle = '#c0a070';
    mCtx.beginPath(); mCtx.ellipse(bx - 14, hy + 1, 3, 4.5, 0, 0, Math.PI * 2); mCtx.fill();
    mCtx.beginPath(); mCtx.ellipse(bx + 14, hy + 1, 3, 4.5, 0, 0, Math.PI * 2); mCtx.fill();
    // ear stud (small detail — visible in photo)
    mCtx.fillStyle = '#d4af37';
    mCtx.beginPath(); mCtx.arc(bx + 14, hy + 3, 1.5, 0, Math.PI * 2); mCtx.fill();

    // ── GLASSES — rectangular frames ──
    const glassY = hy - 2;
    mCtx.strokeStyle = '#888';
    mCtx.lineWidth = 1.5;
    mCtx.fillStyle = 'rgba(180,210,240,0.08)';
    // left lens
    mCtx.beginPath(); mCtx.roundRect(bx - 12, glassY - 4, 9, 7, 1.5); mCtx.fill(); mCtx.stroke();
    // right lens
    mCtx.beginPath(); mCtx.roundRect(bx + 3, glassY - 4, 9, 7, 1.5); mCtx.fill(); mCtx.stroke();
    // bridge
    mCtx.beginPath(); mCtx.moveTo(bx - 3, glassY - 1); mCtx.lineTo(bx + 3, glassY - 1); mCtx.stroke();
    // temple left
    mCtx.beginPath(); mCtx.moveTo(bx - 12, glassY - 1); mCtx.lineTo(bx - 15, glassY); mCtx.stroke();
    // temple right
    mCtx.beginPath(); mCtx.moveTo(bx + 12, glassY - 1); mCtx.lineTo(bx + 15, glassY); mCtx.stroke();

    // ── EYES ──
    if (!blinking) {
      mCtx.fillStyle = '#1a0a00';
      mCtx.beginPath(); mCtx.ellipse(bx - 7.5, glassY, 2.5, 2.5, 0, 0, Math.PI * 2); mCtx.fill();
      mCtx.beginPath(); mCtx.ellipse(bx + 7.5, glassY, 2.5, 2.5, 0, 0, Math.PI * 2); mCtx.fill();
      // whites
      mCtx.fillStyle = 'rgba(255,255,255,0.8)';
      mCtx.beginPath(); mCtx.arc(bx - 7, glassY - 0.5, 1, 0, Math.PI * 2); mCtx.fill();
      mCtx.beginPath(); mCtx.arc(bx + 8, glassY - 0.5, 1, 0, Math.PI * 2); mCtx.fill();
    } else {
      // blink — closed eyes
      mCtx.strokeStyle = '#1a0a00'; mCtx.lineWidth = 1.5;
      mCtx.beginPath(); mCtx.moveTo(bx - 10, glassY); mCtx.lineTo(bx - 5, glassY - 1); mCtx.stroke();
      mCtx.beginPath(); mCtx.moveTo(bx + 5, glassY); mCtx.lineTo(bx + 10, glassY - 1); mCtx.stroke();
    }

    // ── EYEBROWS ──
    mCtx.strokeStyle = '#111';
    mCtx.lineWidth = 2; mCtx.lineCap = 'round';
    mCtx.beginPath();
    mCtx.moveTo(bx - 11, glassY - 6.5);
    mCtx.bezierCurveTo(bx - 8, glassY - 8, bx - 5, glassY - 7.5, bx - 3.5, glassY - 6.5);
    mCtx.stroke();
    mCtx.beginPath();
    mCtx.moveTo(bx + 3.5, glassY - 6.5);
    mCtx.bezierCurveTo(bx + 5, glassY - 7.5, bx + 8, glassY - 8, bx + 11, glassY - 6.5);
    mCtx.stroke();

    // ── NOSE ──
    mCtx.strokeStyle = 'rgba(150,80,50,0.4)'; mCtx.lineWidth = 1.2;
    mCtx.beginPath();
    mCtx.moveTo(bx - 1, glassY + 2);
    mCtx.lineTo(bx, glassY + 5);
    mCtx.lineTo(bx + 3, glassY + 5);
    mCtx.stroke();

    // ── BEARD STUBBLE ──
    mCtx.fillStyle = 'rgba(30,20,10,0.55)';
    // jaw area beard
    for (let i = -8; i <= 8; i += 3) {
      for (let j = 6; j <= 12; j += 3) {
        mCtx.beginPath();
        mCtx.arc(bx + i + Math.sin(i * j) * 1.5, hy + j, 0.9, 0, Math.PI * 2);
        mCtx.fill();
      }
    }
    // mustache area
    for (let i = -5; i <= 5; i += 2.5) {
      mCtx.beginPath();
      mCtx.arc(bx + i, hy + 4.5, 0.8, 0, Math.PI * 2);
      mCtx.fill();
    }

    // ── MOUTH / SUBTLE SMILE ──
    mCtx.strokeStyle = 'rgba(120,60,40,0.6)';
    mCtx.lineWidth = 1.2; mCtx.lineCap = 'round';
    mCtx.beginPath();
    mCtx.moveTo(bx - 4, hy + 7.5);
    mCtx.bezierCurveTo(bx - 1, hy + 9, bx + 1, hy + 9, bx + 4, hy + 7.5);
    mCtx.stroke();

    // ── GOLD CHAIN ── (visible in photo)
    mCtx.strokeStyle = 'rgba(212,175,55,0.5)';
    mCtx.lineWidth = 1;
    mCtx.beginPath();
    mCtx.moveTo(bx - 4, bodyTop - 4);
    mCtx.bezierCurveTo(bx - 2, bodyTop + 2, bx + 2, bodyTop + 2, bx + 4, bodyTop - 4);
    mCtx.stroke();

    // ── RED THREAD / BRACELET ── (on right wrist — visible in photo)
    mCtx.strokeStyle = '#cc2200';
    mCtx.lineWidth = 2;
    mCtx.beginPath();
    mCtx.arc(bx + 15, bodyTop + 31 + arm * 0.4, 3.5, 0, Math.PI * 2);
    mCtx.stroke();

    mCtx.restore();
  }

  // ── Blinking ──
  let blink = false;
  let blinkTimer = 0;
  setInterval(() => {
    blink = true;
    setTimeout(() => { blink = false; }, 120);
  }, 3200 + Math.random() * 2000);

  // ── Wander / follow logic ──
  function randomTarget() {
    const pad = 60;
    return {
      x: pad + Math.random() * (window.innerWidth - pad * 2),
      y: groundY()
    };
  }

  let target = randomTarget();
  let wanderTimeout = null;

  function scheduleWander() {
    clearTimeout(wanderTimeout);
    wanderTimeout = setTimeout(() => {
      target = randomTarget();
      isFollowing = false;
      scheduleWander();
    }, 2000 + Math.random() * 4000);
  }
  scheduleWander();

  // Follow cursor occasionally
  function maybeFollow() {
    setTimeout(() => {
      isFollowing = true;
      followEnd = Date.now() + 2500 + Math.random() * 2500;
      maybeFollow();
    }, 6000 + Math.random() * 8000);
  }
  maybeFollow();

  document.addEventListener('mousemove', e => {
    if (isFollowing) { target.x = e.clientX - 20; target.y = groundY(); }
  });

  // Jump on click
  mCanvas.addEventListener('click', () => {
    if (!isJumping) { isJumping = true; jumpVy = -14; }
    // Show bubble
    const msg = bubbleMsgs[Math.floor(Math.random() * bubbleMsgs.length)];
    bubble.textContent = msg;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 2400);
  });

  // ── Main loop ──
  let lastTime = 0;
  function loop(ts) {
    const dt = Math.min((ts - lastTime) / 16, 3);
    lastTime = ts;

    const gY = groundY();

    // Follow / wander
    if (isFollowing && Date.now() > followEnd) { isFollowing = false; target = randomTarget(); scheduleWander(); }

    const dx = target.x - px;
    const dy = gY - py;

    const speed = isFollowing ? 0.1 : 0.045;
    vx += dx * speed * dt;
    vx *= Math.pow(0.82, dt);

    // Jump physics
    if (isJumping) {
      jumpVy += 0.85 * dt;
      py += jumpVy * dt;
      if (py >= gY) { py = gY; isJumping = false; jumpVy = 0; }
    } else {
      py += (gY - py) * 0.2 * dt;
    }

    px += vx * dt;
    px = Math.max(30, Math.min(window.innerWidth - 50, px));

    // Direction
    if (vx > 0.4) facingRight = true;
    else if (vx < -0.4) facingRight = false;

    // Walk anim — only when moving
    const speed_abs = Math.abs(vx);
    if (speed_abs > 0.6) {
      walkTick += speed_abs * 0.18 * dt;
      if (walkTick > 1) { walkFrame = (walkFrame + 1) % 6; walkTick = 0; }
    } else {
      walkFrame = 0; // idle pose
    }

    // Position mascot
    mascot.style.left = (px - 32) + 'px';
    mascot.style.top  = (py - 90) + 'px';

    // Shadow scale based on jump height
    const shadow = mascot.querySelector('.mascot-shadow');
    if (shadow) {
      const lift = Math.max(0, gY - py);
      const sc = Math.max(0.3, 1 - lift / 200);
      shadow.style.transform = `scaleX(${sc}) scaleY(${sc * 0.5})`;
      shadow.style.opacity = sc;
    }

    drawChar(walkFrame, facingRight, blink);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Resize
  window.addEventListener('resize', () => {
    px = Math.min(px, window.innerWidth - 50);
    py = groundY();
    if (target.y) target.y = groundY();
  });

})();
