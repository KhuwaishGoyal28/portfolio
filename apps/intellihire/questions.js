/* MOCK content engine. The Android app asks Gemini to generate 10 MCQs, interview follow-ups and chat replies.
   Here those are produced locally: generated Logic/Aptitude items, a Soft Skills pool, Technical items reused from
   the Gyaankosh bank, plus rule-based interview and chatbot responses. No network, no API key. */
(function () {
  'use strict';
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[rnd(0, a.length - 1)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mk(q, correct, wrongs) {
    var opts = [String(correct)];
    wrongs.forEach(function (w) { w = String(w); if (opts.indexOf(w) < 0 && opts.length < 4) opts.push(w); });
    var n = 1; while (opts.length < 4) { var w = String(isNaN(+correct) ? correct + ' ' + n : +correct + n * 2 + 1); if (opts.indexOf(w) < 0) opts.push(w); n++; }
    return { q: q, o: shuffle(opts), a: String(correct) };
  }
  function near(c, spread) { return [c + rnd(1, spread), c - rnd(1, spread), c + rnd(spread + 1, spread * 2), c * 2 - rnd(1, 3)]; }

  // ---- Logic ----
  var LOGIC_STATIC = {
    easy: [
      mk('Which one does not belong: Apple, Banana, Carrot, Mango?', 'Carrot', ['Apple', 'Banana', 'Mango']),
      mk('If all roses are flowers and some flowers fade, which is definitely true?', 'Roses are flowers', ['All flowers are roses', 'All roses fade', 'No rose fades']),
      mk('Pointing to a boy, Riya says "He is the son of my father\'s only son." How is the boy related to Riya?', 'Nephew', ['Brother', 'Cousin', 'Uncle']),
      mk('Today is Wednesday. What day will it be after 10 days?', 'Saturday', ['Friday', 'Sunday', 'Monday'])
    ],
    medium: [
      mk('A is taller than B, B is taller than C, D is shorter than C. Who is the shortest?', 'D', ['A', 'B', 'C']),
      mk('If CAT is coded as 3-1-20, how is DOG coded?', '4-15-7', ['4-14-7', '3-15-7', '4-15-8']),
      mk('A man walks 5 km north, then 3 km east, then 5 km south. How far is he from the start?', '3 km', ['5 km', '8 km', '13 km']),
      mk('Statements: All pens are books. All books are papers. Conclusion: All pens are papers. This is:', 'True', ['False', 'Cannot be determined', 'Partly true'])
    ],
    hard: [
      mk('Five people P, Q, R, S, T sit in a row. P is left of Q but right of R. S is at the far right. T is between P and S only if Q is not adjacent to S. Which arrangement fits (left to right)?', 'R P Q T S', ['R P T Q S', 'P R Q T S', 'R Q P T S']),
      mk('In a certain code, MOBILE is written as NPCJMF. How is TABLET written?', 'UBCMFU', ['UBCMEU', 'SZAKDS', 'UBDMFU']),
      mk('A clock shows 3:15. What is the angle between the hour and minute hands?', '7.5 degrees', ['0 degrees', '15 degrees', '22.5 degrees']),
      mk('Two fathers and two sons go fishing and each catches one fish, but only 3 fish are caught. How is this possible?', 'They are a grandfather, father and son', ['One person did not fish', 'One fish was shared', 'It is impossible'])
    ]
  };
  function series(level) {
    var s = [], a = rnd(2, 9), ans, label;
    if (level === 'easy') { var d = rnd(2, 7); for (var i = 0; i < 5; i++) s.push(a + d * i); ans = a + d * 5; }
    else if (level === 'medium') { var r = rnd(2, 3); for (var j = 0; j < 5; j++) s.push(a * Math.pow(r, j)); ans = a * Math.pow(r, 5); }
    else { var x = rnd(1, 4), y = rnd(2, 5); s = [x, y]; for (var k = 2; k < 6; k++) s.push(s[k - 1] + s[k - 2]); ans = s[5] + s[4]; s = s.slice(0, 6); }
    return mk('Find the next number in the series: ' + s.join(', ') + ', ?', ans, near(ans, 6));
  }
  function alpha() {
    var st = rnd(0, 8), d = rnd(1, 3), L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', s = [];
    for (var i = 0; i < 4; i++) s.push(L[st + d * i]);
    var ans = L[st + d * 4];
    return mk('What comes next: ' + s.join(', ') + ', ?', ans, [L[st + d * 4 + 1], L[st + d * 4 - 1], L[st + d * 5]]);
  }
  function logicQuiz(level) {
    var out = LOGIC_STATIC[level].slice(); while (out.length < 10) out.push(out.length % 3 === 2 ? alpha() : series(level));
    return shuffle(out);
  }

  // ---- Aptitude ----
  function apt(level) {
    var m = level === 'easy' ? 1 : level === 'medium' ? 2 : 3, t = rnd(0, 5), p, q, c;
    switch (t) {
      case 0: p = rnd(2, 9) * 10 * m; q = pick([10, 20, 25, 40, 50]); c = p * q / 100; return mk('What is ' + q + '% of ' + p + '?', c, near(c, 6));
      case 1: p = rnd(4, 9) * 10 * m; q = rnd(2, 5) * 10; c = p * 60 / 60 * (q / 10); return mk('A car travels at ' + p + ' km/h. How far does it go in ' + (q / 10) + ' hours?', c, near(c, 12));
      case 2: var a = rnd(10, 30) * m, b = rnd(10, 30) * m, d = rnd(10, 30) * m; c = Math.round((a + b + d) / 3 * 100) / 100; if (c !== Math.floor(c)) { d += 3 - ((a + b + d) % 3); c = (a + b + d) / 3; } return mk('Find the average of ' + a + ', ' + b + ' and ' + d + '.', c, near(c, 5));
      case 3: p = rnd(10, 50) * 10 * m; q = rnd(1, 4) * 10; c = p + p * q / 100; return mk('An item costs ' + p + '. After a ' + q + '% price increase, what is the new price?', c, near(c, 20));
      case 4: var w = rnd(2, 6) * m, h = rnd(3, 9); c = w * h; return mk('If ' + w + ' workers can build a wall in ' + h + ' days working equally, how many worker-days are needed in total?', c, near(c, 4));
      default: p = rnd(2, 6) * 100 * m; q = rnd(2, 5); var rr = rnd(5, 10); c = p * q * rr / 100; return mk('Find the simple interest on ' + p + ' at ' + rr + '% per annum for ' + q + ' years.', c, near(c, 10));
    }
  }
  function aptQuiz(level) { var o = [], seen = {}, g = 0; while (o.length < 10 && g++ < 200) { var x = apt(level); if (!seen[x.q]) { seen[x.q] = 1; o.push(x); } } return o; }

  // ---- Soft skills ----
  var SOFT = {
    easy: [
      ['What is the best way to start a professional email?', 'A polite greeting', ['Slang', 'Emojis only', 'No greeting at all']],
      ['A colleague is speaking to you. What shows active listening?', 'Making eye contact and nodding', ['Checking your phone', 'Interrupting with your view', 'Looking away']],
      ['You are running late for a meeting. What should you do?', 'Inform the team in advance', ['Say nothing', 'Skip the meeting silently', 'Blame traffic later']],
      ['Which is an example of good teamwork?', 'Sharing information openly', ['Keeping tasks secret', 'Taking all credit', 'Ignoring others\' ideas']],
      ['What does "time management" mean?', 'Planning tasks to use time well', ['Working without breaks', 'Avoiding deadlines', 'Doing tasks at random']],
      ['How should you accept constructive feedback?', 'Listen and learn from it', ['Argue immediately', 'Ignore it', 'Take it personally']],
      ['Which body language suggests confidence in an interview?', 'Upright posture and a steady voice', ['Slouching', 'Crossed arms and no eye contact', 'Fidgeting constantly']],
      ['What is empathy?', 'Understanding how others feel', ['Agreeing with everyone', 'Avoiding conflict', 'Giving orders']],
      ['A teammate asks for help and you are busy. What is best?', 'Tell them when you can help', ['Ignore them', 'Refuse rudely', 'Do their work silently']],
      ['Punctuality at work shows:', 'Respect for others\' time', ['Nothing important', 'Weakness', 'Lack of flexibility']]
    ],
    medium: [
      ['Two team members disagree about a solution. As lead, you should first:', 'Hear both sides and find common ground', ['Pick your favourite', 'Ignore the conflict', 'Escalate immediately']],
      ['In the STAR method, what does the "A" stand for?', 'Action', ['Answer', 'Attitude', 'Ability']],
      ['You receive unclear instructions from your manager. What is best?', 'Ask clarifying questions', ['Guess and proceed', 'Wait silently', 'Ask a colleague to do it']],
      ['Which best describes assertive communication?', 'Stating needs clearly and respectfully', ['Being aggressive', 'Staying silent', 'Passive complaints']],
      ['A deadline is at risk. What should you do?', 'Raise it early with a plan', ['Hide it until the deadline', 'Blame others', 'Work in silence and hope']],
      ['What is the best response when asked about your weakness in an interview?', 'Name a real one and how you are improving it', ['Say you have none', 'Give a strength disguised as flaw only', 'Refuse to answer']],
      ['Which helps build trust in a team?', 'Keeping commitments', ['Making excuses', 'Gossiping', 'Avoiding accountability']],
      ['When prioritising tasks, the Eisenhower matrix sorts by:', 'Urgency and importance', ['Cost and size', 'Colour and length', 'Age and rank']],
      ['A client is upset about a delay. You should:', 'Acknowledge, apologise and offer a fix', ['Defend yourself', 'Ignore the client', 'Promise the impossible']],
      ['Emotional intelligence includes:', 'Self-awareness and managing emotions', ['Only IQ', 'Suppressing all feelings', 'Winning every argument']]
    ],
    hard: [
      ['You disagree with your manager\'s decision that affects the project. What is the best approach?', 'Present data privately and propose alternatives', ['Complain to peers', 'Silently comply and sabotage', 'Publicly challenge them']],
      ['A high performer on your team is toxic to others. As a leader you should:', 'Give direct feedback and set clear expectations', ['Ignore it due to performance', 'Fire them without warning', 'Move others away']],
      ['You discover a teammate\'s mistake that will reach the client. First step?', 'Inform them privately and help correct it', ['Report to the client', 'Ignore it', 'Fix it secretly and say nothing']],
      ['Negotiating salary, the strongest approach is to:', 'Cite market data and your impact', ['Demand a random figure', 'Accept the first offer always', 'Threaten to leave']],
      ['Two departments have conflicting priorities for your time. You should:', 'Align priorities with your manager and communicate', ['Choose the louder one', 'Do both poorly', 'Refuse both']],
      ['Which behaviour best signals leadership without authority?', 'Taking initiative and enabling others', ['Giving orders', 'Waiting for instructions', 'Taking credit']],
      ['During a crisis, communication should be:', 'Frequent, honest and calm', ['Minimal', 'Optimistic regardless of facts', 'Only in writing to avoid blame']],
      ['You are given a task outside your skills. Best response?', 'Say so, propose learning steps and seek help', ['Pretend you can do it', 'Refuse outright', 'Delegate secretly']],
      ['Feedback to a peer is most effective when it is:', 'Specific, timely and behaviour-focused', ['General and personal', 'Delayed for months', 'Delivered publicly']],
      ['A change is announced that most of the team resists. A good response is to:', 'Listen to concerns and explain the why', ['Dismiss the concerns', 'Leave the team', 'Spread negativity']]
    ]
  };
  function softQuiz(level) { return shuffle(SOFT[level]).map(function (r) { return { q: r[0], o: shuffle([r[1]].concat(r[2])), a: r[1] }; }); }

  // ---- Technical (reuse Gyaankosh bank) ----
  function techQuiz(level) {
    var all = []; IH_TECH_TOPICS.forEach(function (t) { all = all.concat(IH_TECH[t][level]); });
    return shuffle(all).slice(0, 10).map(function (x) { return { q: x.q, o: shuffle(x.o), a: x.a }; });
  }

  window.IH_SUBJECTS = ['Logic', 'Aptitude', 'Technical', 'Soft Skills'];
  window.IH_makeQuiz = function (subject, level) {
    if (subject === 'Logic') return logicQuiz(level);
    if (subject === 'Aptitude') return aptQuiz(level);
    if (subject === 'Technical') return techQuiz(level);
    return softQuiz(level);
  };

  // ---- Interview mock (replaces Gemini follow-up questions) ----
  var FIRST = 'Welcome to the AI Interview. Please introduce yourself.';
  var RULES = [
    [/project|built|developed|app|website/, ['What was the biggest challenge in that project and how did you solve it?', 'What was your specific role in that project?']],
    [/java|python|c\+\+|javascript|sql|react|code|program/, ['Explain the difference between an abstract class and an interface, or a similar concept in your favourite language.', 'How do you debug a problem when the code compiles but gives wrong output?', 'What is the time complexity of searching in a balanced binary search tree, and why?']],
    [/team|group|colleague|together/, ['Tell me about a time you had a conflict in a team. How did you handle it?']],
    [/intern|experience|worked|job|company/, ['What did you learn from that experience that you would apply here?']],
    [/student|college|degree|study|university|b\.?tech|gpa/, ['Which subject or course did you enjoy most and why?', 'How do you balance studies with other commitments?']],
    [/leader|lead|manage/, ['Describe a situation where you took the lead. What was the outcome?']]
  ];
  var GENERIC = ['Where do you see yourself in five years?', 'What are your greatest strengths and one weakness you are working on?', 'Why do you want to work in this field?', 'Tell me about a failure and what you learned from it.', 'How do you handle tight deadlines and pressure?', 'Why should we hire you?', 'How do you keep learning new skills?', 'Do you have any questions for us?'];
  window.IH_nextQuestion = function (answer, asked) {
    var l = (answer || '').toLowerCase(), cand = [];
    RULES.forEach(function (r) { if (r[0].test(l)) cand = cand.concat(r[1]); });
    cand = cand.concat(GENERIC).filter(function (q) { return asked.indexOf(q) < 0; });
    if (!l.trim()) return cand.filter(function (q) { return GENERIC.indexOf(q) >= 0; })[0] || cand[0];
    return cand[0] || 'Thank you. The interview is complete.';
  };
  window.IH_FIRST = FIRST;
  window.IH_evaluate = function (answers) {
    var real = answers.filter(function (a) { return a && a.trim(); });
    var words = real.join(' ').split(/\s+/).filter(Boolean).length, avg = real.length ? words / real.length : 0;
    var tech = /java|python|sql|code|algorithm|data|function|class|api|system|test|debug/gi, techHits = (real.join(' ').match(tech) || []).length;
    var logic = /because|therefore|so that|since|however|first|then|finally|result/gi, logicHits = (real.join(' ').match(logic) || []).length;
    function clamp(x) { return Math.max(1, Math.min(10, Math.round(x * 10) / 10)); }
    var spoken = clamp(2 + Math.min(avg, 40) / 8 + real.length / answers.length * 2.5);
    var t = clamp(2.5 + Math.min(techHits, 10) * 0.6 + real.length * 0.2), lg = clamp(2.5 + Math.min(logicHits, 8) * 0.7 + real.length * 0.2);
    var tips = [];
    if (answers.length - real.length > 0) tips.push('You skipped ' + (answers.length - real.length) + ' question(s); try to answer every one, even briefly.');
    if (avg < 15) tips.push('Answers were short. Aim for 30 to 60 words with a concrete example.');
    if (techHits < 3) tips.push('Use more precise technical vocabulary when discussing your skills.');
    if (logicHits < 2) tips.push('Structure answers (situation, action, result) and connect ideas with because/therefore.');
    if (!tips.length) tips.push('Good structure and detail. Keep quantifying results.');
    return { tech: t, spoken: spoken, logic: lg, overall: Math.round((t + spoken + lg) / 3 * 100) / 100, tips: tips };
  };

  // ---- Chatbot mock (replaces Gemini free-form replies) ----
  var CHAT = [
    [/^(hi|hello|hey|good (morning|evening|afternoon))\b/, 'Hello! I am the IntelliHire assistant. Ask me about interview preparation, resumes, aptitude, coding or soft skills.'],
    [/tell me about yourself|introduce/, 'Use a 3-part structure: (1) who you are now (education or role), (2) two or three relevant achievements, (3) why you want this role. Keep it under a minute.'],
    [/star|behavio/, 'Use the STAR method: Situation (context), Task (your goal), Action (what you did), Result (measurable outcome). Prepare 4 or 5 stories you can adapt.'],
    [/resume|cv/, 'Keep your resume to one page, lead with impact (verbs plus numbers), tailor keywords to the job description, and list projects with tools used and results.'],
    [/salary|negotiat|ctc/, 'Research market ranges first, state your range with confidence, anchor on the value you bring, and never accept on the spot: ask for time to review the offer.'],
    [/weakness/, 'Pick a real, non-critical weakness, explain the concrete steps you are taking to improve, and show progress.'],
    [/strength/, 'Choose strengths relevant to the job and back each with a short example.'],
    [/aptitude|quant|percentage|ratio/, 'For aptitude, practise percentages, ratios, averages, time and work, and speed-distance-time. Use the Quiz tab (Aptitude) for timed practice.'],
    [/logic|reasoning|puzzle/, 'For logical reasoning, practise number and letter series, coding-decoding, seating arrangements and syllogisms. Try the Logic quiz.'],
    [/code|coding|dsa|algorithm|data structure|program/, 'Focus on arrays, strings, hashing, recursion, trees and sorting. Explain your thinking aloud, state complexity, and test edge cases.'],
    [/nervous|anxious|fear|stress/, 'Nerves are normal. Breathe slowly, rehearse answers aloud, arrive early, and remember the interview is a conversation.'],
    [/dress|wear/, 'Dress one step above the company dress code: clean, comfortable and professional.'],
    [/question.*ask|ask.*interviewer/, 'Good questions to ask: what does success look like in the first 90 days, how is the team structured, and what are the biggest challenges of this role.'],
    [/interview/, 'Interview tips: research the company, prepare STAR stories, practise aloud, ask thoughtful questions and follow up with a thank-you note. Try the Interview tab for a mock session.'],
    [/thank/, 'You are welcome! Good luck with your preparation.']
  ];
  window.IH_chatReply = function (q) {
    var l = q.toLowerCase().trim();
    for (var i = 0; i < CHAT.length; i++) if (CHAT[i][0].test(l)) return CHAT[i][1];
    return 'I am a demo assistant running offline, so I can only help with common interview, resume, aptitude, coding and soft-skill topics. Try asking "How do I introduce myself?" or "Tips for salary negotiation".';
  };
})();
