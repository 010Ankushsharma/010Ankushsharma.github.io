/**
 * Developer Portfolio - Main Script
 * Handles: loader, particles, navbar, typing, scroll reveal, progress bar, form, back-to-top
 */

(function () {
  'use strict';

  // ---------- Config ----------
  const TYPING_PHRASES = [
    'Full Stack Developer',
    'AI/ML Enthusiast',
    'Problem Solver',
  ];
  const TYPING_SPEED = 80;
  const TYPING_PAUSE = 2000;
  const LOADER_TYPING = 'Loading portfolio...';
  const LOADER_DURATION = 2800;

  // ---------- DOM Refs ----------
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loaderText');
  const scrollProgress = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const heroTyping = document.getElementById('heroTyping');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const backToTop = document.getElementById('backToTop');
  const particleCanvas = document.getElementById('particleCanvas');
  const themeToggle = document.getElementById('themeToggle');

  // ---------- Dark theme only ----------
  document.documentElement.removeAttribute('data-theme');

  // ---------- Loader: typing + fade out ----------
  function typeWriter(el, text, speed, onComplete) {
    let i = 0;
    el.textContent = '';
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else if (onComplete) {
        onComplete();
      }
    }
    type();
  }

  function initLoader() {
    typeWriter(loaderText, LOADER_TYPING, 50, function () {
      // Wait for bar animation then hide
      setTimeout(function () {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initTyping();
      }, 400);
    });
    setTimeout(function () {
      if (!loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initTyping();
      }
    }, LOADER_DURATION);
  }

  document.body.style.overflow = 'hidden';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  // ---------- Hero typing (cyclic) ----------
  function initTyping() {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    function tick() {
      const current = TYPING_PHRASES[phraseIndex];
      if (isDeleting) {
        heroTyping.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        timeout = charIndex > 0 ? 40 : TYPING_PAUSE;
      } else {
        heroTyping.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        timeout = charIndex < current.length ? TYPING_SPEED : TYPING_PAUSE;
      }
      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % TYPING_PHRASES.length;
      }
      setTimeout(tick, timeout);
    }
    tick();
  }

  // ---------- Particle background ----------
  function initParticles() {
    const ctx = particleCanvas.getContext('2d');
    let width = (particleCanvas.width = window.innerWidth);
    let height = (particleCanvas.height = window.innerHeight);
    const particles = [];
    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
    let mouse = { x: null, y: null, radius: 120 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 2;
            this.y -= (dy / dist) * force * 2;
          }
        }
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = 'rgba(0, 212, 255, ' + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connect() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = 'rgba(0, 212, 255, ' + (0.15 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(function (p) {
        p.update();
        p.draw();
      });
      connect();
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', function () {
      width = particleCanvas.width = window.innerWidth;
      height = particleCanvas.height = window.innerHeight;
      particles.forEach(function (p) {
        p.x = Math.min(p.x, width);
        p.y = Math.min(p.y, height);
      });
    });

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    animate();
  }

  if (particleCanvas) {
    initParticles();
  }

  // ---------- Navbar scroll + mobile ----------
  function onScrollNav() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Smooth scroll to section when nav link is clicked
  navLinkItems.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#' && href.length > 1) {
        var id = href.slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          var offsetTop = target.offsetTop - 80; // Account for fixed navbar
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          navToggle.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // Smooth scroll for any anchor link (e.g. logo, back-to-top)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    if (!anchor.classList.contains('nav-link') && anchor.getAttribute('href') !== '#') {
      anchor.addEventListener('click', function (e) {
        var href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          var id = href.slice(1);
          var target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            var offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          }
        }
      });
    }
  });

  window.addEventListener('scroll', onScrollNav);
  onScrollNav();

  // ---------- Active section highlight ----------
  const sections = document.querySelectorAll('section[id]');
  function setActiveSection() {
    const scrollY = window.scrollY;
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinkItems.forEach(function (l) {
          l.classList.remove('active');
          if (l.getAttribute('href') === '#' + id) l.classList.add('active');
        });
        return;
      }
    });
  }

  window.addEventListener('scroll', setActiveSection);
  setActiveSection();

  // ---------- Scroll progress bar ----------
  function updateScrollProgress() {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = height > 0 ? (winScroll / height) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateScrollProgress);

  // ---------- Reveal on scroll + counter + skill bars ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  const skillFills = document.querySelectorAll('.skill-fill[data-pct]');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('revealed');
        if (el.classList.contains('skill-card')) {
          el.querySelectorAll('.skill-fill[data-pct]').forEach(function (fill) {
            const pct = fill.getAttribute('data-pct');
            fill.style.width = pct + '%';
          });
        }
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Counter animation for stats (in about section we observe the parent)
  const aboutStats = document.querySelector('.about-stats');
  if (aboutStats) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          statValues.forEach(function (stat) {
            animateCounter(stat, parseInt(stat.getAttribute('data-count'), 10));
          });
          statsObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(aboutStats);
  }

  function animateCounter(el, target) {
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  // ---------- Contact form ----------
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // Simulate send
    const btn = contactForm.querySelector('.btn-submit');
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(function () {
      contactForm.reset();
      contactForm.style.opacity = '0';
      contactForm.style.pointerEvents = 'none';
      formSuccess.classList.add('visible');
      btnText.textContent = originalText;
      btn.disabled = false;
      setTimeout(function () {
        formSuccess.classList.remove('visible');
        contactForm.style.opacity = '';
        contactForm.style.pointerEvents = '';
      }, 3000);
    }, 800);
  });

  // ---------- Back to top ----------
  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop);
  toggleBackToTop();

  backToTop.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Footer year ----------
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
