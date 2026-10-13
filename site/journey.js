/* Progres local, lecții pe pași, întrebări și experiență. Nu modifică evaluatorul Python. */
const journeyStorageKey = 'pa-journey-v1';
let journey = { quiz: {}, activityDays: [] };
try { const stored = JSON.parse(localStorage.getItem(journeyStorageKey) || 'null'); if (stored && typeof stored === 'object' && !Array.isArray(stored)) { journey.quiz = typeof stored.quiz === 'object' && stored.quiz && !Array.isArray(stored.quiz) ? stored.quiz : {}; journey.activityDays = Array.isArray(stored.activityDays) ? stored.activityDays.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day)).slice(-365) : []; } } catch {}
try { const stored = JSON.parse(localStorage.getItem(journeyStorageKey) || 'null'); if (typeof stored?.resume === 'string') { journey.resume = stored.resume; } } catch {}
const questionsForLesson = lessonId => window.PA_INTERACTIVE[lessonId] || [];
const exercisesForLesson = lessonId => beginnerExercises.filter(item => item.chapter === lessonId);
const quizKey = (lessonId, index) => `${lessonId}:${index}`;
const quizPassed = (lessonId, index) => journey.quiz[quizKey(lessonId, index)] === true;
const lessonIsCompleted = lesson => questionsForLesson(lesson.id).every((question, index) => quizPassed(lesson.id, index)) && exercisesForLesson(lesson.id).every(isPassed);
const algorithmItems = id => exercises.filter(item => item.chapter === id);
const algorithmUnits = id => { const items = algorithmItems(id); return Array.from({ length: Math.ceil(items.length / 3) }, (_, index) => items.slice(index * 3, index * 3 + 3)); };
const algorithmUnitDone = (chapter, index) => quizPassed(chapter.id, index) && algorithmUnits(chapter.id)[index].every(isPassed);
const algorithmCompleted = chapter => algorithmUnits(chapter.id).every((_, index) => algorithmUnitDone(chapter, index));
const firstPendingAlgorithmUnit = chapter => { const index = algorithmUnits(chapter.id).findIndex((_, i) => !algorithmUnitDone(chapter, i)); return index < 0 ? 0 : index; };
const firstPendingAlgorithmStep = (chapter, unit = firstPendingAlgorithmUnit(chapter)) => !quizPassed(chapter.id, unit) ? 0 : (algorithmUnits(chapter.id)[unit].findIndex(item => !isPassed(item)) < 0 ? algorithmUnits(chapter.id)[unit].length + 2 : algorithmUnits(chapter.id)[unit].findIndex(item => !isPassed(item)) + 2);
const algorithmStep = id => { const item = exercises.find(exercise => exercise.id === id); return item ? 2 + algorithmItems(item.chapter).findIndex(exercise => exercise.id === id) % 3 : 0; };
const algorithmUnit = id => { const item = exercises.find(exercise => exercise.id === id); return item ? Math.floor(algorithmItems(item.chapter).findIndex(exercise => exercise.id === id) / 3) : 0; };
function algorithmQuestion(chapter, unit) { if (unit === 0 && window.PA_ALGO_QUIZZES[chapter.id]) { return window.PA_ALGO_QUIZZES[chapter.id]; } if (unit === 1 && window.PA_ALGO_LESSONS[chapter.id]) { return window.PA_ALGO_LESSONS[chapter.id].check; } const cards = chapter.studyCards; return cards[Math.max(0, unit - 2) % cards.length].quiz; }

const lessonUnlocked = index => index === 0 || lessonIsCompleted(beginnerLessons[index - 1]);
const practiceStep = id => { const item = beginnerExercises.find(exercise => exercise.id === id); return item ? 4 + exercisesForLesson(item.chapter).findIndex(exercise => exercise.id === id) : 0; };
function persistJourney() { try { localStorage.setItem(journeyStorageKey, JSON.stringify(journey)); } catch { const label = document.querySelector('#course-progress'); if (label) { label.textContent = 'Progresul interactiv nu poate fi salvat în acest browser.'; } } }
function localDay(value = new Date()) { const y = value.getFullYear(); const m = String(value.getMonth() + 1).padStart(2, '0'); const d = String(value.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
function markActivity() { const day = localDay(); if (!journey.activityDays.includes(day)) { journey.activityDays.push(day); journey.activityDays = journey.activityDays.slice(-365); persistJourney(); } }
function currentStreak() { const days = new Set(journey.activityDays); let date = new Date(); if (!days.has(localDay(date))) { date.setDate(date.getDate() - 1); } let count = 0; while (days.has(localDay(date)) && count < 365) { count++; date.setDate(date.getDate() - 1); } return count; }
function journeyStats() { const correct = beginnerLessons.reduce((sum, lesson) => sum + questionsForLesson(lesson.id).filter((_, index) => quizPassed(lesson.id, index)).length, 0); const beginnerDone = beginnerExercises.filter(isPassed).length; const subjectDone = exercises.filter(isPassed).length; const lessonsDone = beginnerLessons.filter(lessonIsCompleted).length; const algoCorrect = chapters.reduce((sum, chapter) => sum + algorithmUnits(chapter.id).filter((_, index) => quizPassed(chapter.id, index)).length, 0); const algoChaptersDone = chapters.filter(algorithmCompleted).length; const xp = correct * 10 + beginnerDone * 20 + subjectDone * 25 + lessonsDone * 40 + algoCorrect * 10 + algoChaptersDone * 30; return { correct, beginnerDone, subjectDone, lessonsDone, algoCorrect, algoChaptersDone, xp, level: Math.floor(xp / 120) + 1, streak: currentStreak() }; }
function firstPendingStep(lesson) { if (!quizPassed(lesson.id, 0)) { return 0; } if (!quizPassed(lesson.id, 1)) { return 2; } const index = exercisesForLesson(lesson.id).findIndex(item => !isPassed(item)); return index === -1 ? 7 : 4 + index; }
function nextLesson() { return beginnerLessons.find((lesson, index) => lessonUnlocked(index) && !lessonIsCompleted(lesson)) || beginnerLessons[beginnerLessons.length - 1]; }
function setText(selector, value) { const node = document.querySelector(selector); if (node) { node.textContent = value; } }
function setWidth(selector, value) { const node = document.querySelector(selector); if (node) { node.style.width = `${Math.min(100, Math.max(0, value))}%`; } }
const unifiedHome = document.querySelector('#acasa');
const unifiedIntro = document.querySelector('#course-lesson-list');
const unifiedPath = document.querySelector('#roadmap');
unifiedHome.querySelector('.welcome-copy h1').innerHTML = 'Un pas mic.<br><em>În fiecare zi.</em>';
unifiedHome.querySelector('.welcome-copy .lead').textContent = 'Un singur drum: începi de la zero, apoi înveți algoritmii. Citește, răspunde și scrie cod.';
unifiedHome.querySelector('.section-heading').innerHTML = '<h2>Drumul tău prin PA</h2>';
unifiedHome.querySelector('.paths-grid').hidden = true;
unifiedHome.querySelector('.dashboard-bottom').hidden = true;
const unifiedMap = document.createElement('div');
unifiedMap.className = 'unified-map';
unifiedMap.innerHTML = '<div class="path-banner"><span>START</span><h2>Primul tău program</h2><p>Cinci lecții pentru început. Apoi continuă mai jos cu materia.</p></div>';
unifiedMap.append(unifiedIntro);
const unifiedDivider = document.createElement('div');
unifiedDivider.className = 'path-banner';
unifiedDivider.innerHTML = '<span>CONTINUĂ</span><h2>Python și algoritmi</h2><p>Capitole în ordinea în care ai nevoie de ele.</p>';
unifiedMap.append(unifiedDivider, unifiedPath);
unifiedHome.append(unifiedMap);
document.querySelectorAll('#traseu > .notice').forEach(note => unifiedHome.append(note));
const unifiedExtras = document.createElement('details');
unifiedExtras.className = 'path-extras';
unifiedExtras.innerHTML = '<summary>Mai multe opțiuni</summary><a class="text-link" href="#exercitii">Caută o problemă sau salvează progresul →</a>';
unifiedHome.append(unifiedExtras);
function renderDashboard() {
const s = journeyStats();
setText('#side-level', s.level); setText('#side-xp', `${s.xp} XP`); setText('#side-next', `Încă ${120 - s.xp % 120} XP până la nivelul următor`); setWidth('#side-meter', s.xp % 120 / 120 * 100);
setText('#header-xp', s.xp); setText('#header-streak', s.streak); setText('#dashboard-level', s.level); setText('#dashboard-xp', s.xp); setText('#dashboard-tasks', `${s.beginnerDone + s.subjectDone}/${beginnerExercises.length + exercises.length}`); setText('#dashboard-streak', s.streak);
setText('#home-python-progress', `${s.lessonsDone}/${beginnerLessons.length} lecții finalizate`); setText('#home-algo-progress', `${s.subjectDone}/${exercises.length} rezolvate`); setWidth('#home-python-meter', s.lessonsDone / beginnerLessons.length * 100); setWidth('#home-algo-meter', s.subjectDone / exercises.length * 100);
setText('#algo-progress-count', `${s.subjectDone}/${exercises.length}`); setWidth('#algo-meter', s.subjectDone / exercises.length * 100);
const lesson = nextLesson(); const finished = beginnerLessons.every(lessonIsCompleted); const link = `#lectie-python/${lesson.id}/${firstPendingStep(lesson)}`;
setText('#next-step-title', finished ? 'Felicitări! Traseul Python este finalizat' : lesson.title.slice(5)); setText('#next-step-description', finished ? 'Continuă cu problemele de algoritmică și avansează spre teme noi.' : lesson.subtitle);
const resume = document.querySelector('#resume-learning'); const next = document.querySelector('#next-step-link'); if (resume) { resume.href = finished ? '#traseu' : link; resume.innerHTML = finished ? 'Exersează algoritmi <span>→</span>' : 'Continuă învățarea <span>→</span>'; } if (next) { next.href = finished ? '#traseu' : link; next.textContent = finished ? 'Deschide algoritmii →' : 'Continuă lecția →'; }
if (typeof journey.resume === "string" && /^#(capitol|lectie-python)\/[a-z-]+\/\d+(\/\d+)?$/.test(journey.resume)) { const id = journey.resume.split("/")[1]; const selected = chapters.find(item => item.id === id) || beginnerLessons.find(item => item.id === id); if (selected) { if (resume) { resume.href = journey.resume; } if (next) { next.href = journey.resume; } setText("#next-step-title", selected.title.slice(5)); setText("#next-step-description", "Reia lecția din locul în care ai rămas."); } }
roadmap.querySelectorAll('.road-card').forEach((card, index) => { const chapter = chapters[index]; const passed = exercises.filter(item => item.chapter === chapter.id && isPassed(item)).length; const all = exercises.filter(item => item.chapter === chapter.id).length; const label = card.querySelector('small'); if (label) { label.textContent = `${passed}/${all} exerciții · ${algorithmUnits(chapter.id).length} ${algorithmUnits(chapter.id).length === 1 ? 'lecție scurtă' : 'lecții scurte'}${chapter.supplemental ? ' · suplimentar' : ''}`; } card.classList.toggle('road-done', algorithmCompleted(chapter)); const resume = card.querySelector('a'); if (resume) { resume.href = `#capitol/${chapter.id}/${firstPendingAlgorithmStep(chapter)}/${firstPendingAlgorithmUnit(chapter)}`; resume.textContent = algorithmCompleted(chapter) ? 'Recapitulează →' : 'Continuă →'; } let path = card.querySelector('.unit-path'); if (!path) { path = document.createElement('details'); path.className = 'unit-path'; card.append(path); } path.innerHTML = '<summary>Alege o lecție scurtă</summary><div class="unit-nodes">' + algorithmUnits(chapter.id).map((items, i) => `<a class="unit-node ${algorithmUnitDone(chapter, i) ? 'unit-done' : i === firstPendingAlgorithmUnit(chapter) ? 'unit-current' : ''}" href="#capitol/${chapter.id}/0/${i}"><b>${algorithmUnitDone(chapter, i) ? '✓' : i + 1}</b><span>${escapeHTML(items[0].title)}<small>${items.length} exerciții · 1 întrebare</small></span></a>`).join('') + '</div>'; });
}
function renderCourse() {
const s = journeyStats(); setText('#course-progress', `${s.lessonsDone} din ${beginnerLessons.length} lecții finalizate · ${s.correct}/10 quiz-uri corecte · ${s.beginnerDone}/15 exerciții verificate`); setWidth('#course-meter', s.lessonsDone / beginnerLessons.length * 100);
document.querySelector('#course-lesson-list').innerHTML = beginnerLessons.map((lesson, index) => { const tasks = exercisesForLesson(lesson.id); const count = tasks.filter(isPassed).length; const locked = !lessonUnlocked(index); const done = lessonIsCompleted(lesson); const href = `#lectie-python/${lesson.id}/${firstPendingStep(lesson)}`; return `<article class="course-card ${locked ? 'course-locked' : ''} ${done ? 'course-done' : ''}"><div class="course-number">${done ? '✓' : locked ? '🔒' : String(index + 1).padStart(2, '0')}</div><div class="course-card-content"><div class="eyebrow">${escapeHTML(lesson.duration)} · ${count}/${tasks.length} exerciții</div><h2>${escapeHTML(lesson.title)}</h2><p>${escapeHTML(lesson.subtitle)}</p><div class="mini-progress"><span style="width:${count / tasks.length * 100}%"></span></div>${locked ? '<span class="locked-label">Finalizează lecția precedentă pentru a debloca</span>' : `<a class="text-link" href="${href}">${done ? 'Revezi lecția ↗' : index === 0 ? 'Începe lecția →' : 'Continuă →'}</a>`}</div><span class="course-status">${done ? 'Completă' : locked ? 'Blocată' : 'Disponibilă'}</span></article>`; }).join('');
}
function stepAvailable(lesson, step) { if (step <= 1) { return true; } if (step <= 3) { return quizPassed(lesson.id, 0); } if (step >= 4 && step <= 7) { return quizPassed(lesson.id, 0) && quizPassed(lesson.id, 1) && exercisesForLesson(lesson.id).slice(0, Math.max(0, step - 4)).every(isPassed); } return false; }
function resolveStep(lesson, requested) { const step = Number.isInteger(requested) && requested >= 0 && requested <= 7 ? requested : firstPendingStep(lesson); if (stepAvailable(lesson, step)) { return step; } for (let i = 0; i < 7; i++) { if (!stepAvailable(lesson, i + 1)) { return i; } } return 0; }
function algorithmStepAvailable(chapter, step, unit) { if (step <= 1) { return true; } return quizPassed(chapter.id, unit) && algorithmUnits(chapter.id)[unit].slice(0, step - 2).every(isPassed); }
function resolveAlgorithmStep(chapter, requested, unit) { const last = algorithmUnits(chapter.id)[unit].length + 2; const step = Number.isInteger(requested) && requested >= 0 && requested <= last ? requested : firstPendingAlgorithmStep(chapter, unit); if (algorithmStepAvailable(chapter, step, unit)) { return step; } for (let i = 0; i < last; i++) { if (!algorithmStepAvailable(chapter, i + 1, unit)) { return i; } } return 0; }
function renderQuiz(question, key, quizIndex, algorithm = false) { const passed = quizPassed(key, quizIndex); const choices = question.options.map((option, i) => `<button class="quiz-option ${passed && i === question.correct ? 'correct' : ''}" type="button" ${algorithm ? `data-algo-question="${quizIndex}" data-algo-answer="${i}"` : `data-question="${quizIndex}" data-answer="${i}"`} ${passed ? 'disabled' : ''}><span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(option)}</span>${passed && i === question.correct ? '<span class="option-check">✓</span>' : ''}</button>`).join(''); const feedbackId = algorithm ? 'algo-quiz-feedback' : 'quiz-feedback'; return `<span class="question-kicker">ALEGE RĂSPUNSUL · +10 XP</span><h2>${escapeHTML(question.question)}</h2><div class="quiz-options" role="group" aria-label="Răspunsuri posibile">${choices}</div><div id="${feedbackId}" class="quiz-feedback ${passed ? 'correct-feedback' : ''}" role="status">${passed ? `✓ Corect! ${escapeHTML(question.explanation)}` : 'Alege un răspuns pentru a continua.'}</div>`; }
function playerControls(prev, next, step, last, canContinue, kind, finishText) { const back = `<a class="secondary step-back" href="${prev}">← Înapoi</a>`; const forward = step === last ? `<a class="button" href="${next}">${finishText} →</a>` : canContinue ? `<a class="button" data-step-next href="${next}">Continuă →</a>` : `<button class="button" type="button" data-step-next disabled>${['ÎNTREBARE', 'ALEGE'].includes(kind) ? 'Răspunde' : 'Verifică exercițiul'} pentru a continua</button>`; return `<div class="lesson-controls">${back}${forward}</div>`; }

function renderLesson(id) {
window.PA_EDITOR?.restore();
journey.resume = location.hash; persistJourney();
const index = beginnerLessons.findIndex(item => item.id === id); const lesson = beginnerLessons[index < 0 ? 0 : index]; const courseIndex = beginnerLessons.indexOf(lesson); const container = document.querySelector('#course-lesson-content');
if (!lessonUnlocked(courseIndex)) { container.innerHTML = `<div class="lesson-player"><div class="eyebrow">LECȚIE BLOCATĂ</div><h2>Finalizează întâi lecția precedentă.</h2><p>Răspunde la quiz-uri și verifică cele trei exerciții.</p><a class="button" href="#curs-python">Înapoi la curs →</a></div>`; return; }
const requested = Number(location.hash.split('/')[2]); const step = resolveStep(lesson, location.hash.split('/')[2] === undefined ? NaN : requested); const questions = questionsForLesson(lesson.id); const tasks = exercisesForLesson(lesson.id); const item = step >= 4 && step <= 6 ? tasks[step - 4] : null;
let content = ''; let canContinue = true; let kind = 'CONCEPT';
if (step === 0) { content = `<div class="lesson-illustration">🧠 <span>O SINGURĂ IDEE PE RÂND</span></div><h2>${escapeHTML(lesson.title.slice(5))}</h2><p>${escapeHTML(lesson.lesson[0])}</p><div class="concept-highlight">${escapeHTML(lesson.lesson[1])}</div>`; }
if (step === 1 || step === 3) { kind = 'ÎNTREBARE'; const quizIndex = step === 1 ? 0 : 1; canContinue = quizPassed(lesson.id, quizIndex); content = renderQuiz(questions[quizIndex], lesson.id, quizIndex); }
if (step === 2) { kind = 'EXEMPLU'; content = `<div class="eyebrow">URMĂREȘTE EXEMPLUL</div><h2>Ce face fiecare linie?</h2><pre class="concept-code"><code>${escapeHTML(lesson.example)}</code></pre><p>${escapeHTML(lesson.explain)}</p><div class="concept-highlight">${escapeHTML(lesson.lesson[2])}</div>`; }
if (item) { kind = 'SCRIE COD'; canContinue = isPassed(item); content = `<span class="question-kicker">PROVOCARE ${step - 3} DIN 3 · +20 XP</span><h2>${escapeHTML(item.title)}</h2><p>Scrie și verifică soluția chiar aici. După toate testele corecte, apasă „Continuă”.</p><div id="inline-editor-slot" class="inline-editor-slot"></div><p id="inline-completion" class="quiz-feedback ${canContinue ? 'correct-feedback' : ''}" role="status">${canContinue ? '✓ Exercițiu rezolvat. Treci direct la următorul pas.' : 'Verifică soluția pentru a debloca pasul următor.'}</p>`; }
if (step === 7) { kind = 'REUȘITĂ'; const finished = lessonIsCompleted(lesson); content = `<div class="finish-icon">🏆</div><h2>${finished ? 'Lecție terminată!' : 'Mai ai câteva sarcini de rezolvat.'}</h2><p>${finished ? 'Ai răspuns la întrebări și ai testat toate cele trei programe. Poți continua cu următoarea lecție.' : 'Revino la exercițiile incomplete.'}</p><div class="reward-list"><span>✦ 20 XP quiz-uri</span><span>⌨ 60 XP exerciții</span><span>⚡ +40 XP lecție</span></div>`; }
const percent = (step + 1) / 8 * 100; const prev = step > 0 ? `#lectie-python/${lesson.id}/${step - 1}` : '#curs-python'; const next = step < 7 ? `#lectie-python/${lesson.id}/${step + 1}` : beginnerLessons[courseIndex + 1] ? `#lectie-python/${beginnerLessons[courseIndex + 1].id}/0` : '#traseu'; const dots = Array.from({ length: 8 }, (_, dot) => `<span class="step-dot ${dot === step ? 'current' : dot < step ? 'done' : ''}" title="Pasul ${dot + 1}"></span>`).join('');
container.innerHTML = `<div class="lesson-player ${item ? 'has-editor' : ''}"><div class="lesson-top"><div><span class="eyebrow">PYTHON · LECȚIA ${courseIndex + 1}/${beginnerLessons.length} · ${kind}</span><h1 class="player-title">${escapeHTML(lesson.title.slice(5))}</h1></div><span class="lesson-step-counter">${step + 1} / 8</span></div><div class="lesson-progress"><span style="width:${percent}%"></span></div><div class="step-dots">${dots}</div><article class="lesson-screen">${content}</article>${playerControls(prev, next, step, 7, canContinue, kind, courseIndex === beginnerLessons.length - 1 ? 'Mergi la algoritmi' : 'Lecția următoare')}</div>`;
if (item) { window.PA_EDITOR?.attachTo(container.querySelector('#inline-editor-slot'), item.id); }
}
function onQuizClick(event) { const option = event.target.closest('.quiz-option'); if (!option) { return; } const lessonId = location.hash.split('/')[1]; const index = Number(option.dataset.question); const answer = Number(option.dataset.answer); const question = questionsForLesson(lessonId)[index]; if (!question || quizPassed(lessonId, index)) { return; } if (answer !== question.correct) { document.querySelectorAll('.quiz-option').forEach(button => button.classList.remove('wrong')); option.classList.add('wrong'); const feedback = document.querySelector('#quiz-feedback'); feedback.textContent = `Mai încearcă. Explicație: ${question.explanation}`; feedback.className = 'quiz-feedback wrong-feedback'; return; } journey.quiz[quizKey(lessonId, index)] = true; markActivity(); persistJourney(); renderLesson(lessonId); updateAll(); }
function renderChapter(id) {
window.PA_EDITOR?.restore();
const chapter = chapters.find(item => item.id === id) || chapters[0];
const chapterIndex = chapters.indexOf(chapter);
const units = algorithmUnits(chapter.id);
const requestedUnit = Number(location.hash.split('/')[3]);
const unit = Number.isInteger(requestedUnit) && requestedUnit >= 0 && requestedUnit < units.length ? requestedUnit : firstPendingAlgorithmUnit(chapter);
const info = window.PA_ALGO_LESSONS[chapter.id];
const concept = { ...chapter.studyCards[Math.max(0, unit - 2) % chapter.studyCards.length] };
if (unit === 0 && info) { concept.title = info.hook; concept.text = `${info.story} ${info.points.join(' ')}`; concept.example = chapter.example; }
const items = units[unit];
const last = items.length + 2;
const requested = Number(location.hash.split('/')[2]);
const step = resolveAlgorithmStep(chapter, location.hash.split('/')[2] === undefined ? NaN : requested, unit);
const item = step >= 2 && step < last ? items[step - 2] : null;
journey.resume = `#capitol/${chapter.id}/${step}/${unit}`; persistJourney();
let content = ''; let kind = 'ÎNȚELEGE'; let canContinue = true;
if (step === 0) { content = `<div class="lesson-illustration">🧭 <span>O IDEE. TREI EXERCIȚII. UN PAS ÎNAINTE.</span></div><h2>${escapeHTML(concept.title)}</h2><p>${escapeHTML(concept.text)}</p><pre class="concept-code"><code>${escapeHTML(concept.example)}</code></pre><details class="study-notebook"><summary>Recapitularea capitolului</summary>${chapter.studyCards.map(card => `<article><h3>${escapeHTML(card.title)}</h3><p>${escapeHTML(card.text)}</p><pre><code>${escapeHTML(card.example)}</code></pre></article>`).join('')}</details>`; }
if (step === 1) { kind = 'ALEGE'; canContinue = quizPassed(chapter.id, unit); content = renderQuiz(algorithmQuestion(chapter, unit), chapter.id, unit, true); }
if (item) { kind = 'SCRIE COD'; canContinue = isPassed(item); content = `<span class="question-kicker">EXERCIȚIUL ${step - 1}/${items.length} · ${escapeHTML(item.level)} · +25 XP</span><h2>${escapeHTML(item.title)}</h2><p>Scrie soluția, verifică și continuă. Indiciul este disponibil când ai nevoie.</p><div id="inline-editor-slot" class="inline-editor-slot"></div><p id="inline-completion" class="quiz-feedback ${canContinue ? 'correct-feedback' : ''}" role="status">${canContinue ? '✓ Corect! Poți continua.' : 'Verifică soluția pentru a continua.'}</p>`; }
if (step === last) { kind = 'LECȚIE COMPLETĂ'; const finished = algorithmUnitDone(chapter, unit); content = `<div class="finish-icon">🌟</div><h2>${finished ? 'Încă o lecție învățată!' : 'Mai sunt exerciții de verificat.'}</h2><p>${finished ? 'Ai verificat programele și ai răspuns la întrebare. Poți continua sau reveni la traseu.' : 'Revino la exercițiile incomplete.'}</p><div class="reward-list"><span>✦ 10 XP întrebare</span><span>⌨ ${25 * items.length} XP exerciții</span></div><a class="text-link" href="#traseu">Vezi traseul →</a>`; }
const percent = (step + 1) / (last + 1) * 100;
const base = `#capitol/${chapter.id}`;
const prev = step > 0 ? `${base}/${step - 1}/${unit}` : '#traseu';
const next = step < last ? `${base}/${step + 1}/${unit}` : unit + 1 < units.length ? `${base}/0/${unit + 1}` : chapters[chapterIndex + 1] ? `#capitol/${chapters[chapterIndex + 1].id}/0/0` : '#traseu';
const dots = Array.from({ length: last + 1 }, (_, dot) => `<span class="step-dot ${dot === step ? 'current' : dot < step ? 'done' : ''}" title="Pasul ${dot + 1}"></span>`).join('');
document.querySelector('#chapter-content').innerHTML = `<div class="lesson-player ${item ? 'has-editor' : ''}"><div class="lesson-top"><div><span class="eyebrow">${chapter.supplemental || items.every(item => item.supplemental) ? 'SUPLIMENTAR' : 'PA'} · LECȚIA ${unit + 1}/${units.length} · ${kind}</span><h1 class="player-title">${escapeHTML(chapter.title.slice(5))}</h1></div><span class="lesson-step-counter">${step + 1} / ${last + 1}</span></div><div class="lesson-progress"><span style="width:${percent}%"></span></div><div class="step-dots" aria-hidden="true">${dots}</div><article class="lesson-screen">${content}</article>${playerControls(prev, next, step, last, canContinue, kind, unit + 1 < units.length ? 'Lecția următoare' : 'Capitolul următor')}</div>`;
if (item) { window.PA_EDITOR?.attachTo(document.querySelector('#chapter-content #inline-editor-slot'), item.id); }
}
function onAlgoQuizClick(event) {
const button = event.target.closest('[data-algo-answer]');
if (!button) { return; }
const id = location.hash.split('/')[1];
const chapter = chapters.find(item => item.id === id);
const index = Number(button.dataset.algoQuestion);
const question = chapter && algorithmQuestion(chapter, index);
if (!question || quizPassed(id, index)) { return; }
if (Number(button.dataset.algoAnswer) !== question.correct) { document.querySelectorAll('[data-algo-answer]').forEach(option => option.classList.remove('wrong')); button.classList.add('wrong'); const feedback = document.querySelector('#algo-quiz-feedback'); feedback.className = 'quiz-feedback wrong-feedback'; feedback.textContent = `Mai încearcă. ${question.explanation}`; return; }
journey.quiz[quizKey(id, index)] = true;
markActivity(); persistJourney(); renderChapter(id); updateAll(false);
}
function refreshExerciseStep(id) { const active = document.querySelector('.view:not([hidden]) .lesson-player.has-editor'); if (!active || !currentExercise || currentExercise.id !== id) { return; } const passed = isPassed(currentExercise); const current = active.querySelector('[data-step-next]'); const href = current?.getAttribute('href') || (location.hash.startsWith('#lectie-python') ? `#lectie-python/${currentExercise.chapter}/${practiceStep(id) + 1}` : `#capitol/${currentExercise.chapter}/${algorithmStep(id) + 1}/${algorithmUnit(id)}`); if (current) { current.outerHTML = passed ? `<a class="button" data-step-next href="${href}">Continuă →</a>` : `<button class="button" type="button" data-step-next disabled>Verifică exercițiul pentru a continua</button>`; } const message = active.querySelector('#inline-completion'); if (message) { message.textContent = passed ? '✓ Exercițiu rezolvat! Apasă „Continuă” pentru a trece la următorul.' : 'Verifică soluția pentru a debloca pasul următor.'; message.className = `quiz-feedback ${passed ? 'correct-feedback' : ''}`; } }
function exportJourney() { return { version: 1, quiz: journey.quiz, activityDays: journey.activityDays }; }
function importJourney(data) { if (!data || typeof data !== 'object' || data.version !== 1) { return; } const allowed = new Set([...beginnerLessons.flatMap(lesson => questionsForLesson(lesson.id).map((_, index) => quizKey(lesson.id, index))), ...chapters.flatMap(chapter => algorithmUnits(chapter.id).map((_, index) => quizKey(chapter.id, index)))]); if (data.quiz && typeof data.quiz === 'object') { for (const [key, value] of Object.entries(data.quiz)) { if (allowed.has(key) && value === true) { journey.quiz[key] = true; } } } if (Array.isArray(data.activityDays)) { journey.activityDays = [...new Set([...journey.activityDays, ...data.activityDays.filter(day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day))])].sort().slice(-365); } persistJourney(); updateAll(); }
function updateAll(refreshCurrent = true) { renderDashboard(); renderCourse(); if (refreshCurrent && location.hash.startsWith('#lectie-python/')) { renderLesson(location.hash.split('/')[1]); } if (refreshCurrent && location.hash.startsWith('#capitol/')) { renderChapter(location.hash.split('/')[1]); } }
window.PA_JOURNEY = { renderCourse, renderLesson, renderChapter, updateAll, markActivity, exportState: exportJourney, importState: importJourney, getExerciseStepIndex: practiceStep, getAlgorithmStepIndex: algorithmStep, getAlgorithmUnitIndex: algorithmUnit, refreshExerciseStep, stats: journeyStats };
document.querySelector('#course-lesson-content').addEventListener('click', onQuizClick);
document.querySelector('#chapter-content').addEventListener('click', onAlgoQuizClick);
window.addEventListener('hashchange', () => { if (location.hash === '#acasa' || location.hash === '') { renderDashboard(); } if (location.hash === '#traseu') { renderDashboard(); } });
updateAll();


