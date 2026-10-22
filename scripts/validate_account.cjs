const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
const {emptyProgress,buildProgressMetadata,normalizeProgress,mergeProgress}=await import('./progress.mjs');
const course={window:{}};
for(const file of ['exercises.js','python-course.js','interactive-content.js'])vm.runInNewContext(fs.readFileSync('site/'+file,'utf8'),course);
const source=fs.readFileSync('site/account-source.js','utf8').replace(/^import .*;\r?\n/,'');
const id='11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222';
const progress=()=>({version:1,drafts:{'baze-01':{code:'print(1)',input:'1\n2'}},journey:{version:1,quiz:{'baze:0':true},activityDays:[],resume:'#capitol/baze/2/0'}});
async function scenario({enabled=true,remote=progress(),cached,guest,owner,userId=id,failPut=false,network=false}={}){
const elements=new Map(),events={},timers=[];let current=emptyProgress(),writes=0,reloads=0,redirect='',lastHeaders;
const storage=new Map();
if(cached){current=structuredClone(cached.progress);storage.set('pa-cloud-meta:'+id,JSON.stringify({revision:cached.version,base:cached.base,imported:true}));}
if(guest){storage.set('pa-drafts-v2',JSON.stringify(guest.drafts));storage.set('pa-journey-v1',JSON.stringify(guest.journey));}
if(owner)storage.set('pa-anonymous-owner',owner);
function element(){return {children:[],listeners:{},hidden:false,textContent:'',className:'',append(...rows){this.children.push(...rows);},replaceChildren(...rows){this.children=[...rows];},addEventListener(type,fn){this.listeners[type]=fn;},click(){}};}
for(const key of ['#account-controls','#account-actions','#account-status'])elements.set(key,element());
const response=(status,value)=>({ok:status<400,status,json:async()=>structuredClone(value)});
const fetch=async(path,options={})=>{if(network)throw new Error('offline');if(path==='/api/account')return response(200,{enabled,user:enabled?{id:userId,email:'student@s.unibuc.ro',name:'Nume Universitar'}:null});if(options.method==='PUT'){writes++;lastHeaders=options.headers;if(failPut)return response(409,{version:2,progress:remote});const body=JSON.parse(options.body);remote=structuredClone(body.progress);return response(200,{version:2,progress:remote});}return response(200,{version:1,progress:remote});};
const location={protocol:'https:',reload(){reloads++;},assign(href){redirect=href;}};
const context={console,fetch,AbortSignal:{timeout:()=>({})},URL,Blob,confirm:()=>false,setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},accountStorageSuffix:':'+id,emptyProgress,buildProgressMetadata,normalizeProgress,mergeProgress,document:{querySelector:key=>elements.get(key),createElement:element,addEventListener:(name,fn)=>events[name]=fn,visibilityState:'visible'},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},window:{...course.window,location,PA_EDITOR:{exportState:()=>structuredClone(current.drafts),replaceState:value=>current.drafts=structuredClone(value),saveCode(){}},PA_JOURNEY:{exportState:()=>structuredClone(current.journey),replaceState:value=>current.journey=structuredClone(value),updateAll(){}},addEventListener:(name,fn)=>events[name]=fn}};
vm.runInNewContext(source,context);for(let i=0;i<45;i++)await Promise.resolve();
return {elements,storage,events,context,current:()=>current,edit:value=>{current=structuredClone(value);context.window.PA_CLOUD.changed();},writes:()=>writes,reloads:()=>reloads,redirect:()=>redirect,headers:()=>lastHeaders,timers};
}
let s=await scenario();assert.equal(s.current().drafts['baze-01'].code,'print(1)');const controls=s.elements.get('#account-controls').children;assert.equal(controls[0].textContent,'Nume Universitar');assert.equal(controls[1].textContent,'Logout');assert.equal(controls[1].href,'/.auth/logout?post_logout_redirect_uri=/');
let edited=structuredClone(s.current());edited.drafts['baze-01'].code='print(2)';s.edit(edited);await s.context.window.PA_CLOUD.sync();assert.equal(s.writes(),1);assert.equal(s.headers()['X-PA-Account'],id);assert.equal(s.headers()['X-PA-Progress'],'1');
s=await scenario({enabled:false});assert.equal(s.reloads(),1);assert.equal(s.storage.has('pa-active-account'),false);assert.equal(s.writes(),0);
s=await scenario({userId:'33333333-3333-4333-8333-333333333333:44444444-4444-4444-8444-444444444444'});assert.equal(s.reloads(),1);assert.equal(s.writes(),0);
const base=progress(),ours=progress(),theirs=progress();ours.drafts['baze-01'].code='print(2)';theirs.drafts['baze-01'].code='print(3)';s=await scenario({cached:{progress:ours,base,version:1},remote:theirs});assert.equal(s.writes(),0);assert.equal(s.current().drafts['baze-01'].code,'print(2)');assert.equal(s.elements.get('#account-actions').children.length,2);
const guest=progress();guest.drafts['baze-02']={code:'print(9)',input:''};s=await scenario({guest,owner:'another-account'});assert.equal(s.current().drafts['baze-02'],undefined);
s=await scenario({guest});assert.equal(s.current().drafts['baze-02'].code,'print(9)');assert.equal(s.storage.get('pa-anonymous-owner'),id);assert.equal(s.writes(),1);
s=await scenario({network:true});assert.match(s.elements.get('#account-status').textContent,/local/);assert.equal(s.writes(),0);
s=await scenario();await s.elements.get('#account-controls').children[1].listeners.click({preventDefault(){}});assert.equal(s.redirect(),'/.auth/logout?post_logout_redirect_uri=/');
console.log('Account UI checks passed: name/Logout, restore/save, headers, disabled/offline mode, account switch, conflicts and guest import isolation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
