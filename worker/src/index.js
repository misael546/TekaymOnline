import { DurableObject } from 'cloudflare:workers';
const MAX_PLAYERS=16;
const WORLD={minX:-108,maxX:108,minZ:-88,maxZ:88};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}})}
function uid(){return crypto.randomUUID().replaceAll('-','').slice(0,16)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function safeText(v,max=160){return String(v??'').trim().slice(0,max)}
function b64urlBytes(input){const s=typeof input==='string'?input:JSON.stringify(input);const bytes=new TextEncoder().encode(s);let out='';for(let i=0;i<bytes.length;i+=0x8000)out+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(out).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function pemToArrayBuffer(pem){const b64=String(pem).replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g,'');const bin=atob(b64);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out.buffer}
let firebaseTokenCache={value:'',exp:0};
async function firebaseAccessToken(env){
  const raw=String(env.FIREBASE_SERVICE_ACCOUNT_JSON||'').trim();if(!raw)throw new Error('Firebase service account no configurada');
  const sa=JSON.parse(raw.replace(/^var\s+admin\s*=\s*/,'').replace(/;?\s*$/,''));
  const now=Math.floor(Date.now()/1000);
  if(firebaseTokenCache.value&&firebaseTokenCache.exp>now+60)return firebaseTokenCache.value;
  const key=await crypto.subtle.importKey('pkcs8',pemToArrayBuffer(sa.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const header=b64urlBytes({alg:'RS256',typ:'JWT'});
  const payload=b64urlBytes({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const data=header+'.'+payload;
  const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(data));
  const jwt=data+'.'+b64urlBytes(new Uint8Array(sig));
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:jwt})});
  if(!r.ok)throw new Error('No se pudo obtener acceso de Firestore');
  const j=await r.json();firebaseTokenCache={value:String(j.access_token||''),exp:now+Number(j.expires_in||3600)};return firebaseTokenCache.value;
}
function docId(sub){let h=0;for(const ch of String(sub)){h=((h<<5)-h+ch.charCodeAt(0))|0}return Math.abs(h).toString(36)+'-'+btoa(String(sub)).replaceAll('/','_').replaceAll('+','-').slice(0,24)}
function toFields(obj){const f={};for(const [k,v] of Object.entries(obj||{})){if(v===undefined||v===null)continue;if(typeof v==='number'&&Number.isFinite(v))f[k]={doubleValue:v};else if(typeof v==='boolean')f[k]={booleanValue:v};else f[k]={stringValue:String(v)}}return f}
function fromFields(fields){const out={};for(const [k,v] of Object.entries(fields||{})){if('doubleValue'in v)out[k]=Number(v.doubleValue);else if('integerValue'in v)out[k]=Number(v.integerValue);else if('booleanValue'in v)out[k]=Boolean(v.booleanValue);else if('stringValue'in v)out[k]=v.stringValue}return out}
async function fsRequest(env,path,init={}){
  const token=await firebaseAccessToken(env);const project=String(env.FIREBASE_PROJECT_ID||'').trim();if(!project)throw new Error('FIREBASE_PROJECT_ID no configurado');
  const r=await fetch('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(project)+'/databases/(default)/documents/'+path,{...init,headers:{...(init.headers||{}),authorization:'Bearer '+token,'content-type':'application/json'}});
  return r;
}
async function loadPlayer(env,sub){
  const r=await fsRequest(env,'tekaym_players/'+encodeURIComponent(docId(sub)));if(r.status===404)return null;if(!r.ok)throw new Error('Firestore load '+r.status);const d=await r.json();return fromFields(d.fields);
}
async function savePlayer(env,sub,data){
  const r=await fsRequest(env,'tekaym_players/'+encodeURIComponent(docId(sub)),{method:'PATCH',body:JSON.stringify({fields:toFields({...data,googleSub:sub,updatedAt:Date.now()})})});if(!r.ok)throw new Error('Firestore save '+r.status);return true;
}
async function ensureAccount(env,g){
  const body={fields:toFields({googleSub:g.sub,email:g.email,name:g.name,updatedAt:Date.now()})};
  const r=await fsRequest(env,'tekaym_accounts/'+encodeURIComponent(docId(g.sub)),{method:'PATCH',body:JSON.stringify(body)});if(!r.ok)throw new Error('Firestore account '+r.status);return true;
}
async function verifyGoogle(idToken,env){
  const clientId=String(env.GOOGLE_CLIENT_ID||'').trim();if(!clientId)throw new Error('GOOGLE_CLIENT_ID no configurado');if(!idToken)throw new Error('Inicia sesión con Google');
  const r=await fetch('https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(idToken),{cache:'no-store'});if(!r.ok)throw new Error('Token de Google inválido');
  const p=await r.json();if(String(p.aud||'')!==clientId)throw new Error('Token de Google no pertenece a Tekaym');if(Number(p.exp||0)<=Math.floor(Date.now()/1000))throw new Error('Sesión de Google expirada');if(String(p.email_verified||'').toLowerCase()!=='true')throw new Error('Correo de Google no verificado');if(!p.sub)throw new Error('Identidad Google inválida');
  return {sub:String(p.sub),email:String(p.email||''),name:safeText(p.name||p.email||'Jugador',20)};
}

export class GameRoom extends DurableObject {
  constructor(ctx,env){
    super(ctx,env);this.ctx=ctx;this.env=env;this.sessions=new Map();this.initialized=false;
    for(const ws of this.ctx.getWebSockets()){const a=ws.deserializeAttachment();if(a?.id)this.sessions.set(a.id,{ws,...a})}
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'));
  }
  async load(){
    if(this.initialized)return;
    this.initialized=true;
    if(!(await this.ctx.storage.get('bootedAt')))await this.ctx.storage.put('bootedAt',Date.now());
  }
  async fetch(request){
    await this.load();
    if(request.headers.get('Upgrade')!=='websocket')return json({ok:true,game:'Tekaym Online',version:this.env.GAME_VERSION||'V1',players:this.sessions.size,maxPlayers:MAX_PLAYERS});
    if(this.sessions.size>=MAX_PLAYERS)return new Response('Server full',{status:503});
    const pair=new WebSocketPair();const [client,server]=Object.values(pair);const id=uid();
    const session={id,name:'Jugador',googleSub:'',x:0,z:0,hp:100,maxHp:100,stamina:100,hunger:100,thirst:100,lastMove:0,lastSave:0,lastNeeds:Date.now()};
    this.ctx.acceptWebSocket(server,['room:main','session:'+id]);server.serializeAttachment(session);session.ws=server;this.sessions.set(id,session);
    server.send(JSON.stringify({type:'connected',id,release:this.env.GAME_VERSION||'V1',maxPlayers:MAX_PLAYERS,googleConfigured:Boolean(this.env.GOOGLE_CLIENT_ID)}));
    return new Response(null,{status:101,webSocket:client});
  }
  refreshSession(ws){
    const a=ws.deserializeAttachment();if(!a?.id)return null;
    let s=this.sessions.get(a.id);if(!s){s={...a,ws};this.sessions.set(a.id,s)}else s.ws=ws;
    return s;
  }
  persistSession(ws,s){const clean={...s};delete clean.ws;ws.serializeAttachment(clean)}
  broadcast(payload){const raw=JSON.stringify(payload);for(const ws of this.ctx.getWebSockets())try{if(ws.readyState===1)ws.send(raw)}catch{}}
  webSocketClose(ws){const s=this.refreshSession(ws);if(s)saveSessionSnapshot(this.env,s).catch(()=>{});if(s)this.sessions.delete(s.id);this.broadcastState()}
  webSocketError(ws){const s=this.refreshSession(ws);if(s)this.sessions.delete(s.id)}
  async webSocketMessage(ws,message){
    const p=this.refreshSession(ws);if(!p)return;
    this.updateNeeds(p);
    let m;try{m=JSON.parse(message)}catch{return}
    if(m.type==='join'){
      if(this.sessions.size>MAX_PLAYERS){ws.send(JSON.stringify({type:'auth_error',message:'Servidor lleno.'}));return}
      try{const g=await verifyGoogle(String(m.googleIdToken||''),this.env);p.googleSub=g.sub;p.name=g.name;await ensureAccount(this.env,g);const old=await loadPlayer(this.env,g.sub);if(old){p.x=clamp(Number(old.x)||0,WORLD.minX,WORLD.maxX);p.z=clamp(Number(old.z)||0,WORLD.minZ,WORLD.maxZ);p.hp=clamp(Number(old.hp)||100,0,100);p.hunger=clamp(Number(old.hunger)||100,0,100);p.thirst=clamp(Number(old.thirst)||100,0,100)}await savePlayer(this.env,g.sub,{x:p.x,z:p.z,hp:p.hp,hunger:p.hunger,thirst:p.thirst,name:p.name});ws.send(JSON.stringify({type:'joined',player:{id:p.id,name:p.name,x:p.x,z:p.z,hp:p.hp,maxHp:p.maxHp}}));this.broadcastState()}catch(e){ws.send(JSON.stringify({type:'auth_error',message:e?.message||'Autenticación inválida.'}))}
      return;
    }
    if(m.type==='move'){
      const x=Number(m.x),z=Number(m.z);const now=Date.now();if(now-p.lastMove<60)return;if(Number.isFinite(x)&&Number.isFinite(z)&&x>=WORLD.minX&&x<=WORLD.maxX&&z>=WORLD.minZ&&z<=WORLD.maxZ){p.x=x;p.z=z;p.lastMove=now}this.broadcastState();return;
    }
    if(m.type==='knife_attack'){
      const target=String(m.targetId||'');const zombie=this.zombies.find(z=>z.id===target);if(!zombie)return;
      const d=Math.hypot(p.x-zombie.x,p.z-zombie.z);if(d>2.7)return;
      zombie.hp-=20;ws.send(JSON.stringify({type:'attack_ack',targetId:target,damage:20}));
      if(zombie.hp<=0){zombie.hp=zombie.maxHp;zombie.x=clamp(p.x+(Math.random()*2-1)*25,WORLD.minX,WORLD.maxX);zombie.z=clamp(p.z+(Math.random()*2-1)*25,WORLD.minZ,WORLD.maxZ)}
      return;
    }
    if(m.type==='chat'){const text=safeText(m.text);if(text)this.broadcast({type:'chat',from:p.name,text})}
  }
  async alarm(){this.broadcast({type:'event',event:'alarm',at:Date.now()})}
  broadcastState(){this.broadcast({type:'state',players:[...this.sessions.values()].map(p=>({id:p.id,name:p.name,x:p.x,z:p.z,hp:p.hp,maxHp:p.maxHp}))})}
}

async function saveSessionSnapshot(env,p){if(!p.googleSub)return;await savePlayer(env,p.googleSub,{x:p.x,z:p.z,hp:p.hp,hunger:p.hunger,thirst:p.thirst,name:p.name})}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/health')return json({ok:true,game:'Tekaym Online',version:env.GAME_VERSION||'V1',status:'online',maxPlayers:MAX_PLAYERS,server:'cloudflare-durable-object'});
    if(url.pathname==='/auth/google/config')return json({ok:Boolean(env.GOOGLE_CLIENT_ID),clientId:String(env.GOOGLE_CLIENT_ID||'')});
    if(url.pathname==='/ws'){
      const id=env.GAME_ROOMS.idFromName('main');return env.GAME_ROOMS.get(id).fetch(request)
    }
    return json({ok:false,error:'Not Found'},404);
  }
};
