'use strict';
const admin=require('firebase-admin');
const crypto=require('crypto');
let db=null,enabled=false;
function parseServiceAccount(raw){
  let s=String(raw||'').trim();if(!s)return null;
  if(s.startsWith('var admin')){const start=s.indexOf('{'),end=s.lastIndexOf('}');if(start>=0&&end>start)s=s.slice(start,end+1)}
  return JSON.parse(s);
}
async function init(){
  if(String(process.env.STORAGE_PROVIDER||'').trim().toLowerCase()!=='firebase')return false;
  if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)return false;
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});
  db=admin.firestore();enabled=true;
  await db.collection('tekaym_runtime').doc('main').set({schema:1,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
  return true;
}
function docId(sub){return crypto.createHash('sha256').update(String(sub)).digest('hex').slice(0,40)}
async function getPlayer(sub){if(!enabled)return null;const s=await db.collection('tekaym_players').doc(docId(sub)).get();return s.exists?s.data():null}
async function savePlayer(sub,data){if(!enabled)return false;await db.collection('tekaym_players').doc(docId(sub)).set({...data,googleSub:sub,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});return true}
async function ensureAccount(g){if(!enabled)return null;const ref=db.collection('tekaym_accounts').doc(docId(g.sub));const s=await ref.get();const data={googleSub:g.sub,email:g.email,name:g.name,updatedAt:admin.firestore.FieldValue.serverTimestamp()};if(!s.exists)data.createdAt=admin.firestore.FieldValue.serverTimestamp();await ref.set(data,{merge:true});return ref.id}
module.exports={init,getPlayer,savePlayer,ensureAccount,get enabled(){return enabled}};
