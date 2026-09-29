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

  /* ---------- 3D world (three.js) ---------- */
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });
  (function initGL() {
    if (typeof THREE === 'undefined') return;
    const cv = $('#gl');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0c12, .017);
    const cam = new THREE.PerspectiveCamera(55, 1, .1, 320);
    cam.position.set(0, 0, 6);

    scene.add(new THREE.AmbientLight(0xffffff, .55));
    const key = new THREE.DirectionalLight(0xffc27a, 1.5); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0x5eead4, 1.4, 30); rim.position.set(-4, -2, 3); scene.add(rim);

    // starfield tube
    const N = 2600, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - .5) * 90;
      pos[i * 3 + 1] = (Math.random() - .5) * 60;
      pos[i * 3 + 2] = 25 - Math.random() * 160;
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffd9a0, size: .09, transparent: true, opacity: .85, depthWrite: false }));
    scene.add(stars);

    // gold trophy (lathe profile)
    const gold = new THREE.MeshStandardMaterial({ color: 0xffb454, metalness: .92, roughness: .22, emissive: 0x3a1c00, side: THREE.DoubleSide });
    const prof = [[0, 0], [.95, 0], [.95, .16], [.6, .26], [.2, .4], [.16, .5], [.16, 1.05], [.45, 1.25], [.5, 1.4], [.95, 1.75], [1.18, 2.5], [1.16, 2.9], [1.04, 2.9], [1.02, 2.5], [.82, 1.9], [.3, 1.6], [0, 1.55]]
      .map(p => new THREE.Vector2(p[0], p[1]));
    const trophy = new THREE.Group();
    trophy.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 48), gold));
    [-1, 1].forEach(s => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(.5, .07, 14, 28, Math.PI), gold);
      h.position.set(s * 1.13, 2.2, 0); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
      trophy.add(h);
    });
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(.32), new THREE.MeshStandardMaterial({ color: 0x5eead4, emissive: 0x0b5c52, metalness: .6, roughness: .2 }));
    star.position.y = 3.5; trophy.add(star);
    trophy.position.y = -1.6;
    const stage = new THREE.Group(); stage.add(trophy);

    // orbiting award rings
    const orbit = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(.36, .07, 14, 32), gold);
      r.userData = { a: i * Math.PI * 2 / 3, rad: 2.6 };
      stage.add(r); orbit.push(r);
    }
    scene.add(stage);

    // wireframe shapes along the scroll path
    const geos = [() => new THREE.IcosahedronGeometry(1.2, 0), () => new THREE.TorusKnotGeometry(.9, .28, 90, 12), () => new THREE.OctahedronGeometry(1.3), () => new THREE.TorusGeometry(1.2, .08, 8, 48), () => new THREE.DodecahedronGeometry(1.1)];
    const floaters = [];
    for (let i = 0; i < 16; i++) {
      const col = i % 2 ? 0x5eead4 : 0xffb454;
      const m = new THREE.Mesh(geos[i % geos.length](), new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .5 }));
      m.position.set((i % 2 ? 1 : -1) * (3.4 + Math.random() * 3.2), (Math.random() - .5) * 5, -17 - i * 7);
      m.userData = { s: (Math.random() * .4 + .1) * (i % 2 ? 1 : -1) };
      scene.add(m); floaters.push(m);
    }

    let camZ = 6, roll = 0, lastY = scrollY, running = true;
    const layout = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      const wide = w / h > 1.15;
      stage.position.set(wide ? 3.1 : 0, wide ? .2 : 2.7, 0);
      stage.scale.setScalar(wide ? .8 : .45);
    };
    layout();
    addEventListener('resize', () => { layout(); if (reduce) render(0); });
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });

    const clock = new THREE.Clock();
    function render(dt) {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = Math.min(1, scrollY / max);
      camZ += ((6 - p * 126) - camZ) * (reduce ? 1 : .06);
      const vel = scrollY - lastY; lastY = scrollY;
      roll += ((-vel * .0009) - roll) * .08;
      cam.position.x += (mouse.x * 1.6 - cam.position.x) * .05;
      cam.position.y += (-mouse.y * 1.0 - cam.position.y) * .05;
      cam.position.z = camZ;
      cam.rotation.z = roll;
      cam.lookAt(cam.position.x * .4, cam.position.y * .4, camZ - 12);
      const t = clock.elapsedTime;
      trophy.rotation.y += dt * .7;
      star.rotation.y -= dt * 1.4; star.position.y = 3.5 + Math.sin(t * 2) * .12;
      orbit.forEach(r => {
        const u = r.userData; u.a += dt * .8;
        r.position.set(Math.cos(u.a) * u.rad, 1.6 + Math.sin(t * 1.6 + u.a) * .35, Math.sin(u.a) * u.rad);
        r.rotation.x = t + u.a; r.rotation.y = t * .7;
      });
      floaters.forEach(f => { f.rotation.x += dt * f.userData.s; f.rotation.y += dt * f.userData.s * 1.3; });
      stars.rotation.z = t * .01;
      renderer.render(scene, cam);
    }
    if (reduce) { render(0); addEventListener('scroll', () => render(0), { passive: true }); return; }
    (function loop() { requestAnimationFrame(loop); if (running) render(Math.min(clock.getDelta(), .05)); })();
  })();

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
    $$('.trophy, .job:not(.end), .live-grid a, .panel').forEach(e => e.classList.add('tilt'));
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
