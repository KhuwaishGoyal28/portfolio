/* Per-project page themes: colours, surface, and an animated background that matches what the project is about.
   fx: circuit | pulse | paper | nodes | code | lens | hands | chart | bubbles | wave */
window.KG_THEMES = {
  evalpro:     { mode: 'dark',  bg: '#071634', bg2: '#0c2250', card: 'rgba(12,34,80,.82)', ink: '#f3f6ff', mute: '#b9c6e6', accent: '#f5d000', accent2: '#5b8cff', fx: 'paper',  curtain: ['#0a1c44', '#12306e'], font: "'Manrope'" },
  nayipehal:   { mode: 'light', bg: '#f6f1e7', bg2: '#ece3d2', card: 'rgba(255,255,255,.86)', ink: '#1f1a14', mute: '#5d5347', accent: '#c2620c', accent2: '#1f7a5a', fx: 'nodes', curtain: ['#7a3d0b', '#9a5316'] },
  fitforce:    { mode: 'light', bg: '#eef0ff', bg2: '#dfe3ff', card: 'rgba(255,255,255,.88)', ink: '#141537', mute: '#4b4f7a', accent: '#3b3fd8', accent2: '#e0457b', fx: 'pulse', curtain: ['#262a9e', '#3438c0'] },
  intellihire: { mode: 'dark',  bg: '#0d0b1f', bg2: '#17133a', card: 'rgba(26,21,62,.82)', ink: '#f2f0ff', mute: '#bdb6e6', accent: '#8b7bff', accent2: '#39d0ff', fx: 'wave',   curtain: ['#1d1650', '#2c2275'] },
  gyaankosh:   { mode: 'dark',  bg: '#101409', bg2: '#1a2110', card: 'rgba(28,36,17,.84)', ink: '#f6f7ee', mute: '#c3c9ad', accent: '#ffd166', accent2: '#8bd450', fx: 'code',   curtain: ['#3a3208', '#57490c'] },
  ats:         { mode: 'dark',  bg: '#0a0c12', bg2: '#12151f', card: 'rgba(18,21,31,.84)', ink: '#ece9e1', mute: '#b4b9c9', accent: '#ffb454', accent2: '#5eead4', fx: 'chart',  curtain: ['#3a260a', '#5a3a10'] },
  luxury:      { mode: 'dark',  bg: '#0c0810', bg2: '#1a1022', card: 'rgba(28,18,36,.84)', ink: '#f7f1ea', mute: '#cbbfd6', accent: '#d8b46a', accent2: '#b98cff', fx: 'lens',   curtain: ['#2a1438', '#3e1d52'] },
  gemini:      { mode: 'dark',  bg: '#0b0a18', bg2: '#15122e', card: 'rgba(24,20,52,.82)', ink: '#f3f0ff', mute: '#c2bbe6', accent: '#a78bfa', accent2: '#60a5fa', fx: 'bubbles', curtain: ['#231a55', '#33277a'] },
  signova:     { mode: 'dark',  bg: '#04161a', bg2: '#08252b', card: 'rgba(8,37,43,.84)', ink: '#eefcfb', mute: '#a9d6d2', accent: '#2dd4bf', accent2: '#fbbf24', fx: 'hands',  curtain: ['#073b3f', '#0b5157'] },
  patient:     { mode: 'light', bg: '#f3f8fb', bg2: '#e2eef5', card: 'rgba(255,255,255,.9)', ink: '#0d2230', mute: '#46606f', accent: '#e11d48', accent2: '#0284c7', fx: 'pulse', curtain: ['#7a0f28', '#9b1433'] },
  lstm:        { mode: 'dark',  bg: '#080d1c', bg2: '#0f1830', card: 'rgba(15,24,48,.84)', ink: '#eef2ff', mute: '#b3bee0', accent: '#818cf8', accent2: '#34d399', fx: 'chart',  curtain: ['#1b2152', '#262e70'] },
  hr:          { mode: 'light', bg: '#fbf8ef', bg2: '#f1ead4', card: 'rgba(255,255,255,.9)', ink: '#221c0b', mute: '#5f563c', accent: '#b8860b', accent2: '#2563eb', fx: 'chart', curtain: ['#6b4f07', '#8a670b'] },
  dashboards:  { mode: 'light', bg: '#fbf8ef', bg2: '#f1ead4', card: 'rgba(255,255,255,.9)', ink: '#221c0b', mute: '#5f563c', accent: '#b8860b', accent2: '#2563eb', fx: 'chart', curtain: ['#6b4f07', '#8a670b'] }
};

/* Animated themed background on a full-page canvas */
window.KG_FX = function (cv, T) {
  const g = cv.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, t = 0, items = [];
  const light = T.mode === 'light';
  const a1 = T.accent, a2 = T.accent2;
  const alpha = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); seed();
  };
  function seed() {
    items = [];
    const n = Math.round(W * H / 22000);
    for (let i = 0; i < n; i++) items.push({ x: rnd(0, W), y: rnd(0, H), v: rnd(.2, 1), s: rnd(.6, 1.6), p: rnd(0, 6.28), c: Math.random() < .5 ? a1 : a2 });
  }
  const draw = {
    circuit() { g.lineWidth = 1.2; items.forEach(o => { g.strokeStyle = alpha(o.c, .25); g.beginPath(); g.moveTo(o.x, o.y); g.lineTo(o.x + 60 * o.s, o.y); g.lineTo(o.x + 60 * o.s, o.y + 40 * o.s); g.stroke(); const k = (t * .01 * o.v + o.p) % 1; g.fillStyle = alpha(o.c, .9); g.beginPath(); g.arc(o.x + 60 * o.s * Math.min(1, k * 2), o.y + (k > .5 ? 40 * o.s * (k - .5) * 2 : 0), 2, 0, 7); g.fill(); }); },
    paper() { // floating answer sheets with tick marks
      items.forEach(o => { o.y -= o.v * .35; if (o.y < -80) o.y = H + 80; const w = 46 * o.s, h = 60 * o.s;
        g.save(); g.translate(o.x, o.y); g.rotate(Math.sin(t * .01 + o.p) * .25);
        g.fillStyle = alpha('#ffffff', .06); g.strokeStyle = alpha(a2, .35); g.lineWidth = 1; g.fillRect(-w / 2, -h / 2, w, h); g.strokeRect(-w / 2, -h / 2, w, h);
        g.strokeStyle = alpha('#ffffff', .18); for (let l = 1; l < 5; l++) { g.beginPath(); g.moveTo(-w / 2 + 6, -h / 2 + l * h / 5); g.lineTo(w / 2 - 12, -h / 2 + l * h / 5); g.stroke(); }
        g.strokeStyle = alpha(a1, .85); g.lineWidth = 2.4; g.beginPath(); g.moveTo(w / 2 - 14, -h / 2 + 10); g.lineTo(w / 2 - 9, -h / 2 + 16); g.lineTo(w / 2 - 1, -h / 2 + 4); g.stroke(); g.restore(); }); },
    nodes() { // community network
      items.forEach(o => { o.x += Math.cos(o.p + t * .003) * .25 * o.v; o.y += Math.sin(o.p + t * .003) * .25 * o.v; });
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], b = items[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 150) { g.strokeStyle = alpha(a1, (1 - d / 150) * .35); g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
      items.forEach(o => { g.fillStyle = alpha(o.c, .75); g.beginPath(); g.arc(o.x, o.y, 3 * o.s, 0, 7); g.fill(); }); },
    pulse() { // ECG heartbeat lines
      for (let r = 0; r < 4; r++) { const y0 = H * (.2 + r * .22); g.strokeStyle = alpha(r % 2 ? a2 : a1, light ? .28 : .4); g.lineWidth = 2; g.beginPath();
        for (let x = 0; x <= W; x += 4) { const ph = (x + t * 3 + r * 200) % 320; let y = 0; if (ph > 120 && ph < 140) y = -(ph - 120) * 3; else if (ph >= 140 && ph < 160) y = -60 + (ph - 140) * 5; else if (ph >= 160 && ph < 175) y = 40 - (ph - 160) * 2.7; g.lineTo(x, y0 + y); }
        g.stroke(); }
      items.forEach(o => { o.y -= o.v * .5; if (o.y < -10) o.y = H + 10; g.fillStyle = alpha(o.c, .35); g.font = `${14 * o.s}px sans-serif`; g.fillText(o.c === a1 ? '♥' : '+', o.x, o.y); }); },
    code() { // falling code tokens
      const tok = ['if', '{ }', 'Q?', 'A', 'B', 'C', '✓', '10s', 'int', 'def', '++', '<>'];
      g.font = '600 14px JetBrains Mono, monospace';
      items.forEach((o, i) => { o.y += o.v * 1.2; if (o.y > H + 20) { o.y = -20; o.x = rnd(0, W); } g.fillStyle = alpha(o.c, .45); g.fillText(tok[i % tok.length], o.x, o.y); }); },
    lens() { // scanning lens + sparkles
      const cx = W * .5 + Math.cos(t * .006) * W * .3, cy = H * .5 + Math.sin(t * .009) * H * .25;
      const gr = g.createRadialGradient(cx, cy, 10, cx, cy, 220); gr.addColorStop(0, alpha(a1, .18)); gr.addColorStop(1, 'transparent'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.strokeStyle = alpha(a1, .45); g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, 110, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - 130, cy); g.lineTo(cx + 130, cy); g.moveTo(cx, cy - 130); g.lineTo(cx, cy + 130); g.stroke();
      items.forEach(o => { const s = (Math.sin(t * .05 * o.v + o.p) + 1) / 2; g.fillStyle = alpha(o.c, s * .8); g.beginPath(); g.moveTo(o.x, o.y - 5 * o.s); g.lineTo(o.x + 1.5, o.y); g.lineTo(o.x, o.y + 5 * o.s); g.lineTo(o.x - 1.5, o.y); g.fill(); }); },
    hands() { // hand landmark skeletons drifting
      const F = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [0, 17]];
      const hand = (x, y, s, rot, c) => { const pts = [[0, 0]]; const base = [[-.9, -.5], [-.35, -1.1], [0, -1.2], [.35, -1.1], [.7, -.9]];
        base.forEach(([bx, by], f) => { for (let k = 1; k <= 4; k++) { const bend = Math.sin(t * .03 + f + x) * .15 * k; pts.push([bx * k * .55 + bend, by * k * .55]); } });
        g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * 40, s * 40); g.strokeStyle = alpha(c, .45); g.lineWidth = .05;
        F.forEach(ch => { g.beginPath(); ch.forEach((i, k) => { const p = pts[i]; k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); });
        g.fillStyle = alpha(c, .85); pts.forEach(p => { g.beginPath(); g.arc(p[0], p[1], .07, 0, 7); g.fill(); }); g.restore(); };
      items.slice(0, 9).forEach(o => { o.y -= o.v * .3; if (o.y < -120) o.y = H + 120; hand(o.x, o.y, o.s, Math.sin(t * .01 + o.p) * .4, o.c); }); },
    chart() { // animated bars + trend line
      const n = 28, bw = W / n; for (let i = 0; i < n; i++) { const h = (Math.sin(i * .6 + t * .02) * .5 + .5) * H * .28 + 20; g.fillStyle = alpha(i % 2 ? a1 : a2, light ? .1 : .12); g.fillRect(i * bw + 4, H - h, bw - 8, h); }
      g.strokeStyle = alpha(a1, .6); g.lineWidth = 2.5; g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = H * .45 + Math.sin(x * .008 + t * .015) * 60 + Math.sin(x * .021 + t * .01) * 25; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      items.forEach(o => { g.fillStyle = alpha(o.c, .35); g.beginPath(); g.arc(o.x, (o.y + t * o.v * .3) % H, 2, 0, 7); g.fill(); }); },
    bubbles() { // chat bubbles rising
      items.forEach(o => { o.y -= o.v * .6; if (o.y < -40) { o.y = H + 40; o.x = rnd(0, W); } const w = 54 * o.s, h = 28 * o.s;
        g.fillStyle = alpha(o.c, .14); g.strokeStyle = alpha(o.c, .5); g.lineWidth = 1.2; g.beginPath(); g.roundRect ? g.roundRect(o.x, o.y, w, h, 12) : g.rect(o.x, o.y, w, h); g.fill(); g.stroke();
        g.fillStyle = alpha(o.c, .8); for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(o.x + w / 2 - 10 + k * 10, o.y + h / 2, 2.2 + Math.sin(t * .1 + k + o.p) * .8, 0, 7); g.fill(); } }); },
    wave() { // voice waveform + orbiting dots
      const mid = H * .5; for (let r = 0; r < 3; r++) { g.strokeStyle = alpha(r ? a2 : a1, .35 - r * .08); g.lineWidth = 2; g.beginPath();
        for (let x = 0; x <= W; x += 6) { const amp = (Math.sin(x * .01 + t * .02) * .5 + .5) * 70 * (1 - r * .25); const y = mid + Math.sin(x * .04 + t * .08 + r) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      items.forEach(o => { g.fillStyle = alpha(o.c, .4); g.beginPath(); g.arc(o.x + Math.cos(t * .01 * o.v + o.p) * 20, o.y + Math.sin(t * .01 * o.v + o.p) * 20, 2, 0, 7); g.fill(); }); }
  };
  const fx = draw[T.fx] || draw.nodes;
  size(); addEventListener('resize', size);
  (function loop() {
    t++;
    g.clearRect(0, 0, W, H);
    fx();
    if (!reduce) requestAnimationFrame(loop);
  })();
};
