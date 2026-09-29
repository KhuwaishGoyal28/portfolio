/* Gyaankosh web port. Storage is localStorage (stands in for the app's SQLite:
   UserAuth.db `users` table and gyaankosh.db `scores` table). */
(function () {
  'use strict';
  var $screen = document.getElementById('screen');
  var $toast = document.getElementById('toast');
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  // ---- "SQLite" helpers ----
  var DB = {
    users: function () { return LS.get('gk_users', {}); },
    insertUser: function (u, p) { var all = DB.users(); if (all[u] !== undefined) return false; all[u] = p; LS.set('gk_users', all); return true; },
    checkUser: function (u, p) { var all = DB.users(); return all[u] !== undefined && all[u] === p; },
    scores: function () { return LS.get('gk_scores', {}); },
    saveScore: function (u, s) { var all = DB.scores(); all[u] = s; LS.set('gk_scores', all); },
    getScore: function (u) { var s = DB.scores()[u]; return s === undefined ? 0 : s; }
  };
  var session = { user: LS.get('gk_session', null) };
  var timerId = null, autoId = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var toastT;
  function toast(msg) { $toast.textContent = msg; $toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { $toast.classList.remove('show'); }, 2400); }
  function go(h) { location.hash = h; }
  function stopTimers() { clearInterval(timerId); clearTimeout(autoId); timerId = autoId = null; }
  function render(html, cls) { $screen.className = cls || ''; $screen.innerHTML = html; $screen.scrollTop = 0; }

  // ---- screens ----
  function login() {
    render('<div class="pad"><div class="center card"><h1>Login</h1><p class="sub">GyaanKosh</p>' +
      '<input id="u" placeholder="Username" autocomplete="username"><input id="p" type="password" placeholder="Password" autocomplete="current-password">' +
      '<button class="btn" id="login">Login</button><button class="btn alt" id="reg">Register</button></div></div>', 'sign');
    document.getElementById('login').onclick = function () {
      var u = val('u'), p = val('p');
      if (!u || !p) return toast('Please enter username and password');
      if (DB.checkUser(u, p)) { session.user = u; LS.set('gk_session', u); toast('Login Successful! Welcome ' + u); go('#/dashboard'); }
      else toast('Invalid username or password');
    };
    document.getElementById('reg').onclick = function () { go('#/register'); };
    enterSubmit('login');
  }
  function register() {
    render('<div class="pad"><div class="center card"><h1>Register</h1><p class="sub">Create your GyaanKosh account</p>' +
      '<input id="u" placeholder="Username" autocomplete="username"><input id="p" type="password" placeholder="Password" autocomplete="new-password">' +
      '<input id="c" type="password" placeholder="Confirm Password" autocomplete="new-password">' +
      '<button class="btn" id="reg">Register</button><button class="btn alt" id="login">Login</button></div></div>', 'sign');
    document.getElementById('reg').onclick = function () {
      var u = val('u'), p = val('p'), c = val('c');
      if (!u || !p || !c) return toast('Please fill all fields');
      if (p !== c) return toast('Passwords do not match');
      if (DB.insertUser(u, p)) { toast('Registration Successful'); go('#/login'); }
      else toast('Registration Failed. Username may already exist.');
    };
    document.getElementById('login').onclick = function () { go('#/login'); };
    enterSubmit('reg');
  }
  function val(id) { return document.getElementById(id).value.trim(); }
  function enterSubmit(btn) { $screen.onkeydown = function (e) { if (e.key === 'Enter') document.getElementById(btn).click(); }; }

  function bottomBar(active) {
    return '<nav class="bottom"><button data-g="#/profile" class="' + (active === 'p' ? 'on' : '') + '">View Profile</button>' +
      '<button data-g="#/dashboard" class="' + (active === 'h' ? 'on' : '') + '">Home</button>' +
      '<button data-g="#/leaderboard" class="' + (active === 'l' ? 'on' : '') + '">Leaderboard</button></nav>';
  }
  function wireNav() { Array.prototype.forEach.call($screen.querySelectorAll('[data-g]'), function (b) { b.onclick = function () { go(b.getAttribute('data-g')); }; }); }
  function needAuth() { if (!session.user) { go('#/login'); return true; } return false; }

  function dashboard() {
    if (needAuth()) return;
    var tiles = GK_TOPICS.map(function (t, i) { return '<button class="tile" data-g="#/topic/' + i + '">' + esc(t) + '</button>'; }).join('');
    render('<div class="pad"><div class="welcome">Welcome to GyaanKosh</div><div class="hi">Hi, ' + esc(session.user) + '</div>' +
      '<div class="grid">' + tiles + '</div><div class="spacer"></div><button class="help" data-g="#/ask">Help Me?</button></div>' + bottomBar('h'), 'dash');
    wireNav();
  }
  function topic(i) {
    if (needAuth()) return;
    var t = GK_TOPICS[i]; if (!t) return go('#/dashboard');
    render('<div class="pad"><button class="back" data-g="#/dashboard" style="color:#fff">&larr; Dashboard</button><h1>' + esc(t) + '</h1><p class="sub" style="color:#fff">Choose a difficulty</p>' +
      '<button data-g="#/quiz/' + i + '/easy">Easy</button><button data-g="#/quiz/' + i + '/medium">Medium</button><button data-g="#/quiz/' + i + '/hard">Hard</button></div>', 'diff');
    wireNav();
  }

  // Quiz: mirrors Easy/Medium/HardActivityN. 10s per question, Next checks then advances,
  // time-up checks the answer and auto-advances after 2s, colours right/wrong, final score text.
  function quiz(i, level) {
    if (needAuth()) return;
    var t = GK_TOPICS[i], qs = t && GK_QUESTIONS[t] && GK_QUESTIONS[t][level];
    if (!qs) return go('#/dashboard');
    var idx = 0, score = 0, checked = false, left = 10;
    var title = level.charAt(0).toUpperCase() + level.slice(1) + ' Level';
    render('<div class="pad"><button class="back" data-g="#/topic/' + i + '" style="color:#000">&larr; ' + esc(t) + '</button>' +
      '<div class="qlevel">' + title + ' &middot; ' + esc(t) + '</div><div class="bar"><i id="bar"></i></div><div class="qtext" id="q"></div><div id="opts"></div>' +
      '<div class="timer" id="tm"></div><button class="next" id="next">Next</button></div>', 'q-' + level);
    wireNav();
    var $q = document.getElementById('q'), $o = document.getElementById('opts'), $tm = document.getElementById('tm'), $n = document.getElementById('next'), $b = document.getElementById('bar');
    function show() {
      if (idx >= qs.length) return end();
      var q = qs[idx]; checked = false;
      $q.textContent = (idx + 1) + '/' + qs.length + '. ' + q.q;
      $b.style.width = (idx / qs.length * 100) + '%';
      $o.innerHTML = q.o.map(function (o, k) { return '<label class="opt"><input type="radio" name="o" value="' + k + '"><span>' + esc(o) + '</span></label>'; }).join('');
      Array.prototype.forEach.call($o.querySelectorAll('input'), function (r) { r.onchange = function () { mark(); }; });
      $n.textContent = 'Next';
      startTimer();
    }
    function mark() { Array.prototype.forEach.call($o.querySelectorAll('.opt'), function (l) { l.classList.toggle('sel', l.querySelector('input').checked); }); }
    function startTimer() {
      stopTimers(); left = 10; $tm.textContent = 'Time left: ' + left + 's';
      timerId = setInterval(function () {
        left--;
        if (left > 0) { $tm.textContent = 'Time left: ' + left + 's'; return; }
        clearInterval(timerId); timerId = null; $tm.textContent = "Time's up!";
        check();
        autoId = setTimeout(function () { $n.click(); }, 2000);
      }, 1000);
    }
    function check() {
      if (checked) return; checked = true;
      var q = qs[idx], sel = $o.querySelector('input:checked'), labels = $o.querySelectorAll('.opt');
      function showCorrect() { Array.prototype.forEach.call(labels, function (l) { if (l.textContent === q.a) l.classList.add('ok'); }); }
      if (sel) {
        var lab = sel.closest('.opt');
        if (lab.textContent === q.a) { score++; lab.classList.add('ok'); } else { lab.classList.add('no'); showCorrect(); }
      } else { showCorrect(); toast('No answer selected.'); }
      Array.prototype.forEach.call($o.querySelectorAll('input'), function (r) { r.disabled = true; });
      clearInterval(timerId); timerId = null;
      $n.textContent = idx + 1 >= qs.length ? 'Finish' : 'Next';
    }
    $n.onclick = function () {
      if (checked) { clearTimeout(autoId); idx++; show(); } else check();
    };
    function end() {
      stopTimers();
      var msg = 'Quiz completed!\nYour score: ' + score + ' out of ' + qs.length + ' correct answers.';
      DB.saveScore(session.user, score);
      $b.style.width = '100%';
      $q.className = 'qtext result'; $q.textContent = msg; $o.innerHTML = ''; $tm.textContent = ''; $n.disabled = true;
      toast(msg);
      var again = document.createElement('button'); again.className = 'next'; again.style.marginTop = '10px'; again.textContent = 'Back to ' + t;
      again.onclick = function () { go('#/topic/' + i); }; $n.parentNode.appendChild(again);
    }
    show();
  }

  function profile() {
    if (needAuth()) return;
    render('<div class="pad"><div class="center card"><div style="font-size:18px;margin-bottom:20px">Username: ' + esc(session.user) + '</div>' +
      '<div style="font-size:16px;padding-bottom:16px">Score: ' + DB.getScore(session.user) + '</div>' +
      '<button class="btn logout" id="lo">Logout</button></div></div>' + bottomBar('p'), 'prof');
    wireNav();
    document.getElementById('lo').onclick = function () { session.user = null; LS.set('gk_session', null); toast('Logged out successfully!'); go('#/login'); };
  }
  function leaderboard() {
    if (needAuth()) return;
    var s = DB.scores(), rows = Object.keys(s).map(function (k) { return [k, s[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var body = rows.length ? '<table><tr><th>#</th><th>Player</th><th>Score</th></tr>' + rows.map(function (r, n) { return '<tr><td>' + (n + 1) + '</td><td>' + esc(r[0]) + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' : '<p style="text-align:center">No scores yet. Finish a quiz to appear here.</p>';
    render('<div class="pad"><div class="center card"><h1>Leaderboard</h1>' + body + '</div></div>' + bottomBar('l'), 'lb');
    wireNav();
  }

  // ---- Ask AI (GyankhoshQuizApp) : MOCK of the Gemini text-generation screen ----
  var KB = [
    [/jvm|java virtual machine/, 'The JVM (Java Virtual Machine) runs compiled Java bytecode, which is why Java is "write once, run anywhere". The JDK compiles source to bytecode, the JRE/JVM executes it.'],
    [/pointer/, 'A pointer stores the memory address of another variable. In C/C++ you declare one with a * (int *p = &x;) and read the pointed-to value with *p. Dereferencing nullptr is undefined behaviour.'],
    [/polymorphism/, 'Polymorphism lets one interface have many forms: compile-time via overloading, run-time via overriding with virtual functions (C++) or overridden methods (Java).'],
    [/inherit/, 'Inheritance lets a class reuse and extend another class. Java uses "extends" (single inheritance for classes); C++ also supports multiple inheritance.'],
    [/exception|try.?catch/, 'Exceptions signal runtime errors. Wrap risky code in try { } catch (Type e) { } and use finally for cleanup.'],
    [/primary key/, 'A PRIMARY KEY uniquely identifies each row in a table, cannot be NULL, and there is only one per table.'],
    [/join/, 'SQL JOINs combine rows from tables: INNER (matches only), LEFT/RIGHT (keep all rows from one side), FULL (keep both). Example: SELECT * FROM a INNER JOIN b ON a.id = b.a_id;'],
    [/select|sql|mysql|query/, 'Basic SQL: SELECT columns FROM table WHERE condition ORDER BY col; use INSERT, UPDATE and DELETE to change data.'],
    [/list|tuple|dictionary|python/, 'Python: lists are mutable ordered sequences [1,2], tuples are immutable (1,2), dictionaries map keys to values {"a":1}. Indentation defines blocks.'],
    [/html|css|javascript|web/, 'Web basics: HTML gives structure, CSS gives style, JavaScript adds behaviour. The browser combines all three.'],
    [/agile|scrum|sdlc|waterfall|software engineering/, 'Software engineering models: Waterfall is sequential; Agile/Scrum builds in short iterations (sprints) with continuous feedback. SDLC phases: requirements, design, implementation, testing, deployment, maintenance.'],
    [/activity|android|app develop|intent/, 'Android: an Activity is one screen; Intents start activities and pass data; layouts are defined in XML and the manifest declares activities and permissions.'],
    [/loop|array|variable|data type/, 'Core building blocks: variables store data of a type, arrays hold several values of one type, loops (for/while) repeat work and conditions (if/else) branch.']
  ];
  function mockAnswer(q) {
    var l = q.toLowerCase(), hit = KB.filter(function (k) { return k[0].test(l); }).map(function (k) { return k[1]; });
    var words = l.replace(/[^a-z0-9+#\s]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 3; }), best = null, bs = 0;
    GK_TOPICS.forEach(function (t) { ['easy', 'medium', 'hard'].forEach(function (lv) { GK_QUESTIONS[t][lv].forEach(function (x) {
      var xl = x.q.toLowerCase(), sc = words.filter(function (w) { return xl.indexOf(w) >= 0; }).length; if (sc > bs) { bs = sc; best = { t: t, x: x }; } }); }); });
    var out = hit.length ? hit.slice(0, 2).join('\n\n') : 'I could not match that to a stored topic, but a good way to learn it is to break it into small definitions and try a short example.';
    if (best && bs >= 2) out += '\n\nRelated quiz question (' + best.t + '): ' + best.x.q + '\nAnswer: ' + best.x.a;
    return out;
  }
  function ask() {
    if (needAuth()) return;
    render('<div class="pad ai"><button class="back" data-g="#/dashboard">&larr; Dashboard</button><h1>Ask GyaanKosh</h1><span class="tag">Demo: offline mock, no Gemini API</span>' +
      '<textarea id="in" placeholder="Enter your question"></textarea><button class="btn" id="gen">Generate Response</button><div class="out" id="out">Response will appear here</div></div>' + bottomBar(''));
    wireNav();
    document.getElementById('gen').onclick = function () {
      var v = val('in'); if (!v) return;
      var o = document.getElementById('out'); o.textContent = 'Thinking...';
      setTimeout(function () { o.textContent = mockAnswer(v); }, 500);
    };
  }

  // ---- router ----
  function route() {
    stopTimers(); $screen.onkeydown = null;
    var h = (location.hash || '').replace(/^#\/?/, '').split('/');
    switch (h[0]) {
      case 'register': return register();
      case 'dashboard': return dashboard();
      case 'topic': return topic(+h[1]);
      case 'quiz': return quiz(+h[1], h[2]);
      case 'profile': return profile();
      case 'leaderboard': return leaderboard();
      case 'ask': return ask();
      case 'login': return login();
      default: return session.user ? dashboard() : login();
    }
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
