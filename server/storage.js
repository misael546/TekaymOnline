'use strict';
const firestore=require('./firestore-storage');
async function initStorage(){return firestore.init()}
module.exports={initStorage,getPlayer:firestore.getPlayer,savePlayer:firestore.savePlayer,ensureAccount:firestore.ensureAccount,get enabled(){return firestore.enabled},provider:'firebase'};
