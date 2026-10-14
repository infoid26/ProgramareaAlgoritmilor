import { createClient } from '@supabase/supabase-js';
const config = window.PA_AUTH_CONFIG;
const login = document.querySelector('#account-login');
const details = document.querySelector('#account-details');
const message = document.querySelector('#account-status');
let client;
let user;
let loading = true;
let busy = false;
let timer;
let conflict = false;
let revision = 0;
let epoch = 0;
const state = () => ({ version:1,drafts:window.PA_EDITOR.exportState(),journey:window.PA_JOURNEY.exportState() });
const metaKey = () => 'pa-cloud-meta:' + user.id;
const meta = () => { try { return JSON.parse(localStorage.getItem(metaKey()) || '{}'); } catch { return {}; } };
const putMeta = data => localStorage.setItem(metaKey(),JSON.stringify(data));
function changed() { if (loading || !user) { return; } epoch++; putMeta({ ...meta(),dirty:true }); clearTimeout(timer); timer = setTimeout(sync,1600); message.textContent = 'Modificări salvate local; sincronizare în așteptare.'; }
function apply(data) { loading = true; window.PA_EDITOR.replaceState(data?.drafts || {}); window.PA_JOURNEY.replaceState(data?.journey || { version:1,quiz:{},activityDays:[] }); window.PA_JOURNEY.updateAll(); loading = false; }
async function readRemote() { const { data,error } = await client.from('pa_progress').select('revision,payload').eq('user_id',user.id).maybeSingle(); if (error) { throw error; } return data; }
async function sync() {
if (!user || busy || loading || conflict) { return; }
busy = true;
const startEpoch = epoch;
const snapshot = state();
try { const { data,error } = await client.rpc('pa_save_progress',{ p_expected_revision:revision,p_payload:snapshot }); if (error) { if (error.code === '40001') { conflict = true; document.querySelector('#account-remote').hidden = false; throw new Error('Alt dispozitiv a salvat o versiune nouă. Exportă lucrul local înainte de a încărca versiunea din cloud.'); } throw error; } revision = data; putMeta({ revision,dirty:epoch !== startEpoch }); message.textContent = epoch === startEpoch ? 'Progres sincronizat.' : 'Se salvează modificările noi…'; }
catch (error) { message.textContent = conflict ? error.message : 'Sincronizarea nu a reușit. Lucrul rămâne salvat local. Apasă Sincronizează pentru a reîncerca.'; }
finally { busy = false; if (!conflict && epoch !== startEpoch) { timer = setTimeout(sync,1600); } }
}
async function connect() {
try {
const { data,error } = await client.auth.getUser();
if (error) { throw error; }
if (!data.user) { loading = false; if (accountStorageSuffix) { localStorage.removeItem('pa-active-account'); location.reload(); } return; }
user = data.user;
if (!/^[^@\s]+@(s\.unibuc\.ro|unibuc\.ro)$/i.test(user.email || '') || !user.identities?.some(identity => identity.provider === 'azure')) { await client.auth.signOut(); user = null; message.textContent = 'Sunt acceptate numai conturile Microsoft @s.unibuc.ro sau @unibuc.ro.'; loading = false; return; }
const suffix = ':' + user.id;
if (accountStorageSuffix !== suffix) { localStorage.setItem('pa-active-account',suffix); location.reload(); return; }
login.hidden = true; details.hidden = false;
document.querySelector('#account-name').textContent = 'Contul meu';
document.querySelector('#account-email').textContent = user.email;
const remote = await readRemote();
const saved = meta();
revision = remote?.revision || 0;
if (saved.dirty && (saved.revision || 0) !== revision) { conflict = true; message.textContent = 'Există modificări locale și o versiune nouă în cloud. Exportă lucrul local înainte de a încărca versiunea din cloud.'; document.querySelector('#account-remote').hidden = false; loading = false; return; }
if (!saved.dirty && remote) { apply(remote.payload); }
loading = false;
putMeta({ revision,dirty:!!saved.dirty });
message.textContent = remote ? 'Progres încărcat din cont.' : 'Cont conectat. Poți copia progresul local în cont.';
if (saved.dirty) { sync(); }
} catch { loading = false; message.textContent = 'Contul nu poate fi verificat acum. Progresul local este păstrat.'; }
}
window.PA_CLOUD = { changed };
login.addEventListener('click',async () => { if (!client) { message.textContent = 'Autentificarea nu este încă activată. Continuă local până la configurarea serviciului.'; return; } window.PA_EDITOR.saveCode(); const { error } = await client.auth.signInWithOAuth({ provider:'azure',options:{ scopes:'email',redirectTo:config.redirectUrl,queryParams:{ prompt:'select_account' } } }); if (error) { message.textContent = 'Conectarea Microsoft nu a putut începe.'; } });
document.querySelector('#account-sync').addEventListener('click',sync);
document.querySelector('#account-import-local').addEventListener('click',() => { if (!user || busy || conflict) { return; } if (!confirm('Copiază progresul anonim din acest browser în cont? Codul deja existent în cont va fi păstrat.')) { return; } try { const local = JSON.parse(localStorage.getItem('pa-drafts-v2') || '{}'); const snapshot = state(); snapshot.drafts = { ...local,...snapshot.drafts }; apply(snapshot); window.PA_JOURNEY.importState(JSON.parse(localStorage.getItem('pa-journey-v1') || '{}')); changed(); sync(); } catch { message.textContent = 'Progresul local nu poate fi importat.'; } });
document.querySelector('#account-remote').addEventListener('click',async () => { if (busy || !confirm('Înlocuiește copia locală a acestui cont cu versiunea din cloud? Exportă mai întâi codul local dacă vrei să îl păstrezi.')) { return; } try { const remote = await readRemote(); revision = remote?.revision || 0; apply(remote?.payload); conflict = false; putMeta({ revision,dirty:false }); document.querySelector('#account-remote').hidden = true; message.textContent = 'Versiunea din cloud a fost încărcată.'; } catch { message.textContent = 'Nu am putut încărca progresul.'; } });
document.querySelector('#account-logout').addEventListener('click',async () => { if (busy) { message.textContent = 'Așteaptă terminarea sincronizării.'; return; } clearTimeout(timer); await client.auth.signOut(); localStorage.removeItem('pa-active-account'); location.reload(); });
if (config?.enabled && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.supabaseUrl) && config.publishableKey) { client = createClient(config.supabaseUrl,config.publishableKey,{ auth:{ flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true } }); client.auth.onAuthStateChange((event,session) => { if (event === 'SIGNED_OUT' && accountStorageSuffix) { localStorage.removeItem('pa-active-account'); location.reload(); } if (event === 'SIGNED_IN' && session && accountStorageSuffix !== ':' + session.user.id) { localStorage.setItem('pa-active-account',':' + session.user.id); location.reload(); } }); connect(); } else { loading = false; login.title = 'Pregătit pentru activare după configurarea Microsoft și SQL'; }
window.addEventListener('online',sync);
window.addEventListener('storage',event => { if (event.key === 'pa-active-account') { location.reload(); } });
