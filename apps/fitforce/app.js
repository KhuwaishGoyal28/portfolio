'use strict';
// FitForce web port. All data is local (localStorage). Auth, OTP, and the AI chatbot are LOCAL MOCKS.
const KEY = 'fitforce-web-v1';
const $ = (s, r = document) => r.querySelector(s);
const scr = $('#screen');
const defaults = { user: null, accounts: [], workouts: [], meals: [], points: 7180, chat: [], prefs: { notif: true, dark: false, sync: true }, devices: { 'Apple watch': true, 'Fastrack Wave': false, 'Samsung Galaxy Fit': false, 'Garmin Smart': false } };
let S;
try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = { ...defaults }; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }
const go = h => { location.hash = h; };
const LOGO = '<svg viewBox="0 0 512 512"><path d="M110 210v92M170 170v172M342 170v172M402 210v92M170 256h172" stroke="#3A49DA" stroke-width="40" stroke-linecap="round" fill="none"/></svg>';

const HEALTH = ['Health Condition', 'Excellent', 'Good', 'Average', 'Poor', 'Under Medications'];
const DISAB = ['Disability', 'Visual Impairment', 'Hearing Impairment', 'Speech Impairment', 'Physical Disability', 'Others', 'None'];
const ACTS = ['Screen time', 'Weight', 'Hydration', 'Steps', 'Break', 'Posture'];
const DURS = ['Weekily', 'Monthly', 'Yearly'];
const TOPICS = ['Nutrition', 'Exercise', 'Posture', 'Hydration', 'Stress', 'Anxiety', 'Mental Health', 'Heart Health', 'Gut Health', 'Eye Health', 'Spine', 'Infections', 'Food', 'Weight Loss', 'Weight Gain', 'Skin', 'Hair', 'Dental'];
const MENU = [['Notifications', 'notifications'], ['Help', 'help'], ['Settings', 'settings'], ['About us', 'about'], ['Security', 'security'], ['Manage Devices', 'managedevices'], ['Feed back', 'feedback']];
const opts = (a, sel) => a.map((x, i) => `<option value="${i}" ${x === sel ? 'selected' : ''}>${esc(x)}</option>`).join('');

// ---- chart data (illustrative, per selected activity/duration) ----
function series(act, dur) {
  const n = dur === 0 ? 7 : dur === 1 ? 4 : 12;
  const labels = dur === 0 ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : dur === 1 ? ['W1', 'W2', 'W3', 'W4'] : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const seed = act * 7 + dur * 3;
  return labels.map((l, i) => [l, 30 + ((seed + i * 37 + i * i * 11) % 65)]);
}
function chart(act, dur) { return `<div class="chart">${series(act, dur).map(([l, v]) => `<div style="height:${v}%"><small>${l}</small></div>`).join('')}</div>`; }

// ---- layout helpers ----
function nav(active) {
  const t = [['home', '🏠', 'Home'], ['tracker', '📈', 'Tracker'], ['devices', '⌚', 'Devices'], ['blog', '📰', 'Blog'], ['ai', '🤖', 'AI'], ['profile', '👤', 'Profile']];
  return `<nav>${t.map(([r, i, l]) => `<button class="${r === active ? 'on' : ''}" data-go="${r}"><span>${i}</span>${l}</button>`).join('')}</nav>`;
}
const topbar = (title, back) => `<div class="top">${back ? `<button class="back" data-go="${back}" aria-label="Back">←</button>` : ''}<h3>${esc(title)}</h3><span></span></div>`;
function page(title, body, active, back) { return `${topbar(title, back)}<div class="body">${body}</div>${active ? nav(active) : ''}`; }

// ---- screens ----
const R = {};
R.splash = () => { setTimeout(() => { if (location.hash === '#splash' || !location.hash) go(S.user ? 'home' : 'signin'); }, 1600); return `<div class="center grad"><div class="logo">${LOGO}</div><h1>FITFORCE</h1><p>Empowering Employees to Thrive</p></div>`; };

R.signin = () => `<div class="center grad"><div class="logo">${LOGO}</div><h1>FITFORCE</h1><p>Empowering Employees to Thrive</p>
<h2>Sign In</h2><div class="row" style="width:100%"><button class="btn wh" data-social="Google">Google</button><button class="btn wh" data-social="Apple ID">Apple ID</button></div>
<p style="opacity:.85">or continue with Mail address</p>
<form id="f" style="width:100%"><input name="email" type="email" placeholder="Mail Id" autocomplete="email" required><input name="pw" type="password" placeholder="Password" autocomplete="current-password" required>
<button class="btn wh">Log In</button></form><p>Don’t have an account? <button class="link" data-go="signup1">Sign Up</button></p></div>`;
R.signin.after = () => {
  $('#f').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); const em = f.get('email').trim().toLowerCase();
    const a = S.accounts.find(x => x.email === em && x.pw === f.get('pw'));
    if (!a) { toast('Invalid login (no such local account - sign up first)'); return; }
    S.user = a; save(); go('home'); };
  document.querySelectorAll('[data-social]').forEach(b => b.onclick = () => toast(b.dataset.social + ' sign-in is mocked - use mail address'));
};

R.signup1 = () => `<div class="center grad"><div class="logo">${LOGO}</div><h1>FITFORCE</h1><p>Empowering Employees to Thrive</p><h2>Sign Up</h2>
<form id="f" style="width:100%"><input name="email" type="email" placeholder="Mail Id" required><div class="row"><input name="otp" inputmode="numeric" placeholder="OTP" maxlength="6"><button type="button" id="otpb" class="btn wh" style="margin:6px 0">Get OTP</button></div>
<button class="btn wh">Verify</button></form><p class="mock" style="color:#333">Demo: OTP is mocked, shown in a toast.</p><button class="link" data-go="signin">Back to Sign In</button></div>`;
R.signup1.after = () => {
  let otp = null; const f = $('#f');
  $('#otpb').onclick = () => { if (!f.email.value) return toast('Enter your mail id'); otp = String(Math.floor(1000 + Math.random() * 9000)); toast('Demo OTP: ' + otp); };
  f.onsubmit = e => { e.preventDefault(); if (!otp) return toast('Tap Get OTP first'); if (f.otp.value !== otp) return toast('Wrong OTP');
    sessionStorage.setItem('ff-signup', f.email.value.trim().toLowerCase()); go('signup2'); };
};

R.signup2 = () => `<div class="center grad"><div class="logo">${LOGO}</div><h1>FITFORCE</h1><h2>Sign Up</h2>
<form id="f" style="width:100%"><input value="${esc(sessionStorage.getItem('ff-signup') || '')}" placeholder="Mail Id" readonly><input name="p1" type="password" placeholder="Create Password" minlength="4" required><input name="p2" type="password" placeholder="Confirm Password" required><button class="btn wh">Sign Up</button></form></div>`;
R.signup2.after = () => { $('#f').onsubmit = e => { e.preventDefault(); const f = e.target; if (f.p1.value !== f.p2.value) return toast('Passwords do not match');
  const em = sessionStorage.getItem('ff-signup'); if (!em) return go('signup1');
  S.accounts = S.accounts.filter(a => a.email !== em); S.user = { email: em, pw: f.p1.value, name: em.split('@')[0], age: '', sex: '', marital: '', height: 164, weight: 64, health: 0, disab: 0, topics: [] };
  S.accounts.push(S.user); save(); go('consent'); }; };

R.consent = () => `<div class="center grad"><div class="logo">${LOGO}</div><h2>Consent for health data collection and tracking</h2><p>Your data stays on this device in this web version.</p>
<div class="row" style="width:100%"><button class="btn wh" data-go="check">Cancel</button><button class="btn wh" id="allow">Allow</button></div></div>`;
R.consent.after = () => { $('#allow').onclick = () => go('preference'); };

R.check = () => `<div class="center grad"><h1>We are sorry to see you go</h1><div class="row" style="width:100%"><button class="btn wh" id="leave">Leave</button><button class="btn wh" data-go="consent">Proceed</button></div></div>`;
R.check.after = () => { $('#leave').onclick = () => { S.user = null; save(); go('signin'); }; };

function profileForm(u, ctaLabel) {
  return `<form id="f"><input name="name" placeholder="Name" value="${esc(u.name)}"><div class="row"><input name="age" type="number" min="1" max="120" placeholder="Age" value="${esc(u.age)}"><input name="sex" placeholder="Sex" value="${esc(u.sex)}"></div><input name="marital" placeholder="Marital Status" value="${esc(u.marital)}">
<div class="card"><div class="row spread"><b>Height <span id="hv">${u.height}</span> cm</b></div><input type="range" name="height" min="100" max="220" value="${u.height}" style="padding:0"><div class="row spread"><b>Weight <span id="wv">${u.weight}</span> kg</b></div><input type="range" name="weight" min="30" max="200" value="${u.weight}" style="padding:0"></div>
<select name="health">${opts(HEALTH, HEALTH[u.health])}</select><select name="disab">${opts(DISAB, DISAB[u.disab])}</select>
<h2>Health topics you are interested</h2><div class="chips" id="chips">${TOPICS.map(t => `<button type="button" class="chip ${u.topics.includes(t) ? 'on' : ''}">${t}</button>`).join('')}</div>
<button class="btn" style="margin-top:20px">${ctaLabel}</button></form>`;
}
function profileAfter(cb) {
  const f = $('#f'); f.height.oninput = () => $('#hv').textContent = f.height.value; f.weight.oninput = () => $('#wv').textContent = f.weight.value;
  f.health.onchange = () => f.health.value > 0 && toast('Health Selected: ' + HEALTH[f.health.value]);
  f.disab.onchange = () => f.disab.value > 0 && toast('Disability Selected: ' + DISAB[f.disab.value]);
  document.querySelectorAll('.chip').forEach(c => c.onclick = () => c.classList.toggle('on'));
  f.onsubmit = e => { e.preventDefault(); Object.assign(S.user, { name: f.name.value, age: f.age.value, sex: f.sex.value, marital: f.marital.value, height: +f.height.value, weight: +f.weight.value, health: +f.health.value, disab: +f.disab.value, topics: [...document.querySelectorAll('.chip.on')].map(c => c.textContent) });
    const i = S.accounts.findIndex(a => a.email === S.user.email); if (i >= 0) S.accounts[i] = S.user; save(); cb(); };
}
R.preference = () => { if (!S.user) return R.signin(); return `<div class="top"><h3>Let’s get you started</h3><span></span></div><div class="body">${profileForm(S.user, 'Log In')}</div>`; };
R.preference.after = () => S.user ? profileAfter(() => go('home')) : R.signin.after();

const rewardsCard = () => `<div class="card" data-go="rewards" style="cursor:pointer"><div class="row spread"><b>Rewards ></b><span>${S.points.toLocaleString()}/20,000</span></div><div class="bar" style="margin-top:8px"><i style="width:${Math.min(100, S.points / 200)}%"></i></div></div>`;

R.home = () => {
  if (!S.user) return R.signin();
  const wk = S.workouts.reduce((a, w) => a + w.cal, 0);
  return page('FitForce', `<div class="row spread"><div><h1>Hey ${esc(S.user.name)},</h1><p style="margin:0">Here is how you are doing today</p></div>
<select id="menu" style="width:auto" aria-label="Menu"><option value="">☰</option>${MENU.map(m => `<option value="${m[1]}">${m[0]}</option>`).join('')}</select></div>
${rewardsCard()}
<div class="card"><div class="ring" style="--p:${Math.min(100, 7180 / 200)}"><div>7180<br><small>steps</small></div></div><button class="btn" data-go="tracker">Track</button></div>
<div class="card"><h2 style="margin-top:0">Health Analysis</h2><div class="row"><select id="dur">${opts(DURS, DURS[0])}</select><select id="act">${opts(ACTS, ACTS[0])}</select></div><div id="ch">${chart(0, 0)}</div></div>
<div class="card"><h2 style="margin-top:0">Insights</h2><p>Screen Time Average : 8.2 hours</p><p style="margin:0">Logged workouts burned <b>${wk}</b> kcal · ${S.meals.length} meals tracked.</p></div>
<div class="card" data-go="blog" style="cursor:pointer"><b>Articles ></b></div>`, 'home');
};
R.home.after = () => {
  const d = $('#dur'), a = $('#act'), up = () => $('#ch').innerHTML = chart(+a.value, +d.value); d.onchange = a.onchange = up;
  $('#menu').onchange = e => { if (e.target.value) go(e.target.value); };
};

R.tracker = () => {
  if (!S.user) return R.signin();
  const cal = S.workouts.reduce((a, w) => a + w.cal, 0), min = S.workouts.reduce((a, w) => a + w.dur, 0), mc = S.meals.reduce((a, m) => a + m.cal, 0);
  return page('Tracker', `<div class="card" style="background:var(--lav)">You are 1000 points away from unlocking your next rewards!!!</div>${rewardsCard()}
<div class="card"><div class="ring" style="--p:36"><div>7180<br><small>/ 20,000</small></div></div></div>
<div class="card"><h2 style="margin-top:0">Screen time</h2><div class="row"><select id="dur">${opts(DURS, DURS[0])}</select><select id="act">${opts(ACTS, ACTS[0])}</select></div><div id="ch">${chart(0, 0)}</div></div>
<div class="card"><h2 style="margin-top:0">Health Analysis</h2><p>Workouts: <b>${min} min</b>, <b>${cal} kcal</b> burned<br>Meals: <b>${mc} kcal</b> eaten</p>
<div class="row"><button class="btn" data-go="workouts">Track Workouts</button><button class="btn" data-go="meals">Track Meals</button></div></div>`, 'tracker');
};
R.tracker.after = R.home.after && (() => { const d = $('#dur'), a = $('#act'), up = () => { $('#ch').innerHTML = chart(+a.value, +d.value); d.previousElementSibling; }; d.onchange = a.onchange = up; });

R.workouts = () => page('Workout Tracker', `<form id="f" class="card"><input name="n" placeholder="Workout Name"><input name="d" type="number" min="1" placeholder="Duration (minutes)"><input name="c" type="number" min="0" placeholder="Calories Burned"><button class="btn">Add Workout</button></form>
<div class="card">${S.workouts.length ? S.workouts.map((w, i) => `<div class="item"><div><b>${esc(w.name)}</b><small>Duration: ${w.dur} min · Calories Burned: ${w.cal}</small></div><button class="del" data-del="${i}" aria-label="Delete">✕</button></div>`).join('') : '<p style="margin:0;color:#777">No workouts yet.</p>'}</div>`, null, 'tracker');
R.workouts.after = () => {
  $('#f').onsubmit = e => { e.preventDefault(); const f = e.target; if (!f.n.value || !f.d.value || !f.c.value) return toast('Please fill all fields!');
    S.workouts.push({ name: f.n.value, dur: +f.d.value, cal: +f.c.value }); S.points += 50; save(); toast('Workout Added! +50 points'); route(); };
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.workouts.splice(+b.dataset.del, 1); save(); route(); });
};
R.meals = () => page('Meal Tracker', `<form id="f" class="card"><input name="n" placeholder="Meal Name"><input name="c" type="number" min="0" placeholder="Calories"><button class="btn">Add Meal</button></form>
<div class="card">${S.meals.length ? S.meals.map((m, i) => `<div class="item"><div><b>${esc(m.name)}</b><small>Calories: ${m.cal} kcal</small></div><button class="del" data-del="${i}" aria-label="Delete">✕</button></div>`).join('') : '<p style="margin:0;color:#777">No meals yet.</p>'}</div>`, null, 'tracker');
R.meals.after = () => {
  $('#f').onsubmit = e => { e.preventDefault(); const f = e.target; if (!f.n.value || f.c.value === '') return toast('Failed to Add Meal');
    S.meals.push({ name: f.n.value, cal: +f.c.value }); save(); toast('Meal Added!'); route(); };
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.meals.splice(+b.dataset.del, 1); save(); route(); });
};

R.rewards = () => page('Rewards', `<div class="card" style="text-align:center"><div class="ring" style="--p:${Math.min(100, S.points / 200)}"><div>${S.points.toLocaleString()}<br><small>/ 20,000</small></div></div><p>${Math.max(0, 20000 - S.points).toLocaleString()} points to go. Logging a workout earns 50 points (web demo rule).</p></div>`, null, 'home');

R.devices = () => page('Paired Devices', `<div class="card">${Object.keys(S.devices).map(d => `<div class="item"><div><b>${d}</b><small>${S.devices[d] ? 'Paired' : 'Not paired'}</small></div><label class="sw"><input type="checkbox" data-dev="${d}" ${S.devices[d] ? 'checked' : ''}><b></b></label></div>`).join('')}</div><p class="mock">Mock: no real Bluetooth pairing in the web version.</p>`, 'devices');
R.devices.after = () => document.querySelectorAll('[data-dev]').forEach(c => c.onchange = () => { S.devices[c.dataset.dev] = c.checked; save(); toast(c.dataset.dev + (c.checked ? ' paired' : ' unpaired')); route(); });

R.blog = () => page('Articles', `<div class="card"><h2 style="margin-top:0">Prevention is Better Than Cure</h2><p>The saying "prevention is better than cure" emphasises the importance of proactive measures to avoid problems rather than dealing with their consequences. Maintaining a healthy lifestyle with proper nutrition and exercise reduces the risk of diseases, while regular safety checks prevents accidents. By addressing potential issues before they escalate, we foster a more sustainable and efficient approach to problem-solving, benefiting individuals and society as a whole.</p></div>`, 'blog');

// ---- mock rule-based chatbot (original called Gemini; key intentionally not included) ----
const RULES = [
  [/water|hydrat|drink/, 'Aim for about 2-3 litres of water a day, more when you exercise or it is hot. Keep a bottle at your desk and sip regularly.'],
  [/sleep|insomnia|tired|rest/, 'Adults generally need 7-9 hours of sleep. Keep a regular schedule, avoid screens 1 hour before bed and keep the room cool and dark.'],
  [/posture|back|spine|neck|desk/, 'For desk posture: screen at eye level, feet flat, back supported. Stand and stretch every 30-45 minutes.'],
  [/screen|eye/, 'Follow the 20-20-20 rule: every 20 minutes look at something 20 feet away for 20 seconds. Reduce screen time before bed.'],
  [/stress|anxiety|mental|mood|relax|calm/, 'Try 5 minutes of slow breathing (inhale 4s, exhale 6s), a short walk, and talking to someone you trust. If it persists, please see a professional.'],
  [/lose weight|weight loss|fat|slim/, 'Sustainable weight loss comes from a modest calorie deficit, protein-rich meals, daily walking and strength training. Aim for 0.25-0.5 kg per week.'],
  [/gain|bulk|muscle/, 'To gain weight or muscle: eat in a small calorie surplus, get enough protein, and do progressive strength training 3-4 times a week.'],
  [/workout|exercise|gym|cardio|train|steps|walk|run/, 'A good weekly base: 150 minutes of moderate cardio plus 2 strength sessions. Log your workouts in the Tracker to earn points.'],
  [/diet|food|nutrition|meal|calorie|eat|protein/, 'Build meals around vegetables, lean protein, whole grains and healthy fats. Log meals in the Tracker to see your calories.'],
  [/heart|blood pressure|cholesterol/, 'Heart health: regular cardio, less salt and processed food, no smoking, and regular check-ups.'],
  [/gut|digest|stomach/, 'For gut health eat more fibre, fermented foods like curd, and stay hydrated.'],
  [/skin|hair|dental|teeth/, 'Good skin, hair and dental health starts with balanced nutrition, hydration, sleep, sun protection and brushing twice daily.'],
  [/hello|hi\b|hey|namaste/, 'Hello! I am the FitForce assistant. Ask me about workouts, diet, sleep, hydration, posture or well-being.'],
];
function botReply(q) {
  const s = q.toLowerCase(); for (const [re, r] of RULES) if (re.test(s)) return r;
  return "I'm sorry, but I only provide information about health and fitness.";
}
R.ai = () => `${topbar('AI Chatbot')}<div class="body" id="cb"><div class="mock">Local mock: rule-based health &amp; fitness replies (the Android app called a Gemini API). Off-topic questions are politely declined.</div><div class="chat" id="msgs">${(S.chat.length ? S.chat : [{ r: 'b', t: 'Hi! Ask me anything about health, workouts, diet or well-being.' }]).map(m => `<div class="msg ${m.r === 'u' ? 'u' : 'b'}">${esc(m.t)}</div>`).join('')}</div></div>
<form class="send" id="f"><input name="q" placeholder="Ask a question..." autocomplete="off"><button class="btn">Send</button></form>${nav('ai')}`;
R.ai.after = () => { const b = $('#cb'); b.scrollTop = b.scrollHeight;
  $('#f').onsubmit = e => { e.preventDefault(); const q = e.target.q.value.trim(); if (!q) return; e.target.q.value = '';
    S.chat.push({ r: 'u', t: q }); S.chat.push({ r: 'b', t: botReply(q) }); S.chat = S.chat.slice(-60); save(); route(); }; };

R.profile = () => { if (!S.user) return R.signin(); return page('Profile', `<p style="color:#777;margin-top:0">${esc(S.user.email)}</p>${profileForm(S.user, 'Update Profile')}<button class="btn alt" id="lo">Log out</button>`, 'profile'); };
R.profile.after = () => { if (!S.user) return R.signin.after(); profileAfter(() => toast('Profile Updated!')); $('#lo').onclick = () => { S.user = null; save(); go('signin'); }; };

// ---- menu pages from the dropdown (originals are empty layouts; content here is minimal, generic) ----
R.notifications = () => page('Notifications', `<div class="card"><div class="item"><b>Push notifications</b><label class="sw"><input type="checkbox" id="n" ${S.prefs.notif ? 'checked' : ''}><b></b></label></div></div><div class="card"><p style="margin:0">You are 1000 points away from unlocking your next reward.</p></div>`, null, 'home');
R.notifications.after = () => $('#n').onchange = e => { S.prefs.notif = e.target.checked; save(); };
R.help = () => page('Help', `<div class="card"><p>Use <b>Tracker</b> to log workouts and meals, <b>Devices</b> to manage paired wearables, <b>Blog</b> for articles and <b>AI</b> to chat about health topics.</p></div>`, null, 'home');
R.settings = () => page('Settings', `<div class="card"><div class="item"><b>Sync health data</b><label class="sw"><input type="checkbox" id="s" ${S.prefs.sync ? 'checked' : ''}><b></b></label></div><button class="btn alt" id="reset">Reset local data</button></div>`, null, 'home');
R.settings.after = () => { $('#s').onchange = e => { S.prefs.sync = e.target.checked; save(); }; $('#reset').onclick = () => { if (confirm('Erase all local FitForce data on this device?')) { localStorage.removeItem(KEY); location.hash = ''; location.reload(); } }; };
R.about = () => page('About us', `<div class="card"><h2 style="margin-top:0">FITFORCE</h2><p>Empowering Employees to Thrive. Built by Khuwaish Goyal. Top Team at Salesforce Study Jam 2024. This is the web version of the Android app.</p></div>`, null, 'home');
R.security = () => page('Security', `<div class="card"><p style="margin:0">In this web version, your account and health data live only in this browser (localStorage). Nothing is sent to a server.</p></div>`, null, 'home');
R.managedevices = () => page('Manage Devices', `<div class="card"><p>Manage your paired wearables.</p><button class="btn" data-go="devices">Open Paired Devices</button></div>`, null, 'home');
R.feedback = () => page('Feed back', `<form id="f" class="card"><textarea rows="5" placeholder="Your feedback" required></textarea><button class="btn">Submit</button></form>`, null, 'home');
R.feedback.after = () => $('#f').onsubmit = e => { e.preventDefault(); toast('Thanks! (stored nowhere - demo)'); e.target.reset(); };

// ---- router ----
const PUBLIC = ['splash', 'signin', 'signup1', 'signup2', 'consent', 'check'];
function route() {
  let h = location.hash.slice(1) || 'splash';
  if (!R[h]) h = 'splash';
  if (!S.user && !PUBLIC.includes(h)) h = 'signin';
  scr.innerHTML = R[h]();
  if (R[h].after) R[h].after();
  const b = scr.querySelector('.body'); if (b && h !== 'ai') b.scrollTop = 0;
}
document.addEventListener('click', e => { const t = e.target.closest('[data-go]'); if (t) { e.preventDefault(); go(t.dataset.go); } });
window.addEventListener('hashchange', route);
route();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
