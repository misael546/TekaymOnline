import * as THREE from 'three';
import { WORLD } from './config.js';
const mats=[
  new THREE.MeshStandardMaterial({color:0x5a6067,roughness:.92}),
  new THREE.MeshStandardMaterial({color:0x737b84,roughness:.9}),
  new THREE.MeshStandardMaterial({color:0x31363d,roughness:.95}),
  new THREE.MeshStandardMaterial({color:0x686e75,roughness:.88}),
  new THREE.MeshStandardMaterial({color:0x1d252e,roughness:.65,metalness:.75})
];
function box(w,h,d,mat,x,y,z,g){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function label(g,label,x,z){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle='#dfe8f2';q.font='bold 56px Arial';q.textAlign='center';q.fillText(label,256,76);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(10,2.5,1);s.position.set(x,2.8,z);g.add(s)}
export function buildPrisonBlockout(){
 const group=new THREE.Group(),cells=[],colliders=[],zombieZones=[];
 box(220,.5,180,mats[0],0,-.25,0,group);
 box(220,18,.5,mats[1],0,9,-90,group);box(220,18,.5,mats[1],0,9,90,group);box(.5,18,180,mats[1],-110,9,0,group);box(.5,18,180,mats[1],110,9,0,group);
 const offsets=[[-65,-48],[65,-48],[-65,48],[65,48]];let index=0;
 for(let a=0;a<offsets.length;a++){const ox=offsets[a][0],oz=offsets[a][1];
  for(let side=0;side<2;side++)for(let i=0;i<8;i++){
   const x=ox+(i-3.5)*WORLD.cellWidth,z=oz+(side===0?-11:11),back=oz+(side===0?-13.5:13.5);
   box(3.85,3.2,.28,mats[3],x,1.6,back,group);box(.28,3.2,5.2,mats[3],x-2,1.6,z,group);box(.28,3.2,5.2,mats[3],x+2,1.6,z,group);
   box(2.2,.25,1.8,mats[2],x,.9,z+(side===0?.8:-.8),group);box(.8,.5,.8,mats[2],x+(side===0?1.35:-1.35),.3,z+(side===0?1.6:-1.6),group);box(2.7,2.8,.15,mats[4],x,1.4,back+(side===0?5.1:-5.1),group);
   const letter=String.fromCharCode(65+a);const suffix=side?'B':'A';cells.push({id:letter+'-'+String(i+1).padStart(2,'0')+suffix,area:a,side,index:index++,spawn:new THREE.Vector3(x,1.65,z+(side===0?-1.2:1.2)),center:new THREE.Vector3(x,1.65,z)});
  }
  box(66,3.2,4,mats[3],ox,1.6,oz,group);colliders.push({minX:ox-33,maxX:ox+33,minZ:oz-2,maxZ:oz+2});zombieZones.push(new THREE.Box3(new THREE.Vector3(ox-33,0,oz-8),new THREE.Vector3(ox+33,3,oz+8)));label(group,'BLOQUE '+String.fromCharCode(65+a),ox,oz);
 }
 const rooms=[['COMEDOR',0,-8,34,26],['GIMNASIO',0,28,26,22],['PATIO',0,65,54,28],['ENFERMERÍA',0,-56,24,18],['DUCHAS',-36,0,18,18],['LAVANDERÍA',36,0,18,18],['CONTROL',0,0,18,12],['TALLER',-35,30,20,18],['VISITAS',35,30,20,18],['MANTENIMIENTO',-35,-30,20,18],['ALMACÉN',35,-30,20,18]];
 for(const [name,x,z,w,d] of rooms){box(w,3.4,.25,mats[1],x,1.7,z-d/2,group);box(w,3.4,.25,mats[1],x,1.7,z+d/2,group);box(.25,3.4,d,mats[1],x-w/2,1.7,z,group);box(.25,3.4,d,mats[1],x+w/2,1.7,z,group);label(group,name,x,z);zombieZones.push(new THREE.Box3(new THREE.Vector3(x-w/2+1,0,z-d/2+1),new THREE.Vector3(x+w/2-1,3,z+d/2-1)))}
 box(4,3,174,mats[2],0,1.5,0,group);box(214,3,4,mats[2],0,1.5,0,group);
 return {group,cells,colliders,zombieZones};
}
