const editor = document.querySelector('#python-code');
const stdin = document.querySelector('#python-input');
const result = document.querySelector('#python-output');
const runButton = document.querySelector('#python-run');
const stopButton = document.querySelector('#python-stop');
const checkButton = document.querySelector('#python-check');
const status = document.querySelector('#python-status');
const exercises = window.PA_CONTENT.exercises;
const chapters = window.PA_CONTENT.chapters;
const beginnerExercises = window.PA_BEGINNER.exercises;
const beginnerLessons = window.PA_BEGINNER.lessons;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let activeWorker = null;
let cancelRun = null;
let currentExercise;
let drafts = {};
let leaveEditor = false;
const sharedEditor = document.querySelector('#shared-editor');
const editorHome = document.querySelector('#editor-home');
function restoreEditor() { if (sharedEditor.parentElement !== editorHome) { if (currentExercise) { saveCode(); } editorHome.append(sharedEditor); } sharedEditor.classList.remove('inline-mode'); }
function attachEditor(slot, id) { if (!slot) { return; } if (sharedEditor.parentElement !== slot) { if (currentExercise) { saveCode(); } slot.append(sharedEditor); } sharedEditor.classList.add('inline-mode'); if (!currentExercise || currentExercise.id !== id) { selectExercise(id); } else { updateExerciseProgress(); } }
try { const stored = JSON.parse(localStorage.getItem('pa-drafts-v2') || '{}'); if (stored && typeof stored === 'object' && !Array.isArray(stored)) { drafts = stored; } } catch { status.textContent = 'Salvarea locală nu este disponibilă. Descarcă soluțiile.'; }
try { const previous = localStorage.getItem('pa-python-code'); if (!drafts['baze-01'] && previous !== null) { drafts['baze-01'] = { code: previous, input: localStorage.getItem('pa-python-input') ?? exercises[0].tests[0].input }; } } catch {}
function isPassed(exercise) { const draft = drafts[exercise.id]; return typeof draft?.code === 'string' && draft.code === draft.passedCode; }
function persistDrafts() { try { localStorage.setItem('pa-drafts-v2', JSON.stringify(drafts)); } catch { status.textContent = 'Nu se poate salva în browser. Descarcă lucrul tău din lista de exerciții.'; } }
function saveCode() { if (!currentExercise) { return; } drafts[currentExercise.id] = { ...drafts[currentExercise.id], code: editor.value, input: stdin.value }; persistDrafts(); updateExerciseProgress(); window.PA_JOURNEY?.refreshExerciseStep(currentExercise.id); }
function updateExerciseProgress() { document.querySelector('#exercise-progress').textContent = isPassed(currentExercise) ? '✓ Codul salvat a trecut toate testele acestei probleme. Explică și metoda folosită.' : 'În lucru · verifică soluția după fiecare modificare.'; }
function renderBank() {
const query = document.querySelector('#exercise-search').value.toLocaleLowerCase('ro');
const chapter = document.querySelector('#chapter-filter').value;
const level = document.querySelector('#level-filter').value;
const progress = document.querySelector('#progress-filter').value;
const visible = exercises.filter(item => (!chapter || item.chapter === chapter) && (!level || item.level === level) && (!progress || isPassed(item) === (progress === 'done')) && `${item.title} ${item.statement} ${chapters.find(c => c.id === item.chapter).title}`.toLocaleLowerCase('ro').includes(query));
document.querySelector('#bank-count').textContent = `${visible.length} exerciții afișate · ${exercises.filter(isPassed).length}/${exercises.length} cu testele trecute`;
document.querySelector('#exercise-list').innerHTML = visible.map(item => `<a class="exercise-card ${isPassed(item) ? 'passed' : ''}" href="#practica/${item.id}"><span class="tag">${escapeHTML(item.level)} · ${item.tests.length} teste</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(chapters.find(c => c.id === item.chapter).title)}</p><span class="text-link">${isPassed(item) ? '✓ Teste trecute' : drafts[item.id]?.code ? 'Continuă →' : 'Începe →'}</span></a>`).join('') || '<p>Nu există exerciții pentru filtrele alese. Schimbă filtrul sau textul căutat.</p>';
}
function renderCourse() { window.PA_JOURNEY?.renderCourse(); }
function renderCourseLesson(id) { window.PA_JOURNEY?.renderLesson(id); }
function renderChapter(id) { window.PA_JOURNEY?.renderChapter(id); }
function selectExercise(id) {
if (cancelRun) { cancelRun(); }
if (currentExercise) { saveCode(); }
currentExercise = beginnerExercises.find(item => item.id === id) || exercises.find(item => item.id === id) || currentExercise || exercises[0];
const item = currentExercise;
const beginner = beginnerExercises.includes(item);
const chapter = beginner ? beginnerLessons.find(c => c.id === item.chapter) : chapters.find(c => c.id === item.chapter);
const collection = beginner ? beginnerExercises : exercises;
const draft = drafts[item.id];
editor.value = typeof draft?.code === 'string' ? draft.code : item.starter;
stdin.value = typeof draft?.input === 'string' ? draft.input : item.tests[0].input;
document.querySelector('#exercise-title').textContent = item.title;
document.querySelector('#exercise-chapter').textContent = `${chapter.title} · ${item.level}`;
document.querySelector('#editor-filename').textContent = `${item.id}.py`;
document.querySelector('#exercise-brief').innerHTML = `<span class="tag">CERINȚĂ</span><p>${escapeHTML(item.statement)}</p><h3>Exemplu</h3><div class="example-pair"><div><small>${item.inputFile || 'INTRARE'}</small><pre>${escapeHTML(item.tests[0].input) || '(linie goală)'}</pre></div><div><small>${item.outputFile || 'IEȘIRE'}</small><pre>${escapeHTML(item.tests[0].expected) || '(nimic)'}</pre></div></div><p class="source-note">${item.compare === 'exact' ? 'Conținutul fișierului trebuie să coincidă exact, inclusiv spațiile și liniile.' : 'Respectă ordinea și liniile cerute. Spațiile de la sfârșitul liniilor și liniile goale finale sunt ignorate.'}</p><details><summary>Un indiciu</summary><p>${escapeHTML(item.hint)}</p></details><details><summary>O posibilă rezolvare</summary><pre><code>${escapeHTML(item.solution)}</code></pre><p>${escapeHTML(item.explanation)}</p><p>Închide soluția, rescrie-o singur și explică fiecare pas.</p></details>${sharedEditor.classList.contains('inline-mode') ? '' : `<p><a class="text-link" href="${beginner ? `#lectie-python/${chapter.id}/${window.PA_JOURNEY?.getExerciseStepIndex(item.id) ?? 4}` : `#capitol/${chapter.id}/${window.PA_JOURNEY?.getAlgorithmStepIndex(item.id) ?? 4}`}">Înapoi la lecție →</a></p>`}<p class="source-note">${beginner ? "Exercițiu original din cursul introductiv Python." : "Exercițiu de pregătire creat sau adaptat pentru grupă. Nu este un subiect oficial de examen."}</p>`;
document.querySelector('#input-label').textContent = item.inputFile ? `CONȚINUTUL ${item.inputFile}` : 'DATE DE INTRARE';
document.querySelector('#input-help').textContent = item.inputFile ? `Fișierul ${item.inputFile} este creat înaintea rulării. Scrie rezultatul în ${item.outputFile}.` : 'Fiecare input() citește o linie. Pentru o ultimă linie goală, adaugă încă un Enter.';
const index = collection.indexOf(item);
const back = document.querySelector("#exercise-back");
back.href = beginner ? `#lectie-python/${chapter.id}/${window.PA_JOURNEY?.getExerciseStepIndex(item.id) ?? 0}` : "#exercitii";
back.textContent = beginner ? "← Înapoi la lecție" : "← Toate exercițiile";
for (const [selector, offset] of [['#previous-exercise', -1], ['#next-exercise', 1]]) { const link = document.querySelector(selector); link.hidden = !collection[index + offset]; link.href = `#practica/${collection[index + offset]?.id || item.id}`; }
result.textContent = 'Rezultatul va apărea aici.';
document.querySelector('#test-results').replaceChildren();
document.querySelector('#error-line').hidden = true;
status.textContent = 'Rulează cu datele tale sau verifică toate testele.';
updateExerciseProgress();
}
function routePractice() {
const [page, id] = location.hash.slice(1).split('/');
if (page !== 'practica' && cancelRun) { cancelRun(); }
if (page === 'practica') { restoreEditor(); selectExercise(id); } else if (page !== 'lectie-python' && page !== 'capitol') { restoreEditor(); }
if (page === 'exercitii') { renderBank(); }
if (page === 'curs-python') { renderCourse(); }
if (page === 'lectie-python') { renderCourseLesson(id); }
if (page === 'capitol') { renderChapter(id); }
}
function explainError(error) {
const hints = { SyntaxError: 'Verifică două puncte, paranteze și ghilimele.', IndentationError: 'Folosește aceeași indentare pentru instrucțiunile din același bloc.', TabError: 'Nu amesteca taburi cu spații.', NameError: 'Verifică numele și dacă valoarea a fost definită înainte de folosire.', ValueError: 'Verifică formatul datelor citite și cerința funcției.', TypeError: 'Verifică tipurile valorilor și numărul argumentelor.', IndexError: 'Un indice este în afara listei sau șirului.', KeyError: 'Cheia cerută nu există în dicționar.', ZeroDivisionError: 'Nu poți împărți la zero.', EOFError: 'Programul cere mai multe linii decât ai furnizat.', FileNotFoundError: 'Verifică numele fișierului. Pentru aceste exerciții trebuie creat date.out.', RecursionError: 'Verifică oprirea recursiei și reducerea problemei.' };
return `${error.type}${error.line ? ` · linia ${error.line}` : ''}: ${error.message}\n${hints[error.type] || 'Verifică instrucțiunea indicată și datele de intrare.'}`;
}
function normalizeOutput(value, mode) { return mode === 'exact' ? value : value.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n').map(line => line.replace(/[ \t]+$/, '')).join('\n'); }
function executePython(code, input, exercise = currentExercise, check = false, onResult = () => {}) {
return new Promise((resolve, reject) => {
const worker = new Worker('site/python-worker.js');
activeWorker = worker;
let timeout;
let finished = false;
const outputs = [];
const finish = (error) => { if (finished) { return; } finished = true; clearTimeout(timeout); worker.terminate(); activeWorker = null; cancelRun = null; if (error) { reject(error); } else { resolve(outputs); } };
cancelRun = () => finish(new Error('Execuție oprită. Codul tău a fost păstrat.'));
timeout = setTimeout(() => finish(new Error('Încărcarea Python a depășit 90 de secunde. Verifică internetul și reîncearcă.')), 90000);
worker.onmessage = ({ data }) => {
if (data.type === 'starting') { clearTimeout(timeout); timeout = setTimeout(() => finish(new Error(`Testul ${data.index + 1} a depășit 10 secunde. Verifică buclele și eficiența soluției.`)), 10000); status.textContent = check ? `Se verifică testul ${data.index + 1}/${exercise.tests.length}…` : 'Programul rulează…'; }
if (data.type === 'result') { outputs.push(data.result); onResult(data.result, data.index); }
if (data.type === 'done') { finish(); }
if (data.type === 'error') { finish(new Error(data.message)); }
};
worker.onerror = () => finish(new Error('Nu s-a putut porni Python. Verifică internetul și reîncearcă.'));
worker.postMessage({ code, exercise: { inputFile: exercise.inputFile, outputFile: exercise.outputFile, requiredFunction: exercise.requiredFunction }, tests: check ? exercise.tests : [{ input }] });
});
}
async function runCode(check) {
if (activeWorker) { return; }
saveCode();
const item = currentExercise;
const passedBeforeCheck = isPassed(item);
const code = editor.value;
runButton.disabled = true; checkButton.disabled = true; stopButton.disabled = false;
editor.readOnly = true; stdin.readOnly = true;
status.textContent = 'Se încarcă Python… Prima pornire poate dura puțin.';
result.textContent = '';
document.querySelector('#test-results').replaceChildren();
document.querySelector('#error-line').hidden = true;
if (check) { delete drafts[item.id].passedCode; persistDrafts(); updateExerciseProgress(); window.PA_JOURNEY?.refreshExerciseStep(item.id); }
let passed = 0;
let executionError = false;
try {
await executePython(code, stdin.value, item, check, (output, index) => {
if (output.error) { executionError = true; }
const actual = item.outputFile ? output.fileOutput ?? '' : output.output;
if (check) {
const test = item.tests[index];
const ok = !output.error && normalizeOutput(actual, item.compare) === normalizeOutput(test.expected, item.compare);
if (ok) { passed += 1; }
const card = document.createElement('details');
card.className = `test-result ${ok ? 'test-pass' : 'test-fail'}`;
card.open = !ok;
card.innerHTML = `<summary>${ok ? '✓' : '✗'} Test ${index + 1} · ${ok ? 'Corect' : output.error ? 'Eroare de execuție' : 'Rezultat diferit'}</summary><div class="test-columns"><div><h4>Intrare${item.inputFile ? ' · date.in' : ''}</h4><pre>${escapeHTML(test.input) || '(gol)'}</pre></div><div><h4>Așteptat${item.outputFile ? ' · date.out' : ''}</h4><pre>${escapeHTML(test.expected) || '(gol)'}</pre></div><div><h4>Obținut</h4><pre>${escapeHTML(actual) || '(gol)'}</pre></div></div>${output.error ? `<p class="error-explanation">${escapeHTML(explainError(output.error))}</p>` : !ok ? '<p>Compară valorile, ordinea și spațiile din interiorul liniilor. Nu afișa mesaje suplimentare. Dacă pare identic, verifică liniile goale și spațiile de la început.</p>' : ''}`;
document.querySelector('#test-results').append(card);
result.textContent = `${passed}/${index + 1} teste trecute. Detaliile sunt sub editor.`;
} else { result.textContent = output.output + (item.outputFile ? `\n── ${item.outputFile} ──\n${output.fileOutput ?? '(fișierul nu a fost creat)'}` : '') + (output.error ? `\n${explainError(output.error)}` : ''); if (!result.textContent) { result.textContent = '(Programul nu a afișat nimic.)'; } }
if (output.error?.line) { const button = document.querySelector('#error-line'); button.hidden = false; button.textContent = `Arată linia ${output.error.line}`; button.onclick = () => { const offset = editor.value.split('\n').slice(0, output.error.line - 1).reduce((sum, line) => sum + line.length + 1, 0); editor.focus(); editor.setSelectionRange(offset, editor.value.indexOf('\n', offset) < 0 ? editor.value.length : editor.value.indexOf('\n', offset)); }; }
});
if (check) { if (passed === item.tests.length) { drafts[item.id].passedCode = code; persistDrafts(); if (!passedBeforeCheck) { window.PA_JOURNEY?.markActivity(); } window.PA_JOURNEY?.updateAll(false); window.PA_JOURNEY?.refreshExerciseStep(item.id); } status.textContent = `${passed}/${item.tests.length} teste trecute. ${passed === item.tests.length ? 'Acum explică soluția și încearcă și alte date.' : 'Deschide testele de mai jos, corectează codul și încearcă din nou.'}`; } else { status.textContent = executionError ? 'Programul s-a oprit cu o eroare. Consultă explicația din rezultat.' : 'Rulare încheiată. Consultă rezultatul; verificarea tuturor testelor este separată.'; }
} catch (error) { if (currentExercise.id === item.id) { result.textContent += `\n${error.message}`; status.textContent = 'Execuție întreruptă. Rezultatele deja obținute sunt păstrate mai jos.'; } }
finally { runButton.disabled = false; checkButton.disabled = false; stopButton.disabled = true; editor.readOnly = false; stdin.readOnly = false; updateExerciseProgress(); window.PA_JOURNEY?.refreshExerciseStep(item.id); }
}
function downloadData(text, filename, type = 'text/plain;charset=utf-8') { const url = URL.createObjectURL(new Blob([text], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
editor.addEventListener('input', saveCode);
stdin.addEventListener('input', saveCode);
editor.addEventListener('keydown', event => { if (event.key === 'Escape') { leaveEditor = true; } else if (event.key === 'Tab' && !leaveEditor && !editor.readOnly) { event.preventDefault(); editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end'); saveCode(); } else { leaveEditor = false; } if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); runCode(false); } });
runButton.addEventListener('click', () => runCode(false));
checkButton.addEventListener('click', () => runCode(true));
stopButton.addEventListener('click', () => { if (cancelRun) { cancelRun(); } });
document.querySelector('#python-download').addEventListener('click', () => downloadData(editor.value, `${currentExercise.id}.py`));
document.querySelector('#chapter-filter').insertAdjacentHTML('beforeend', chapters.map(item => `<option value="${item.id}">${escapeHTML(item.title)}</option>`).join(''));
for (const id of ['chapter-filter', 'level-filter', 'exercise-search', 'progress-filter']) { document.getElementById(id).addEventListener('input', renderBank); }
document.querySelector('#progress-export').addEventListener('click', () => downloadData(JSON.stringify({ version: 2, drafts, journey: window.PA_JOURNEY?.exportState() || null }, null, 2), 'progres-pa.json', 'application/json'));
document.querySelector('#progress-import').addEventListener('change', async event => {
const file = event.target.files[0];
if (!file) { return; }
try {
if (file.size > 5000000) { throw new Error('Fișier prea mare (maximum 5 MB).'); }
const data = JSON.parse(await file.text());
if (data.version !== 2 || !data.drafts || typeof data.drafts !== 'object') { throw new Error('Acesta nu este un export PA valid.'); }
let restored = 0;
for (const item of [...exercises, ...beginnerExercises]) { const draft = data.drafts[item.id]; if (draft && typeof draft.code === 'string' && typeof draft.input === 'string' && !drafts[item.id]) { drafts[item.id] = { code: draft.code, input: draft.input }; restored += 1; } }
persistDrafts(); window.PA_JOURNEY?.importState(data.journey); renderBank(); renderCourse(); window.PA_JOURNEY?.updateAll(); document.querySelector('#backup-status').textContent = `${restored} soluții restaurate. Soluțiile existente au fost păstrate. Rulează verificarea pentru confirmarea progresului.`;
} catch (error) { document.querySelector('#backup-status').textContent = error.message; }
event.target.value = '';
});
window.addEventListener('hashchange', routePractice);
if (!location.hash.startsWith('#practica')) { selectExercise(exercises[0].id); }
routePractice();
renderBank();
renderCourse();

window.PA_EDITOR = { attachTo: attachEditor, restore: restoreEditor, selectExercise, saveCode };
