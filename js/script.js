(function () {
  'use strict';

  // ---- Loader ----
  const loader = document.getElementById('loader');
  const loaderLabel = document.getElementById('loaderLabel');
  const messages = ['Compiling modules...', 'Loading assets...', 'Initializing AI...', 'Ready.'];
  let mi = 0;

  function cycleMsg() {
    if (mi < messages.length) {
      loaderLabel.textContent = messages[mi++];
      if (mi < messages.length) setTimeout(cycleMsg, 500);
    }
  }
  cycleMsg();

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('gone');
      document.body.style.overflow = '';
    }, 2400);
  });
  document.body.style.overflow = 'hidden';

  // ---- Cursor ----
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let cx = 0, cy = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
  });

  function animateCursor() {
    rx += (cx - rx) * 0.15;
    ry += (cy - ry) * 0.15;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('cursor-hover'); cursorRing.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('cursor-hover'); cursorRing.classList.remove('cursor-hover'); });
  });

  // ---- Scroll bar ----
  const scrollBar = document.getElementById('scrollBar');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    scrollBar.style.width = pct + '%';
  }, { passive: true });

  // ---- Navbar ----
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navList = document.getElementById('navList');
  const navAs = document.querySelectorAll('.nav-a');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navList.classList.toggle('open');
  });

  navAs.forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href[0] === '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        hamburger.classList.remove('open');
        navList.classList.remove('open');
      }
    });
  });

  // Active nav highlight
  const sections = document.querySelectorAll('section[id]');
  function highlightNav() {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    navAs.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  // ---- Hero roles ticker ----
  const roles = document.querySelectorAll('.role');
  let ri = 0;
  function nextRole() {
    const prev = roles[ri];
    ri = (ri + 1) % roles.length;
    const next = roles[ri];
    prev.classList.remove('active');
    prev.classList.add('exit');
    setTimeout(() => { prev.classList.remove('exit'); }, 500);
    next.classList.add('active');
  }
  setInterval(nextRole, 2800);

  // ---- Particle canvas ----
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 70;
  let mouse = { x: null, y: null };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.a = Math.random() * 0.4 + 0.1;
    }
    update() {
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) { this.vx -= (dx / d) * 0.8; this.vy -= (dy / d) * 0.8; }
      }
      this.x += this.vx; this.y += this.vy;
      this.vx *= 0.99; this.vy *= 0.99;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.12 * (1 - d / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('[data-reveal]');
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.getAttribute('data-delay') || 0;
      setTimeout(() => {
        el.classList.add('visible');
        // Animate skill bars inside skill groups
        el.querySelectorAll('.bar-fill[data-w]').forEach(fill => {
          fill.style.width = fill.getAttribute('data-w') + '%';
        });
      }, Number(delay));
      ro.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => ro.observe(el));

  // ---- Counter animation ----
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      let start = 0;
      const dur = 1600;
      const t0 = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => counterObs.observe(el));

  // ---- Contact form ----
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btnText = submitBtn.querySelector('.btn-text');
      btnText.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.opacity = '0';
        form.style.pointerEvents = 'none';
        formSuccess.classList.add('show');
        setTimeout(() => {
          form.reset();
          form.style.opacity = '';
          form.style.pointerEvents = '';
          formSuccess.classList.remove('show');
          btnText.textContent = 'Send Message';
          submitBtn.disabled = false;
        }, 4000);
      }, 900);
    });
  }

  // ---- Footer year ----
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---- Back to top ----
  document.getElementById('backTop').addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
