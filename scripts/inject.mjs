/* Runs the real Node/Express request handler with Node HTTP message objects.
   No TCP socket or listening port is needed by the training evaluator. */
import {IncomingMessage,ServerResponse} from 'node:http';
import {Duplex} from 'node:stream';
export function inject(handler, options={}) {
 return new Promise((resolve,reject)=>{
  const socket=new Duplex({read(){},write(chunk,encoding,callback){callback();}});
  const req=new IncomingMessage(socket);
  req.method=options.method||'GET';req.url=options.path||'/';
  req.headers=Object.fromEntries(Object.entries(options.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));
  const body=options.body===undefined?null:Buffer.from(options.body);
  if(body&&!req.headers['content-length'])req.headers['content-length']=String(body.length);
  req.httpVersion='1.1';req.httpVersionMajor=1;req.httpVersionMinor=1;
  const res=new ServerResponse(req);const chunks=[];
  let settled=false;
  const timer=setTimeout(()=>finish(new Error('The route did not complete its response.')),options.timeout||2500);
  function finish(error) {
   if(settled)return;settled=true;clearTimeout(timer);
   if(error)reject(error);else resolve({status:res.statusCode,headers:res.getHeaders(),body:Buffer.concat(chunks).toString('utf8')});
   socket.destroy();
  }
  res.write=function(chunk,encoding,callback){if(chunk!==undefined&&chunk!==null)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(String(chunk),typeof encoding==='string'?encoding:'utf8'));if(typeof encoding==='function')encoding();if(typeof callback==='function')callback();return true;};
  res.end=function(chunk,encoding,callback){if(chunk!==undefined&&chunk!==null)this.write(chunk,encoding);this.emit('finish');finish();if(typeof callback==='function')callback();return this;};
  res.on('error',finish);
  if(body)req.push(body);req.push(null);
  try { handler(req,res,error=>{if(error)finish(error);else{res.statusCode=404;res.end('Not found');}}); }
  catch(error){finish(error);}
 });
}
