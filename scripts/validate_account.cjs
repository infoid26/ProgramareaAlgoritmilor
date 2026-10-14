const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('site/account-source.js','utf8').replace(/^import .*;\r?\n/,'');
async function scenario(enabled,dirty=false,remoteRevision=1,rpcConflict=false) {
const nodes = new Map();
const storage = new Map([['pa-cloud-meta:u',JSON.stringify({ revision:1,dirty })]]);
let writes=0;
let applied=0;
const getNode = key => { if (!nodes.has(key)) { nodes.set(key,{ hidden:false,textContent:'',listeners:{},addEventListener(type,fn) { this.listeners[type]=fn; } }); } return nodes.get(key); };
const client = { auth:{ getUser:async () => ({ data:{ user:{ id:'u',email:'a@s.unibuc.ro',identities:[{ provider:'azure' }] } } }),onAuthStateChange(){},signOut:async()=>({}),signInWithOAuth:async()=>({}) },from:() => ({ select:() => ({ eq:() => ({ maybeSingle:async () => ({ data:{ revision:remoteRevision,payload:{version:1,drafts:{},journey:{version:1,quiz:{},activityDays:[]}} } }) }) }) }),rpc:async()=> { writes++; return rpcConflict ? {error:{code:'40001'}} : {data:2}; } };
const context = { console,URL,setTimeout:()=>0,clearTimeout(){},confirm:()=>true,accountStorageSuffix:':u',createClient:()=>client,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{reload(){}},document:{querySelector:getNode},window:{PA_AUTH_CONFIG:{enabled,supabaseUrl:'https://example.supabase.co',publishableKey:'public',redirectUrl:'https://pa.infoid26.ro/'},PA_EDITOR:{exportState:()=>({}),replaceState:()=>applied++,saveCode(){}},PA_JOURNEY:{exportState:()=>({version:1,quiz:{},activityDays:[]}),replaceState(){},updateAll(){},importState(){}},addEventListener(){}} };
vm.runInNewContext(source,context);
for(let i=0;i<12;i++){ await Promise.resolve(); }
return {nodes,writes:()=>writes,applied:()=>applied,storage,context};
}
(async()=>{
let s=await scenario(false);await s.nodes.get('#account-login').listeners.click();assert.match(s.nodes.get('#account-status').textContent,/nu este încă activată/);assert.equal(s.writes(),0);
s=await scenario(true);assert.equal(s.applied(),1);assert.equal(s.nodes.get('#account-login').hidden,true);await s.nodes.get('#account-sync').listeners.click();assert.equal(s.writes(),1);assert.equal(JSON.parse(s.storage.get('pa-cloud-meta:u')).revision,2);
s=await scenario(true,true,2);assert.equal(s.writes(),0);assert.equal(s.applied(),0);assert.equal(s.nodes.get('#account-remote').hidden,false);
s=await scenario(true,false,1,true);await s.nodes.get('#account-sync').listeners.click();assert.equal(s.nodes.get('#account-remote').hidden,false);assert.match(s.nodes.get('#account-status').textContent,/Alt dispozitiv/);
console.log('4 scenarii trecute: dezactivat, restaurare/salvare, conflict la pornire, conflict la salvare.');
})().catch(error=>{console.error(error);process.exitCode=1;});
