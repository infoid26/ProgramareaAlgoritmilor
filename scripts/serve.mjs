import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {buildProgressMetadata} from './progress.mjs';
import {fileURLToPath} from 'node:url';
import {createAccountHandler,createProgressStore,progressDatabaseSettings} from './accounts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.py':'text/x-python; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
export async function courseMetadata(){
const context={window:{}};
for(const file of ['exercises.js','python-course.js','interactive-content.js'])vm.runInNewContext(await fs.readFile(path.join(root,'site',file),'utf8'),context,{timeout:2000});
return buildProgressMetadata(context.window.PA_CONTENT,context.window.PA_BEGINNER,context.window.PA_INTERACTIVE);
}
export function runtimeSettings(env=process.env){
const production=env.NODE_ENV==='production'||Boolean(env.WEBSITE_INSTANCE_ID);
const port=Number(env.PORT||8080);
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Invalid PORT');
return {production,port,host:env.HOST||(production?'0.0.0.0':'127.0.0.1')};
}
export function createServer(options={}){
const env=options.env||process.env;
const store=options.progressStore||createProgressStore(progressDatabaseSettings(env));
let metadata;
const lessons=()=>metadata??=courseMetadata();
const accounts=createAccountHandler({env,lessons,store});
const server=http.createServer(async(req,res)=>{
try{
const pathname=decodeURIComponent(new URL(req.url,'https://application.invalid').pathname);
if(await accounts(req,res,pathname))return;
if(pathname==='/api/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({status:'ok',service:'programarea-algoritmilor',accounts:env.AUTH_ENABLED==='true'}));return;}
if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
if(pathname!=='/'&&pathname!=='/index.html'&&(!pathname.startsWith('/site/')||pathname.includes('..')||pathname.includes('\\')||pathname.split('/').some(part=>part.startsWith('.')))){res.writeHead(404);res.end('Not found');return;}
const target=path.join(root,pathname==='/'?'index.html':pathname.slice(1));
const resolved=await fs.realpath(target);
if(resolved!==path.join(root,'index.html')&&!resolved.startsWith(path.join(root,'site')+path.sep)){res.writeHead(404);res.end('Not found');return;}
const type=types[path.extname(target)];
if(!type){res.writeHead(404);res.end('Not found');return;}
const body=await fs.readFile(resolved);
res.writeHead(200,{'Content-Type':type,'Content-Length':body.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});
res.end(req.method==='HEAD'?undefined:body);
}catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end(error.code==='ENOENT'?'Not found':'Request failed');}
});
server.on('close',()=>void store.close());
return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const settings=runtimeSettings();const server=createServer();server.listen(settings.port,settings.host,()=>console.log('PA server listening on port '+server.address().port));}
