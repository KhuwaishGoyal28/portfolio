/* IntelliHire web port. Firebase Auth / Firestore / Storage are replaced by localStorage (demo only). */
(function () {
  'use strict';
  var $screen = document.getElementById('screen'), $toast = document.getElementById('toast');
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var toastT;
  function toast(m) { $toast.textContent = m; $toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { $toast.classList.remove('show'); }, 2800); }
  function go(h) { location.hash = h; }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function render(html, cls) { cleanup(); $screen.className = cls || ''; $screen.innerHTML = html; $screen.scrollTop = 0; $screen.onkeydown = null; }
  function enter(id) { $screen.onkeydown = function (e) { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { var b = document.getElementById(id); if (b) b.click(); } }; }
  function wire() { Array.prototype.forEach.call($screen.querySelectorAll('[data-g]'), function (b) { b.onclick = function () { go(b.getAttribute('data-g')); }; }); }

  // ---- fake "Firebase" ----
  function sha(s) {
    if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest('SHA-256', new TextEncoder().encode('ih:' + s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); });
    return Promise.resolve('p:' + s);
  }
  var Auth = {
    users: function () { return LS.get('ih_users', {}); },
    save: function (u) { LS.set('ih_users', u); },
    email: function () { return LS.get('ih_session', null); },
    profile: function () { var u = Auth.users()[Auth.email()]; return u ? u.profile || {} : {}; },
    setProfile: function (p) { var all = Auth.users(), e = Auth.email(); if (all[e]) { all[e].profile = p; Auth.save(all); } }
  };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var temp = {}; // create-account wizard extras (intent extras)

  function needAuth() { if (!Auth.email() || !Auth.users()[Auth.email()]) { go('#/login'); return true; } return false; }

  // ---- screens ----
  function splash() {
    render('<div class="pad splash"><span class="w1">Intelli</span><span class="w2">Hire</span></div>', 'splash');
    $screen.className = ''; // keep flex column look via inner div
    setTimeout(function () { if ((location.hash || '').replace('#/', '') === 'splash' || !location.hash) go(Auth.email() && Auth.users()[Auth.email()] ? '#/home' : '#/login'); }, 3000);
  }
  function authForm(title, extra, btnId, btnText, links) {
    return '<div class="pad"><div class="mid"><img class="logo" src="img/logo.jpg" alt="IntelliHire logo"><h1>' + title + '</h1>' + extra +
      '<button class="btn" id="' + btnId + '">' + btnText + '</button>' + links + '</div></div>';
  }
  function login() {
    render(authForm('Login', '<input id="em" type="email" placeholder="Email" autocomplete="email"><input id="pw" type="password" placeholder="Password" autocomplete="current-password">', 'go', 'Login',
      '<button class="link" data-g="#/forgot">Forgot Password?</button><button class="link" data-g="#/register">Don\'t have an account? Register</button>'));
    wire(); enter('go');
    document.getElementById('go').onclick = function () {
      var e = val('em'), p = document.getElementById('pw').value.trim();
      if (!e || !p) return toast('Please fill in all fields');
      var u = Auth.users()[e.toLowerCase()];
      if (!EMAIL.test(e)) return toast('Login Failed: The email address is badly formed.');
      if (!u) return toast('Login Failed: There is no user record corresponding to this identifier. The user may have been deleted.');
      sha(p).then(function (h) {
        if (u.hash !== h) return toast('Login Failed: The password is invalid or the user does not have a password.');
        LS.set('ih_session', e.toLowerCase()); go('#/home');
      });
    };
  }
  function register() {
    render(authForm('Register', '<input id="em" type="email" placeholder="Email" autocomplete="email"><input id="pw" type="password" placeholder="Password" autocomplete="new-password">', 'go', 'Register',
      '<button class="link" data-g="#/login">If you have an account? Login</button>'));
    wire(); enter('go');
    document.getElementById('go').onclick = function () {
      var e = val('em').toLowerCase(), p = document.getElementById('pw').value.trim();
      if (!e || !p) return toast('Email and Password cannot be empty');
      if (!EMAIL.test(e)) return toast('Registration Failed: The email address is badly formed.');
      if (p.length < 6) return toast('Registration Failed: The given password is invalid. [ Password should be at least 6 characters ]');
      var all = Auth.users(); if (all[e]) return toast('Registration Failed: The email address is already in use by another account.');
      sha(p).then(function (h) { all[e] = { hash: h, profile: {} }; Auth.save(all); LS.set('ih_session', e); temp = {}; go('#/create/1'); });
    };
  }
  function forgot() {
    render(authForm('Forgot Password', '<input id="em" type="email" placeholder="Email" autocomplete="email">', 'go', 'Reset Password', '<button class="link" data-g="#/login">Back to login</button>'));
    wire(); enter('go');
    document.getElementById('go').onclick = function () {
      var e = val('em').toLowerCase();
      if (!e) { toast('Email required'); document.getElementById('em').focus(); return; }
      if (!Auth.users()[e]) return toast('No account found with this email');
      toast('Reset link sent to your email\n(demo: no email is actually sent)');
    };
  }
  function steps(n) { var s = ''; for (var i = 1; i <= 4; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return '<div class="step">' + s + '</div>'; }
  function create(n) {
    if (needAuth()) return;
    var body, title;
    if (n === 1) { title = 'Step 1: Name'; body = '<input id="f" placeholder="Full Name" autocomplete="name" value="' + esc(temp.name || '') + '"><button class="btn" id="go">Next</button>'; }
    else if (n === 2) { title = 'Step 2: Date of Birth'; body = '<input id="f" placeholder="Date of Birth (DD/MM/YYYY)" value="' + esc(temp.dob || '') + '"><button class="btn" id="go">Next</button>'; }
    else if (n === 3) { title = 'Step 3: Gender'; body = '<select id="f"><option>Male</option><option>Female</option><option>Other</option></select><button class="btn" id="go">Next</button>'; }
    else { title = 'Select Login Type'; body = '<select id="f"><option>Student</option><option>Recruiter</option></select><button class="btn" id="go">Create Account</button>'; }
    render('<div class="pad"><div class="mid"><img class="logo" src="img/logo.jpg" alt="">' + steps(n) + '<h1 style="font-size:22px">' + title + '</h1>' + body + '</div></div>');
    enter('go');
    var f = document.getElementById('f'); if (temp['s' + n]) f.value = temp['s' + n];
    document.getElementById('go').onclick = function () {
      var v = f.value.trim();
      if (n === 1) { temp.name = v; go('#/create/2'); }
      else if (n === 2) { temp.dob = v; go('#/create/3'); }
      else if (n === 3) { temp.gender = v; go('#/create/4'); }
      else {
        var all = Auth.users(), e = Auth.email();
        all[e].profile = { name: temp.name || '', dob: temp.dob || '', gender: temp.gender || '', loginType: v, email: e };
        Auth.save(all); toast('Account created successfully'); go('#/home');
      }
    };
  }

  function nav(active) {
    var ic = {
      d: '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      q: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
      i: '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v5"/></svg>',
      c: '<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>'
    };
    function b(k, t, h) { return '<button data-g="' + h + '" class="' + (active === k ? 'on' : '') + '">' + ic[k] + t + '</button>'; }
    return '<nav class="nav">' + b('d', 'Dashboard', '#/home') + b('q', 'Quiz', '#/subjects') + b('i', 'Interview', '#/interview') + b('c', 'Chatbot', '#/chat') + '</nav>';
  }
  function home() {
    if (needAuth()) return;
    var pic = Auth.profile().photo || '';
    render('<div class="top"><button class="avatar" data-g="#/profile" aria-label="Profile" style="' + (pic ? 'background:url(' + pic + ') center/cover' : '') + '"></button></div>' +
      '<div class="homebody"><img class="logo" src="img/logo.jpg" alt="IntelliHire"><p>Use the tabs below to take a quiz, practise a voice interview or chat with the assistant.</p></div>' + nav('d'));
    wire();
  }
  function subjects() {
    if (needAuth()) return;
    render('<div class="pad list"><h1>Select Subject</h1>' + IH_SUBJECTS.map(function (s) { return '<button data-g="#/difficulty/' + encodeURIComponent(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' + nav('q'));
    wire();
  }
  function difficulty(subj) {
    if (needAuth()) return;
    render('<div class="pad"><div class="mid"><h1>Select Difficulty</h1><p class="tag">' + esc(subj) + '</p>' +
      ['easy', 'medium', 'hard'].map(function (d) { return '<button class="btn" data-g="#/timer/' + encodeURIComponent(subj) + '/' + d + '">' + d[0].toUpperCase() + d.slice(1) + '</button>'; }).join('') + '</div></div>' + nav('q'));
    wire();
  }
  function timerSel(subj, diff) {
    if (needAuth()) return;
    function g(type, label, secs) { return '<button data-g="#/quiz/' + encodeURIComponent(subj) + '/' + diff + '/' + type + '/' + secs + '">' + label + '</button>'; }
    render('<div class="pad"><h1 style="font-size:22px">Select Timer Type and Duration</h1>' +
      '<div class="grp">Collective Timer (total time for whole quiz)</div><div class="two">' + g('collective', '5 minutes', 300) + g('collective', '8 minutes', 480) + g('collective', '10 minutes', 600) + '</div>' +
      '<div class="grp">Individual Timer (per question time)</div><div class="two">' + g('individual', '5 seconds', 5) + g('individual', '8 seconds', 8) + g('individual', '10 seconds', 10) + '</div></div>' + nav('q'));
    wire();
  }

  // Quiz: options are buttons; picking one records and advances immediately (no feedback), like QuizActivity.
  var tick = null, iv = null;
  function cleanup() { clearInterval(tick); tick = null; if (iv) { iv.stop(); iv = null; } }
  function quiz(subj, diff, type, secs) {
    if (needAuth()) return;
    render('<div class="pad qwrap"><div id="timer">Time Left: --</div><div class="qnum" id="qn"></div><div class="qq" id="qq">Generating questions...</div><div id="op"></div></div>', 'qwrap');
    var qs = IH_makeQuiz(subj, diff), idx = 0, score = 0, done = false, left = secs;
    if (!qs.length) { toast('No questions generated'); return go('#/subjects'); }
    var $t = document.getElementById('timer');
    function finish() {
      if (done) return; done = true; clearInterval(tick);
      var hist = LS.get('ih_scores', []); hist.push({ user: Auth.email(), score: score, total: qs.length, subject: subj, difficulty: diff, timestamp: Date.now() }); LS.set('ih_scores', hist);
      var msg = 'Quiz Finished! Your score: ' + score + '/' + qs.length; toast(msg + '\nScore saved');
      render('<div class="pad res"><div class="mid"><h1>Quiz Finished!</h1><p class="tag">' + esc(subj) + ' &middot; ' + diff + '</p><div class="big">' + score + '/' + qs.length + '</div><p>Your score</p>' +
        '<button class="btn" data-g="#/timer/' + encodeURIComponent(subj) + '/' + diff + '">Try again</button><button class="btn gray" data-g="#/subjects">Choose another subject</button></div></div>' + nav('q')); wire();
    }
    function show() {
      if (idx >= qs.length) return finish();
      var q = qs[idx];
      document.getElementById('qn').textContent = 'Question ' + (idx + 1) + ' of ' + qs.length;
      document.getElementById('qq').textContent = q.q;
      var op = document.getElementById('op'); op.innerHTML = q.o.map(function (o, k) { return '<button class="qopt" data-k="' + k + '">' + esc(o) + '</button>'; }).join('');
      Array.prototype.forEach.call(op.querySelectorAll('button'), function (b) { b.onclick = function () { if (type === 'individual') clearInterval(tick); if (q.o[+b.getAttribute('data-k')] === q.a) score++; idx++; show(); }; });
      if (type === 'individual') { clearInterval(tick); left = secs; $t.textContent = 'Time Left: ' + left + 's'; tick = setInterval(function () { left--; if (left <= 0) { clearInterval(tick); toast("Time's up for this question!"); idx++; show(); } else $t.textContent = 'Time Left: ' + left + 's'; }, 1000); }
      else $t.textContent = 'Time Left: ' + fmt(left);
    }
    function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2) + ' (' + s + 's)'; }
    if (type === 'collective') tick = setInterval(function () { left--; if (left <= 0) { toast('Quiz time over!'); finish(); } else $t.textContent = 'Time Left: ' + fmt(left); }, 1000);
    show();
  }

  // ---- Chatbot ----
  function chat() {
    if (needAuth()) return;
    render('<div class="chat" style="display:flex;flex-direction:column;flex:1;min-height:0"><div class="chatbox" id="box"><img class="chatlogo" id="lg" src="img/logo.jpg" alt=""></div>' +
      '<div class="chatin"><input id="msg" placeholder="Write here" autocomplete="off"><button id="send" aria-label="Send">&gt;</button></div></div>' + nav('c'));
    wire();
    var box = document.getElementById('box'), input = document.getElementById('msg');
    function add(t, cls) { var lg = document.getElementById('lg'); if (lg) lg.remove(); var d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = t; box.appendChild(d); box.scrollTop = box.scrollHeight; return d; }
    function sendMsg() {
      var q = input.value.trim(); if (!q) return; input.value = ''; add(q, 'u');
      var typing = add('...', 'b'); setTimeout(function () { typing.textContent = IH_chatReply(q); box.scrollTop = box.scrollHeight; }, 500);
    }
    document.getElementById('send').onclick = sendMsg;
    input.onkeydown = function (e) { if (e.key === 'Enter') sendMsg(); };
  }

  // ---- Voice interview (browser speech APIs where available) ----
  function interview() {
    if (needAuth()) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, synth = window.speechSynthesis;
    render('<div class="pad iv"><video id="cam" autoplay playsinline muted hidden></video><div class="qbox" id="qt">Interview Question will appear here</div>' +
      '<div class="abox" id="at">Your answer will appear here</div><div class="sbox" id="st">Status will appear here</div>' +
      '<textarea id="typed" rows="2" placeholder="' + (SR ? 'Or type your answer' : 'Speech recognition is not available in this browser: type your answer') + '" hidden></textarea>' +
      '<button class="btn" id="mic">Start Interview</button><button class="btn gray" id="nx" hidden>Next</button>' +
      '<div class="scores" id="fs" hidden></div><div class="row2" id="rep" hidden><button id="dl">Download Report</button><button id="sh">Share Report</button></div></div>' + nav('i'));
    wire();
    var MAXQ = 10, running = false, qCount = 0, history = '', answers = [], asked = [], rec = null, silenceT = null, stream = null, report = '';
    var $ = function (id) { return document.getElementById(id); };
    function speak(t) { try { if (synth) { synth.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; synth.speak(u); } } catch (e) {} }
    function cancelSilence() { clearTimeout(silenceT); silenceT = null; }
    function startSilence() { cancelSilence(); silenceT = setTimeout(function () { if (running) { $('st').textContent = 'Silence detected. Moving to next question...'; speak('Moving to next question.'); process(''); } }, 5000); }
    function listen() {
      if (!running) return;
      $('typed').hidden = false; $('typed').value = ''; $('nx').hidden = false;
      if (!SR) { $('st').textContent = 'Type your answer, then press Next.'; return; }
      try {
        rec = new SR(); rec.lang = navigator.language || 'en-US'; rec.interimResults = true; rec.continuous = false;
        var got = false;
        rec.onstart = function () { $('st').textContent = 'Listening...'; cancelSilence(); };
        rec.onspeechstart = cancelSilence;
        rec.onresult = function (e) { var t = ''; for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; $('at').textContent = t; got = true; if (e.results[e.results.length - 1].isFinal) { rec = null; process(t); } };
        rec.onspeechend = startSilence;
        rec.onerror = function (e) { if (!running) return; if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { $('st').textContent = 'Microphone blocked: type your answer and press Next.'; rec = null; return; } if (e.error !== 'no-speech' && e.error !== 'aborted') $('st').textContent = 'Error occurred, please try again.'; };
        rec.onend = function () { if (running && rec && !got) startSilence(); };
        rec.start();
      } catch (e) { $('st').textContent = 'Type your answer, then press Next.'; }
    }
    function ask(q) {
      if (!running) return;
      qCount++; if (qCount > MAXQ) return stop();
      asked.push(q); history += 'Q' + qCount + ': ' + q + '\n';
      $('qt').textContent = q; $('at').textContent = 'Your answer will appear here'; $('st').textContent = 'Speak your answer...';
      speak(q); listen();
    }
    function process(ans) {
      cancelSilence(); if (rec) { try { rec.abort(); } catch (e) {} rec = null; }
      if (!running) return;
      $('nx').hidden = true; $('typed').hidden = true;
      answers.push(ans); history += 'A' + qCount + ': ' + ans + '\n'; $('st').textContent = 'Processing answer...';
      setTimeout(function () { if (!running) return; var nq = IH_nextQuestion(ans, asked); if (/interview is complete/i.test(nq)) stop(); else ask(nq); }, 600);
    }
    function startCam() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then(function (s) { if (!running) { s.getTracks().forEach(function (t) { t.stop(); }); return; } stream = s; var v = $('cam'); v.srcObject = s; v.hidden = false; }).catch(function () { $('st').textContent = 'Camera unavailable: continuing without video.'; });
    }
    function stopCam() { if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } var v = $('cam'); if (v) { v.srcObject = null; v.hidden = true; } }
    function stop() {
      running = false; cancelSilence(); if (rec) { try { rec.abort(); } catch (e) {} rec = null; } if (synth) synth.cancel(); stopCam();
      $('mic').textContent = 'Start Interview'; $('nx').hidden = true; $('typed').hidden = true; $('at').textContent = '';
      evaluate();
    }
    function evaluate() {
      var e = IH_evaluate(answers); if (!answers.length) { $('st').textContent = 'Interview stopped before any answer was given.'; return; }
      var txt = 'Technical: ' + e.tech.toFixed(1) + '/10\nSpoken Skill: ' + e.spoken.toFixed(1) + '/10\nLogical Thinking: ' + e.logic.toFixed(1) + '/10\nOverall Score: ' + e.overall.toFixed(2) + '/10\n\nSuggestions:\n- ' + e.tips.join('\n- ');
      report = 'AI Interview Report\n====================\n' + history + '\nEvaluation Summary (demo heuristic, not an AI model):\n' + txt + '\n';
      $('fs').hidden = false; $('fs').textContent = txt; $('rep').hidden = false; $('st').textContent = 'Interview ended. Report generated.'; speak('Interview ended. Report generated.');
    }
    $('mic').onclick = function () {
      if (!running) {
        running = true; qCount = 0; history = ''; answers = []; asked = []; $('fs').hidden = true; $('rep').hidden = true; $('mic').textContent = 'Stop Interview';
        startCam(); ask(IH_FIRST);
      } else stop();
    };
    $('nx').onclick = function () { process($('typed').value.trim() || $('at').textContent.replace('Your answer will appear here', '').trim()); };
    $('dl').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([report], { type: 'text/plain' })); a.download = 'InterviewReport.txt'; document.body.appendChild(a); a.click(); a.remove(); toast('Report downloaded'); };
    $('sh').onclick = function () {
      if (navigator.share) navigator.share({ title: 'Interview Report', text: report }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(report).then(function () { toast('Report copied to clipboard'); }, function () { toast('Sharing not supported'); });
      else toast('Sharing not supported');
    };
    iv = { stop: function () { running = false; cancelSilence(); if (rec) { try { rec.abort(); } catch (e) {} } if (synth) synth.cancel(); stopCam(); } };
  }

  // ---- Profile ----
  function profile() {
    if (needAuth()) return;
    var p = Auth.profile(), photo = p.photo || '';
    render('<div class="pad prof"><div class="photo"><img id="pic" alt="Profile photo" src="' + (photo || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="#c9ced6"/><circle cx="12" cy="9" r="4" fill="#fff"/><path d="M4 22c0-5 4-7 8-7s8 2 8 7z" fill="#fff"/></svg>')) + '">' +
      '<div class="row2"><button id="up">Upload Image</button><button class="red" id="rm" style="background:#fff;color:#c62828;border:1px solid #c62828">Delete Image</button></div><input type="file" id="file" accept="image/*" hidden></div>' +
      '<input id="nm" placeholder="Full Name" value="' + esc(p.name || '') + '"><input id="db" placeholder="Date of Birth (DD/MM/YYYY)" value="' + esc(p.dob || '') + '">' +
      '<input id="gd" placeholder="Gender" value="' + esc(p.gender || '') + '"><input id="em" placeholder="Email" readonly value="' + esc(Auth.email()) + '">' +
      '<select id="lt"><option>Email/Password</option><option>Google</option><option>Facebook</option></select>' +
      '<button class="btn" id="sv">Save Changes</button><button class="btn red" id="del">Delete Account</button><button class="link" id="lo">Log out</button></div>' + nav(''));
    wire();
    if (p.loginType) { var s = document.getElementById('lt'); for (var i = 0; i < s.options.length; i++) if (s.options[i].text === p.loginType) s.selectedIndex = i; }
    var newPhoto = photo;
    document.getElementById('up').onclick = function () { document.getElementById('file').click(); };
    document.getElementById('file').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { var im = new Image(); im.onload = function () { var c = document.createElement('canvas'), s = Math.min(1, 256 / Math.max(im.width, im.height)); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); newPhoto = c.toDataURL('image/jpeg', .8); document.getElementById('pic').src = newPhoto; var q = Auth.profile(); q.photo = newPhoto; Auth.setProfile(q); toast('Image Uploaded'); }; im.onerror = function () { toast('Upload Failed'); }; im.src = r.result; };
      r.readAsDataURL(f);
    };
    document.getElementById('rm').onclick = function () { var q = Auth.profile(); delete q.photo; newPhoto = ''; Auth.setProfile(q); go('#/profile'); toast('Image deleted'); setTimeout(profile, 0); };
    document.getElementById('sv').onclick = function () {
      var n = val('nm'), d = val('db'), g = val('gd');
      if (!n || !d || !g) return toast('Please fill all fields');
      var q = Auth.profile(); q.name = n; q.dob = d; q.gender = g; q.loginType = document.getElementById('lt').value; q.email = Auth.email(); Auth.setProfile(q); toast('Profile Updated');
    };
    document.getElementById('del').onclick = function () {
      if (!confirm('Delete your account and all local data? This cannot be undone.')) return;
      var all = Auth.users(); delete all[Auth.email()]; Auth.save(all); LS.set('ih_scores', LS.get('ih_scores', []).filter(function (x) { return x.user !== Auth.email(); }));
      LS.set('ih_session', null); toast('Account Deleted'); go('#/login');
    };
    document.getElementById('lo').onclick = function () { LS.set('ih_session', null); go('#/login'); };
  }

  // ---- router ----
  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    switch (h[0]) {
      case 'login': return login();
      case 'register': return register();
      case 'forgot': return forgot();
      case 'create': return create(+h[1] || 1);
      case 'home': return home();
      case 'subjects': return subjects();
      case 'difficulty': return difficulty(h[1]);
      case 'timer': return timerSel(h[1], h[2]);
      case 'quiz': return quiz(h[1], h[2], h[3], +h[4]);
      case 'chat': return chat();
      case 'interview': return interview();
      case 'profile': return profile();
      default: return splash();
    }
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
