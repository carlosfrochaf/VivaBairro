// Prévia local da interface Flutter, sem instalação global de servidor web.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../mobile/build/web/',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.png':'image/png','.svg':'image/svg+xml','.css':'text/css','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{
 try {
  let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(path!==resolve(root)&&!path.startsWith(resolve(root)+sep)){res.writeHead(403).end();return;}
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end('Arquivo não encontrado.');}
}).listen(8088,'127.0.0.1',()=>console.log('Prévia: http://127.0.0.1:8088'));
