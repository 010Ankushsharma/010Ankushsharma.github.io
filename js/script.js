(function () {
  'use strict';

  // ======== LOADER ========
  const loader = document.getElementById('loader');
  const loaderLabel = document.getElementById('loaderLabel');
  const msgs = ['Compiling modules...', 'Loading assets...', 'Waking up mascot...', 'Ready ✓'];
  let mi = 0;
  function cycleMsg() {
    loaderLabel.textContent = msgs[mi++];
    if (mi < msgs.length) setTimeout(cycleMsg, 550);
  }
  cycleMsg();
  window.addEventListener('load', () => {
    setTimeout(() => { loader.classList.add('gone'); document.body.style.overflow = ''; }, 2500);
  });
  document.body.style.overflow = 'hidden';

  // ======== CURSOR ========
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let cx = 0, cy = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
  });
  (function animRing() {
    rx += (cx - rx) * 0.14; ry += (cy - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button,[data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
  });

  // ======== SCROLL BAR ========
  const sb = document.getElementById('scrollBar');
  window.addEventListener('scroll', () => {
    sb.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
  }, { passive: true });

  // ======== NAV ========
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navList = document.getElementById('navList');
  const navAs = document.querySelectorAll('.nav-a');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  hamburger.addEventListener('click', () => { hamburger.classList.toggle('open'); navList.classList.toggle('open'); });
  navAs.forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href[0] === '#') {
        e.preventDefault();
        const t = document.querySelector(href);
        if (t) window.scrollTo({ top: t.offsetTop - 70, behavior: 'smooth' });
        hamburger.classList.remove('open'); navList.classList.remove('open');
      }
    });
  });
  const sections = document.querySelectorAll('section[id]');
  function hlNav() {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', hlNav, { passive: true }); hlNav();

  // ======== HERO ROLES ========
  const roles = document.querySelectorAll('.role');
  let ri = 0;
  setInterval(() => {
    roles[ri].classList.remove('active'); roles[ri].classList.add('exit');
    const prev = ri;
    ri = (ri + 1) % roles.length;
    roles[ri].classList.add('active');
    setTimeout(() => roles[prev].classList.remove('exit'), 500);
  }, 2800);

  // ======== PARTICLES ========
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  let mouse = { x: null, y: null };

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35; this.vy = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 1.5 + 0.4;
      this.a = Math.random() * 0.35 + 0.1;
      // amber or violet
      this.col = Math.random() > 0.5 ? '255,180,50' : '168,85,247';
    }
    update() {
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) { this.vx -= (dx / d) * 0.7; this.vy -= (dy / d) * 0.7; }
      }
      this.x += this.vx; this.y += this.vy;
      this.vx *= 0.99; this.vy *= 0.99;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.col},${this.a})`; ctx.fill();
    }
  }
  for (let i = 0; i < 65; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,180,50,${0.1 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }
  (function loop() { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); drawLines(); requestAnimationFrame(loop); })();

  // ======== SCROLL REVEAL ========
  const revEls = document.querySelectorAll('[data-reveal]');
  const ro = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const d = el.getAttribute('data-delay') || 0;
      setTimeout(() => {
        el.classList.add('visible');
        el.querySelectorAll('.bar-fill[data-w]').forEach(f => { f.style.width = f.getAttribute('data-w') + '%'; });
      }, +d);
      ro.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revEls.forEach(el => ro.observe(el));

  // ======== COUNTER ========
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  const co = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / 1600, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      })(performance.now());
      co.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => co.observe(el));

  // ======== CONTACT FORM ========
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btnText = submitBtn.querySelector('.btn-text');
      btnText.textContent = 'Sending...'; submitBtn.disabled = true;
      setTimeout(() => {
        form.style.opacity = '0'; form.style.pointerEvents = 'none';
        formSuccess.classList.add('show');
        setTimeout(() => {
          form.reset(); form.style.opacity = ''; form.style.pointerEvents = '';
          formSuccess.classList.remove('show');
          btnText.textContent = 'Send Message'; submitBtn.disabled = false;
        }, 4000);
      }, 900);
    });
  }

  // ======== FOOTER ========
  document.getElementById('yr').textContent = new Date().getFullYear();
  document.getElementById('backTop').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // ======== MASCOT ========
  const mascot = document.getElementById('mascot');
  if (!mascot) return;

  let mX = 80, mY = window.innerHeight - 120;
  let targetX = mX, targetY = mY;
  let velX = 0, velY = 0;
  let followCursor = false;
  let followTimer = null;
  let wanderTimer = null;
  let facingRight = true;
  const bubble = mascot.querySelector('.mascot-bubble');
  const bubbleMsgs = ['Hi! 👋', 'What\'s up?', 'Cool portfolio!', 'Let\'s build! 🚀', 'Need a dev? 😄', '< / >', 'AI is cool! 🤖'];
  let bubbleTimeout = null;

  function setMascotPos() {
    mascot.style.left = mX + 'px';
    mascot.style.top = mY + 'px';
  }
  setMascotPos();

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function scheduleWander() {
    clearTimeout(wanderTimer);
    wanderTimer = setTimeout(() => {
      if (!followCursor) pickNewTarget();
    }, 1500 + Math.random() * 3000);
  }

  function pickNewTarget() {
    const pad = 60;
    targetX = clamp(Math.random() * window.innerWidth, pad, window.innerWidth - pad);
    targetY = clamp(Math.random() * window.innerHeight, pad, window.innerHeight - pad);
    scheduleWander();
  }

  // Start wandering
  pickNewTarget();

  // Cursor following: random chance every 5-12s
  function maybeFolowCursor() {
    setTimeout(() => {
      followCursor = true;
      clearTimeout(followTimer);
      followTimer = setTimeout(() => {
        followCursor = false;
        pickNewTarget();
        maybeFolowCursor();
      }, 2500 + Math.random() * 3000);
    }, 5000 + Math.random() * 7000);
  }
  maybeFolowCursor();

  document.addEventListener('mousemove', e => {
    if (followCursor) { targetX = e.clientX - 20; targetY = e.clientY - 60; }
  });

  // Animate mascot
  (function animMascot() {
    const dx = targetX - mX;
    const dy = targetY - mY;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 2) {
      const speed = followCursor ? 0.12 : 0.05;
      velX += dx * speed; velY += dy * speed;
      velX *= 0.78; velY *= 0.78;
      mX += velX; mY += velY;
      // Clamp to viewport
      mX = clamp(mX, 10, window.innerWidth - 70);
      mY = clamp(mY, 10, window.innerHeight - 90);
    }

    // Flip direction
    if (velX > 0.5 && !facingRight) {
      facingRight = true;
      mascot.querySelector('.mascot-sprite').style.transform = 'scaleX(1)';
    } else if (velX < -0.5 && facingRight) {
      facingRight = false;
      mascot.querySelector('.mascot-sprite').style.transform = 'scaleX(-1)';
    }

    setMascotPos();
    requestAnimationFrame(animMascot);
  })();

  // Click mascot — show random bubble
  mascot.querySelector('.mascot-sprite').addEventListener('click', () => {
    const msg = bubbleMsgs[Math.floor(Math.random() * bubbleMsgs.length)];
    bubble.textContent = msg;
    bubble.classList.add('show');
    clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => bubble.classList.remove('show'), 2200);
  });

  // Resize update
  window.addEventListener('resize', () => {
    mX = clamp(mX, 10, window.innerWidth - 70);
    mY = clamp(mY, 10, window.innerHeight - 90);
    setMascotPos();
  });

})();
