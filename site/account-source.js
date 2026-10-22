import {emptyProgress,buildProgressMetadata,normalizeProgress,mergeProgress} from '../scripts/progress.mjs';
const metadata=buildProgressMetadata(window.PA_CONTENT,window.PA_BEGINNER,window.PA_INTERACTIVE);
const normalize=value=>normalizeProgress(value,metadata);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=value=>JSON.parse(JSON.stringify(value));
const controls=document.querySelector('#account-controls');
const actions=document.querySelector('#account-actions');
const message=document.querySelector('#account-status');
let user=null,base=emptyProgress(),revision=0,ready=false,applying=false,stopped=false,timer,retry=2000,conflict=null,imported=false,pending;
const state=()=>normalize({version:1,drafts:window.PA_EDITOR.exportState(),journey:window.PA_JOURNEY.exportState()});
const metaKey=()=> 'pa-cloud-meta:'+user.id;
const tell=text=>{message.textContent=text;};
function remember(){if(!user)return;try{localStorage.setItem(metaKey(),JSON.stringify({revision,base,dirty:!same(state(),base),imported}));}catch{tell('Salvarea locală nu este disponibilă. Descarcă progresul.');}}
function apply(data){applying=true;try{window.PA_EDITOR.replaceState(data.drafts);window.PA_JOURNEY.replaceState(data.journey);window.PA_JOURNEY.updateAll();}finally{applying=false;}}
function schedule(delay=1200){clearTimeout(timer);if(user&&ready&&!stopped)timer=setTimeout(()=>void sync(),delay);}
function changed(){if(applying||!user)return;remember();if(ready){tell('Se sincronizează…');schedule();}}
function button(label,fn){const el=document.createElement('button');el.type='button';el.className='secondary';el.textContent=label;el.addEventListener('click',fn);actions.append(el);return el;}
function downloadLocal(){const value=JSON.stringify({version:2,drafts:state().drafts,journey:state().journey},null,2);const url=URL.createObjectURL(new Blob([value],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='PA-progres-local.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function render(){
controls.replaceChildren();
if(user){const label=document.createElement('span');label.className='account-name';label.textContent=user.name||user.email;label.title=user.email;controls.append(label);const link=document.createElement('a');link.className='secondary';link.href='/.auth/logout?post_logout_redirect_uri=/';link.textContent='Logout';link.addEventListener('click',async event=>{event.preventDefault();window.PA_EDITOR.saveCode();await sync();window.location.assign(link.href);});controls.append(link);}
else{const link=document.createElement('a');link.className='secondary';link.href='/.auth/login/aad?post_login_redirect_uri=/';link.textContent='Conectare cu Microsoft';link.addEventListener('click',()=>window.PA_EDITOR.saveCode());controls.append(link);}
}
async function request(path,options={}){const response=await fetch(path,{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),...options});let value;try{value=await response.json();}catch{throw new Error('Account API unavailable');}if(!response.ok){const error=new Error(value.error||'Sincronizarea nu este disponibilă.');error.status=response.status;error.value=value;throw error;}return value;}
const headers=()=>({'X-PA-Account':user.id});
function showConflict(value){
conflict=value;stopped=true;clearTimeout(timer);actions.replaceChildren();
button('Descarcă varianta locală',downloadLocal);
button('Încarcă varianta din cont',()=>{if(!confirm('Descarc o copie a variantei locale, apoi încarc progresul din cont. Continui?'))return;downloadLocal();apply(normalize(conflict.progress));base=clone(state());revision=conflict.version;conflict=null;stopped=false;remember();actions.replaceChildren();tell('Progresul din cont a fost încărcat.');});
tell('Același exercițiu a fost modificat pe alt dispozitiv. Am păstrat copia locală și am oprit sincronizarea.');
}
function acceptRemote(value){
if(!Number.isSafeInteger(value.version)||value.version<0)throw new Error('Invalid progress revision');
const remote=normalize(value.progress);
const merged=mergeProgress(base,state(),remote);
if(merged.conflicts.length){showConflict({version:value.version,progress:remote});return false;}
base=clone(remote);revision=value.version;
if(!same(merged.progress,state()))apply(merged.progress);
remember();return true;
}
function importAnonymous(){
if(imported)return;
try{
const owner=localStorage.getItem('pa-anonymous-owner');
if(owner&&owner!==user.id){imported=true;remember();return;}
const guest=normalize({version:1,drafts:JSON.parse(localStorage.getItem('pa-drafts-v2')||'{}'),journey:JSON.parse(localStorage.getItem('pa-journey-v1')||'{"version":1,"quiz":{},"activityDays":[]}')});
const current=state();
for(const [id,row] of Object.entries(guest.drafts))if(!Object.hasOwn(current.drafts,id))current.drafts[id]=row;
current.journey.quiz={...guest.journey.quiz,...current.journey.quiz};
current.journey.activityDays=[...new Set([...guest.journey.activityDays,...current.journey.activityDays])].sort().slice(-365);
if(!current.journey.resume)current.journey.resume=guest.journey.resume;
if(Object.keys(guest.drafts).length||Object.keys(guest.journey.quiz).length)localStorage.setItem('pa-anonymous-owner',user.id);
apply(current);imported=true;remember();
}catch{tell('Progresul local nu a putut fi importat. Poți păstra o copie prin export.');}
}
async function performSync(){
if(!user||stopped)return;
try{
if(!ready){if(!acceptRemote(await request('/api/progress',{headers:headers()})))return;ready=true;importAnonymous();}
if(same(state(),base)){tell('Progres sincronizat.');return;}
const snapshot=state();
const saved=await request('/api/progress',{method:'PUT',headers:{...headers(),'Content-Type':'application/json','X-PA-Progress':'1'},body:JSON.stringify({version:revision,progress:snapshot})});
if(!Number.isSafeInteger(saved.version)||saved.version<=revision)throw new Error('Invalid saved revision');
base=normalize(saved.progress);revision=saved.version;retry=2000;remember();
if(same(state(),base))tell('Progres sincronizat.');else schedule();
}catch(error){
if(error.status===409&&error.value?.code!=='account-changed'){if(acceptRemote(error.value))schedule(100);}
else if([401,403,409].includes(error.status)){stopped=true;tell('Contul nu mai este disponibil. Copia locală este păstrată. Reîncarcă pagina.');}
else if([400,413,415].includes(error.status)){stopped=true;tell(error.message);actions.replaceChildren();button('Descarcă progresul',downloadLocal);}
else{tell('Sincronizarea nu este disponibilă. Progresul este păstrat local.');clearTimeout(timer);timer=setTimeout(()=>void sync(),retry);retry=Math.min(retry*2,60000);}
}
}
async function sync(){if(pending){await pending;if(user&&ready&&!stopped&&!same(state(),base))return sync();return;}pending=performSync();try{await pending;}finally{pending=null;}}
function switchStorage(suffix){if(accountStorageSuffix===suffix)return false;if(suffix)localStorage.setItem('pa-active-account',suffix);else localStorage.removeItem('pa-active-account');window.location.reload();return true;}
async function connect(){
try{
const account=await request('/api/account');
if(!account.enabled){if(switchStorage(''))return;tell('Progres salvat în acest browser.');return;}
if(!account.user){if(switchStorage(''))return;render();tell('Conectare disponibilă pentru @s.unibuc.ro și @unibuc.ro.');return;}
if(!/^[0-9a-f-]{36}:[0-9a-f-]{36}$/i.test(account.user.id)||! /^[^\s@#]+@(?:s\.unibuc\.ro|unibuc\.ro)$/i.test(account.user.email))throw new Error('Invalid account response');
if(switchStorage(':'+account.user.id))return;
user=account.user;render();
let saved;try{saved=JSON.parse(localStorage.getItem(metaKey())||'null');}catch{}
if(saved&&Number.isSafeInteger(saved.revision)&&saved.revision>=0){try{base=normalize(saved.base);revision=saved.revision;imported=saved.imported===true;}catch{base=emptyProgress();revision=0;}}
await sync();
}catch(error){if(error.status===403){controls.replaceChildren();const link=document.createElement('a');link.className='secondary';link.href='/.auth/logout?post_logout_redirect_uri=/';link.textContent='Schimbă contul Microsoft';controls.append(link);tell('Sunt acceptate numai conturile universitare @s.unibuc.ro și @unibuc.ro.');}else tell('Conectarea nu este disponibilă momentan. Progresul rămâne local.');}
}
window.PA_CLOUD={changed,sync};
window.addEventListener('online',()=>{if(user&&!stopped)void sync();});
window.addEventListener('storage',event=>{if(event.key==='pa-active-account')window.location.reload();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')void sync();});
connect();
