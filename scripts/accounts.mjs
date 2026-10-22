import {Pool} from 'pg';
import {normalizeProgress} from './progress.mjs';
export {normalizeProgress} from './progress.mjs';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const claimNames={
  tenant:['tid','http://schemas.microsoft.com/identity/claims/tenantid'],
  object:['oid','http://schemas.microsoft.com/identity/claims/objectidentifier'],
  username:['preferred_username','upn','http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
};
const empty=()=>({version:1,drafts:{},journey:{version:1,quiz:{},activityDays:[],resume:''}});
export const progressLimit=6000000;
const diagnosticCodes=new Map([
  ['ENOTFOUND','dns'],['EAI_AGAIN','dns'],
  ['ECONNREFUSED','network'],['ECONNRESET','network'],['ETIMEDOUT','timeout'],['ENETUNREACH','network'],['EHOSTUNREACH','network'],
  ['CERT_HAS_EXPIRED','tls'],['DEPTH_ZERO_SELF_SIGNED_CERT','tls'],['SELF_SIGNED_CERT_IN_CHAIN','tls'],['UNABLE_TO_VERIFY_LEAF_SIGNATURE','tls'],['UNABLE_TO_GET_ISSUER_CERT_LOCALLY','tls'],['ERR_TLS_CERT_ALTNAME_INVALID','tls'],
  ['28P01','database-auth'],['28000','database-auth'],['42501','database-permission'],['3D000','database-missing'],['42P01','table-missing'],['53300','database-capacity'],['57P03','database-unavailable'],['57014','timeout'],
  ['PA_DB_NOT_CONFIGURED','configuration'],
]);
export function progressErrorDiagnostic(error){
  const code=diagnosticCodes.has(error?.code)?error.code:'UNKNOWN';
  if(code!=='UNKNOWN')return {category:diagnosticCodes.get(code),code};
  if(/^(Connection terminated due to connection timeout|Connection timeout|Query read timeout|timeout exceeded when trying to connect)$/i.test(error?.message||''))return {category:'timeout',code:'CLIENT_TIMEOUT'};
  return {category:'unknown',code};
}
const reportedErrors=new WeakSet();
function reportProgressError(error,stage){
  const trackable=error!==null&&(typeof error==='object'||typeof error==='function');
  if(trackable&&reportedErrors.has(error))return;
  if(trackable)reportedErrors.add(error);
  console.warn(JSON.stringify({event:'pa_progress_error',stage,...progressErrorDiagnostic(error)}));
}

export function progressDatabaseSettings(env){
  if(env.PROGRESS_DATABASE_URL){let url;try{url=new URL(env.PROGRESS_DATABASE_URL);}catch{throw new Error('Invalid progress database settings');}if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||(url.searchParams.has('sslmode')&&url.searchParams.get('sslmode')!=='verify-full')||url.searchParams.has('ssl'))throw new Error('Progress database requires verified TLS');return {connectionString:env.PROGRESS_DATABASE_URL,connectionOptions:{ssl:{rejectUnauthorized:true}}};}
  if(env.PROGRESS_USE_AZURE_POSTGRESQL!=='true')return {};
  for(const name of ['AZURE_POSTGRESQL_HOST','AZURE_POSTGRESQL_USER','AZURE_POSTGRESQL_PASSWORD','AZURE_POSTGRESQL_DATABASE']){
    if(!env[name])throw new Error('Missing PostgreSQL setting: '+name);
  }
  const port=Number(env.AZURE_POSTGRESQL_PORT||5432);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PostgreSQL port');
  return {connectionOptions:{host:env.AZURE_POSTGRESQL_HOST,port,user:env.AZURE_POSTGRESQL_USER,password:env.AZURE_POSTGRESQL_PASSWORD,database:env.AZURE_POSTGRESQL_DATABASE,ssl:{rejectUnauthorized:true}}};
}

export function accountSettings(env){
  if(env.AUTH_ENABLED!=='true')return null;
  const tenants=(env.AUTH_UNIVERSITY_TENANT_IDS||'').split(',').map(id=>id.trim().toLowerCase()).filter(Boolean);
  const origin=new URL(env.AUTH_ORIGIN||'https://pa.infoid26.ro');
  // Identity headers are trusted ONLY behind Azure's enabled Easy Auth module.
  // Never enable a local/header-based development bypass in the shipped server.
  if(!env.WEBSITE_INSTANCE_ID||!['true','1'].includes((env.WEBSITE_AUTH_ENABLED||'').toLowerCase())||!tenants.length||tenants.some(id=>!uuid.test(id))||origin.protocol!=='https:'||origin.origin!==origin.href.replace(/\/$/,'')){
    throw new Error('Account configuration requires Azure Easy Auth, university tenant IDs and an HTTPS origin.');
  }
  return {tenants:new Set(tenants),origin:origin.origin};
}

export function accountIdentity(headers,settings){
  if(!settings)return null;
  const encoded=headers['x-ms-client-principal'];
  if(!encoded)return null;
  if(typeof encoded!=='string'||encoded.length>64000)throw new Error('Forbidden account');
  let principal;
  try{principal=JSON.parse(Buffer.from(encoded,'base64').toString('utf8'));}catch{throw new Error('Forbidden account');}
  if(principal.auth_typ!=='aad'||!Array.isArray(principal.claims))throw new Error('Forbidden account');
  const read=names=>{
    const values=[...new Set(principal.claims.filter(c=>names.includes(c.typ)).map(c=>c.val))];
    if(values.some(v=>typeof v!=='string')||values.length>1)throw new Error('Conflicting identity claims');
    return values[0];
  };
  const tenant=read(claimNames.tenant)?.toLowerCase();
  const object=read(claimNames.object)?.toLowerCase();
  // Do not authorize using a mutable email/contact claim or principal-name header.
  const username=read(claimNames.username)?.toLowerCase();
  if(!uuid.test(tenant||'')||!uuid.test(object||'')||!settings.tenants.has(tenant)||!username||username.length>254||! /^[^\s@#]+@(?:s\.unibuc\.ro|unibuc\.ro)$/.test(username))throw new Error('Forbidden account');
  if(principal.claims.some(c=>c.typ==='idtyp'&&c.val!=='user')||principal.claims.some(c=>c.typ==='acct'&&c.val!=='0'))throw new Error('Forbidden account');
  // Display names are presentation only; authorization above uses tenant/oid/UPN.
  const display=principal.claims.find(c=>c.typ==='name'&&typeof c.val==='string'&&c.val.trim())
    ||principal.claims.find(c=>c.typ==='http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'&&typeof c.val==='string'&&c.val.trim());
  return {tenant,object,id:tenant+':'+object,email:username,name:display?display.val.trim().slice(0,200):username};
}

export function createProgressStore({connectionString,connectionOptions,database}={}){
  let pool=database,initializing;
  async function query(stage,...args){
    try{return await pool.query(...args);}catch(error){reportProgressError(error,stage);throw error;}
  }
  async function ready(){
    if(!pool){
      if(!connectionString&&!connectionOptions)throw Object.assign(new Error('Progress database is not configured'),{code:'PA_DB_NOT_CONFIGURED'});
      pool=new Pool({...connectionOptions,...(connectionString?{connectionString}:{}),max:4,connectionTimeoutMillis:5000,idleTimeoutMillis:30000,query_timeout:7000,statement_timeout:5000});
      // Never log connection strings or student code on a database error.
      pool.on('error',error=>reportProgressError(error,'idle-connection'));
    }
    initializing??=query('connect-or-schema',`CREATE TABLE IF NOT EXISTS public.pa_account_progress (
      tenant_id uuid NOT NULL, object_id uuid NOT NULL,
      version integer NOT NULL CHECK (version > 0), progress jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (tenant_id, object_id)
    )`).catch(error=>{initializing=undefined;throw error;});
    await initializing;
    return pool;
  }
  const convert=row=>row?{version:Number(row.version),progress:row.progress}:{version:0,progress:empty()};
  return {
    async read(user){
      await ready();
      const result=await query('read','SELECT version, progress FROM public.pa_account_progress WHERE tenant_id=$1 AND object_id=$2',[user.tenant,user.object]);
      return convert(result.rows[0]);
    },
    async write(user,version,progress){
      await ready();
      const values=[user.tenant,user.object,JSON.stringify(progress)];
      // Compare-and-swap prevents an old tab/device overwriting newer progress.
      const result=version===0
        ?await query('write','INSERT INTO public.pa_account_progress (tenant_id,object_id,version,progress) VALUES ($1,$2,1,$3::jsonb) ON CONFLICT DO NOTHING RETURNING version,progress',values)
        :await query('write','UPDATE public.pa_account_progress SET version=version+1,progress=$3::jsonb,updated_at=now() WHERE tenant_id=$1 AND object_id=$2 AND version=$4 RETURNING version,progress',[...values,version]);
      return result.rows[0]?convert(result.rows[0]):null;
    },
    async close(){if(pool&&!database)await pool.end();},
  };
}

export function createAccountHandler({env,lessons,store}){
  const settings=accountSettings(env);
  const json=(res,status,value)=>{
    for(const [name,header] of Object.entries({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}))res.setHeader(name,header);
    res.writeHead(status);res.end(JSON.stringify(value));
  };
  return async(req,res,pathname)=>{
    if(!['/api/account','/api/progress'].includes(pathname))return false;
    try{
      if(!settings){json(res,pathname==='/api/account'?200:503,{enabled:false,user:null,error:'Sincronizarea conturilor nu este încă activată.'});return true;}
      let user;
      try{user=accountIdentity(req.headers,settings);}catch{json(res,403,{enabled:true,user:null,error:'Conectarea este permisă numai conturilor universitare @s.unibuc.ro și @unibuc.ro.',logoutUrl:'/.auth/logout?post_logout_redirect_uri=/'});return true;}
      if(pathname==='/api/account'){
        if(req.method!=='GET'){json(res,405,{error:'Metodă nepermisă.'});return true;}
        json(res,200,{enabled:true,user:user?{id:user.id,email:user.email,name:user.name}:null,loginUrl:'/.auth/login/aad?post_login_redirect_uri=/',logoutUrl:'/.auth/logout?post_logout_redirect_uri=/'});return true;
      }
      if(!user){json(res,401,{error:'Conectează-te pentru sincronizarea progresului.'});return true;}
      if(req.headers['x-pa-account']!==user.id){json(res,409,{code:'account-changed',error:'Contul conectat s-a schimbat. Reîncarcă pagina; copia locală este păstrată.'});return true;}
      if(req.method==='GET'){json(res,200,await store.read(user));return true;}
      if(req.method!=='PUT'){json(res,405,{error:'Metodă nepermisă.'});return true;}
      if(req.headers.origin!==settings.origin||req.headers['x-pa-progress']!=='1'||req.headers['sec-fetch-site']==='cross-site'){
        json(res,403,{error:'Cererea de salvare trebuie trimisă de pe site.'});return true;
      }
      if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')){json(res,415,{error:'Este necesar JSON.'});return true;}
      const chunks=[];let size=0;
      for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>progressLimit){json(res,413,{error:'Progresul depășește limita de 6 MB. Descarcă o copie locală.'});return true;}chunks.push(Buffer.from(chunk));}
      let input,progress;
      try{
        input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if(!Number.isSafeInteger(input.version)||input.version<0||input.version>=2147483647)throw new Error('Invalid version');
        progress=normalizeProgress(input.progress,await lessons());
      }catch{json(res,400,{error:'Formatul progresului nu este valid.'});return true;}
      const saved=await store.write(user,input.version,progress);
      if(!saved){json(res,409,{error:'Progresul s-a schimbat pe alt dispozitiv.',...await store.read(user)});return true;}
      json(res,200,saved);
    }catch(error){reportProgressError(error,req.method==='GET'?'read-request':'write-request');json(res,503,{error:'Progresul nu a putut fi sincronizat. Copia locală este păstrată.'});}
    return true;
  };
}
