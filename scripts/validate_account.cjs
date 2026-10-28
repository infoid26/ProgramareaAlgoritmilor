const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
const {emptyProgress,buildProgressMetadata,normalizeProgress,mergeProgress}=await import('./progress.mjs');
const course={window:{}};
for(const file of ['exercises.js','python-course.js','interactive-content.js'])vm.runInNewContext(fs.readFileSync('site/'+file,'utf8'),course);
const source=fs.readFileSync('site/account-source.js','utf8').replace(/^import .*;\r?\n/,'');
const id='11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222';
const progress=()=>({version:1,drafts:{'baze-01':{code:'print(1)',input:'1\n2'}},journey:{version:1,quiz:{'baze:0':true},activityDays:[],resume:'#capitol/baze/2/0'}});
async function scenario({enabled=true,remote=progress(),cached,guest,owner,userId=id,failPut=false,network=false,offlineWrites=false,anonymous=false}={}){
const elements=new Map(),events={},timers=[];let current=emptyProgress(),writes=0,reloads=0,redirect='',lastHeaders;
const storage=new Map();
if(cached){current=structuredClone(cached.progress);storage.set('pa-cloud-meta:'+id,JSON.stringify({revision:cached.version,base:cached.base,imported:true}));}
if(guest){storage.set('pa-drafts-v2',JSON.stringify(guest.drafts));storage.set('pa-journey-v1',JSON.stringify(guest.journey));}
if(owner)storage.set('pa-anonymous-owner',owner);
function element(){return {children:[],listeners:{},hidden:false,textContent:'',className:'',append(...rows){this.children.push(...rows);},replaceChildren(...rows){this.children=[...rows];},addEventListener(type,fn){this.listeners[type]=fn;},click(){},requestSubmit(){redirect=this.action;}};}
for(const key of ['#account-controls','#account-actions','#account-status','#account-signin-hint','#account-panel'])elements.set(key,element());
const response=(status,value)=>({ok:status<400,status,json:async()=>structuredClone(value)});
const fetch=async(path,options={})=>{if(network)throw new Error('offline');if(path==='/api/account')return response(200,{enabled,user:enabled&&!anonymous?{id:userId,email:'student@s.unibuc.ro',name:'Nume Universitar'}:null});if(options.method==='PUT'){if(offlineWrites)throw new Error('offline');writes++;lastHeaders=options.headers;if(failPut)return response(409,{version:2,progress:remote});const body=JSON.parse(options.body);remote=structuredClone(body.progress);return response(200,{version:2,progress:remote});}return response(200,{version:1,progress:remote});};
const location={protocol:'https:',reload(){reloads++;},assign(href){redirect=href;}};
const context={console,fetch,AbortSignal:{timeout:()=>({})},URL,Blob,confirm:()=>false,setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},accountStorageSuffix:anonymous?'':':'+id,emptyProgress,buildProgressMetadata,normalizeProgress,mergeProgress,document:{querySelector:key=>elements.get(key),createElement:element,addEventListener:(name,fn)=>events[name]=fn,visibilityState:'visible'},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},window:{...course.window,location,PA_EDITOR:{exportState:()=>structuredClone(current.drafts),replaceState:value=>current.drafts=structuredClone(value),saveCode(){}},PA_JOURNEY:{exportState:()=>structuredClone(current.journey),replaceState:value=>current.journey=structuredClone(value),updateAll(){}},addEventListener:(name,fn)=>events[name]=fn}};
vm.runInNewContext(source,context);for(let i=0;i<45;i++)await Promise.resolve();
return {elements,storage,events,context,current:()=>current,edit:value=>{current=structuredClone(value);context.window.PA_CLOUD.changed();},writes:()=>writes,reloads:()=>reloads,redirect:()=>redirect,headers:()=>lastHeaders,timers};
}
let s=await scenario();assert.equal(s.current().drafts['baze-01'].code,'print(1)');const form=s.elements.get('#account-controls').children[0];assert.equal(form.action,'/account/logout');assert.equal(form.method,'post');assert.equal(form.children[0].children[0].textContent,'Nume Universitar');assert.equal(form.children[0].children[1].textContent,'Logout');
let edited=structuredClone(s.current());edited.drafts['baze-01'].code='print(2)';s.edit(edited);await s.context.window.PA_CLOUD.sync();assert.equal(s.writes(),1);assert.equal(s.headers()['X-PA-Account'],id);assert.equal(s.headers()['X-PA-Progress'],'1');
s=await scenario({enabled:false});assert.equal(s.reloads(),1);assert.equal(s.storage.has('pa-active-account'),false);assert.equal(s.writes(),0);
s=await scenario({userId:'33333333-3333-4333-8333-333333333333:44444444-4444-4444-8444-444444444444'});assert.equal(s.reloads(),1);assert.equal(s.writes(),0);
const base=progress(),ours=progress(),theirs=progress();ours.drafts['baze-01'].code='print(2)';theirs.drafts['baze-01'].code='print(3)';s=await scenario({cached:{progress:ours,base,version:1},remote:theirs});assert.equal(s.writes(),0);assert.equal(s.current().drafts['baze-01'].code,'print(2)');assert.equal(s.elements.get('#account-actions').children.length,2);
const guest=progress();guest.drafts['baze-02']={code:'print(9)',input:''};s=await scenario({guest,owner:'another-account'});assert.equal(s.current().drafts['baze-02'],undefined);
s=await scenario({guest});assert.equal(s.current().drafts['baze-02'].code,'print(9)');assert.equal(s.storage.get('pa-anonymous-owner'),id);assert.equal(s.writes(),1);
s=await scenario({network:true});assert.match(s.elements.get('#account-status').textContent,/local/);assert.equal(s.writes(),0);
s=await scenario({guest});
s.storage.set('pa-drafts-v2:'+id,'saved');s.storage.set('pa-journey-v1:'+id,'saved');s.storage.set('pa-active-account',':'+id);s.storage.set('unrelated-preference','keep');s.storage.set('pa-drafts-v2:another-account','keep');
await s.elements.get('#account-controls').children[0].listeners.submit({preventDefault(){}});
assert.equal(s.redirect(),'/account/logout');
for(const key of ['pa-drafts-v2:'+id,'pa-journey-v1:'+id,'pa-cloud-meta:'+id,'pa-active-account','pa-drafts-v2','pa-journey-v1','pa-anonymous-owner'])assert.equal(s.storage.has(key),false,key);
assert.equal(s.storage.get('unrelated-preference'),'keep');assert.equal(s.storage.get('pa-drafts-v2:another-account'),'keep');
s=await scenario({offlineWrites:true});edited=structuredClone(s.current());edited.drafts['baze-01'].code='print(99)';s.edit(edited);
await s.elements.get('#account-controls').children[0].listeners.submit({preventDefault(){}});
assert.equal(s.redirect(),'');assert.equal(s.storage.has('pa-cloud-meta:'+id),true);assert.match(s.elements.get('#account-status').textContent,/nu a fost sincronizat/);
s=await scenario({anonymous:true});assert.equal(s.elements.get('#account-signin-hint').hidden,false);assert.equal(s.elements.get('#account-status').textContent,'');assert.equal(s.elements.get('#account-panel').hidden,true);assert.equal(s.elements.get('#account-controls').children[0].href,'/.auth/login/aad?post_login_redirect_uri=/');assert.equal(s.writes(),0);
s=await scenario();assert.equal(s.elements.get('#account-signin-hint').hidden,true);assert.equal(s.elements.get('#account-panel').hidden,false);
console.log('Account UI checks passed: name/Logout, restore/save, headers, disabled/offline mode, account switch, conflicts and guest import isolation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
