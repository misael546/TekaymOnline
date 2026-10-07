'use strict';
const http=require('http');
const {WebSocketServer}=require('ws');
const crypto=require('crypto');
const storage=require('./storage');
const {GOOGLE_CLIENT_ID,verifyGoogleCredential}=require('./google-auth');
const RELEASE=require('../release.json');

const PORT=Number(process.env.PORT||10000);
const MAX_PLAYERS=16;
const clients=new Map();
let storageReady=false;
const startedAt=Date.now();

function id(){return crypto.randomBytes(8).toString('hex')}
function send(ws,p){try{if(ws.readyState===1)ws.send(JSON.stringify(p))}catch{}}
function json(res,data,status=200){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data))}
function health(res){json(res,{ok:true,game:'Tekaym Online',players:clients.size,maxPlayers:MAX_PLAYERS,status:'online',storage:storage.enabled?'firestore':'unconfigured',storageReady,googleConfigured:Boolean(GOOGLE_CLIENT_ID),release:RELEASE.version,startedAt})}
function allowedPosition(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=108&&Math.abs(z)<=88}

const httpServer=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://'+(req.headers.host||'localhost'));
 if(u.pathname==='/'||u.pathname==='/health')return health(res);
 if(u.pathname==='/auth/google/config')return json(res,{ok:Boolean(GOOGLE_CLIENT_ID),clientId:GOOGLE_CLIENT_ID||''});
 if(u.pathname==='/rooms')return json(res,{ok:true,rooms:[{code:'MAIN',players:clients.size,maxPlayers:MAX_PLAYERS}]});
 return json(res,{ok:false,error:'Not Found'},404);
});

const wss=new WebSocketServer({server:httpServer,path:'/ws',maxPayload:16*1024});
function publicPlayer(p){return{id:p.id,name:p.name,x:p.x,z:p.z,hp:p.hp,maxHp:p.maxHp}}
function broadcastState(){const players=[...clients.values()].map(publicPlayer);for(const p of clients.values())send(p.ws,{type:'state',players})}

async function authenticate(msg){
 if(!String(msg.googleIdToken||''))throw new Error('Se requiere acceso con Google.');
 return verifyGoogleCredential(String(msg.googleIdToken));
}

wss.on('connection',ws=>{
 if(clients.size>=MAX_PLAYERS){send(ws,{type:'room_error',message:'Servidor lleno.'});ws.close();return}
 const p={id:id(),ws,name:'Jugador',googleSub:'',x:0,z:0,hp:100,maxHp:100,stamina:100,hunger:100,thirst:100,lastSave:Date.now()};
 clients.set(ws,p);
 send(ws,{type:'connected',id:p.id,maxPlayers:MAX_PLAYERS,release:RELEASE.version,googleConfigured:Boolean(GOOGLE_CLIENT_ID)});

 ws.on('message',async raw=>{
  try{
   const msg=JSON.parse(raw.toString());
   if(!msg||typeof msg.type!=='string')return;
   if(msg.type==='join'){
    try{
     const g=await authenticate(msg);p.googleSub=g.sub;
     await storage.ensureAccount(g);
     const saved=await storage.getPlayer(g.sub);
     if(saved){p.x=Number(saved.x)||p.x;p.z=Number(saved.z)||p.z;p.hp=Math.max(0,Math.min(p.maxHp,Number(saved.hp)||p.hp));p.hunger=Math.max(0,Math.min(100,Number(saved.hunger)||p.hunger));p.thirst=Math.max(0,Math.min(100,Number(saved.thirst)||p.thirst));}
     p.name=String(saved?.name||g.name||'Jugador').slice(0,20);
     send(ws,{type:'joined',player:publicPlayer(p)});broadcastState();
    }catch(e){send(ws,{type:'auth_error',message:e?.message||'Autenticación inválida.'})}
    return;
   }
   if(msg.type==='move'){
    const x=Number(msg.x),z=Number(msg.z);
    if(allowedPosition(x,z)){const distance=Math.hypot(x-p.x,z-p.z);if(distance<=1.5)p.x=x,p.z=z}
    broadcastState();return;
   }
   if(msg.type==='knife_attack'){
    const targetId=String(msg.targetId||'').slice(0,64);
    if(!targetId){send(ws,{type:'attack_rejected',message:'Objetivo inválido.'});return}
    send(ws,{type:'attack_ack',targetId,damage:20});return;
   }
   if(msg.type==='chat'){const text=String(msg.text||'').trim().slice(0,160);if(text)for(const q of clients.values())send(q.ws,{type:'chat',from:p.name,text})}
  }catch(e){send(ws,{type:'error',message:'Mensaje inválido.'})}
 });

 ws.on('close',async()=>{
  clients.delete(ws);
  if(storage.enabled&&p.googleSub)await storage.savePlayer(p.googleSub,{x:p.x,z:p.z,hp:p.hp,hunger:p.hunger,thirst:p.thirst,name:p.name});
  broadcastState();
 });
 ws.on('error',()=>{});
});

setInterval(async()=>{
 for(const p of clients.values()){
  p.hunger=Math.max(0,p.hunger-.03);p.thirst=Math.max(0,p.thirst-.05);
  if(p.hunger===0||p.thirst===0)p.hp=Math.max(0,p.hp-.15);
  if(storage.enabled&&p.googleSub&&Date.now()-p.lastSave>=15000){p.lastSave=Date.now();await storage.savePlayer(p.googleSub,{x:p.x,z:p.z,hp:p.hp,hunger:p.hunger,thirst:p.thirst,name:p.name})}
 }
},1000);

(async()=>{try{storageReady=await storage.initStorage()}catch(e){console.error('[TEKAYM STORAGE]',e?.stack||e)}})();
httpServer.listen(PORT,()=>console.log('Tekaym Online server listening on '+PORT+' · release '+RELEASE.version+' · maxPlayers '+MAX_PLAYERS));
