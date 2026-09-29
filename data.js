/* Shared data: skills (with symbols) and projects. Only facts from Khuwaish's resume and GitHub. */
window.KG = (() => {
  const DI = n => `https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/${n}.svg`;
  const GH = 'https://github.com/KhuwaishGoyal28/';

  const SKILLS = {
    python:     { name: 'Python', icon: DI('python/python-original'), color: '#3776ab', level: 90, group: 'Languages',
                  how: 'My main language — ML models, FastAPI/Flask backends, OCR pipelines and the Python tutorials I wrote at Codespeedy.' },
    java:       { name: 'Java', icon: DI('java/java-original'), color: '#e76f00', level: 75, group: 'Languages',
                  how: 'Every Android app I shipped — NayiPehal, FitForce, IntelliHire, Gyaankosh — plus my data-structure practice repos.' },
    sql:        { name: 'SQL', icon: DI('mysql/mysql-original'), color: '#00758f', level: 80, group: 'Languages',
                  how: 'MySQL, SQL Server and SQLite — local app databases and the data behind my dashboards.' },
    dart:       { name: 'Flutter / Dart', icon: DI('flutter/flutter-original'), color: '#02569b', level: 70, group: 'Mobile',
                  how: 'Leave management, receipt generator and a Gemini chatbot — built in Flutter, now also running on the web.' },
    android:    { name: 'Android Studio', icon: DI('androidstudio/androidstudio-original'), color: '#3ddc84', level: 80, group: 'Mobile',
                  how: 'Built 6+ Android apps with multi-screen flows, SQLite storage and Firebase backends.' },
    firebase:   { name: 'Firebase', icon: DI('firebase/firebase-plain'), color: '#ffca28', level: 80, group: 'Cloud',
                  how: 'Auth and Firestore for IntelliHire and the real-time leave-tracking system at my Uptoskill internship.' },
    pandas:     { name: 'Pandas & NumPy', icon: DI('pandas/pandas-original'), color: '#e70488', level: 85, group: 'AI & Data',
                  how: 'Cleaning and shaping data for disaster prediction, crop analysis and patient-diagnosis models.' },
    sklearn:    { name: 'Scikit-learn', icon: DI('scikitlearn/scikitlearn-original'), color: '#f7931e', level: 80, group: 'AI & Data',
                  how: 'TF-IDF scoring in the ATS matcher and classic ML models for natural-disaster prediction.' },
    tensorflow: { name: 'TensorFlow / CNN', icon: DI('tensorflow/tensorflow-original'), color: '#ff6f00', level: 65, group: 'AI & Data',
                  how: 'MobileNetV2 CNN for fake luxury detection; LSTM experiments for sequence data.' },
    hf:         { name: 'Hugging Face & Gemini', glyph: '🤗', color: '#ffd21e', level: 70, group: 'AI & Data',
                  how: 'Image generation and GIF pipelines at Zidio; Gemini API for multimodal text + voice chatbots.' },
    fastapi:    { name: 'FastAPI & Flask', icon: DI('fastapi/fastapi-original'), color: '#05998b', level: 75, group: 'Backend',
                  how: 'REST APIs for EvalPro (OCR + LLM grading), ATS matcher and the luxury-detection model server.' },
    supabase:   { name: 'Supabase', icon: DI('supabase/supabase-original'), color: '#3ecf8e', level: 60, group: 'Backend',
                  how: 'Per-job cloud storage for every evaluated exam paper in EvalPro.' },
    powerbi:    { name: 'Power BI', glyph: 'BI', color: '#f2c811', level: 85, group: 'Visualization',
                  how: 'HR analytics, supermarket, Amazon and Shark Tank sales dashboards.' },
    tableau:    { name: 'Tableau', glyph: '✦', color: '#e97627', level: 80, group: 'Visualization',
                  how: 'Indian crop-production analysis and a bookstore sales dashboard for policy and planning.' },
    git:        { name: 'Git & GitHub', icon: DI('git/git-original'), color: '#f05032', level: 85, group: 'Tools',
                  how: '70+ public repositories — every project here is versioned and open.' },
    aws:        { name: 'AWS (basics)', icon: DI('amazonwebservices/amazonwebservices-original-wordmark'), color: '#ff9900', level: 45, group: 'Cloud',
                  how: 'Certified in Introduction to AWS; used for learning deployment basics.' }
  };

  const PROJECTS = [
    { id: 'nayipehal', title: 'NayiPehal', award: '🏆 1st · IEEE Rapid Innovation Challenge 2024', accent: '#ffb454',
      demo: 'https://nayipehal-web.vercel.app', src: GH + 'NayiPehal', kind: 'Android app → Web',
      pitch: 'One app that brings education, jobs, mentors and community support to underserved people.',
      stack: ['java', 'android', 'sql', 'hf'],
      steps: [
        ['The problem', 'People in poor communities struggle to find courses, jobs and mentors in one place.'],
        ['What I built', 'Onboarding that learns your goals, a job board with bookmarks, courses with progress, mentor booking, wellness and a community space.'],
        ['How it works', 'Java activities with SQLite storage; a Gemini chatbot answers questions. The web version keeps data in your browser.'],
        ['Result', 'Won 1st place at the IEEE Rapid Innovation Challenge 2024.']] },
    { id: 'fitforce', title: 'FitForce', award: '★ Top Team · Salesforce Study Jam 2024', accent: '#ff7a7a',
      demo: 'https://fitforce-web.vercel.app', src: GH + 'FITFORCE', kind: 'Android app → Web',
      pitch: 'A wellness app that helps busy working professionals track and improve their health.',
      stack: ['java', 'android', 'firebase', 'hf'],
      steps: [
        ['The problem', 'Working professionals sit for hours and lose track of their health.'],
        ['What I built', 'Step ring, health analysis charts, workout and meal trackers, paired devices, articles and a health-only chatbot.'],
        ['How it works', 'Java + XML screens with an onboarding health profile; chatbot restricted to health topics.'],
        ['Result', 'Top Team award at Salesforce Study Jam 2024.']] },
    { id: 'evalpro', title: 'EvalPro', award: '● Live AI product', accent: '#5eead4',
      demo: 'https://ai-exam-evaluator-nine.vercel.app', src: GH + 'ai-exam-evaluator', kind: 'AI web app',
      pitch: 'Upload a handwritten answer sheet and get it checked like a real teacher would.',
      stack: ['python', 'fastapi', 'hf', 'supabase'],
      steps: [
        ['The problem', 'Teachers spend hours checking papers by hand.'],
        ['What I built', 'OCR on every page, a 5 × 10 rubric score sheet, and an annotated paper with ticks, crosses and margin notes.'],
        ['How it works', 'FastAPI backend → vision OCR → Groq LLM rubric scoring → files stored per job in Supabase.'],
        ['Result', 'Works for any exam — school boards, JEE, NEET, UPSC, college.']] },
    { id: 'intellihire', title: 'IntelliHire', award: 'Interview-prep app', accent: '#8b9cff',
      demo: 'https://intellihire-web.vercel.app', src: GH + 'IntelliHire', kind: 'Android app → Web',
      pitch: 'Practice aptitude quizzes and a spoken mock interview with a scored report.',
      stack: ['java', 'android', 'firebase', 'hf'],
      steps: [
        ['The problem', 'Students have no easy way to practise interviews out loud.'],
        ['What I built', 'Four-step sign-up, timed quizzes by subject and difficulty, a voice interview with camera preview, and a downloadable report.'],
        ['How it works', 'Firebase auth + Firestore; Gemini generates questions; speech-to-text captures answers.'],
        ['Result', 'A full practice loop from quiz to interview to report.']] },
    { id: 'gyaankosh', title: 'Gyaankosh', award: 'Learning quiz app', accent: '#ffd166',
      demo: 'https://gyaankosh-web.vercel.app', src: GH + 'GayanKhosh', kind: 'Android app → Web',
      pitch: 'Timed quizzes across 8 programming topics with a leaderboard.',
      stack: ['java', 'android', 'sql'],
      steps: [
        ['The problem', 'Revising CS subjects is boring without quick feedback.'],
        ['What I built', '8 topics × 3 levels, about 470 questions, a 10-second timer, colour feedback, profile and leaderboard.'],
        ['How it works', 'Java activities with an SQLite users/scores database.'],
        ['Result', 'A fast, game-like way to revise.']] },
    { id: 'ats', title: 'ATS Resume Matcher', award: 'NLP tool', accent: '#5eead4',
      demo: 'https://ats-resume-matcher-nu.vercel.app', src: GH + 'ATS-RESUME-MATCHER', kind: 'NLP web app',
      pitch: 'See how well your resume matches a job — and which skills are missing.',
      stack: ['python', 'sklearn', 'fastapi'],
      steps: [
        ['The problem', 'Resumes get rejected by ATS filters before a human reads them.'],
        ['What I built', 'Upload PDF/DOCX/TXT + job description → match score, matched and missing skills.'],
        ['How it works', '50% keyword match with synonyms + 50% TF-IDF cosine similarity. Originally FastAPI/Streamlit; now also runs in the browser.'],
        ['Result', 'Instant, private resume feedback.']] },
    { id: 'luxury', title: 'Luxury Fraud Detection', award: 'Computer vision', accent: '#c9a2ff',
      demo: 'https://fake-luxury-detection-web.vercel.app', src: GH + 'Fake_Luxury_Detection', kind: 'Deep learning · runs in browser',
      pitch: 'Point a camera at a luxury product and tell real from fake.',
      stack: ['python', 'tensorflow', 'fastapi', 'hf'],
      steps: [
        ['The problem', 'Counterfeit luxury goods are hard to spot.'],
        ['What I built', 'A CNN (MobileNetV2) with OCR, a Flask API and a live camera client.'],
        ['How it works', 'Camera frame → CNN real/fake score → Gemini double-checks brand and product name → verdict.'],
        ['Result', 'Automated, real-time product authentication.']] },
    { id: 'gemini', title: 'Gemini Chatbot', award: 'Flutter app', accent: '#b58cff',
      demo: 'https://flutter-gemini-chatbot-web.vercel.app', src: GH + 'flutter_gemini_chatbot', kind: 'Flutter → Web',
      pitch: 'A chatbot with voice input and speech output, built in Flutter.',
      stack: ['dart', 'hf'],
      steps: [
        ['The problem', 'Typing is slow — people want to talk to assistants.'],
        ['What I built', 'Chat UI with speech-to-text input and text-to-speech replies.'],
        ['How it works', 'Flutter app calling the Gemini API; compiled to the web with Flutter web.'],
        ['Result', 'Runs on Android and in any browser.']] },
    { id: 'signova', title: 'Signova', award: 'Accessibility · computer vision', accent: '#5eead4',
      demo: 'https://signova-web-omega.vercel.app', src: GH + 'Signova', kind: 'Webcam sign translator',
      pitch: 'Helps people who cannot hear communicate: it reads hand signs from the webcam and turns them into text.',
      stack: ['python', 'hf'],
      steps: [
        ['The problem', 'Deaf and hard-of-hearing people often cannot talk easily with people who do not know sign language.'],
        ['What I built', 'A live translator that tracks the hand and builds a transcript from recognised letters and phrases.'],
        ['How it works', 'MediaPipe Hands finds 21 hand landmarks each frame; my rules map finger positions to signs, held briefly before they are typed.'],
        ['Result', 'Recognises 14 letters and 5 phrases in real time, right in the browser.']] },
    { id: 'patient', title: 'AI Patient Diagnosis', award: 'Deep learning · healthcare', accent: '#ff7a7a',
      demo: 'https://ai-patient-diagnosis-web.vercel.app', src: GH + 'AI_Patient_Diagnosis', kind: 'PyTorch model to browser',
      pitch: 'A neural network that predicts patient health status from medical record data.',
      stack: ['python', 'pandas', 'tensorflow'],
      steps: [
        ['The problem', 'Doctors need quick signals from electronic health records.'],
        ['What I built', 'A synthetic EHR dataset, a PyTorch model and a scaler, served by an API.'],
        ['How it works', 'Patient values are scaled and passed through my trained network; the web demo runs the exact same weights in JavaScript.'],
        ['Result', 'A working end-to-end pipeline, trained on synthetic data: a learning project, not medical advice.']] },
    { id: 'lstm', title: 'LSTM Forecasting', award: 'Deep learning · time series', accent: '#8b9cff',
      demo: 'https://lstm-web-silk.vercel.app', src: GH + 'LSTM', kind: 'Sequence model',
      pitch: 'A two-layer LSTM that forecasts the next value in a price series.',
      stack: ['python', 'tensorflow', 'pandas'],
      steps: [
        ['The problem', 'Forecasting needs a model that remembers what happened before.'],
        ['What I built', 'A two-layer LSTM trained on a price history, compared against real values.'],
        ['How it works', 'Sliding 30-day windows into the LSTM give a next-day prediction; the web demo runs the network in plain JavaScript.'],
        ['Result', 'Forecast-vs-actual chart and a pick-any-day predictor.']] },
    { id: 'hr', title: 'HR Attrition Dashboard', award: 'Data analytics', accent: '#f2c811',
      demo: 'https://anova-web-gamma.vercel.app', src: GH + 'anova', kind: 'Interactive dashboard',
      pitch: 'KPIs and charts that show why employees leave, filterable by department.',
      stack: ['python', 'pandas', 'powerbi'],
      steps: [
        ['The problem', 'HR teams need to see attrition patterns at a glance.'],
        ['What I built', 'Six KPI cards and six charts over the HR analytics dataset.'],
        ['How it works', 'Data cleaned with Pandas and shown as linked charts with a department filter.'],
        ['Result', 'A clear view of who is leaving and why.']] },
    { id: 'dashboards', title: 'Analytics Dashboards', award: 'Power BI · Tableau', accent: '#f2c811',
      src: GH + 'HR-Analatic-Dashboard', kind: 'Data visualization',
      pitch: 'Dashboards that turn raw business and farm data into decisions.',
      stack: ['powerbi', 'tableau', 'pandas', 'sql'],
      steps: [
        ['The problem', 'Managers and policymakers drown in spreadsheets.'],
        ['What I built', 'HR analytics, supermarket, Amazon and Shark Tank sales dashboards; Indian crop-production and bookstore views.'],
        ['How it works', 'Clean with Pandas/SQL → model in Power BI / Tableau → interactive filters and KPIs.'],
        ['Result', 'Clear patterns for resource allocation and planning.']] }
  ];

  const icon = (k, cls = 'sk-ico') => {
    const s = SKILLS[k];
    return s.icon ? `<img class="${cls}" src="${s.icon}" alt="" loading="lazy">`
                  : `<span class="${cls} glyph" style="--c:${s.color}">${s.glyph}</span>`;
  };
  return { SKILLS, PROJECTS, icon };
})();
