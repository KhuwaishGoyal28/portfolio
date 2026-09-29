/* Virtual Showroom — a 3D hall with one "cinema room" per project.
   The camera flies room to room as you scroll; a live demo plays on each screen. */
(() => {
  const sec = document.getElementById('showroom');
  if (!sec || typeof THREE === 'undefined') { sec && (sec.hidden = true); return; }
  const $ = (s, c = sec) => c.querySelector(s);
  const cv = $('#sr-gl'), stage = $('.sr-stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { sec.hidden = true; return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth < 820;
  const GH = 'https://github.com/KhuwaishGoyal28/';

  const ROOMS = [
    { title: 'Trophy Hall', tag: 'Room 0 · Awards', badge: '3× First place', accent: 0xffb454, mode: 'reel',
      desc: 'Six podiums and finals across IEEE, Jain University, Salesforce, Honeywell and Rakuten. Every project in the next rooms comes from this journey.',
      trophies: true },
    { title: 'NayiPehal', tag: 'Room 1 · Android → Web', badge: '🏆 1st · IEEE Rapid Innovation 2024', accent: 0xffb454,
      desc: 'Education, jobs, mentors and community in one app for underserved communities. Sign in, take a course, book a mentor.',
      demo: 'https://nayipehal-web.vercel.app', src: GH + 'NayiPehal', trophy: true },
    { title: 'FitForce', tag: 'Room 2 · Android → Web', badge: '★ Top Team · Salesforce Study Jam 2024', accent: 0xff7a7a,
      desc: 'A wellness app for working professionals: steps, workouts, meals, paired devices and a health-only chatbot.',
      demo: 'https://fitforce-web.vercel.app', src: GH + 'FITFORCE', trophy: true },
    { title: 'EvalPro', tag: 'Room 3 · AI · Live product', badge: '● Live · FastAPI + OCR', accent: 0x5eead4,
      desc: 'Upload a handwritten answer sheet and get OCR text, a 50-point rubric and an annotated, teacher-style checked paper.',
      demo: 'https://ai-exam-evaluator-nine.vercel.app', src: GH + 'ai-exam-evaluator' },
    { title: 'IntelliHire', tag: 'Room 4 · Android → Web', badge: 'Quizzes + voice interview', accent: 0x8b9cff,
      desc: 'Aptitude, logic and technical quizzes plus a spoken interview coach with a scored report.',
      demo: 'https://intellihire-web.vercel.app', src: GH + 'IntelliHire' },
    { title: 'Gyaankosh', tag: 'Room 5 · Android → Web', badge: '8 topics · ~470 questions', accent: 0xffd166,
      desc: 'A timed quiz app across Java, Python, C, C++, MySQL and more, with a profile and leaderboard.',
      demo: 'https://gyaankosh-web.vercel.app', src: GH + 'GayanKhosh' },
    { title: 'ATS Resume Matcher', tag: 'Room 6 · NLP', badge: 'TF-IDF + keyword scoring', accent: 0x5eead4,
      desc: 'Drop in a resume and a job description; get a match score and the skills you are missing. Runs fully in your browser.',
      demo: 'https://ats-resume-matcher-nu.vercel.app', src: GH + 'ATS-RESUME-MATCHER' },
    { title: 'Gemini Chatbot', tag: 'Room 7 · Flutter', badge: 'Flutter web build', accent: 0xb58cff,
      desc: 'A Flutter chatbot with voice input and speech output, built for the web from the original Dart code.',
      demo: 'https://flutter-gemini-chatbot-web.vercel.app', src: GH + 'flutter_gemini_chatbot' }
  ];
  const AWARDS = [
    ['1st', 'IEEE Rapid Innovation Challenge', 'Education & jobs app · 2024'],
    ['1st', 'IEEE Sustainable Solutions for Humanity', 'AI-driven farmers app · 2024'],
    ['1st', 'Code Relay · Jain University', 'Fraud detection + shortest path'],
    ['Top', 'Salesforce Study Jam', 'FitForce wellness app · 2024'],
    ['8th', 'Honeywell Hackathon', 'Dynamic building evacuation'],
    ['Final', 'Rakuten Hackathon', 'ABEA · AI e-commerce']
  ];
  const N = ROOMS.length, S = 28, HALL_W = 16, H = 8;
  const hex = n => '#' + n.toString(16).padStart(6, '0');
  const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const sgnOf = i => (i % 2 === 0 ? 1 : -1);          // which wall the screen is on
  const roomZ = i => -i * S;

  /* ---------- scene ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080d);
  scene.fog = new THREE.FogExp2(0x07080d, .024);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  const cam = new THREE.PerspectiveCamera(55, 1, .1, 200);
  scene.add(new THREE.AmbientLight(0x8890b0, .5));

  const zFront = 16, zBack = roomZ(N - 1) - S / 2 - 6, L = zFront - zBack, zMid = (zFront + zBack) / 2;
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .8, metalness: .1 }, o));

  // floor: glossy, so the accent lights streak across it
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, L), mat(0x0c0e15, { roughness: .16, metalness: .55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zMid); scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, L), mat(0x08090e));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, zMid); scene.add(ceil);
  [-1, 1].forEach(s => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(L, H), mat(0x10121b, { roughness: .7 }));
    w.rotation.y = -s * Math.PI / 2; w.position.set(s * HALL_W / 2, H / 2, zMid); scene.add(w);
  });
  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, H), mat(0x0d0f17));
  endWall.position.set(0, H / 2, zBack); scene.add(endWall);
  const startWall = endWall.clone(); startWall.position.z = zFront; startWall.rotation.y = Math.PI; scene.add(startWall);

  // wall ribs (depth)
  const ribGeo = new THREE.BoxGeometry(.5, H, .35), ribMat = mat(0x171a26, { roughness: .6 });
  for (let z = zFront - 2; z > zBack; z -= 4) [-1, 1].forEach(s => {
    const r = new THREE.Mesh(ribGeo, ribMat); r.position.set(s * (HALL_W / 2 - .25), H / 2, z); scene.add(r);
  });
  // floor guide lines
  [-1.4, 1.4].forEach(x => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(.06, L), new THREE.MeshBasicMaterial({ color: 0x2b3146 }));
    l.rotation.x = -Math.PI / 2; l.position.set(x, .01, zMid); scene.add(l);
  });

  /* ---------- helpers ---------- */
  function poster(r) {
    const c = document.createElement('canvas'); c.width = 1280; c.height = 720;
    const g = c.getContext('2d'), col = hex(r.accent);
    const gr = g.createLinearGradient(0, 0, 1280, 720); gr.addColorStop(0, '#0a0c12'); gr.addColorStop(1, col + '66');
    g.fillStyle = gr; g.fillRect(0, 0, 1280, 720);
    g.strokeStyle = col + '33'; g.lineWidth = 1;
    for (let x = 0; x < 1280; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 720); g.stroke(); }
    for (let y = 0; y < 720; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(1280, y); g.stroke(); }
    g.fillStyle = col; g.font = '500 30px monospace'; g.fillText(r.tag.toUpperCase(), 80, 120);
    g.fillStyle = '#ece9e1'; g.font = 'italic 600 118px Georgia, serif';
    const words = r.title.split(' '); let line = '', y = 300;
    words.forEach(w => { const t = line + w + ' '; if (g.measureText(t).width > 1080 && line) { g.fillText(line, 80, y); line = w + ' '; y += 130; } else line = t; });
    g.fillText(line, 80, y);
    g.fillStyle = '#8b90a0'; g.font = '400 34px sans-serif'; g.fillText(r.badge.replace(/[🏆★●]/g, '').trim(), 80, y + 90);
    g.fillStyle = col; g.beginPath(); g.arc(1100, 560, 58, 0, 7); g.fill();
    g.fillStyle = '#0a0c12'; g.beginPath(); g.moveTo(1084, 530); g.lineTo(1084, 590); g.lineTo(1136, 560); g.fill();
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  function makeTrophy(m) {
    const g = new THREE.Group();
    const prof = [[0, 0], [.95, 0], [.95, .16], [.6, .26], [.2, .4], [.16, .5], [.16, 1.05], [.45, 1.25], [.5, 1.4], [.95, 1.75], [1.18, 2.5], [1.16, 2.9], [1.04, 2.9], [1.02, 2.5], [.82, 1.9], [.3, 1.6], [0, 1.55]].map(p => new THREE.Vector2(p[0], p[1]));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), m));
    [-1, 1].forEach(s => { const h = new THREE.Mesh(new THREE.TorusGeometry(.5, .07, 12, 24, Math.PI), m); h.position.set(s * 1.13, 2.2, 0); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(h); });
    return g;
  }
  const goldMat = mat(0xffb454, { metalness: .92, roughness: .2, emissive: 0x2a1400, side: THREE.DoubleSide });
  const spin = [];   // things that rotate
  const beams = [];

  /* ---------- rooms ---------- */
  ROOMS.forEach((r, i) => {
    const sgn = sgnOf(i), z = roomZ(i), col = r.accent;
    // accent ceiling strips + wall light lines
    [-1, 1].forEach(s => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(.14, .06, S - 4), new THREE.MeshBasicMaterial({ color: col }));
      strip.position.set(s * 5.2, H - .1, z); scene.add(strip);
      const line = new THREE.Mesh(new THREE.BoxGeometry(.05, .08, S - 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8 }));
      line.position.set(s * (HALL_W / 2 - .05), 1.2, z); scene.add(line);
    });
    // arch between rooms
    const az = z - S / 2;
    const archMat = new THREE.MeshBasicMaterial({ color: col });
    [-1, 1].forEach(s => { const c = new THREE.Mesh(new THREE.BoxGeometry(.18, H, .18), archMat); c.position.set(s * (HALL_W / 2 - .3), H / 2, az); scene.add(c); });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(HALL_W - .5, .18, .18), archMat); beam.position.set(0, H - .3, az); scene.add(beam);

    // light: colored pool in front of the screen
    const pl = new THREE.PointLight(col, 1.7, 34, 1.6); pl.position.set(sgn * 3.2, 5.2, z); scene.add(pl);
    const spot = new THREE.PointLight(0xffffff, .5, 22, 2); spot.position.set(-sgn * 3, 6.5, z); scene.add(spot);

    // cinema screen on the side wall
    const grp = new THREE.Group(); grp.position.set(sgn * (HALL_W / 2 - .45), 3.1, z); grp.rotation.y = -sgn * Math.PI / 2; scene.add(grp);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(10.3, 6, .3), mat(0x050506, { metalness: .8, roughness: .25 })); grp.add(frame);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 5.4), new THREE.MeshBasicMaterial({ map: poster(r) })); screen.position.z = .17; grp.add(screen);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(13, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .13, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.z = .12; grp.add(glow);
    // curtains
    [-1, 1].forEach(s => { const cu = new THREE.Mesh(new THREE.BoxGeometry(.9, 6.4, .5), mat(0x4a0f18, { roughness: .9 })); cu.position.set(s * 5.5, 0, .1); grp.add(cu); });
    // projector light cone
    const cone = new THREE.Mesh(new THREE.ConeGeometry(4.6, 15, 24, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    cone.position.set(-sgn * 1.5, H - 6.2, z); cone.rotation.z = sgn * (Math.PI / 2 + .35); scene.add(cone); beams.push(cone);

    // seats facing the screen
    const seatMat = mat(0x3a1017, { roughness: .55 });
    [3.0, 4.6].forEach((sx, row) => {
      for (let k = -3; k <= 3; k++) {
        if (k === 0) continue;                          // aisle
        const sz = z + k * 1.35;
        const base = new THREE.Mesh(new THREE.BoxGeometry(.95, .5, .95), seatMat); base.position.set(sgn * sx, .45 + row * .18, sz);
        const back = new THREE.Mesh(new THREE.BoxGeometry(.18, .95, .95), seatMat); back.position.set(sgn * sx - sgn * .42, 1.0 + row * .18, sz);
        scene.add(base, back);
      }
    });
    // pedestals flanking the screen
    [-1, 1].forEach((s, pi) => {
      const p = new THREE.Group(); p.position.set(sgn * (HALL_W / 2 - 1.4), 0, z + s * 6.3);
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(.62, .75, 1.1, 24), mat(0x161925, { metalness: .6, roughness: .3 })); ped.position.y = .55; p.add(ped);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.63, .03, 8, 32), new THREE.MeshBasicMaterial({ color: col })); rim.rotation.x = Math.PI / 2; rim.position.y = 1.1; p.add(rim);
      let obj;
      if ((r.trophy || r.trophies) && pi === 0) { obj = makeTrophy(goldMat); obj.scale.setScalar(.32); obj.position.y = 1.15; }
      else { obj = new THREE.Mesh(pi ? new THREE.OctahedronGeometry(.5) : new THREE.IcosahedronGeometry(.5), new THREE.MeshBasicMaterial({ color: col, wireframe: true })); obj.position.y = 1.9; }
      p.add(obj); spin.push(obj); scene.add(p);
    });
  });

  // dust
  const D = 500, dp = new Float32Array(D * 3);
  for (let i = 0; i < D; i++) { dp[i * 3] = (Math.random() - .5) * (HALL_W - 1); dp[i * 3 + 1] = Math.random() * H; dp[i * 3 + 2] = zBack + Math.random() * L; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffe2b0, size: .05, transparent: true, opacity: .55, depthWrite: false }));
  scene.add(dust);

  /* ---------- HUD / cinema DOM ---------- */
  const cinema = $('#cinema'), frameEl = $('#sr-frame'), poster2 = $('#sr-poster'), reel = $('#sr-reel'), interact = $('#sr-interact');
  const hud = { tag: $('#hud-tag'), title: $('#hud-title'), badge: $('#hud-badge'), desc: $('#hud-desc'), live: $('#hud-live'), src: $('#hud-src'), count: $('#hud-count') };
  const dots = $('#sr-dots');
  dots.innerHTML = ROOMS.map((r, i) => `<li><button aria-label="Go to ${r.title}" data-i="${i}"></button></li>`).join('');
  const dotBtns = [...dots.querySelectorAll('button')];
  dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) goTo(+b.dataset.i); });
  function goTo(i) {
    const total = sec.offsetHeight - innerHeight;
    scrollTo({ top: sec.offsetTop + (i / (N - 1)) * total, behavior: reduce ? 'auto' : 'smooth' });
  }
  reel.innerHTML = AWARDS.map((a, i) => `<div class="reel-item${i ? '' : ' on'}"><b>${a[0]}</b><h3>${a[1]}</h3><p>${a[2]}</p></div>`).join('');
  let reelI = 0;
  setInterval(() => { const items = reel.children; if (!items.length) return; items[reelI].classList.remove('on'); reelI = (reelI + 1) % items.length; items[reelI].classList.add('on'); }, 2600);

  let curRoom = -1, loadTimer = 0;
  function setHUD(i) {
    const r = ROOMS[i];
    hud.tag.textContent = r.tag; hud.title.textContent = r.title; hud.badge.textContent = r.badge; hud.desc.textContent = r.desc;
    hud.count.textContent = String(i).padStart(2, '0') + ' / ' + String(N - 1).padStart(2, '0');
    hud.live.hidden = !r.demo; hud.src.hidden = !r.src;
    if (r.demo) hud.live.href = r.demo;
    if (r.src) hud.src.href = r.src;
    dotBtns.forEach((b, k) => b.classList.toggle('on', k === i));
    sec.style.setProperty('--accent', hex(r.accent));
    cinema.dataset.mode = r.mode === 'reel' ? 'reel' : 'app';
    poster2.querySelector('h4').textContent = r.title;
    const a = poster2.querySelector('a'); a.href = r.demo || '#'; a.hidden = !r.demo;
  }
  function unload() { clearTimeout(loadTimer); frameEl.classList.remove('ready'); frameEl.removeAttribute('src'); cinema.classList.remove('live'); }
  function scheduleLoad(i) {
    unload();
    const r = ROOMS[i];
    if (!r.demo || small()) return;
    loadTimer = setTimeout(() => { if (curRoom === i) { frameEl.src = r.demo; } }, 700);
  }
  frameEl.addEventListener('load', () => { if (frameEl.getAttribute('src')) frameEl.classList.add('ready'); });
  interact.addEventListener('click', () => { cinema.classList.toggle('live'); interact.textContent = cinema.classList.contains('live') ? 'Scroll mode' : 'Click to interact'; });
  cinema.addEventListener('mouseleave', () => { cinema.classList.remove('live'); interact.textContent = 'Click to interact'; });

  /* ---------- camera choreography ---------- */
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });
  const yawOf = i => -sgnOf(i) * Math.PI / 2;
  const offOf = i => -sgnOf(i) * 2.6;
  function pose(f) {
    const seg = Math.min(N - 2, Math.max(0, Math.floor(f))), u = Math.min(1, f - seg);
    const a = sm((u - .15) / .25), b = sm((u - .6) / .25), m = sm((u - .3) / .5);
    const z = roomZ(seg) + (roomZ(seg + 1) - roomZ(seg)) * m;
    const yaw = yawOf(seg) * (1 - a) + yawOf(seg + 1) * b;
    const x = offOf(seg) * (1 - a) + offOf(seg + 1) * b;
    const opA = 1 - sm((u - .10) / .08), opB = sm((u - .82) / .08);
    return { z, yaw, x, room: opA >= opB ? seg : seg + 1, op: Math.max(opA, opB) };
  }
  let fs = 0, visible = false, running = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!visible) { unload(); curRoom = -1; } }, { threshold: 0 }).observe(sec);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 70 : 55; cam.updateProjectionMatrix();
  }
  layout(); addEventListener('resize', layout);

  const corner = new THREE.Vector3();
  function placeCinema(room) {
    const sgn = sgnOf(room), z = roomZ(room), x = sgn * (HALL_W / 2 - .45 - .18);
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const w = stage.clientWidth, h = stage.clientHeight;
    [[-4.8, -2.7], [4.8, -2.7], [4.8, 2.7], [-4.8, 2.7]].forEach(([dz, dy]) => {
      corner.set(x, 3.1 + dy, z + dz).project(cam);
      const px = (corner.x * .5 + .5) * w, py = (-corner.y * .5 + .5) * h;
      minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    });
    cinema.style.left = minX + 'px'; cinema.style.top = minY + 'px';
    cinema.style.width = (maxX - minX) + 'px'; cinema.style.height = (maxY - minY) + 'px';
  }

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || !running) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    const total = Math.max(1, sec.offsetHeight - innerHeight);
    const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / total));
    fs += (p * (N - 1) - fs) * (reduce ? 1 : .085);
    const ps = pose(fs);
    cam.position.set(ps.x + mouse.x * .5, 2.55 - mouse.y * .25, ps.z);
    cam.rotation.set(-.04, ps.yaw, 0, 'YXZ');
    cam.updateMatrixWorld();
    spin.forEach((o, i) => { o.rotation.y += dt * (.6 + i % 3 * .15); });
    beams.forEach((c, i) => { c.material.opacity = .045 + Math.sin(t * .8 + i) * .012; });
    dust.rotation.y = t * .01;
    if (ps.room !== curRoom && ps.op > .5) { curRoom = ps.room; setHUD(curRoom); scheduleLoad(curRoom); }
    placeCinema(ps.room);
    cinema.style.opacity = ps.op;
    cinema.style.pointerEvents = ps.op > .9 ? 'auto' : 'none';
    stage.classList.toggle('moving', ps.op < .9);
    renderer.render(scene, cam);
  }
  setHUD(0); curRoom = 0;
  frame();
})();
