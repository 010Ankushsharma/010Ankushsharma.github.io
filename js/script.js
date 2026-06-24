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
     GITHUB REPOS
     Fetches all public repos, excludes the
     6 featured ones already pinned in HTML,
     sorts by a mix of stars + recency,
     then renders them below the divider.
  ───────────────────────────────────── */
  const GITHUB_USER = '010Ankushsharma';

  // Slugs of the 6 featured repos — excluded from GitHub list to avoid duplicates
  const FEATURED_SLUGS = [
    'Reading-HUb',
    'AutoIntel',
    'kavach_v1',
    'Cafe-e',
    'jobSerach',
    'our_little_space_v1'
  ].map(s => s.toLowerCase());

  // Score formula: stars carry weight, recency decays over time
  function repoScore(repo) {
    const daysSinceUpdate = (Date.now() - new Date(repo.pushed_at)) / 86400000;
    const recencyScore = Math.max(0, 100 - daysSinceUpdate * 0.5);
    return repo.stargazers_count * 10 + recencyScore;
  }

  function langColor(lang) {
    const map = {
      JavaScript: '#f1e05a', Python: '#3572A5', Java: '#b07219',
      Dart: '#00B4AB', HTML: '#e34c26', CSS: '#563d7c',
      TypeScript: '#2b7489', 'C++': '#f34b7d', Shell: '#89e051',
      Kotlin: '#A97BFF', Swift: '#ffac45', Go: '#00ADD8',
    };
    return map[lang] || '#6a6560';
  }

  function buildRepoRow(repo, index) {
    const name        = repo.name;
    const desc        = repo.description || 'No description provided.';
    const url         = repo.html_url;
    const lang        = repo.language || '';
    const stars       = repo.stargazers_count;
    const num         = String(index + 7).padStart(2, '0'); // continues from 06

    const tagsHtml = lang
      ? `<span class="pr-lang" style="border-color:${langColor(lang)}22;color:${langColor(lang)}">${lang}</span>`
      : '';

    const starsHtml = stars > 0
      ? `<span class="pr-stars">★ ${stars}</span>`
      : '';

    const article = document.createElement('article');
    article.className = 'proj-row';
    article.style.animationDelay = `${index * 60}ms`;
    article.innerHTML = `
      <div class="pr-num">${num}</div>
      <div class="pr-info">
        <h3>${name.replace(/-/g, ' ')}</h3>
        <p>${desc}</p>
        <div class="pr-tags">
          ${tagsHtml}
          ${starsHtml}
        </div>
      </div>
      <div class="pr-links">
        <a href="${url}" target="_blank" class="pr-btn">GitHub ↗</a>
      </div>
    `;
    return article;
  }

  async function loadGithubRepos() {
    const list    = document.getElementById('ghRepoList');
    const loading = document.getElementById('ghLoading');
    if (!list) return;

    try {
      // Fetch up to 100 repos (max per page)
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=public`
      );

      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      const repos = await res.json();

      // Filter out featured, forks optional, sort by score
      const filtered = repos
        .filter(r => !FEATURED_SLUGS.includes(r.name.toLowerCase()))
        .filter(r => !r.fork) // hide forks — remove this line if you want forks shown
        .sort((a, b) => repoScore(b) - repoScore(a));

      // Remove loading indicator
      loading && loading.remove();

      if (filtered.length === 0) {
        list.innerHTML = '<p class="gh-error">No additional repositories found.</p>';
        return;
      }

      // Render rows
      filtered.forEach((repo, i) => {
        const row = buildRepoRow(repo, i);
        list.appendChild(row);
      });

      // Re-observe new rows for cursor hover (custom cursor)
      list.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => cur.classList.add('hover'));
        el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
      });

    } catch (err) {
      loading && loading.remove();
      list.innerHTML = `<p class="gh-error">Could not load repositories. <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" style="color:var(--grey2)">View on GitHub ↗</a></p>`;
      console.warn('GitHub fetch failed:', err);
    }
  }

  loadGithubRepos();

  /* ─────────────────────────────────────
     FOOTER
  ───────────────────────────────────── */
  document.getElementById('yr').textContent = new Date().getFullYear();
  document.getElementById('footerTop').addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
