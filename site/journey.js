/* Lecții, întrebări și progres. */
const journeyStorageKey = 'pa-journey-v1' + accountStorageSuffix;
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

const practiceStep = id => { const item = beginnerExercises.find(exercise => exercise.id === id); return item ? 4 + exercisesForLesson(item.chapter).findIndex(exercise => exercise.id === id) : 0; };
function persistJourney() { try { localStorage.setItem(journeyStorageKey, JSON.stringify(journey)); window.PA_CLOUD?.changed(); } catch { const label = document.querySelector('#course-progress'); if (label) { label.textContent = 'Progresul interactiv nu poate fi salvat în acest browser.'; } } }
function localDay(value = new Date()) { const y = value.getFullYear(); const m = String(value.getMonth() + 1).padStart(2, '0'); const d = String(value.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
function markActivity() { const day = localDay(); if (!journey.activityDays.includes(day)) { journey.activityDays.push(day); journey.activityDays = journey.activityDays.slice(-365); persistJourney(); } }
function journeyStats() { const correct = beginnerLessons.reduce((sum, lesson) => sum + questionsForLesson(lesson.id).filter((_, index) => quizPassed(lesson.id, index)).length, 0); const beginnerDone = beginnerExercises.filter(isPassed).length; const subjectDone = exercises.filter(isPassed).length; const lessonsDone = beginnerLessons.filter(lessonIsCompleted).length; const algoCorrect = chapters.reduce((sum, chapter) => sum + algorithmUnits(chapter.id).filter((_, index) => quizPassed(chapter.id, index)).length, 0); const algoChaptersDone = chapters.filter(algorithmCompleted).length; return { correct, beginnerDone, subjectDone, lessonsDone, algoCorrect, algoChaptersDone }; }
function firstPendingStep(lesson) { if (!quizPassed(lesson.id, 0)) { return 0; } if (!quizPassed(lesson.id, 1)) { return 2; } const index = exercisesForLesson(lesson.id).findIndex(item => !isPassed(item)); return index === -1 ? 7 : 4 + index; }
function nextLesson() { return beginnerLessons.find(lesson => !lessonIsCompleted(lesson)) || beginnerLessons[beginnerLessons.length - 1]; }
function setText(selector, value) { const node = document.querySelector(selector); if (node) { node.textContent = value; } }
const unifiedHome = document.querySelector('#acasa');
const unifiedIntro = document.querySelector('#course-lesson-list');
const unifiedPath = document.querySelector('#roadmap');
const unifiedMap = document.createElement('div');
unifiedMap.className = 'unified-map';
unifiedMap.append(unifiedIntro);
unifiedMap.append(unifiedPath);
unifiedHome.append(unifiedMap);
document.querySelectorAll('#traseu > .notice').forEach(note => unifiedHome.append(note));
function courseProgressPercent() { const s = journeyStats(); const progressTotal = beginnerExercises.length + exercises.length + beginnerLessons.reduce((sum, lesson) => sum + questionsForLesson(lesson.id).length, 0) + chapters.reduce((sum, chapter) => sum + algorithmUnits(chapter.id).length, 0); const progressDone = s.beginnerDone + s.subjectDone + s.correct + s.algoCorrect; return Math.floor(progressDone / progressTotal * 100); }
function renderDashboard() {
const s = journeyStats();
const progressPercent = courseProgressPercent();
const lessonCount=beginnerLessons.length+chapters.reduce((total,chapter)=>total+algorithmUnits(chapter.id).length,0);
setText('#course-totals', `${chapters.length+1} capitole · ${lessonCount} lecții · ${beginnerExercises.length+exercises.length} exerciții`);
setText('#header-progress', `${progressPercent}%`);
const progressIndicator = document.querySelector('#header-progress-bar');
progressIndicator.style.width = `${progressPercent}%`;
progressIndicator.parentElement.setAttribute('aria-valuenow', String(progressPercent));
const lesson = nextLesson(); const finished = beginnerLessons.every(lessonIsCompleted); const link = `#lectie-python/${lesson.id}/${firstPendingStep(lesson)}`;
const resume = document.querySelector('#resume-learning'); if (resume) { resume.href = finished ? '#traseu' : link; resume.innerHTML = finished ? 'Exersează algoritmi <span>→</span>' : 'Continuă lecția <span>→</span>'; }
if (typeof journey.resume === "string" && /^#(capitol|lectie-python)\/[a-z-]+\/\d+(\/\d+)?$/.test(journey.resume)) { const id = journey.resume.split("/")[1]; const selected = chapters.find(item => item.id === id) || beginnerLessons.find(item => item.id === id); if (selected) { if (resume) { resume.href = journey.resume; } } }
renderAlgorithmPath();
}
function pathChapter({id,index,title,subtitle,rows,current}) {
const count=rows.filter(row=>row.done).length;
const next=rows.find(row=>!row.done)||rows[0];
const previous=document.querySelector(`[data-path="${id}"]`);
const open=previous?previous.open:current;
return `<article class="path-chapter ${current?'current-chapter':''}"><header class="chapter-banner"><div class="chapter-number">${String(index).padStart(2,'0')}</div><div><div class="eyebrow">${index===1?'PYTHON':'CAPITOLUL '+(index-1)}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(subtitle)}</p><small>${count} / ${rows.length} lecții finalizate</small><progress aria-label="Progres ${escapeHTML(title)}" max="${rows.length}" value="${count}"></progress></div><a class="button" href="${next.href}">${count===rows.length?'Recapitulează':'Continuă'} →</a></header><details data-path="${id}" ${open?'open':''}><summary>Traseul capitolului <span>${rows.length} lecții</span></summary><div class="unit-path">${rows.map((row,i)=>`${i%5===0?`<div class="unit-divider"><span>UNITATEA ${Math.floor(i/5)+1}</span><strong>${escapeHTML(row.title)}</strong></div>`:''}<a class="path-node ${row.done?'path-done':row===next?'path-current':'path-future'}" href="${row.href}" ${row===next&&!row.done?'aria-current="step"':''}><span class="node-bubble" aria-hidden="true">${row.done?'✓':i+1}</span><span class="node-label">${escapeHTML(row.title)}<small>${escapeHTML(row.subtitle)}</small></span>${row===next&&!row.done?'<span class="start-tag">CONTINUĂ AICI</span>':''}</a>`).join('')}</div></details></article>`;
}
function renderCourse() {
const rows=beginnerLessons.map(lesson=>({title:lesson.title.replace(/^\d+\s*[·.-]\s*/,''),subtitle:lesson.duration+' · explicație + exerciții',done:lessonIsCompleted(lesson),href:`#lectie-python/${lesson.id}/${firstPendingStep(lesson)}`}));
unifiedIntro.innerHTML=pathChapter({id:'python',index:1,title:'Introducere în Python',subtitle:'De la primele instrucțiuni la date de intrare, condiții și repetări.',rows,current:rows.some(row=>!row.done)});
}
function renderAlgorithmPath() {
const active=beginnerLessons.every(lessonIsCompleted)?chapters.find(chapter=>!algorithmCompleted(chapter)):null;
roadmap.innerHTML=chapters.map((chapter,index)=>{
const rows=algorithmUnits(chapter.id).map((items,unit)=>({title:items[0].title,subtitle:items.length+' exerciții · 1 întrebare',done:algorithmUnitDone(chapter,unit),href:`#capitol/${chapter.id}/${firstPendingAlgorithmStep(chapter,unit)}/${unit}`}));
return pathChapter({id:chapter.id,index:index+2,title:chapter.title.slice(5),subtitle:chapter.lesson[0],rows,current:chapter===active});
}).join('');
}
function stepAvailable(lesson,step) {
if(step<=1)return true;
if(!quizPassed(lesson.id,0))return false;
if(step<=3)return true;
return quizPassed(lesson.id,1)&&exercisesForLesson(lesson.id).slice(0,step-4).every(isPassed);
}
function resolveStep(lesson,requested) {
const step=Number.isInteger(requested)&&requested>=0&&requested<=7?requested:firstPendingStep(lesson);
if(stepAvailable(lesson,step))return step;
for(let current=0;current<7;current++)if(!stepAvailable(lesson,current+1))return current;
return 0;
}
function algorithmStepAvailable(chapter,step,unit) {
return step<=1||(quizPassed(chapter.id,unit)&&algorithmUnits(chapter.id)[unit].slice(0,step-2).every(isPassed));
}
function resolveAlgorithmStep(chapter,requested,unit) {
const last=algorithmUnits(chapter.id)[unit].length+2;
const step=Number.isInteger(requested)&&requested>=0&&requested<=last?requested:firstPendingAlgorithmStep(chapter,unit);
if(algorithmStepAvailable(chapter,step,unit))return step;
for(let current=0;current<last;current++)if(!algorithmStepAvailable(chapter,current+1,unit))return current;
return 0;
}
function renderQuiz(question, key, quizIndex, algorithm = false) { const passed = quizPassed(key, quizIndex); const choices = question.options.map((option, i) => `<button class="quiz-option ${passed && i === question.correct ? 'correct' : ''}" type="button" ${algorithm ? `data-algo-question="${quizIndex}" data-algo-answer="${i}"` : `data-question="${quizIndex}" data-answer="${i}"`} ${passed ? 'disabled' : ''}><span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(option)}</span>${passed && i === question.correct ? '<span class="option-check">✓</span>' : ''}</button>`).join(''); const feedbackId = algorithm ? 'algo-quiz-feedback' : 'quiz-feedback'; return `<span class="question-kicker">ALEGE RĂSPUNSUL</span><h2>${escapeHTML(question.question)}</h2>${question.code ? `<pre class="concept-code"><code>${escapeHTML(question.code)}</code></pre>` : ""}<div class="quiz-options" role="group" aria-label="Răspunsuri posibile">${choices}</div><div id="${feedbackId}" class="quiz-feedback ${passed ? 'correct-feedback' : ''}" role="status">${passed ? `✓ Corect! ${escapeHTML(question.explanation)}` : ''}</div>`; }
function playerControls(prev,next,step,last,canContinue,kind,finishText) {
const forward=canContinue?`<a class="button" data-step-next href="${next}">${step===last?finishText:'Continuă'} →</a>`:'<span data-step-next hidden></span>';
return `<div class="lesson-controls"><a class="secondary step-back" href="${prev}">← Înapoi</a>${forward}</div>`;
}

function renderLesson(id) {
window.PA_EDITOR?.restore();
journey.resume = location.hash; persistJourney();
const index = beginnerLessons.findIndex(item => item.id === id); const lesson = beginnerLessons[index < 0 ? 0 : index]; const courseIndex = beginnerLessons.indexOf(lesson); const container = document.querySelector('#course-lesson-content');
const requested = Number(location.hash.split('/')[2]); const step = resolveStep(lesson, location.hash.split('/')[2] === undefined ? NaN : requested); const questions = questionsForLesson(lesson.id); const tasks = exercisesForLesson(lesson.id); const item = step >= 4 && step <= 6 ? tasks[step - 4] : null;
let content = ''; let canContinue = true; let kind = 'CONCEPT';
if (step === 0) { content = `<div class="lesson-illustration">🧠 <span>O SINGURĂ IDEE PE RÂND</span></div><h2>${escapeHTML(lesson.title.slice(5))}</h2><p>${escapeHTML(lesson.lesson[0])}</p><div class="concept-highlight">${escapeHTML(lesson.lesson[1])}</div>`; }
if (step === 1 || step === 3) { kind = 'ÎNTREBARE'; const quizIndex = step === 1 ? 0 : 1; canContinue = quizPassed(lesson.id, quizIndex); content = renderQuiz(questions[quizIndex], lesson.id, quizIndex); }
if (step === 2) { kind = 'EXEMPLU'; content = `<div class="eyebrow">URMĂREȘTE EXEMPLUL</div><h2>Ce face fiecare linie?</h2><pre class="concept-code"><code>${escapeHTML(lesson.example)}</code></pre><p>${escapeHTML(lesson.explain)}</p><div class="concept-highlight">${escapeHTML(lesson.lesson[2])}</div>`; }
if (item) { kind = 'SCRIE COD'; canContinue = isPassed(item); content = `<span class="question-kicker">PROVOCARE ${step - 3} DIN 3</span><h2>${escapeHTML(item.title)}</h2><div id="inline-editor-slot" class="inline-editor-slot"></div><p id="inline-completion" class="quiz-feedback ${canContinue ? 'correct-feedback' : ''}" role="status">${canContinue ? '✓ Exercițiu rezolvat. Treci direct la următorul pas.' : ''}</p>`; }
if (step === 7) { kind = 'REUȘITĂ'; const finished = lessonIsCompleted(lesson); const percent = courseProgressPercent(); content = `<h2>${finished ? 'Lecție finalizată' : 'Lecție incompletă'}</h2><div class="lesson-result-progress"><strong>${percent}%</strong><span>din curs</span><progress max="100" value="${percent}" aria-label="Progresul cursului"></progress></div>`; }
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
if (item) { kind = 'SCRIE COD'; canContinue = isPassed(item); content = `<span class="question-kicker">EXERCIȚIUL ${step - 1}/${items.length} · ${escapeHTML(item.level)}</span><h2>${escapeHTML(item.title)}</h2><div id="inline-editor-slot" class="inline-editor-slot"></div><p id="inline-completion" class="quiz-feedback ${canContinue ? 'correct-feedback' : ''}" role="status">${canContinue ? '✓ Corect! Poți continua.' : ''}</p>`; }
if (step === last) { kind = 'LECȚIE COMPLETĂ'; const finished = algorithmUnitDone(chapter, unit); const percent = courseProgressPercent(); content = `<h2>${finished ? 'Lecție finalizată' : 'Lecție incompletă'}</h2><div class="lesson-result-progress"><strong>${percent}%</strong><span>din curs</span><progress max="100" value="${percent}" aria-label="Progresul cursului"></progress></div><a class="text-link" href="#traseu">Capitole →</a>`; }
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
function refreshExerciseStep(id) { const active = document.querySelector('.view:not([hidden]) .lesson-player.has-editor'); if (!active || !currentExercise || currentExercise.id !== id) { return; } const passed = isPassed(currentExercise); const current = active.querySelector('[data-step-next]'); const href = current?.getAttribute('href') || (location.hash.startsWith('#lectie-python') ? `#lectie-python/${currentExercise.chapter}/${practiceStep(id) + 1}` : `#capitol/${currentExercise.chapter}/${algorithmStep(id) + 1}/${algorithmUnit(id)}`); if (current) { current.outerHTML = passed ? `<a class="button" data-step-next href="${href}">Continuă →</a>` : '<span data-step-next hidden></span>'; } const message = active.querySelector('#inline-completion'); if (message) { message.textContent = passed ? '✓ Exercițiu rezolvat! Apasă „Continuă” pentru a trece la următorul.' : ''; message.className = `quiz-feedback ${passed ? 'correct-feedback' : ''}`; } }
function exportJourney() { return { version: 1, quiz: journey.quiz, activityDays: journey.activityDays, resume:journey.resume }; }
function importJourney(data) { if (!data || typeof data !== 'object' || data.version !== 1) { return; } const allowed = new Set([...beginnerLessons.flatMap(lesson => questionsForLesson(lesson.id).map((_, index) => quizKey(lesson.id, index))), ...chapters.flatMap(chapter => algorithmUnits(chapter.id).map((_, index) => quizKey(chapter.id, index)))]); if (data.quiz && typeof data.quiz === 'object') { for (const [key, value] of Object.entries(data.quiz)) { if (allowed.has(key) && value === true) { journey.quiz[key] = true; } } } if (Array.isArray(data.activityDays)) { journey.activityDays = [...new Set([...journey.activityDays, ...data.activityDays.filter(day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day))])].sort().slice(-365); } persistJourney(); updateAll(); }
function updateAll(refreshCurrent = true) { renderDashboard(); renderCourse(); if (refreshCurrent && location.hash.startsWith('#lectie-python/')) { renderLesson(location.hash.split('/')[1]); } if (refreshCurrent && location.hash.startsWith('#capitol/')) { renderChapter(location.hash.split('/')[1]); } }
window.PA_JOURNEY = { replaceState:data => { journey = { quiz:{},activityDays:[] }; importJourney(data); if (typeof data?.resume === 'string') { journey.resume = data.resume; } persistJourney(); }, renderCourse, renderLesson, renderChapter, updateAll, markActivity, exportState: exportJourney, importState: importJourney, getExerciseStepIndex: practiceStep, getAlgorithmStepIndex: algorithmStep, getAlgorithmUnitIndex: algorithmUnit, refreshExerciseStep, stats: journeyStats };
document.querySelector('#course-lesson-content').addEventListener('click', onQuizClick);
document.querySelector('#chapter-content').addEventListener('click', onAlgoQuizClick);
window.addEventListener('hashchange', () => { if (location.hash === '#acasa' || location.hash === '') { renderDashboard(); } if (location.hash === '#traseu') { renderDashboard(); } });
updateAll();


