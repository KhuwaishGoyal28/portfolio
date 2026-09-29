/* 3D skill globe for the Toolbox: logos on a sphere, orbit rings, particles, drag to spin, click to open a skill. */
(() => {
  const host = document.getElementById('sk-globe');
  if (!host || typeof THREE === 'undefined' || !window.KG) { host && host.remove(); return; }
  const { SKILLS } = KG, keys = Object.keys(SKILLS);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { host.remove(); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  host.querySelector('.globe-stage').appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, .1, 100);
  cam.position.set(0, 0, 12);
  const world = new THREE.Group(); scene.add(world);

  // core: glowing wire planet
  world.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 2), new THREE.MeshBasicMaterial({ color: 0x5eead4, wireframe: true, transparent: true, opacity: .18 })));
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: .12 }));
  world.add(core);
  // orbit rings
  const rings = [0xffb454, 0x5eead4, 0x8b9cff].map((c, i) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(4.6 + i * .5, .015, 8, 160), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55 }));
    r.rotation.set(Math.PI / 2 + (i - 1) * .5, i * .7, 0); scene.add(r); return r;
  });
  // particles
  const P = 900, pp = new Float32Array(P * 3);
  for (let i = 0; i < P; i++) { const r = 5.5 + Math.random() * 3, a = Math.random() * 6.28, b = Math.acos(2 * Math.random() - 1); pp[i * 3] = r * Math.sin(b) * Math.cos(a); pp[i * 3 + 1] = r * Math.cos(b); pp[i * 3 + 2] = r * Math.sin(b) * Math.sin(a); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffe2b0, size: .04, transparent: true, opacity: .7 }));
  scene.add(dust);

  // skill sprites on a Fibonacci sphere, joined by constellation lines
  const sprites = [], R = 4, linePts = [];
  const tex = s => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), t = new THREE.CanvasTexture(c);
    const draw = img => {
      g.clearRect(0, 0, 256, 256);
      const gr = g.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, s.color + '66'); gr.addColorStop(1, 'transparent');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#0d1019'; g.strokeStyle = s.color; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 86, 0, 7); g.fill(); g.stroke();
      if (img) g.drawImage(img, 76, 76, 104, 104);
      else { g.fillStyle = s.color; g.font = '700 66px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.glyph, 128, 132); }
      t.needsUpdate = true;
    };
    draw(null);
    if (s.icon) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => draw(im); im.src = s.icon; }
    return t;
  };
  keys.forEach((k, i) => {
    const y = 1 - (i / (keys.length - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.39996;
    const v = new THREE.Vector3(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(SKILLS[k]), transparent: true, depthWrite: false }));
    sp.position.copy(v); sp.scale.setScalar(1.25); sp.userData.k = k; world.add(sp); sprites.push(sp);
    linePts.push(v);
  });
  const lp = [];
  linePts.forEach((a, i) => linePts.forEach((b, j) => { if (j > i && a.distanceTo(b) < 3.3) lp.push(a.x, a.y, a.z, b.x, b.y, b.z); }));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  world.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: .22 })));

  // info panel
  const info = host.querySelector('.globe-info');
  const show = k => {
    const s = SKILLS[k], used = KG.PROJECTS.filter(p => p.stack.includes(k));
    info.style.setProperty('--c', s.color);
    info.innerHTML = `<div class="gi-top">${KG.icon(k)}<div><h3>${s.name}</h3><small>${s.group} · ${s.level}%</small></div></div>
      <div class="gi-bar"><i style="width:${s.level}%"></i></div><p>${s.how}</p>
      ${used.length ? `<div class="used">${used.map(p => `<a href="project.html?p=${p.id}">▶ ${p.title}</a>`).join('')}</div>` : ''}`;
    info.classList.remove('pop'); void info.offsetWidth; info.classList.add('pop');
  };
  show('python');

  // interaction
  let rx = .2, ry = 0, vx = 0, vy = .004, drag = false, lx = 0, ly = 0, moved = 0, hover = null;
  const cv = renderer.domElement, ray = new THREE.Raycaster(), m = new THREE.Vector2();
  cv.addEventListener('pointerdown', e => { drag = true; moved = 0; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    if (drag) { const dx = e.clientX - lx, dy = e.clientY - ly; moved += Math.abs(dx) + Math.abs(dy); vy = dx * .0035; vx = dy * .0035; lx = e.clientX; ly = e.clientY; }
  });
  cv.addEventListener('pointerup', () => {
    drag = false;
    if (moved < 6) { ray.setFromCamera(m, cam); const hit = ray.intersectObjects(sprites)[0]; if (hit) show(hit.object.userData.k); }
  });
  cv.addEventListener('pointerleave', () => { m.set(9, 9); });

  const fit = () => { const w = host.querySelector('.globe-stage').clientWidth, h = Math.min(560, Math.max(380, w * .8)); renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  fit(); addEventListener('resize', fit);
  let vis = true, frames = 0; new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(host);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!vis && frames > 120) return; frames++;
    const t = clock.getElapsedTime();
    if (!drag) { vy += ((reduce ? 0 : .004) - vy) * .02; vx *= .95; }
    ry += vy; rx = Math.max(-1, Math.min(1, rx + vx));
    world.rotation.set(rx, ry, 0);
    rings.forEach((r, i) => { r.rotation.z += .002 * (i + 1); });
    dust.rotation.y = t * .03; core.scale.setScalar(1 + Math.sin(t * 2) * .06);
    ray.setFromCamera(m, cam); const h = ray.intersectObjects(sprites)[0]; hover = h ? h.object : null;
    cv.style.cursor = hover ? 'pointer' : (drag ? 'grabbing' : 'grab');
    sprites.forEach(s => { const target = s === hover ? 1.8 : 1.25; s.scale.setScalar(s.scale.x + (target - s.scale.x) * .15); });
    renderer.render(scene, cam);
  })();
})();
