const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const ctx={window:{}};
for(const file of ['site/exercises.js','site/algorithm-quizzes.js','site/algorithm-lessons.js','site/interactive-content.js']){vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);}
const rows=[];
for(const chapter of ctx.window.PA_CONTENT.chapters){for(const [i,card] of chapter.studyCards.entries()){rows.push({id:chapter.id+':card:'+i,...card.quiz});}}
for(const [id,q] of Object.entries(ctx.window.PA_ALGO_QUIZZES)){rows.push({id:id+':quiz',...q});}
for(const [id,lesson] of Object.entries(ctx.window.PA_ALGO_LESSONS)){rows.push({id:id+':check',...lesson.check});}
for(const [id,qs] of Object.entries(ctx.window.PA_INTERACTIVE)){qs.forEach((q,i)=>rows.push({id:id+':intro:'+i,...q}));}
assert.equal(rows.length,93);
for(const q of rows){assert.ok(q.question.trim()&&q.explanation.trim(),q.id);assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length,q.id);assert.equal(new Set(q.options).size,q.options.length,q.id);assert.ok(q.options.every(x=>typeof x==='string'&&x.trim()),q.id);}

console.log('93 questions checked: valid answers, distinct options, explanations and stable source IDs.');
