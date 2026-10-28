const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('site/journey.js','utf8');
const content={window:{}};
for(const file of ['exercises.js','python-course.js','interactive-content.js','algorithm-quizzes.js','algorithm-lessons.js'])vm.runInNewContext(fs.readFileSync('site/'+file,'utf8'),content);
const lessons=content.window.PA_BEGINNER.lessons,chapters=content.window.PA_CONTENT.chapters;
const passed=new Set(),quiz={},feedback={textContent:'',className:''};
let choice,rendered='',saves=0;
const options=[];
const ctx={chapters,quizKey:(id,index)=>id+':'+index,window:content.window,journey:{quiz},location:{hash:''},currentExercise:null,
quizPassed:(id,index)=>quiz[id+':'+index]===true,
questionsForLesson:id=>content.window.PA_INTERACTIVE[id],
exercisesForLesson:id=>content.window.PA_BEGINNER.exercises.filter(row=>row.chapter===id),
algorithmUnits:id=>{const rows=content.window.PA_CONTENT.exercises.filter(row=>row.chapter===id);return Array.from({length:Math.ceil(rows.length/3)},(_,i)=>rows.slice(i*3,i*3+3));},
isPassed:item=>passed.has(item.id),firstPendingStep:()=>0,firstPendingAlgorithmStep:()=>0,
escapeHTML:value=>String(value).replaceAll('<','&lt;'),markActivity(){},persistJourney(){saves++;},updateAll(){},
renderLesson:id=>{rendered=ctx.renderQuiz(ctx.questionsForLesson(id)[0],id,0);},
renderChapter:id=>{rendered=ctx.renderQuiz(ctx.algorithmQuestion(chapters.find(row=>row.id===id),0),id,0,true);},
document:{querySelector:()=>feedback,querySelectorAll:()=>options}};
vm.createContext(ctx);
vm.runInContext(source.match(/^function algorithmQuestion[^\n]*/m)[0],ctx);
vm.runInContext(source.slice(source.indexOf('function stepAvailable('),source.indexOf('function renderLesson(')),ctx);
vm.runInContext(source.slice(source.indexOf('function onQuizClick('),source.indexOf('function renderChapter(')),ctx);
vm.runInContext(source.slice(source.indexOf('function onAlgoQuizClick('),source.indexOf('function refreshExerciseStep(')),ctx);
function select(answer,algorithm=false){
choice={dataset:algorithm?{algoQuestion:'0',algoAnswer:String(answer)}:{question:'0',answer:String(answer)},classList:{add(){},remove(){}}};options.push(choice);
(algorithm?ctx.onAlgoQuizClick:ctx.onQuizClick)({target:{closest:()=>choice}});
}
for(const lesson of lessons){
ctx.location.hash='#lectie-python/'+lesson.id+'/1';
const question=ctx.questionsForLesson(lesson.id)[0];
assert.equal(ctx.resolveStep(lesson,0),0);
assert.equal(ctx.resolveStep(lesson,7),1);
const unanswered=ctx.renderQuiz(question,lesson.id,0);
assert.ok(!unanswered.includes('Verifică')&&!unanswered.includes('disabled'));
assert.ok(!ctx.playerControls('#a','#b',1,7,false,'QUESTION','Done').includes('href="#b"'));
select((question.correct+1)%question.options.length);
assert.ok(!ctx.quizPassed(lesson.id,0));
assert.match(feedback.textContent,/Mai încearcă/);
select(question.correct);
assert.ok(ctx.quizPassed(lesson.id,0));
assert.equal((rendered.match(/disabled/g)||[]).length,question.options.length);
const saved=saves;select((question.correct+1)%question.options.length);assert.equal(saves,saved);
assert.equal(ctx.resolveStep(lesson,2),2);
quiz[lesson.id+':1']=true;
const tasks=ctx.exercisesForLesson(lesson.id);
assert.equal(ctx.resolveStep(lesson,7),4);
tasks.forEach((item,index)=>{passed.add(item.id);assert.equal(ctx.resolveStep(lesson,index+5),index+5);});
assert.equal(ctx.resolveStep(lesson,7),7);
passed.delete(tasks[0].id);assert.equal(ctx.resolveStep(lesson,7),4);
}
for(const chapter of chapters){
ctx.location.hash='#capitol/'+chapter.id+'/1/0';
const question=ctx.algorithmQuestion(chapter,0);
select((question.correct+1)%question.options.length,true);assert.ok(!ctx.quizPassed(chapter.id,0));
select(question.correct,true);assert.ok(ctx.quizPassed(chapter.id,0));
assert.equal((rendered.match(/disabled/g)||[]).length,question.options.length);
const saved=saves;select((question.correct+1)%question.options.length,true);assert.equal(saves,saved);
ctx.algorithmUnits(chapter.id).forEach((tasks,unit)=>{
if(unit!==0){assert.equal(ctx.resolveAlgorithmStep(chapter,tasks.length+2,unit),1);quiz[chapter.id+':'+unit]=true;}
assert.equal(ctx.resolveAlgorithmStep(chapter,tasks.length+2,unit),2);
tasks.forEach((item,index)=>{passed.add(item.id);assert.equal(ctx.resolveAlgorithmStep(chapter,index+3,unit),index+3);});
});
}
assert.ok(ctx.playerControls('#a','#b',2,7,true,'CODE','Done').includes('href="#b"'));
assert.ok(!ctx.playerControls('#a','#b',2,7,false,'CODE','Done').includes('href="#b"'));
console.log('Lesson flow checks passed: immediate quiz answers, retries, locked correct answers, hidden continuation, prerequisites and code edits.');

