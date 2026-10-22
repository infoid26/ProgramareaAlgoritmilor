const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export const emptyProgress=()=>({version:1,drafts:{},journey:{version:1,quiz:{},activityDays:[],resume:''}});
export function buildProgressMetadata(subject,beginner,interactive){
const exercises=new Map([...subject.exercises,...beginner.exercises].map(row=>[row.id,row]));
const quizKeys=new Set();
const routes=new Set();
for(const lesson of beginner.lessons){for(let index=0;index<interactive[lesson.id].length;index++)quizKeys.add(lesson.id+':'+index);for(let step=0;step<=7;step++)routes.add('#lectie-python/'+lesson.id+'/'+step);}
for(const chapter of subject.chapters){const count=subject.exercises.filter(row=>row.chapter===chapter.id).length;for(let unit=0;unit<Math.ceil(count/3);unit++){quizKeys.add(chapter.id+':'+unit);for(let step=0;step<=Math.min(3,count-unit*3)+2;step++)routes.add('#capitol/'+chapter.id+'/'+step+'/'+unit);}}
return {exercises,quizKeys,routes};
}
export function normalizeProgress(value,lessons){
if(!object(value)||value.version!==1||!object(value.drafts)||!object(value.journey)||value.journey.version!==1||!object(value.journey.quiz)||!Array.isArray(value.journey.activityDays)||Object.keys(value.drafts).length>lessons.exercises.size||Object.keys(value.journey.quiz).length>lessons.quizKeys.size||value.journey.activityDays.length>365)throw new Error('Invalid progress');
const drafts={};
for(const [id,row] of Object.entries(value.drafts)){
if(!lessons.exercises.has(id)||!object(row)||typeof row.code!=='string'||row.code.length>100000||typeof row.input!=='string'||row.input.length>1000000)throw new Error('Invalid exercise record');
const draft={code:row.code,input:row.input};
if(row.passedCode===row.code)draft.passedCode=row.code;
if(row.passedFiles!==undefined){if(typeof row.passedFiles!=='string'||row.passedFiles.length>1000000)throw new Error('Invalid module record');draft.passedFiles=row.passedFiles;}
drafts[id]=draft;
}
const quiz={};
for(const [id,passed] of Object.entries(value.journey.quiz)){if(!lessons.quizKeys.has(id)||typeof passed!=='boolean')throw new Error('Invalid quiz');if(passed)quiz[id]=true;}
const activityDays=[...new Set(value.journey.activityDays)];
if(activityDays.some(day=>typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)))throw new Error('Invalid activity days');
activityDays.sort();
let resume=typeof value.journey.resume==='string'?value.journey.resume:'';
if(resume&&!lessons.routes.has(resume))resume='';
return {version:1,drafts,journey:{version:1,quiz,activityDays,resume}};
}
const clone=value=>JSON.parse(JSON.stringify(value));
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
export function mergeProgress(base,local,remote){
const progress=clone(remote);
const conflicts=[];
for(const id of new Set([...Object.keys(base.drafts),...Object.keys(local.drafts),...Object.keys(remote.drafts)])){
const before=base.drafts[id],ours=local.drafts[id],theirs=remote.drafts[id];
if(same(ours,before))continue;
if(!same(theirs,before)&&!same(ours,theirs)){conflicts.push(id);continue;}
if(ours===undefined)delete progress.drafts[id];else progress.drafts[id]=clone(ours);
}
progress.journey.quiz={...remote.journey.quiz,...local.journey.quiz};
progress.journey.activityDays=[...new Set([...remote.journey.activityDays,...local.journey.activityDays])].sort().slice(-365);
if(local.journey.resume!==base.journey.resume)progress.journey.resume=local.journey.resume;
return {progress,conflicts};
}
