/* NayiPehal web port. All data is local (localStorage). No backend, no API keys. */
(function () {
  'use strict';
  var $app = document.getElementById('app');
  var $toast = document.getElementById('toast');
  var FOOT = '<div class="foot-inline">Web version of my Android app NayiPehal &mdash; source: <a href="https://github.com/KhuwaishGoyal28/NayiPehal" target="_blank" rel="noopener">github.com/KhuwaishGoyal28/NayiPehal</a></div>';

  // ---------- storage (replaces SQLite DatabaseHelper) ----------
  var KEY = 'nayipehal.v1';
  var db = load();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  function def(k, v) { if (db[k] === undefined) db[k] = v; }
  def('users', []); def('jobPrefs', []); def('coursePrefs', []); def('finNeeds', []); def('wellPrefs', []);
  def('profile', null); def('bookmarks', {}); def('applied', []); def('progress', {}); def('goal', ''); def('chat', []); def('mentorChat', []); def('sessions', []);
  var draft = { jobs: [], up: [], fin: [], well: [], userType: '' }; // in-memory like UserViewModel/fragment state

  function toast(m) { $toast.textContent = m; $toast.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { $toast.classList.remove('show'); }, 2200); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function go(r) { location.hash = '#/' + r; }

  async function hash(p) {
    try {
      var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('np:' + p));
      return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    } catch (e) { return 'plain:' + p; }
  }

  // ---------- data from the Android code ----------
  var JOBS = [
    { title: 'Software Engineer', company: 'Tech Corp', location: 'New York', description: 'Job description...' },
    { title: 'Product Manager', company: 'Business Inc.', location: 'San Francisco', description: 'Job description...' }
  ];
  var COURSES = [
    { id: '1', title: 'Intro to Digital Marketing', cat: 0 }, { id: '2', title: 'Data Analytics Basics', cat: 0 },
    { id: '3', title: 'Effective Communication', cat: 1 }, { id: '4', title: 'Time Management', cat: 1 }
  ];
  var MENTORS = [
    { name: 'Alice Johnson', expertise: 'Data Science', background: '5 years of experience in Data Analytics' },
    { name: 'Mark Wilson', expertise: 'Mobile Development', background: 'Expert in Android and iOS development' }
  ];
  var MEDITATIONS = [
    { title: 'Morning Meditation', description: 'Start your day with mindfulness.' },
    { title: 'Evening Relaxation', description: 'Unwind with calming techniques.' }
  ];
  var TIPS = ['Breathe deeply for 5 minutes.', 'Take a short walk in nature.'];
  var OPT = {
    jobs: ['Software Engineer', 'Data Scientist', 'Product Manager', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'Mobile Developer', 'UX/UI Designer', 'QA Engineer'],
    up: ['Data Science', 'Web Development', 'Digital Marketing', 'Graphic Design', 'Cyber Security', 'Machine Learning', 'Mobile Development', 'Cloud Computing', 'Project Management'],
    fin: ['Budgeting', 'Savings', 'Debt Management', 'Investing', 'Retirement Planning', 'Financial Literacy', 'Microloans', 'Emergency Fund', 'Tax Planning'],
    well: ['Meditation', 'Mindfulness', 'Yoga', 'Physical Activity', 'Nutrition', 'Stress Management', 'Community Support', 'Therapy', 'Sleep Health']
  };
  var LANGS = ['English', 'Spanish', 'French', 'German', 'Other'];
  var ROLES = ['Job Seeker', 'Mentor', 'Contributor', 'Other'];
  var USER_TYPES = ['I’m looking for job opportunities.', 'I want to improve my skills and knowledge.', 'I’m here for mental wellness and motivation.', 'I’d like to contribute content or mentorship.'];

  // ---------- view helpers ----------
  function bg(n) { return 'style="background-image:linear-gradient(rgba(255,255,255,.28),rgba(255,255,255,.28)),url(img/layout' + n + '.jpg)"'; }
  function bgRaw(n) { return 'style="background-image:url(img/layout' + n + '.jpg)"'; }
  function render(html) { $app.innerHTML = html; var s = $app.querySelector('.screen,.chat'); if (s) s.scrollTop = 0; }
  function bar(title, back) { return '<div class="topbar"><button class="back" data-back aria-label="Back">&#8592;</button><h3>' + esc(title) + '</h3></div>'; }
  function bindCommon() {
    $app.querySelectorAll('[data-back]').forEach(function (b) { b.onclick = function () { if (history.length > 1) history.back(); else go('home'); }; });
    $app.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { go(b.getAttribute('data-go')); }; });
  }
  function chips(list, sel, onchange) {
    $app.querySelectorAll('.chip').forEach(function (c) {
      c.onclick = function () {
        var v = c.textContent.replace(/\s*✓$/, ''), i = sel.indexOf(v);
        if (i >= 0) { sel.splice(i, 1); c.classList.remove('on'); } else { sel.push(v); c.classList.add('on'); }
        c.setAttribute('aria-pressed', c.classList.contains('on'));
      };
    });
  }
  function chipHtml(list, sel) { return '<div class="chips">' + list.map(function (o) { return '<button class="chip' + (sel.indexOf(o) >= 0 ? ' on' : '') + '" aria-pressed="' + (sel.indexOf(o) >= 0) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }
  function session() { return db.session || null; }

  // ---------- screens ----------
  var R = {};

  R.splash = function () {
    render('<section class="screen splash" id="sp"><img src="img/logo.png" alt="NayiPehal - Empowering your path to opportunity"><small>All Rights Reserved</small></section>');
    var t = setTimeout(function () { go('register'); }, 5000);
    document.getElementById('sp').onclick = function () { clearTimeout(t); go('register'); };
    R.splash.stop = function () { clearTimeout(t); };
  };

  function authForm(kind) {
    var reg = kind === 'register';
    render('<section class="screen center" ' + bgRaw(reg ? 13 : 12) + '>' +
      '<h1>' + (reg ? 'Register' : 'Login') + '</h1><p class="sub">NayiPehal &mdash; Empowering your path to opportunity.</p>' +
      '<form id="f" autocomplete="on"><input id="u" placeholder="Username" autocomplete="username" aria-label="Username">' +
      '<input id="p" type="password" placeholder="Password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '" aria-label="Password">' +
      (reg ? '<input id="c" type="password" placeholder="Confirm Password" autocomplete="new-password" aria-label="Confirm Password">' : '') +
      '<button class="btn" type="submit">' + (reg ? 'Register' : 'Login') + '</button></form>' +
      '<button class="btn ghost" data-go="' + (reg ? 'login' : 'register') + '">' + (reg ? 'Login' : 'Register') + '</button>' +
      '<p class="note">Demo mode: accounts are stored only in this browser (no server).</p>' + FOOT + '</section>');
    bindCommon();
    document.getElementById('f').onsubmit = async function (e) {
      e.preventDefault();
      var u = val('u'), p = val('p'), c = reg ? val('c') : '';
      if (reg) {
        if (!u || !p || !c) return toast('Please fill in all fields');
        if (p !== c) return toast('Passwords do not match');
        if (db.users.some(function (x) { return x.u === u; })) return toast('Registration Failed');
        db.users.push({ u: u, h: await hash(p) }); save();
        toast('Registration Successful'); go('login');
      } else {
        if (!u || !p) return toast('Please enter both username and password');
        var h = await hash(p);
        if (db.users.some(function (x) { return x.u === u && x.h === h; })) {
          db.session = u; save(); toast('Login Successful');
          draft = { jobs: [], up: [], fin: [], well: [], userType: '' };
          go('onb/jobs');
        } else toast('Login Failed');
      }
    };
  }
  function val(id) { return document.getElementById(id).value.trim(); }
  R.register = function () { authForm('register'); };
  R.login = function () { authForm('login'); };

  var ONB = {
    jobs: { title: 'Select Your Preferred Tech Job Type', next: 'onb/upskill', key: 'jobs', bgn: 9 },
    upskill: { title: 'Select Your Preferred Upskilling Course', next: 'onb/finance', key: 'up', opt: 'up', bgn: 9 },
    finance: { title: 'Select Your Financial Needs', next: 'onb/wellness', key: 'fin', opt: 'fin', bgn: 3 },
    wellness: { title: 'Select Your Wellness Preferences', next: 'usertype', key: 'well', opt: 'well', bgn: 4 }
  };
  Object.keys(ONB).forEach(function (step) {
    R['onb/' + step] = function () {
      var o = ONB[step], list = OPT[o.opt || 'jobs'], sel = draft[o.key];
      render('<section class="screen" ' + bg(o.bgn) + '><h2 style="margin-top:8px">' + o.title + '</h2><p class="sub">Choose any that apply.</p>' + chipHtml(list, sel) +
        '<div class="row"><button class="btn ghost" id="skip">Skip</button><button class="btn" id="next">Next</button></div>' + FOOT + '</section>');
      chips(list, sel);
      document.getElementById('skip').onclick = function () { go(o.next); };
      document.getElementById('next').onclick = function () {
        if (step === 'upskill' && !sel.length) return toast('Please select at least one course');
        if (step === 'jobs') db.jobPrefs = sel.slice(); if (step === 'upskill') db.coursePrefs = sel.slice();
        if (step === 'finance') db.finNeeds = sel.slice(); if (step === 'wellness') db.wellPrefs = sel.slice();
        save(); go(o.next);
      };
    };
  });

  R.usertype = function () {
    render('<section class="screen" ' + bgRaw(5) + '><div style="height:34%"></div><h1 style="background:rgba(255,255,255,.85);padding:8px 12px;border-radius:12px;align-self:flex-start">Who Are You?</h1><div style="height:10px"></div>' +
      USER_TYPES.map(function (t, i) { return '<label class="radio"><input type="radio" name="ut" value="' + i + '"' + (draft.userType === t ? ' checked' : '') + '><span>' + t + '</span></label>'; }).join('') +
      '<button class="btn" id="go">Continue</button></section>');
    document.getElementById('go').onclick = function () {
      var c = $app.querySelector('input[name=ut]:checked');
      draft.userType = c ? USER_TYPES[+c.value] : ''; db.userType = draft.userType; save();
      go('profile-setup');
    };
  };

  R['profile-setup'] = function () {
    var p = db.profile || {};
    render('<section class="screen center" ' + bg(6) + '><h1>Tell us about you</h1><p class="sub">Basic profile</p>' +
      '<input id="n" placeholder="Enter your name" value="' + esc(p.name) + '" aria-label="Name">' +
      '<label class="l" for="lg">Preferred language</label><select id="lg">' + LANGS.map(function (x) { return '<option' + (p.lang === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select>' +
      '<input id="rg" placeholder="Enter your region" value="' + esc(p.region) + '" aria-label="Region">' +
      '<label class="l" for="rl">Role</label><select id="rl">' + ROLES.map(function (x) { return '<option' + (p.role === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select>' +
      '<input id="in" placeholder="Enter interests (comma-separated)" value="' + esc((p.interests || []).join(', ')) + '" aria-label="Interests">' +
      '<button class="btn" id="go">Continue</button></section>');
    document.getElementById('go').onclick = function () {
      db.profile = { name: val('n'), lang: val('lg'), region: val('rg'), role: val('rl'), interests: val('in').split(',').map(function (s) { return s.trim(); }).filter(Boolean) };
      save(); toast('Profile saved successfully!'); go('permissions');
    };
  };

  R.permissions = function () {
    render('<section class="screen center" ' + bgRaw(7) + '><h1>Make sure to allow all permission</h1><p class="sub">Location and notifications help with nearby services and reminders. You can continue even if you decline.</p>' +
      '<button class="btn mint" id="loc">Allow location</button><button class="btn mint" id="not">Allow notifications</button><button class="btn" id="go">Continue</button></section>');
    document.getElementById('loc').onclick = function () {
      if (!navigator.geolocation) return toast('Location not supported');
      navigator.geolocation.getCurrentPosition(function () { toast('Location allowed'); }, function () { toast('Permission denied'); }, { timeout: 8000 });
    };
    document.getElementById('not').onclick = function () {
      if (!('Notification' in window)) return toast('Notifications not supported');
      Notification.requestPermission().then(function (r) { toast(r === 'granted' ? 'Notifications allowed' : 'Permission denied'); });
    };
    document.getElementById('go').onclick = function () { go('done'); };
  };

  R.done = function () {
    render('<section class="screen center" ' + bgRaw(8) + ' style="text-align:center;background-image:url(img/layout8.jpg)"><h1 style="font-size:32px">You’re All Set!</h1><p class="sub">Your preferences have been saved.</p><button class="btn" id="go">Get Started</button></section>');
    document.getElementById('go').onclick = function () { go('home'); };
  };

  // ---------- main app ----------
  function tabbar(active) {
    return '<nav class="tabbar"><button data-go="home" class="' + (active === 'home' ? 'act' : '') + '">Home</button><button data-go="profile" class="' + (active === 'profile' ? 'act' : '') + '">Profile</button></nav>';
  }
  R.home = function () {
    var T = [['jobs', '💼', 'Job & Gig Finder'], ['upskilling', '🎓', 'Upskilling & Courses'], ['mentorship', '🤝', 'Mentorship'], ['financial', '💰', 'Financial Support'], ['wellness', '🧘', 'Wellness'], ['community', '🏘️', 'Community Marketplace']];
    var name = db.profile && db.profile.name ? ', ' + esc(db.profile.name) : '';
    render('<section class="screen" ' + bgRaw(13) + '><h1 class="home-h">Welcome to Your Dashboard' + name + '</h1><div class="tiles">' +
      T.map(function (t) { return '<button class="tile" data-go="' + t[0] + '"><span>' + t[1] + '</span>' + esc(t[2]) + '</button>'; }).join('') +
      '<button class="tile" data-go="applications"><span>📄</span>Job Applications</button><button class="tile" data-go="progress"><span>📊</span>Course Progress</button></div>' + FOOT + '</section>' +
      '<button class="ask" data-go="bot" aria-label="Ask Me">Ask Me?</button>' + tabbar('home'));
    bindCommon();
  };

  R.jobs = function () {
    render(bar('Job & Gig Finder') + '<section class="screen" ' + bg(10) + '><input id="q" placeholder="Search for jobs..." aria-label="Search jobs"><div id="lst"></div></section>');
    function draw() {
      var q = document.getElementById('q').value.toLowerCase();
      var h = JOBS.map(function (j, i) { return [j, i]; }).filter(function (x) { return (x[0].title + x[0].company + x[0].location).toLowerCase().indexOf(q) >= 0; }).map(function (x) {
        var j = x[0], i = x[1], b = db.bookmarks[i];
        return '<div class="card click" data-job="' + i + '"><div class="row" style="align-items:center"><div><h4>' + esc(j.title) + '</h4><p>' + esc(j.company) + '</p><p>' + esc(j.location) + '</p></div><button class="bm" data-bm="' + i + '" aria-label="Bookmark" style="flex:none">' + (b ? '★' : '☆') + '</button></div></div>';
      }).join('');
      var l = document.getElementById('lst'); l.innerHTML = h || '<p class="empty">No jobs match your search.</p>';
      l.querySelectorAll('[data-job]').forEach(function (c) { c.onclick = function () { go('job/' + c.getAttribute('data-job')); }; });
      l.querySelectorAll('[data-bm]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); var i = b.getAttribute('data-bm'); db.bookmarks[i] = !db.bookmarks[i]; save(); toast(db.bookmarks[i] ? 'Job bookmarked' : 'Bookmark removed'); draw(); }; });
    }
    document.getElementById('q').oninput = draw; draw(); bindCommon();
  };
  R.job = function (i) {
    var j = JOBS[i]; if (!j) return go('jobs');
    render(bar('Job Details') + '<section class="screen" ' + bg(12) + '><h1>' + esc(j.title) + '</h1><h2>' + esc(j.company) + '</h2><p class="sub">' + esc(j.location) + '</p><div class="card"><p>' + esc(j.description) + '</p></div><button class="btn" id="ap">Apply</button></section>');
    document.getElementById('ap').onclick = function () { go('apply/' + i); };
    bindCommon();
  };
  R.apply = function (i) {
    var j = JOBS[i];
    if (j) { var key = j.title + '@' + j.company; if (db.applied.indexOf(key) < 0) { db.applied.push(key); save(); } }
    render(bar('Job Application') + '<section class="screen" ' + bg(12) + '>' + (j ? '<div class="card"><h4>' + esc(j.title) + '</h4><p>' + esc(j.company) + ' &middot; ' + esc(j.location) + '</p><p style="margin-top:8px">' + esc(j.description) + '</p></div><p class="sub">Application submitted (saved locally).</p>' : '<p class="empty">No job selected.</p>') + '</section>');
    bindCommon();
  };
  R.applications = function () {
    var a = db.applied;
    render(bar('Job Applications') + '<section class="screen" ' + bg(12) + '>' + (a.length ? a.map(function (k) { var p = k.split('@'); return '<div class="card"><h4>' + esc(p[0]) + '</h4><p>' + esc(p[1]) + '</p></div>'; }).join('') : '<p class="empty">You have not applied to any jobs yet.</p><button class="btn" data-go="jobs">Find jobs</button>') + '</section>');
    bindCommon();
  };

  R.upskilling = function (tab) {
    tab = +tab || 0;
    render(bar('Upskilling & Courses') + '<div class="tabs"><button class="' + (tab === 0 ? 'act' : '') + '" data-tab="0">Digital Skills</button><button class="' + (tab === 1 ? 'act' : '') + '" data-tab="1">Soft Skills</button></div>' +
      '<section class="screen" ' + bg(9) + '>' + COURSES.filter(function (c) { return c.cat === tab; }).map(function (c) {
        return '<div class="card"><h4>' + esc(c.title) + '</h4><div class="prog"><i style="width:' + (db.progress[c.id] || 0) + '%"></i></div><button class="btn" data-go="course/' + c.id + '">Start/Resume Course</button></div>';
      }).join('') + '</section>');
    $app.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { R.upskilling(b.getAttribute('data-tab')); }; });
    bindCommon();
  };
  R.course = function (id) {
    var c = COURSES.filter(function (x) { return x.id === id; })[0]; if (!c) return go('upskilling');
    function draw() {
      var p = db.progress[id] || 0;
      render(bar('Course Details') + '<section class="screen" ' + bg(9) + '><h1>' + esc(c.title) + '</h1><h2>Course Overview</h2><div class="prog" role="progressbar" aria-valuenow="' + p + '"><i style="width:' + p + '%"></i></div><p class="sub">' + p + '% complete</p>' +
        '<button class="btn mint" id="adv">' + (p >= 100 ? 'Completed' : 'Continue learning (+25%)') + '</button><button class="btn ghost" id="rst">Reset progress</button></section>');
      document.getElementById('adv').onclick = function () { db.progress[id] = Math.min(100, p + 25); save(); draw(); };
      document.getElementById('rst').onclick = function () { db.progress[id] = 0; save(); draw(); };
      bindCommon();
    }
    draw();
  };
  R.progress = function () {
    render(bar('Course Progress') + '<section class="screen" ' + bg(9) + '>' + COURSES.map(function (c) {
      var p = db.progress[c.id] || 0; return '<div class="card click" data-go="course/' + c.id + '"><h4>' + esc(c.title) + '</h4><div class="prog"><i style="width:' + p + '%"></i></div><p>' + p + '%</p></div>';
    }).join('') + '</section>');
    bindCommon();
  };

  R.mentorship = function () {
    render(bar('Mentorship') + '<section class="screen" ' + bg(12) + '>' + MENTORS.map(function (m, i) { return '<div class="card click" data-go="mentor/' + i + '"><h4>' + esc(m.name) + '</h4><p><b>' + esc(m.expertise) + '</b></p><p>' + esc(m.background) + '</p></div>'; }).join('') +
      '<button class="btn" data-go="scheduler">Schedule Session</button><button class="btn ghost" data-go="mchat">Message Mentor</button></section>');
    bindCommon();
  };
  R.mentor = function (i) {
    var m = MENTORS[i]; if (!m) return go('mentorship');
    render(bar('Mentor Profile') + '<section class="screen" ' + bg(12) + '><div class="avatar">' + esc(m.name[0]) + '</div><h1>' + esc(m.name) + '</h1><h2>' + esc(m.expertise) + '</h2><div class="card"><p>' + esc(m.background) + '</p></div><button class="btn" data-go="scheduler">Schedule Session</button></section>');
    bindCommon();
  };
  R.scheduler = function () {
    render(bar('Schedule Session') + '<section class="screen" ' + bg(14) + '><h2>Select Date and Time</h2><label class="l" for="d">Select Date</label><input id="d" type="date"><label class="l" for="t">Select Time</label><input id="t" type="time">' +
      '<p class="sub" id="sel">Selected Date and Time: </p><button class="btn" id="ok">Confirm Appointment</button>' +
      (db.sessions.length ? '<h2 style="margin-top:18px">Scheduled</h2>' + db.sessions.map(function (s) { return '<div class="card"><p>' + esc(s) + '</p></div>'; }).join('') : '') + '</section>');
    var d = document.getElementById('d'), t = document.getElementById('t');
    function up() { document.getElementById('sel').textContent = 'Selected Date and Time: ' + (d.value ? new Date(d.value + 'T' + (t.value || '00:00')).toString().slice(0, 21) : ''); }
    d.oninput = t.oninput = up;
    document.getElementById('ok').onclick = function () {
      if (!d.value || !t.value) return toast('Select a date and time');
      db.sessions.push(d.value + ' ' + t.value); save(); toast('Session Scheduled!'); history.back();
    };
    bindCommon();
  };
  R.mchat = function () {
    render(bar('Chat with Mentor') + '<div class="chat" id="ch" ' + bgRaw(11) + '></div><form class="composer" id="f"><input id="m" placeholder="Type a message" aria-label="Message"><button class="btn" type="submit">Send</button></form>');
    var box = document.getElementById('ch');
    function draw() { box.innerHTML = db.mentorChat.map(function (m) { return '<div class="msg ' + (m.me ? 'me' : 'bot') + '">' + esc(m.t) + '</div>'; }).join('') || '<p class="empty">Say hello to your mentor.</p>'; box.scrollTop = box.scrollHeight; }
    draw();
    document.getElementById('f').onsubmit = function (e) {
      e.preventDefault(); var i = document.getElementById('m'), t = i.value.trim(); if (!t) return;
      db.mentorChat.push({ me: true, t: t }); i.value = ''; save(); draw();
      setTimeout(function () { db.mentorChat.push({ me: false, t: 'Thank you for reaching out. How can I help?' }); save(); draw(); }, 700);
    };
    bindCommon();
  };

  R.financial = function () {
    render(bar('Financial Support') + '<section class="screen" ' + bg(3) + '><h1>Financial Literacy & Support</h1>' +
      '<div class="card"><h4>Budgeting Tool</h4><input id="g" type="number" min="0" placeholder="Enter financial goal" value="' + esc(db.goal) + '"><button class="btn" id="sv">Save Goal</button></div>' +
      '<div class="card click" id="tip"><h4>Financial Tips</h4><p>Check out our financial tips</p></div>' +
      '<div class="card"><h4>Microloan Access</h4><button class="btn mint" id="ml">Apply for a Microloan</button></div></section>');
    document.getElementById('sv').onclick = function () { var g = val('g'); if (!g) return toast('Please enter a valid goal.'); db.goal = g; save(); toast('Goal saved: $' + g); };
    document.getElementById('tip').onclick = function () { toast('Opening financial tips...'); };
    document.getElementById('ml').onclick = function () { toast('Opening microloan options...'); };
    bindCommon();
  };

  R.wellness = function () {
    render(bar('Wellness') + '<section class="screen" ' + bg(4) + '><h1>Meditation Hub</h1>' + MEDITATIONS.map(function (s, i) { return '<div class="card click" data-go="session/' + i + '"><h4>' + esc(s.title) + '</h4><p>' + esc(s.description) + '</p></div>'; }).join('') +
      '<h2 style="margin-top:8px">Daily Motivation & Streak Counter</h2><div class="streak">Stay motivated! You are on a 5-day streak!</div><h2>Mindfulness Tips</h2>' + TIPS.map(function (t) { return '<div class="card"><p>' + esc(t) + '</p></div>'; }).join('') + '</section>');
    bindCommon();
  };
  var timer;
  R.session = function (i) {
    var s = MEDITATIONS[i]; if (!s) return go('wellness');
    render(bar('Session') + '<section class="screen" ' + bg(4) + '><h1>' + esc(s.title) + '</h1><p class="sub">' + esc(s.description) + '</p><div class="card" style="text-align:center"><div style="font-size:44px;font-weight:700" id="tm">05:00</div><button class="btn mint" id="st">Start</button></div></section>');
    var left = 300; clearInterval(timer);
    document.getElementById('st').onclick = function () {
      clearInterval(timer); left = 300;
      timer = setInterval(function () { left--; var el = document.getElementById('tm'); if (!el) return clearInterval(timer); el.textContent = ('0' + Math.floor(left / 60)).slice(-2) + ':' + ('0' + left % 60).slice(-2); if (left <= 0) { clearInterval(timer); toast('Session complete'); } }, 1000);
    };
    bindCommon();
  };

  R.community = function (tab) {
    tab = +tab || 0; var names = ['Marketplace', 'Service Locator', 'Volunteer Network'], body;
    if (tab === 0) body = '<h2>Marketplace Listings</h2>' + [1, 2, 3, 4, 5].map(function (n) { return '<div class="card"><p>Item ' + n + '</p></div>'; }).join('');
    else if (tab === 1) body = '<h2>Service Locator</h2><div class="card"><p>Resources such as food banks and healthcare will be shown here. (The Android app has this screen as a placeholder for a map; no map is wired up yet.)</p></div>';
    else body = [1, 2, 3, 4, 5].map(function (n) { return '<div class="card"><p>Volunteer ' + n + '</p></div>'; }).join('');
    render(bar('Community') + '<div class="tabs">' + names.map(function (n, i) { return '<button class="' + (i === tab ? 'act' : '') + '" data-tab="' + i + '">' + n + '</button>'; }).join('') + '</div><section class="screen" ' + bgRaw(13) + '>' + body + '</section>');
    $app.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { R.community(b.getAttribute('data-tab')); }; });
    bindCommon();
  };

  R.profile = function () {
    var p = db.profile;
    var rows = p ? [['Name:', p.name], ['Preferred Language:', p.lang], ['Region:', p.region], ['Role:', p.role], ['Interests:', (p.interests || []).join(', ')]] : [];
    var prefs = [['Job types', db.jobPrefs], ['Courses', db.coursePrefs], ['Financial needs', db.finNeeds], ['Wellness', db.wellPrefs]];
    render('<section class="screen" ' + bgRaw(16) + '><h1 style="margin-top:8px">Profile</h1>' +
      (p ? '<div class="avatar">' + esc((p.name || db.session || '?')[0].toUpperCase()) + '</div><div class="card">' + rows.map(function (r) { return '<div class="kv"><b>' + r[0] + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>' : '<p class="empty">No profile yet.</p><button class="btn" data-go="profile-setup">Create profile</button>') +
      '<div class="card">' + prefs.map(function (r) { return '<div class="kv"><b>' + r[0] + '</b><span>' + esc(r[1].join(', ') || '-') + '</span></div>'; }).join('') + '</div>' +
      '<div class="row"><button class="btn ghost" data-go="profile-setup">Edit profile</button><button class="btn" id="lo">Log out</button></div>' + FOOT + '</section>' + tabbar('profile'));
    document.getElementById('lo').onclick = function () { delete db.session; save(); go('login'); };
    bindCommon();
  };

  // ---------- chatbot: local rule-based mock replacing the Gemini API ----------
  var BOT = [
    [/\b(hi|hello|hey|namaste)\b/, 'Hello! I am the NayiPehal virtual assistant. Ask me about jobs, courses, mentors, wellness or financial support.'],
    [/job|gig|work|career|resume|interview/, 'Open "Job & Gig Finder" from the dashboard to search openings, bookmark them and apply. Tip: tailor your resume to each role and practise a short intro about yourself.'],
    [/course|learn|skill|upskill|study|python|web|data/, 'Head to "Upskilling & Courses". Digital Skills has Intro to Digital Marketing and Data Analytics Basics; Soft Skills has Effective Communication and Time Management. Small daily steps beat long sessions.'],
    [/mentor|guidance|advice/, 'In "Mentorship" you can view mentors like Alice Johnson (Data Science) and Mark Wilson (Mobile Development), schedule a session or send a message.'],
    [/money|financ|budget|loan|saving|debt/, 'Try "Financial Support": save a financial goal in the Budgeting Tool, read financial tips or explore microloan access. Start by tracking spending for a week and building a small emergency fund.'],
    [/stress|anx|sad|mind|medit|calm|sleep|wellness|motivat/, 'The "Wellness" section has a Morning Meditation and an Evening Relaxation session, plus tips such as breathing deeply for 5 minutes. Be kind to yourself, you are doing well.'],
    [/communit|market|volunt|service/, 'The "Community Marketplace" has three tabs: Marketplace, Service Locator and Volunteer Network.'],
    [/thank/, 'You are welcome! Anything else I can help with?'],
    [/who are you|your name|what are you/, 'I am a small rule-based demo assistant. The Android app uses a generative AI model; this web version answers with canned replies.']
  ];
  function botReply(t) {
    t = t.toLowerCase();
    for (var i = 0; i < BOT.length; i++) if (BOT[i][0].test(t)) return BOT[i][1];
    return 'I can help with jobs, courses, mentorship, financial support, wellness and the community. Try asking about one of those.';
  }
  R.bot = function () {
    render(bar('Ask Me') + '<div class="chat" id="ch" ' + bgRaw(15) + '></div><form class="composer" id="f"><button type="button" class="mic" id="mic" aria-label="Voice input">🎤</button><input id="m" placeholder="Type your message" aria-label="Message" autocomplete="off"><button class="btn" type="submit">Send</button></form>');
    var box = document.getElementById('ch');
    if (!db.chat.length) db.chat.push({ me: false, t: 'Hi! I am your virtual assistant (local demo, canned replies). How can I help?' });
    function draw() { box.innerHTML = db.chat.map(function (m) { return '<div class="msg ' + (m.me ? 'me' : 'bot') + '"><small>' + (m.me ? 'You' : 'Virtual Assistant') + '</small>' + esc(m.t) + '</div>'; }).join(''); box.scrollTop = box.scrollHeight; }
    function send(t) {
      t = (t || '').trim(); if (!t) return toast('Please enter a message');
      db.chat.push({ me: true, t: t }); draw();
      setTimeout(function () { db.chat.push({ me: false, t: botReply(t) }); save(); draw(); }, 500);
    }
    draw();
    document.getElementById('f').onsubmit = function (e) { e.preventDefault(); var i = document.getElementById('m'); var t = i.value; i.value = ''; send(t); };
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = document.getElementById('mic');
    mic.onclick = function () {
      if (!SR) return toast('Your device does not support speech input');
      var r = new SR(); r.lang = navigator.language || 'en-US';
      r.onstart = function () { mic.classList.add('rec'); };
      r.onend = function () { mic.classList.remove('rec'); };
      r.onerror = function () { toast('Error recognizing speech'); };
      r.onresult = function (ev) { send(ev.results[0][0].transcript); };
      try { r.start(); } catch (e) { toast('Error recognizing speech'); }
    };
    bindCommon();
  };

  // ---------- router ----------
  var PUBLIC = { splash: 1, register: 1, login: 1 };
  function route() {
    if (R.splash.stop) R.splash.stop();
    clearInterval(timer);
    var h = (location.hash || '#/splash').replace(/^#\/?/, '') || 'splash';
    var parts = h.split('/'), name = h, arg;
    if (!R[name]) { name = parts[0]; arg = parts[1]; }
    if (!R[name]) { name = 'splash'; }
    if (!PUBLIC[name] && !session()) { return go('login'); }
    R[name](arg);
  }
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
