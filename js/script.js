(function () {
  'use strict';

  /* ─────────────────────────────────────
     LOADER
  ───────────────────────────────────── */
  const loader = document.getElementById('loader');
  const loaderStatus = document.getElementById('loaderStatus');
  const loadMsgs = ['Initializing...', 'Loading assets...', 'Ready.'];
  let lmi = 0;
  const lmTimer = setInterval(() => {
    lmi++;
    if (lmi < loadMsgs.length) loaderStatus.textContent = loadMsgs[lmi];
    else clearInterval(lmTimer);
  }, 500);
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('gone');
      document.body.style.overflow = '';
    }, 1400);
  });
  document.body.style.overflow = 'hidden';

  /* ─────────────────────────────────────
     CURSOR
  ───────────────────────────────────── */
  const cur = document.getElementById('cursor');
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });

  /* ─────────────────────────────────────
     SCROLL BAR
  ───────────────────────────────────── */
  const sb = document.getElementById('scrollBar');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    sb.style.width = pct + '%';
  }, { passive: true });

  /* ─────────────────────────────────────
     NAV
  ───────────────────────────────────── */
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const nls     = document.querySelectorAll('.nl');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  nls.forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href[0] === '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) window.scrollTo({ top: target.offsetTop - 65, behavior: 'smooth' });
        burger.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  });

  // Active section highlight
  const secs = document.querySelectorAll('section[id]');
  const hlNav = () => {
    let current = '';
    secs.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
    nls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', hlNav, { passive: true });
  hlNav();

  /* ─────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────── */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = +(el.getAttribute('data-delay') || 0);
      setTimeout(() => {
        el.classList.add('visible');
        el.querySelectorAll('.bar-f[data-w]').forEach(f => {
          f.style.width = f.getAttribute('data-w') + '%';
        });
      }, delay);
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
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      co.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

  /* ─────────────────────────────────────
     CONTACT FORM
  ───────────────────────────────────── */
  const ctForm  = document.getElementById('ctForm');
  const formOk  = document.getElementById('formOk');
  const fsubmit = document.getElementById('fsubmit');
  if (ctForm) {
    ctForm.addEventListener('submit', e => {
      e.preventDefault();
      fsubmit.querySelector('.ft').textContent = 'Sending...';
      fsubmit.disabled = true;
      setTimeout(() => {
        ctForm.style.opacity = '0';
        ctForm.style.pointerEvents = 'none';
        formOk.classList.add('show');
        setTimeout(() => {
          ctForm.reset();
          ctForm.style.opacity = '';
          ctForm.style.pointerEvents = '';
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
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
