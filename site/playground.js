const accountStorageSuffix = localStorage.getItem('pa-active-account') || '';
const draftStorageKey = 'pa-drafts-v2' + accountStorageSuffix;
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
const formatStatement = value => escapeHTML(value).replace(/`([^`]+)`/g, '<code class="required-text">$1</code>');
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
try { const stored = JSON.parse(localStorage.getItem(draftStorageKey) || '{}'); if (stored && typeof stored === 'object' && !Array.isArray(stored)) { drafts = stored; } } catch { status.textContent = 'Salvarea locală nu este disponibilă. Descarcă soluțiile.'; }
try { const previous = localStorage.getItem('pa-python-code'); if (!accountStorageSuffix && !drafts['baze-01'] && previous !== null) { drafts['baze-01'] = { code: previous, input: localStorage.getItem('pa-python-input') ?? exercises[0].tests[0].input }; } } catch {}
function isPassed(exercise) { const draft = drafts[exercise.id]; if (typeof draft?.code !== 'string' || draft.code !== draft.passedCode) { return false; } if (!exercise.editableFiles) { return true; } try { const data = JSON.parse(draft.input); return JSON.stringify(Object.fromEntries(exercise.editableFiles.map(name => [name, data[name]]))) === draft.passedFiles; } catch { return false; } }
function persistDrafts() { try { localStorage.setItem(draftStorageKey, JSON.stringify(drafts)); window.PA_CLOUD?.changed(); } catch { status.textContent = 'Nu se poate salva în browser. Descarcă lucrul tău din lista de exerciții.'; } }
function readInput() { if (!currentExercise?.inputFiles) { return stdin.value; } const data = { [currentExercise.inputFiles[0]]: stdin.value }; document.querySelectorAll('[data-input-file]').forEach(field => { data[field.dataset.inputFile] = field.value; }); return JSON.stringify(data); }
function displayInput(value, item) { if (!item.inputFiles) { return value; } try { return Object.entries(JSON.parse(value)).map(([name, text]) => `${name === '_stdin' ? 'Tastatură' : name}\n${item.editableFiles?.includes(name) ? '(codul modulului tău)' : text || '(gol)'}`).join('\n\n'); } catch { return value; } }
function referenceCode(item) { if (!item.editableFiles) { return item.solution; } const data = JSON.parse(item.tests[0].input); return item.solution + '\n\n' + item.editableFiles.map(name => '# ' + name + '\n' + data[name]).join('\n'); }
function configureInput(value, item) { const container = document.querySelector('#additional-inputs'); container.replaceChildren(); if (!item.inputFiles) { stdin.value = value; return; } let data; try { data = JSON.parse(value); } catch { data = {}; } stdin.value = data[item.inputFiles[0]] || ''; for (const name of [...item.inputFiles.slice(1), '_stdin']) { const label = document.createElement('label'); label.textContent = name === '_stdin' ? 'Date de la tastatură' : `Conținutul ${name}`; const field = document.createElement('textarea'); field.dataset.inputFile = name; field.value = data[name] || ''; field.spellcheck = false; label.append(field); container.append(label); } }
function saveCode() { if (!currentExercise) { return; } drafts[currentExercise.id] = { ...drafts[currentExercise.id], code: editor.value, input: readInput() }; persistDrafts(); updateExerciseProgress(); window.PA_JOURNEY?.refreshExerciseStep(currentExercise.id); }
function updateExerciseProgress() { document.querySelector('#exercise-progress').textContent = isPassed(currentExercise) ? '✓ Rezolvat' : ''; }
function renderBank() {
const query = document.querySelector('#exercise-search').value.toLocaleLowerCase('ro');
const chapter = document.querySelector('#chapter-filter').value;
const level = document.querySelector('#level-filter').value;
const progress = document.querySelector('#progress-filter').value;
const visible = exercises.filter(item => (!chapter || item.chapter === chapter) && (!level || item.level === level) && (!progress || isPassed(item) === (progress === 'done')) && `${item.title} ${item.statement} ${chapters.find(c => c.id === item.chapter).title}`.toLocaleLowerCase('ro').includes(query));
document.querySelector('#bank-count').textContent = `${visible.length} exerciții afișate · ${exercises.filter(isPassed).length}/${exercises.length} cu testele trecute`;
document.querySelector('#exercise-list').innerHTML = visible.map(item => `<a class="exercise-card ${isPassed(item) ? 'passed' : ''}" href="#practica/${item.id}"><span class="tag">${escapeHTML(item.level)}${item.supplemental || chapters.find(c => c.id === item.chapter).supplemental ? " · suplimentar" : ""} · ${item.tests.length} teste</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(chapters.find(c => c.id === item.chapter).title)}</p><span class="text-link">${isPassed(item) ? '✓ Teste trecute' : drafts[item.id]?.code ? 'Continuă →' : 'Începe →'}</span></a>`).join('') || '<p>Nu există exerciții pentru filtrele alese. Schimbă filtrul sau textul căutat.</p>';
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
if (/^\s*# Scrie (?:soluția ta|codul tău) aici\.\s*$/.test(editor.value)) { editor.value = ''; }
let initialInput = typeof draft?.input === 'string' ? draft.input : item.tests[0].input;
if (!draft && item.fileStarters) { initialInput = JSON.stringify({ ...JSON.parse(initialInput), ...item.fileStarters }); }
configureInput(initialInput, item);
const customInput = document.querySelector('#custom-input');
customInput.hidden = !item.editableFiles;


stdin.classList.toggle('module-code', !!item.editableFiles?.includes(item.inputFiles?.[0]));
window.dispatchEvent(new Event('pa-module-editor'));
document.querySelector('#module-download').hidden = !item.editableFiles;
document.querySelector('#exercise-title').textContent = item.title;
document.querySelector('#exercise-chapter').textContent = `${chapter.title} · ${item.level}`;
document.querySelector('#exercise-brief').innerHTML = `<span class="tag">CERINȚĂ</span><p>${formatStatement(item.statement)}</p><div class="example-input" ${!item.inputFile && !item.inputFiles && item.tests.every(test => !test.input.trim()) ? 'hidden' : ''}><small>Intrare</small><pre id="example-input-value">${escapeHTML(displayInput(item.tests[0].input,item)) || '(gol)'}</pre></div><p class="source-note">${item.validator ? "Sunt acceptate soluții alternative care respectă cerința; ieșirea de referință este doar un exemplu." : item.compare === 'exact' ? 'Conținutul fișierului trebuie să coincidă exact, inclusiv spațiile și liniile.' : 'Respectă ordinea și liniile cerute. Spațiile de la sfârșitul liniilor și liniile goale finale sunt ignorate.'}</p><div class="exercise-help"><div class="help-buttons"><button type="button" data-help="exercise-hint" aria-controls="exercise-hint" aria-expanded="false">Indiciu</button><button type="button" data-help="exercise-solution" aria-controls="exercise-solution" aria-expanded="false">Rezolvare</button></div><div id="exercise-hint" class="help-content" hidden><p>${escapeHTML(item.hint)}</p></div><div id="exercise-solution" class="help-content" hidden><pre><code>${escapeHTML(referenceCode(item))}</code></pre><p>${escapeHTML(item.explanation)}</p><p>Închide soluția, rescrie-o singur și explică fiecare pas.</p></div></div>${sharedEditor.classList.contains('inline-mode') ? '' : `<p><a class="text-link" href="${beginner ? `#lectie-python/${chapter.id}/${window.PA_JOURNEY?.getExerciseStepIndex(item.id) ?? 4}` : `#capitol/${chapter.id}/${window.PA_JOURNEY?.getAlgorithmStepIndex(item.id) ?? 2}/${window.PA_JOURNEY?.getAlgorithmUnitIndex(item.id) ?? 0}`}">Înapoi la lecție →</a></p>`}<p class="source-note">${beginner ? "Exercițiu original din cursul introductiv Python." : "Exercițiu de pregătire creat sau adaptat pentru grupă. Nu este un subiect oficial de examen."}</p>`;
document.querySelector('#input-label').textContent = item.inputFiles ? `CONȚINUTUL ${item.inputFiles[0]}` : item.inputFile ? `CONȚINUTUL ${item.inputFile}` : 'DATE DE INTRARE';
document.querySelector('#additional-inputs').querySelectorAll('[data-input-file]').forEach(field => { field.parentElement.hidden = !item.editableFiles?.includes(field.dataset.inputFile); });
const index = collection.indexOf(item);
const back = document.querySelector("#exercise-back");
back.href = beginner ? `#lectie-python/${chapter.id}/${window.PA_JOURNEY?.getExerciseStepIndex(item.id) ?? 0}` : "#exercitii";
back.textContent = beginner ? "← Înapoi la lecție" : "← Toate exercițiile";
for (const [selector, offset] of [['#previous-exercise', -1], ['#next-exercise', 1]]) { const link = document.querySelector(selector); link.hidden = !collection[index + offset]; link.href = `#practica/${collection[index + offset]?.id || item.id}`; }
resetComparison();
document.querySelector('#test-results').replaceChildren();
status.classList.remove('verification-feedback', 'verification-correct', 'verification-incorrect');
status.textContent = '';
resetComparison();
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
return `${error.type}${error.file && error.file !== "solutia.py" ? ` · ${error.file}` : ""}${error.line ? ` · linia ${error.line}` : ''}: ${error.message}\n${hints[error.type] || 'Verifică instrucțiunea indicată și datele de intrare.'}`;
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
if (data.type === 'starting') { clearTimeout(timeout); timeout = setTimeout(() => finish(new Error(`Testul ${data.index + 1} a depășit 10 secunde. Verifică buclele și eficiența soluției.`)), 10000); status.textContent = check ? 'Se verifică…' : 'Programul rulează…'; }
if (data.type === 'result') { outputs.push(data.result); onResult(data.result, data.index); }
if (data.type === 'done') { finish(); }
if (data.type === 'error') { finish(new Error(data.message)); }
};
worker.onerror = () => finish(new Error('Nu s-a putut porni Python. Verifică internetul și reîncearcă.'));
const editableFiles = exercise.editableFiles ? Object.fromEntries(exercise.editableFiles.map(name => [name, JSON.parse(input)[name]])) : null;
worker.postMessage({ code, exercise: { inputFile: exercise.inputFile, inputFiles: exercise.inputFiles, outputFile: exercise.outputFile, requiredFunction: exercise.requiredFunction, requiredFunctions: exercise.requiredFunctions, validator: exercise.validator }, editableFiles, tests: check ? exercise.tests : [{ input }] });
});
}
async function runCode(check) {
if (activeWorker) { return; }
saveCode();
const item = currentExercise;
const passedBeforeCheck = isPassed(item);
const code = editor.value;
if (!code.split(/\r?\n/).some(line => line.trim() && !line.trimStart().startsWith('#'))) { resetComparison(); document.querySelector('#test-results').replaceChildren(); status.classList.remove('verification-feedback', 'verification-correct', 'verification-incorrect'); status.textContent = 'Nu există cod de verificat.'; return; }
const inputSnapshot = readInput();
runButton.disabled = true; checkButton.disabled = true; stopButton.disabled = false;
editor.readOnly = true; stdin.readOnly = true;
document.querySelectorAll('[data-input-file]').forEach(field => { field.readOnly = true; });
status.classList.remove('verification-feedback', 'verification-correct', 'verification-incorrect');
status.textContent = 'Se încarcă Python…';
result.textContent = '';
document.querySelector('#test-results').replaceChildren();
if (check) { delete drafts[item.id].passedCode; persistDrafts(); updateExerciseProgress(); window.PA_JOURNEY?.refreshExerciseStep(item.id); }
let passed = 0;
let executionError = false;
let displayedFailure = false;
let failureLocation = "";
resetComparison();
try {
await executePython(code, inputSnapshot, item, check, (output, index) => {
if (output.error) { executionError = true; }
const actual = item.outputFile ? output.fileOutput ?? '' : output.output;
if (check) {
const test = item.tests[index];
const ok = !output.error && (item.validator ? output.correct === true : normalizeOutput(actual, item.compare) === normalizeOutput(test.expected, item.compare));
if (ok) { passed += 1; }
if (index === 0 || (!ok && !displayedFailure)) { document.querySelector('#expected-output').textContent = test.expected || '(gol)'; result.textContent = output.error ? explainError(output.error) : actual.trim() ? actual : '(niciun rezultat)'; result.classList.toggle('output-correct',ok); result.classList.toggle('output-incorrect',!ok); const exampleInput = document.querySelector('#example-input-value'); if (exampleInput) { exampleInput.textContent = displayInput(test.input,item) || '(gol)'; } }
if (!ok && !displayedFailure) { if (output.error) { failureLocation = ''; } else if (!item.validator) { failureLocation = `Prima diferență: linia ${firstDifferentOutputLine(actual, test.expected, item.compare)} din rezultat.`; } else { failureLocation = output.feedback || ''; } }
if (!ok) { displayedFailure = true; }
} else { result.textContent = output.output + (item.outputFile ? `\n── ${item.outputFile} ──\n${output.fileOutput ?? '(fișierul nu a fost creat)'}` : '') + (output.error ? `\n${explainError(output.error)}` : ''); if (!result.textContent) { result.textContent = '(Programul nu a afișat nimic.)'; } }
});
if (check) { if (passed === item.tests.length) { drafts[item.id].passedCode = code; if (item.editableFiles) { const data = JSON.parse(inputSnapshot); drafts[item.id].passedFiles = JSON.stringify(Object.fromEntries(item.editableFiles.map(name => [name, data[name]]))); } persistDrafts(); if (!passedBeforeCheck) { window.PA_JOURNEY?.markActivity(); } window.PA_JOURNEY?.updateAll(false); window.PA_JOURNEY?.refreshExerciseStep(item.id); } status.classList.add('verification-feedback'); status.classList.toggle('verification-correct', passed === item.tests.length); status.classList.toggle('verification-incorrect', passed !== item.tests.length); status.textContent = passed === item.tests.length ? 'Corect' : `Soluția nu este corectă.${failureLocation ? " " + failureLocation : ""}`; } else { status.textContent = executionError ? 'Programul s-a oprit cu o eroare. Consultă explicația din rezultat.' : 'Rulare încheiată. Consultă rezultatul; verificarea tuturor testelor este separată.'; }
} catch (error) { if (currentExercise.id === item.id) { result.textContent += `\n${error.message}`; status.textContent = 'Execuție întreruptă. Rezultatele deja obținute sunt păstrate mai jos.'; } }
finally { runButton.disabled = false; checkButton.disabled = false; stopButton.disabled = true; editor.readOnly = false; stdin.readOnly = false; document.querySelectorAll("[data-input-file]").forEach(field => { field.readOnly = false; }); updateExerciseProgress(); window.PA_JOURNEY?.refreshExerciseStep(item.id); }
}
function downloadData(text, filename, type = 'text/plain;charset=utf-8') { const url = URL.createObjectURL(new Blob([text], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
editor.addEventListener('input', () => { saveCode(); resetComparison(); });
stdin.addEventListener('input', () => { saveCode(); resetComparison(); });
document.querySelector('#additional-inputs').addEventListener('input', () => { saveCode(); resetComparison(); });
editor.addEventListener('keydown', event => { if (event.key === 'Escape') { leaveEditor = true; } else if (event.key === 'Tab' && !leaveEditor && !editor.readOnly) { event.preventDefault(); editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end'); saveCode(); } else { leaveEditor = false; } if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); runCode(true); } });
runButton.addEventListener('click', () => runCode(false));

checkButton.addEventListener('click', () => runCode(true));
stopButton.addEventListener('click', () => { if (cancelRun) { cancelRun(); } });
document.querySelector('#python-download').addEventListener('click', () => downloadData(editor.value, `${currentExercise.id}.py`));
document.querySelector('#module-download').addEventListener('click', () => { const name = currentExercise.editableFiles?.[0]; if (name) { downloadData(JSON.parse(readInput())[name], name); } });
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

window.PA_EDITOR = { attachTo: attachEditor, restore: restoreEditor, selectExercise, saveCode, exportState:() => JSON.parse(JSON.stringify(drafts)), replaceState:data => { drafts = {}; for (const item of [...exercises,...beginnerExercises]) { const row = data?.[item.id]; if (row && typeof row.code === 'string' && typeof row.input === 'string') { drafts[item.id] = { code:row.code,input:row.input }; if (row.passedCode === row.code) { drafts[item.id].passedCode = row.passedCode; } if (typeof row.passedFiles === 'string') { drafts[item.id].passedFiles = row.passedFiles; } } } persistDrafts(); if (currentExercise) { const selectedId = currentExercise.id; currentExercise = null; selectExercise(selectedId); } renderBank(); } };






document.querySelector("#exercise-brief").addEventListener("click", event => { const button = event.target.closest("[data-help]"); if (!button) { return; } const panel = document.getElementById(button.dataset.help); panel.hidden = !panel.hidden; button.setAttribute("aria-expanded", String(!panel.hidden)); });

function resetComparison() { document.querySelector("#expected-output").textContent = currentExercise?.tests[0].expected || "(gol)"; result.textContent = "—"; result.classList.remove("output-correct", "output-incorrect"); status.classList.remove("verification-feedback", "verification-correct", "verification-incorrect"); status.textContent = ""; const exampleInput = document.querySelector("#example-input-value"); if (exampleInput && currentExercise) { exampleInput.textContent = displayInput(currentExercise.tests[0].input,currentExercise) || "(gol)"; } }

function firstDifferentOutputLine(actual, expected, mode) { const actualLines = normalizeOutput(actual, mode).split("\n"); const expectedLines = normalizeOutput(expected, mode).split("\n"); for (let index = 0; index < Math.max(actualLines.length, expectedLines.length); index++) { if (actualLines[index] !== expectedLines[index]) { return index + 1; } } return 1; }
