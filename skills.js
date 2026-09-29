/* Skill cards: symbol, animated level ring, how it was used, and links into project rooms. */
(() => {
  if (!window.KG) return;
  const { SKILLS, PROJECTS, icon } = KG;
  const grid = document.getElementById('sk-grid'), bar = document.getElementById('sk-filters');
  if (!grid) return;
  const usedIn = k => PROJECTS.filter(p => p.stack.includes(k));
  const groups = ['All', ...new Set(Object.values(SKILLS).map(s => s.group))];
  bar.innerHTML = groups.map((g, i) => `<button class="${i ? '' : 'on'}" data-g="${g}">${g}</button>`).join('');

  grid.innerHTML = Object.entries(SKILLS).map(([k, s]) => {
    const used = usedIn(k);
    return `<article class="skc" data-g="${s.group}" style="--c:${s.color}" tabindex="0">
      <div class="skc-top">${icon(k)}<div><h3>${s.name}</h3><small>${s.group}</small></div>
        <svg class="ring" viewBox="0 0 52 52" aria-label="${s.level}% confidence"><circle class="bg" cx="26" cy="26" r="22"/><circle class="fg" cx="26" cy="26" r="22" data-v="${s.level}"/><text x="26" y="27">${s.level}</text></svg></div>
      <p class="how">${s.how}</p>
      ${used.length ? `<div class="used">${used.map(p => `<a href="project.html?p=${p.id}">▶ ${p.title}</a>`).join('')}</div>` : ''}
    </article>`;
  }).join('');

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const fg = e.target.querySelector('.fg');
    fg.style.strokeDashoffset = 138 * (1 - fg.dataset.v / 100);
    io.unobserve(e.target);
  }), { threshold: .3 });
  grid.querySelectorAll('.skc').forEach(c => io.observe(c));

  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    grid.querySelectorAll('.skc').forEach(c => { c.hidden = b.dataset.g !== 'All' && c.dataset.g !== b.dataset.g; });
  });

  // 3D tilt
  if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    grid.addEventListener('pointermove', e => {
      const c = e.target.closest('.skc'); if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
    });
    grid.addEventListener('pointerout', e => { const c = e.target.closest('.skc'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
  }
})();
