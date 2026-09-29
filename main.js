(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const USER = 'KhuwaishGoyal28';

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- hero: rotating role ---------- */
  const roles = ['Data Science student', 'AI developer', 'Android builder', 'Hackathon winner', 'Backend engineer-in-the-making'];
  const roleEl = $('#role');
  if (!reduce) {
    let ri = 0;
    const type = (text, done) => {
      let i = 0;
      const t = setInterval(() => {
        roleEl.textContent = text.slice(0, ++i);
        if (i >= text.length) { clearInterval(t); done && setTimeout(done, 1800); }
      }, 42);
    };
    const erase = (done) => {
      const t = setInterval(() => {
        roleEl.textContent = roleEl.textContent.slice(0, -1);
        if (!roleEl.textContent.length) { clearInterval(t); done(); }
      }, 22);
    };
    const loop = () => { ri = (ri + 1) % roles.length; erase(() => type(roles[ri], loop)); };
    setTimeout(() => erase(() => type(roles[ri = 1], loop)), 2600);
  }

  /* ---------- hero: constellation canvas ---------- */
  const cv = $('#net'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 }, heroVisible = true;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor(W * H / 15000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
  };
  const draw = () => {
    if (heroVisible) {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.x += dx / d * 1.4; p.y += dy / d * 1.4; }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        ctx.fillStyle = 'rgba(255,180,84,.85)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) { ctx.strokeStyle = `rgba(94,234,212,${(1 - d / 130) * .32})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
    }
    requestAnimationFrame(draw);
  };
  size(); addEventListener('resize', size);
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe(cv);
  if (!reduce) draw(); else { heroVisible = true; }

  /* ---------- cursor glow ---------- */
  const glow = $('.glow');
  addEventListener('pointermove', e => {
    glow.style.opacity = 1;
    glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }, { passive: true });

  /* ---------- word-by-word story text ---------- */
  const splitWords = el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.replace(/\s+/g, ' ').split(/( )/).forEach(tok => {
            if (!tok) return;
            if (tok === ' ') { frag.append(' '); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.w', el);
  };
  $$('[data-split]').forEach(splitWords);

  /* ---------- count-up helper ---------- */
  const countUp = (el, to) => {
    if (reduce || !hasGsap) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) });
  };

  if (!hasGsap) {
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count);
    $$('.story .w').forEach(w => w.style.opacity = 1);
    loadGitHub();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- scroll progress + rail ---------- */
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
  const railLinks = $$('.rail a');
  railLinks.forEach(a => {
    const t = $(a.getAttribute('href'));
    ScrollTrigger.create({
      trigger: t, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => s.isActive && railLinks.forEach(x => x.classList.toggle('on', x === a))
    });
  });

  /* ---------- hero intro ---------- */
  if (!reduce) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.prompt', { opacity: 0, y: 14, duration: .7 })
      .from('.hero-name .inner', { yPercent: 115, duration: 1.2, stagger: .14 }, '-=.3')
      .from('.hero-role, .hero-sub', { opacity: 0, y: 24, duration: .9, stagger: .12 }, '-=.7')
      .from('.hero-cta .btn', { opacity: 0, y: 20, duration: .7, stagger: .08 }, '-=.6')
      .from('.hero-facts li', { opacity: 0, y: 16, duration: .7, stagger: .1 }, '-=.5')
      .add(() => $$('.hero-facts [data-count]').forEach(el => countUp(el, +el.dataset.count)), '-=.6');
    gsap.to('.hero-in', { yPercent: -12, opacity: .1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  } else {
    $$('.hero-facts [data-count]').forEach(el => el.textContent = el.dataset.count);
  }

  /* ---------- reveals ---------- */
  if (!reduce) {
    document.documentElement.classList.add('js');
    const targets = [];
    $$('[data-reveal]').forEach(el => targets.push([el, 0]));
    $$('[data-stagger]').forEach(g => [...g.children].forEach((c, i) => targets.push([c, (i % 6) * .09])));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.classList.add('in');
      setTimeout(() => e.target.classList.remove('rv', 'in'), 1600);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    targets.forEach(([el, d]) => { el.classList.add('rv'); el.style.setProperty('--d', d + 's'); io.observe(el); });
    $$('[data-split]').forEach(p => gsap.to($$('.w', p), { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 48%', scrub: true } }));
    $$('.chap-num').forEach(n => gsap.from(n, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: n, start: 'top bottom', end: 'top 40%', scrub: true } }));
  } else {
    $$('.story .w').forEach(w => w.style.opacity = 1);
  }

  /* ---------- pinned horizontal internships (desktop only) ---------- */
  ScrollTrigger.matchMedia({
    '(min-width: 900px) and (prefers-reduced-motion: no-preference)': () => {
      const wrap = $('.h-wrap'), track = $('.h-track'), bar = $('.h-bar span');
      wrap.classList.add('is-pinned');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true,
          onUpdate: s => bar.style.transform = `scaleX(${s.progress})`
        }
      });
      return () => wrap.classList.remove('is-pinned');
    }
  });

  /* ---------- 3D tilt on cards ---------- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotationY: x * 7, rotationX: -y * 7, transformPerspective: 900, duration: .4, ease: 'power2.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotationX: 0, rotationY: 0, duration: .6, ease: 'power3.out' }));
    });
  }

  /* ---------- smooth anchor offset for fixed nav ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  loadGitHub();

  /* =========================================================
     GitHub live feed
     ========================================================= */
  function loadGitHub() {
    const LANG = { Python: '#3572A5', Java: '#b07219', Dart: '#00B4AB', 'C++': '#f34b7d', 'Jupyter Notebook': '#DA5B0B', JavaScript: '#f1e05a', HTML: '#e34c26', Roff: '#ecdebe', Hack: '#878787' };
    const NOISE = new Set(['test123', 'Test10', 'testingappfluter', '1', 'demo1', 'demo2', 'login3', 'Login2', 'login_page', 'apnatime-test', 'tic_tac', 'python', 'jeevan-joyti', 'authentication_demo', '22btrdc021', 'recipt', 'leavegen', 'bits']);
    const FEATURED = ['ai-exam-evaluator', 'Fake_Luxury_Detection', 'Signova', 'ATS-RESUME-MATCHER', 'MyChatbot', 'AI_Patient_Diagnosis'];
    const box = $('#repos'), filters = $('#filters'), moreBtn = $('#more');
    let all = [], lang = 'All', shown = 12, showNoise = false;

    const ago = d => {
      const days = Math.floor((Date.now() - new Date(d)) / 864e5);
      if (days < 1) return 'today'; if (days < 30) return days + 'd ago';
      if (days < 365) return Math.floor(days / 30) + 'mo ago'; return Math.floor(days / 365) + 'y ago';
    };
    const pretty = n => n.replace(/[-_]+/g, ' ');
    const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const render = () => {
      let list = all.filter(r => (showNoise || !NOISE.has(r.name)) && (lang === 'All' || r.language === lang));
      const rank = r => { const i = FEATURED.indexOf(r.name); return i < 0 ? 99 : i; };
      list.sort((a, b) => rank(a) - rank(b) || new Date(b.pushed_at) - new Date(a.pushed_at));
      const slice = list.slice(0, shown);
      box.innerHTML = slice.map(r => `
        <a class="repo" href="${r.html_url}" target="_blank" rel="noopener" style="--c:${LANG[r.language] || '#666'}">
          <h4>${esc(pretty(r.name))}</h4>
          <p>${esc(r.description) || 'Source code & experiments — open to explore.'}</p>
          <footer><span class="lang">${r.language || 'Misc'}</span>${r.homepage ? '<span class="demo">● live</span>' : ''}<span>${ago(r.pushed_at)}</span></footer>
        </a>`).join('') || '<p class="mono muted">No repositories in this language.</p>';
      moreBtn.hidden = list.length <= shown && showNoise;
      moreBtn.textContent = list.length > shown ? `Show more (${list.length - shown})` : (showNoise ? '' : 'Include experiments & tests');
      if (!reduce && hasGsap) gsap.from(box.children, { opacity: 0, y: 24, duration: .5, stagger: .03, ease: 'power2.out' });
    };
    moreBtn.addEventListener('click', () => {
      const remaining = all.filter(r => (showNoise || !NOISE.has(r.name)) && (lang === 'All' || r.language === lang)).length - shown;
      if (remaining > 0) shown += 12; else showNoise = true;
      render();
    });

    const fail = () => {
      box.innerHTML = '<p class="muted">GitHub is rate-limiting live data right now. <a class="go" style="color:var(--amber)" href="https://github.com/' + USER + '?tab=repositories" target="_blank" rel="noopener">Browse every repository on GitHub ↗</a></p>';
    };

    const cached = (() => { try { return JSON.parse(sessionStorage.getItem('gh-kg')); } catch { return null; } })();
    const go = (user, repos) => {
      all = repos.filter(r => !r.fork);
      const counts = {};
      all.forEach(r => r.language && (counts[r.language] = (counts[r.language] || 0) + 1));
      const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const total = langs.reduce((s, [, n]) => s + n, 0);

      $('#gh-repos').textContent = user.public_repos;
      const heroR = $('#hero-repos'); if (heroR) heroR.dataset.count = user.public_repos;
      $('#gh-langs').textContent = langs.length;
      $('#gh-followers').textContent = user.followers;
      $('#gh-since').textContent = new Date(user.created_at).getFullYear();

      $('#lang-bar').innerHTML = langs.map(([l, n]) => `<i style="width:${n / total * 100}%;background:${LANG[l] || '#666'}" title="${l}: ${n}"></i>`).join('');
      $('#lang-legend').innerHTML = langs.map(([l, n]) => `<li style="--c:${LANG[l] || '#666'}">${l} · ${n}</li>`).join('');
      filters.innerHTML = ['All', ...langs.map(([l]) => l)].map(l => `<button class="${l === 'All' ? 'on' : ''}" data-l="${l}">${l}</button>`).join('');
      filters.onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        lang = b.dataset.l; shown = 12;
        $$('button', filters).forEach(x => x.classList.toggle('on', x === b));
        render();
      };
      render();
      if (hasGsap && !reduce) {
        gsap.from('#lang-bar i', { scaleX: 0, duration: 1.2, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '#lang-bar', start: 'top 90%', once: true } });
        $$('.gh-stats b').forEach(b => { const to = +b.textContent; if (to) ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => countUp(b, to) }); });
      }
      ScrollTrigger && ScrollTrigger.refresh();
    };

    if (cached) return go(cached.user, cached.repos);
    Promise.all([
      fetch(`https://api.github.com/users/${USER}`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`).then(r => r.ok ? r.json() : Promise.reject())
    ]).then(([user, repos]) => {
      try { sessionStorage.setItem('gh-kg', JSON.stringify({ user, repos })); } catch {}
      go(user, repos);
    }).catch(fail);
  }
})();
