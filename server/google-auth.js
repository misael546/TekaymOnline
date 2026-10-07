'use strict';
const {OAuth2Client}=require('google-auth-library');
const GOOGLE_CLIENT_ID=String(process.env.GOOGLE_CLIENT_ID||'').trim();
const verifier=new OAuth2Client(GOOGLE_CLIENT_ID||undefined);
async function verifyGoogleCredential(idToken){
  if(!GOOGLE_CLIENT_ID)throw new Error('GOOGLE_CLIENT_ID no configurado');
  const ticket=await verifier.verifyIdToken({idToken,audience:GOOGLE_CLIENT_ID});
  const p=ticket.getPayload();
  if(!p||!p.sub)throw new Error('Credencial Google sin sub');
  if(!['https://accounts.google.com','accounts.google.com'].includes(String(p.iss||'')))throw new Error('Issuer Google inválido');
  if(p.email_verified!==true)throw new Error('Correo Google no verificado');
  return {sub:String(p.sub),email:String(p.email||''),name:String(p.name||p.email||'Jugador').slice(0,20),picture:String(p.picture||'').slice(0,512)};
}
module.exports={GOOGLE_CLIENT_ID,verifyGoogleCredential};
