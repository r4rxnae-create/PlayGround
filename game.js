import * as THREE from 'three';
import { initAudio, setAudioEnabled, sfx, setRegionMusic } from './audio.js';

/* ============ FROZEN DHARMA: THE MYTHIC REAWAKENING (standalone web vertical slice) ============
   Third-person action RPG: 5 regions, 6 Dharma powers, quest chain, 4+1 bosses, NPCs, weather,
   day/night, skill tree, crafting-lite, NG+, touch support. All procedural, no external assets.
============================================================================================ */
const $ = id => document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const dist2d=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

// ---------- DATA ----------
const REGIONS = [
 {id:'frozen', name:'THE FROZEN VALLEY', sub:'Levels 1–50 • Where Time Froze', cx:0, cz:-300, r:210, fog:0x9fc8e8, ground:['#dfeefc','#9db8d6','#7d9bbf'], sky:'#87a8cc', music:'frozen'},
 {id:'sunken', name:'THE SUNKEN KINGDOM', sub:'Levels 51–100 • Drowned Temples', cx:-280, cz:40, r:200, fog:0x3a7a8a, ground:['#2a6a72','#1d4a55','#7ab8b0'], sky:'#4a9aa8', music:'sunken'},
 {id:'forest', name:'THE CELESTIAL FOREST', sub:'Levels 101–200 • Reality Dreams', cx:280, cz:60, r:200, fog:0x2a6a4a, ground:['#1d5a34','#2a7a44','#7ae08a'], sky:'#5ab87a', music:'forest'},
 {id:'ashen', name:'THE ASHEN EMPIRE', sub:'Levels 201–300 • War of Cinders', cx:0, cz:330, r:210, fog:0x5a2a1a, ground:['#3a1a12','#6a2a18','#ff6a2a'], sky:'#8a3a2a', music:'ashen'},
 {id:'sanctum', name:'THE FINAL SANCTUM', sub:'Mythic Realm • Heart of Dharma', cx:0, cz:0, r:130, fog:0x8a7ad8, ground:['#4a3a7a','#6a5aaa','#ffd97a'], sky:'#7a6ad8', music:'sanctum'},
];
const POWERS = [
 {id:'agni', icon:'🔥', name:'AGNI', desc:'Fireball + flame nova. Weak in rain.', unlock:1},
 {id:'vayu', icon:'🌪', name:'VAYU', desc:'Gale dash + vortex pull.', unlock:2},
 {id:'varuna', icon:'🌊', name:'VARUNA', desc:'Healing tide + water wave.', unlock:3},
 {id:'prithvi', icon:'🛡', name:'PRITHVI', desc:'Stone shield + quake.', unlock:4},
 {id:'akasha', icon:'⚡', name:'AKASHA', desc:'Cosmic beam. Buffed in storms.', unlock:6},
 {id:'kala', icon:'⏳', name:'KALA', desc:'Slow time 6s + burst.', unlock:8},
];
const WEAPONS = [
 {id:'khadga', name:'Solar Khadga', dmg:22, spd:1.0},
 {id:'blades', name:'Twin Chandra Blades', dmg:14, spd:1.6},
 {id:'spear', name:'Ganga Spear', dmg:30, spd:0.75, reach:4.2},
 {id:'bow', name:'Star Bow', dmg:26, spd:0.9, ranged:true},
];
const SKILLS = [
 {id:'hp1', n:'Vital Root', d:'+25 max HP', cost:1},{id:'st1', n:'Wind Lungs', d:'+25 stamina', cost:1},
 {id:'fuse', n:'Fusion Adept', d:'Fusion dmg +50%', cost:2},{id:'parry', n:'Mirror Guard', d:'Parry window +80ms', cost:2},
 {id:'agni2', n:'Inferno Heart', d:'Agni dmg +40%', cost:2},{id:'kala2', n:'Wheel Turner', d:'Kala lasts +3s', cost:3},
 {id:'exec', n:'Dharma Execution', d:'Execute below 25% HP', cost:2},{id:'greed', n:'Pilgrim Fate', d:'+30% XP', cost:1},
];
const CHAPTERS = [
 {t:'CHAPTER I — THE FROZEN VALLEY', o:'Speak to Sage Veyas at the shrine ◆'},
 {t:'CHAPTER II — TRIAL OF ICE', o:'Cleanse the Frostbound Seal (defeat the Guardian NW)'},
 {t:'CHAPTER III — SUNKEN TRUTH', o:'Travel SW. Speak to Diver-Queen Mira ◆'},
 {t:'CHAPTER IV — TRIAL OF TIDES', o:'Cleanse the Abyssal Seal (defeat Abyssal Maharaja)'},
 {t:'CHAPTER V — FOREST OF ILLUSIONS', o:'Travel E. Find hermit Aranya ◆'},
 {t:'CHAPTER VI — TRIAL OF ROOTS', o:'Cleanse the Verdant Seal (defeat the Forest Deity)'},
 {t:'CHAPTER VII — EMPIRE OF ASH', o:'Travel S. Meet Commander Raka ◆'},
 {t:'CHAPTER VIII — TRIAL OF CINDERS', o:'Cleanse the Cinder Seal (defeat the Ashen Emperor)'},
 {t:'CHAPTER IX — REAWAKENING', o:'Enter the Central Sanctum ◆. Face KALA-VIGRAHA, the Frozen God.'},
];

// ---------- STATE ----------
const S = {
 started:false, paused:false, dead:false, won:false, ngp:1,
 pos:new THREE.Vector3(0,0,-220), vel:new THREE.Vector3(), yaw:Math.PI, pitch:-0.32,
 hp:100, maxhp:100, st:100, maxst:100, xp:0, level:1, skillPts:0, gold:0,
 weapon:0, powIdx:0, unlockedPowers:['agni'], cds:[0,0,0,0,0,0], ult:100,
 chapter:0, seals:{frozen:false,sunken:false,forest:false,ashen:false},
 skills:{}, blocking:false, dodgeT:0, parryT:0, atkT:0, atkKind:0, combo:0, comboT:0,
 slowmo:0, shield:0, time:8.2, weather:'clear', wthT:0, kills:0, locked:null,
};
function save(){ try{ localStorage.setItem('frozen-dharma-save', JSON.stringify({level:S.level,xp:S.xp,chapter:S.chapter,seals:S.seals,skills:S.skills,unlockedPowers:S.unlockedPowers,gold:S.gold})); toast('Progress saved to this device'); }catch(e){} }
function load(){ try{ const d=JSON.parse(localStorage.getItem('frozen-dharma-save')); if(!d) return false; S.level=d.level;S.xp=d.xp;S.chapter=d.chapter;S.seals=d.seals;S.skills=d.skills||{};S.unlockedPowers=d.unlockedPowers||['agni']; applyLevel(false); return true; }catch(e){ return false; } }

// ---------- THREE SETUP ----------
let renderer, scene, camera, player, playerParts={}, swordMesh, capeMesh;
let hemi, sun, moonLight, fogCtl, waterMesh, groundMesh;
let enemies=[], npcs=[], props=[], projectiles=[], particles=[], pickups=[], shrines=[];
let questMarker=null, bossRef=null, dungeonPortal=null;
let camDist=7, camShake=0, quality='medium';
const keys={}; const clock=new THREE.Clock();
const minimap=$('minimap').getContext('2d');

function getRegionAt(x,z){
 let best=REGIONS[4], bd=1e9;
 for(const r of REGIONS){ const d=Math.hypot(x-r.cx,z-r.cz)-r.r; if(d<bd){bd=d;best=r;} }
 const inside = Math.hypot(x-best.cx,z-best.cz) < best.r;
 return {region:best, inside, edge:bd};
}
function terrainH(x,z){
 let h = Math.sin(x*0.02)*Math.cos(z*0.023)*3 + Math.sin(x*0.008+z*0.006)*6;
 const r=getRegionAt(x,z).region;
 if(r.id==='frozen') h += Math.max(0,( -z-150)/120)*10 + Math.sin(x*0.05)*1.2;
 if(r.id==='ashen') h += Math.max(0,(z-200)/120)*12;
 if(r.id==='sunken') h -= 4;
 if(r.id==='sanctum') h += 6*Math.exp(-(x*x+z*z)/12000);
 return h;
}
function groundColor(x,z){
 const {region}=getRegionAt(x,z);
 const cs=region.ground; const n=(Math.sin(x*0.11)+Math.cos(z*0.13)+Math.sin((x+z)*0.05))/3*0.5+0.5;
 const c1=new THREE.Color(cs[0]), c2=new THREE.Color(cs[1]);
 c1.lerp(c2, clamp(n,0,1));
 if(Math.random()<0.001) c1.set(cs[2]);
 if(region.id==='frozen' && terrainH(x,z)>6) c1.set('#f4faff');
 return c1;
}

function initThree(){
 renderer=new THREE.WebGLRenderer({canvas:$('game-canvas'), antialias:true});
 renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene(); scene.background=new THREE.Color('#87a8cc'); scene.fog=new THREE.Fog(0x9fc8e8, 30, 220);
 camera=new THREE.PerspectiveCamera(58, innerWidth/innerHeight, 0.1, 1200);
 hemi=new THREE.HemisphereLight(0xbfd8ff,0x3a2a1a,0.9); scene.add(hemi);
 sun=new THREE.DirectionalLight(0xfff2d8,1.6); sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;sun.shadow.camera.far=400;
 scene.add(sun); scene.add(sun.target);
 moonLight=new THREE.DirectionalLight(0x6a7aff,0.0); scene.add(moonLight);
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 applyQuality();
}

function applyQuality(){
 quality=$('sel-quality')?.value||'medium';
 const q={low:{px:0.7,sh:512,props:0.4,fog:150},medium:{px:1,sh:1024,props:0.7,fog:220},high:{px:1.25,sh:2048,props:1,fog:280},ultra:{px:1.6,sh:2048,props:1.3,fog:340},cinematic:{px:2,sh:4096,props:1.5,fog:420}}[quality];
 renderer.setPixelRatio(Math.min(devicePixelRatio,q.px));
 sun.shadow.mapSize.set(q.sh,q.sh); if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
 scene.fog.far=q.fog;
}

function buildWorld(){
 // Ground
 const size=950, seg=110;
 const g=new THREE.PlaneGeometry(size,size,seg,seg); g.rotateX(-Math.PI/2);
 const pos=g.attributes.position, col=[];
 for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); pos.setY(i,terrainH(x,z)); const c=groundColor(x,z); col.push(c.r,c.g,c.b); }
 g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals();
 groundMesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.95,metalness:0.02}));
 groundMesh.receiveShadow=true; scene.add(groundMesh);
 // Water (sunken)
 const w=new THREE.Mesh(new THREE.PlaneGeometry(420,420), new THREE.MeshStandardMaterial({color:0x1a8a9a,transparent:true,opacity:0.72,roughness:0.15,metalness:0.5}));
 w.rotation.x=-Math.PI/2; w.position.set(-280,terrainH(-280,40)+0.4,40); waterMesh=w; scene.add(w);
 // Props per region
 const mult={low:0.4,medium:0.7,high:1,ultra:1.3,cinematic:1.5}[quality]||0.7;
 scatterProps(mult);
 buildTemples(); buildNPCs(); buildPickups(); buildQuestActors();
 // Quest marker
 questMarker=new THREE.Mesh(new THREE.OctahedronGeometry(1.2), new THREE.MeshBasicMaterial({color:0xffd34d}));
 scene.add(questMarker);
 // Dungeon portal (central sanctum, locked until 4 seals)
 dungeonPortal=new THREE.Mesh(new THREE.TorusGeometry(5,0.7,12,40), new THREE.MeshStandardMaterial({color:0x8a6aff,emissive:0x4a2aaa,emissiveIntensity:1.2}));
 dungeonPortal.position.set(0,terrainH(0,0)+6,0); scene.add(dungeonPortal);
}

function addProp(mesh,x,z,ry=0){ mesh.position.set(x,terrainH(x,z),z); mesh.rotation.y=ry; mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh); props.push(mesh); return mesh; }
function scatterProps(mult){
 const treeG=new THREE.ConeGeometry(2.2,7,6), rockG=new THREE.DodecahedronGeometry(1.6);
 for(let i=0;i<Math.floor(420*mult);i++){
  const x=rand(-450,450), z=rand(-450,450); const {region,inside}=getRegionAt(x,z); if(!inside) continue;
  if(Math.hypot(x-S.pos.x,z-S.pos.z)<12) continue;
  let m;
  if(region.id==='frozen'){ m=new THREE.Mesh(treeG,new THREE.MeshStandardMaterial({color:Math.random()<0.3?'#5a7a8a':'#e8f2fa',roughness:0.9})); if(Math.random()<0.3) m.material.color.set('#3a5a6a'); }
  else if(region.id==='forest'){ const h=rand(6,16); m=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.9,h,6),new THREE.MeshStandardMaterial({color:'#3a2a1a'})); const top=new THREE.Mesh(new THREE.SphereGeometry(rand(2.5,4.5),7,6),new THREE.MeshStandardMaterial({color:Math.random()<0.3?'#7ae08a':'#1d8a44',emissive:Math.random()<0.25?0x1a5a2a:0x000000,emissiveIntensity:0.8})); top.position.y=h/2+2; top.castShadow=true; m.add(top); if(Math.random()<0.2){const fl=new THREE.Mesh(new THREE.SphereGeometry(0.4),new THREE.MeshBasicMaterial({color:0xaef2ff})); fl.position.set(rand(-3,3),rand(2,8),rand(-3,3)); m.add(fl);} }
  else if(region.id==='ashen'){ m=new THREE.Mesh(rockG,new THREE.MeshStandardMaterial({color:Math.random()<0.4?'#1a0a06':'#5a1a0a',emissive:Math.random()<0.25?0xff3a00:0x000000,emissiveIntensity:0.7,roughness:1})); }
  else if(region.id==='sunken'){ m=new THREE.Mesh(new THREE.BoxGeometry(rand(1,3),rand(2,7),rand(1,3)),new THREE.MeshStandardMaterial({color:'#4a7a82',roughness:0.7})); }
  else { m=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.9,rand(4,9),6),new THREE.MeshStandardMaterial({color:'#8a7aaa',emissive:0x2a1aaa,emissiveIntensity:0.25})); }
  m.scale.setScalar(rand(0.7,1.6));
  addProp(m,x,z,rand(0,6.28));
  if(props.length>900) break;
 }
 // Statues / pillars landmarks
 for(const r of REGIONS){
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const x=r.cx+Math.cos(a)*r.r*0.55, z=r.cz+Math.sin(a)*r.r*0.55;
   const p=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.8,10,6),new THREE.MeshStandardMaterial({color:r.id==='frozen'?'#b8d0e8':r.id==='ashen'?'#2a0f08':r.id==='forest'?'#4a6a4a':'#6a8a92',roughness:0.85}));
   addProp(p,x,z,a);
  }
 }
}

// Temples / seals / shrines
let seals={};
function buildTemples(){
 const defs=[
  {id:'frozen', x:0,z:-360, boss:'FROSTBOUND GUARDIAN'},
  {id:'sunken', x:-330,z:80, boss:'ABYSSAL MAHARAJA'},
  {id:'forest', x:330,z:100, boss:'FOREST DEITY'},
  {id:'ashen', x:0,z:390, boss:'ASHEN EMPEROR'},
 ];
 for(const d of defs){
  const grp=new THREE.Group(); const y=terrainH(d.x,d.z);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(14,16,3,8),new THREE.MeshStandardMaterial({color:0x6a6a7a,roughness:0.8}));
  base.position.y=1.5; base.receiveShadow=true; grp.add(base);
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const pil=new THREE.Mesh(new THREE.CylinderGeometry(1,1.3,12,6),new THREE.MeshStandardMaterial({color:0x9a8a6a})); pil.position.set(Math.cos(a)*10,7,Math.sin(a)*10); pil.castShadow=true; grp.add(pil); }
  const seal=new THREE.Mesh(new THREE.OctahedronGeometry(2.2),new THREE.MeshStandardMaterial({color:0x66d8ff,emissive:0x2288ff,emissiveIntensity:2}));
  seal.position.y=6; grp.add(seal);
  grp.position.set(d.x,y,d.z); scene.add(grp);
  seals[d.id]={group:grp,seal,pos:new THREE.Vector3(d.x,y,d.z),boss:d.boss,done:false};
  const sh=new THREE.Mesh(new THREE.BoxGeometry(2,3,1),new THREE.MeshStandardMaterial({color:0xe8a020,emissive:0x6a3a00,emissiveIntensity:0.6}));
  const sx=d.x+rand(-25,25), sz=d.z+rand(18,30); sh.position.set(sx,terrainH(sx,sz)+1.5,sz); scene.add(sh); shrines.push(sh);
 }
}

// ---------- PLAYER ----------
function buildPlayer(){
 player=new THREE.Group();
 const skin=new THREE.Color($('c-skin').value), cloth=new THREE.Color($('c-cloth').value), trim=new THREE.Color($('c-trim').value), hairC=new THREE.Color($('c-hair').value);
 const build=($('c-build').value/100)||1;
 const matS=new THREE.MeshStandardMaterial({color:skin,roughness:0.6});
 const matC=new THREE.MeshStandardMaterial({color:cloth,roughness:0.8});
 const matT=new THREE.MeshStandardMaterial({color:trim,roughness:0.4,metalness:0.6});
 const matH=new THREE.MeshStandardMaterial({color:hairC,roughness:0.95});
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.42*build,0.75,4,10),matC); torso.position.y=1.35; torso.castShadow=true; player.add(torso); playerParts.torso=torso;
 const head=new THREE.Mesh(new THREE.SphereGeometry(0.30,14,12),matS); head.position.y=2.25; head.castShadow=true; player.add(head); playerParts.head=head;
 const hair=new THREE.Mesh(new THREE.SphereGeometry(0.32,10,8,0,Math.PI*2,0,1.5),matH); hair.position.y=2.32; player.add(hair);
 const circlet=new THREE.Mesh(new THREE.TorusGeometry(0.30,0.045,8,18),matT); circlet.rotation.x=Math.PI/2; circlet.position.y=2.38; player.add(circlet);
 const mkArm=(s)=>{ const a=new THREE.Mesh(new THREE.CapsuleGeometry(0.13,0.6,3,8),matS); a.position.set(0.55*s,1.45,0); a.castShadow=true; player.add(a); return a; };
 playerParts.armL=mkArm(-1); playerParts.armR=mkArm(1);
 const mkLeg=(s)=>{ const l=new THREE.Mesh(new THREE.CapsuleGeometry(0.16,0.65,3,8),new THREE.MeshStandardMaterial({color:cloth.clone().multiplyScalar(0.6)})); l.position.set(0.22*s,0.55,0); l.castShadow=true; player.add(l); return l; };
 playerParts.legL=mkLeg(-1); playerParts.legR=mkLeg(1);
 swordMesh=new THREE.Group();
 const blade=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.5,0.18),new THREE.MeshStandardMaterial({color:0xcfe6ff,metalness:0.9,roughness:0.2,emissive:0x2a5aaa,emissiveIntensity:0.4}));
 blade.position.y=0.9; swordMesh.add(blade);
 const hilt=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.4,6),matT); swordMesh.add(hilt);
 swordMesh.position.set(0.62,1.2,0.3); player.add(swordMesh);
 capeMesh=new THREE.Mesh(new THREE.PlaneGeometry(0.85,1.3,4,4),new THREE.MeshStandardMaterial({color:trim,side:THREE.DoubleSide,roughness:0.9}));
 capeMesh.position.set(0,1.85,-0.42); capeMesh.rotation.x=0.25; player.add(capeMesh);
 // glow for Kala / shield bubble
 playerParts.aura=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,10),new THREE.MeshBasicMaterial({color:0x66d8ff,transparent:true,opacity:0}));
 playerParts.aura.position.y=1.3; player.add(playerParts.aura);
 player.position.copy(S.pos); scene.add(player);
}
function rebuildPlayerColors(){ if(!player) return; scene.remove(player); buildPlayer(); }

// ---------- ENEMIES / NPCs ----------
function spawnEnemy(kind,x,z,lvl){
 const g=new THREE.Group();
 const cfg={scout:{hp:50,dmg:6,spd:4.2,col:0x8a9aaa,s:1}, brute:{hp:140,dmg:12,spd:3,col:0xaa4a3a,s:1.5}, archer:{hp:60,dmg:7,spd:3.6,col:0x4a8a6a,s:1}, wraith:{hp:90,dmg:9,spd:5,col:0x6a5ad8,s:1.1}}[kind];
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.4*cfg.s,0.8*cfg.s,3,8),new THREE.MeshStandardMaterial({color:cfg.col,roughness:0.8}));
 body.position.y=1.1*cfg.s; body.castShadow=true; g.add(body);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,8),new THREE.MeshBasicMaterial({color:0xff2a2a})); eye.position.set(0,1.6*cfg.s,0.32*cfg.s); g.add(eye);
 const wp=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.2,0.1),new THREE.MeshStandardMaterial({color:0x222222})); wp.position.set(0.5,1.2,0); g.add(wp);
 g.position.set(x,terrainH(x,z),z); scene.add(g);
 const e={mesh:g,kind,hp:cfg.hp*(1+lvl*0.12)*S.ngp,maxhp:cfg.hp*(1+lvl*0.12)*S.ngp,dmg:cfg.dmg*S.ngp,spd:cfg.spd,lvl,atkT:rand(0,1),state:'chase',hpbar:null,isBoss:false};
 enemies.push(e); return e;
}
function spawnBoss(regionId){
 const def={frozen:{n:'FROSTBOUND GUARDIAN',col:0x9ad8ff,s:3.2,hp:900,dmg:26},sunken:{n:'ABYSSAL MAHARAJA',col:0x2a9aaa,s:3.0,hp:1300,dmg:32},forest:{n:'FOREST DEITY',col:0x3ad86a,s:3.4,hp:1700,dmg:38},ashen:{n:'ASHEN EMPEROR',col:0xff5a1a,s:3.6,hp:2200,dmg:46},sanctum:{n:'KALA-VIGRAHA, THE FROZEN GOD',col:0xaa6aff,s:4.5,hp:3200,dmg:60}}[regionId];
 const sd=seals[regionId]; const x=sd?sd.pos.x:0, z=sd?(sd.pos.z+14):20;
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.7*def.s,1.2*def.s,4,10),new THREE.MeshStandardMaterial({color:def.col,roughness:0.5,emissive:def.col,emissiveIntensity:0.15}));
 body.position.y=1.8*def.s/2+0.6; body.castShadow=true; g.add(body);
 for(let i=0;i<4;i++){ const horn=new THREE.Mesh(new THREE.ConeGeometry(0.3,1.6,5),new THREE.MeshStandardMaterial({color:0x1a1a2a})); horn.position.set(Math.cos(i*1.57)*1.1*def.s,3.4*def.s/2+1.2,Math.sin(i*1.57)*1.1*def.s); g.add(horn); }
 const crown=new THREE.Mesh(new THREE.TorusGeometry(1.1*def.s,0.18,8,20),new THREE.MeshStandardMaterial({color:0xe8a020,metalness:0.9,roughness:0.3}));
 crown.position.y=3.1*def.s/2+1.2; crown.rotation.x=Math.PI/2; g.add(crown);
 g.position.set(x,terrainH(x,z),z); scene.add(g);
 const b={mesh:g,kind:'boss',name:def.n,hp:def.hp*S.ngp,maxhp:def.hp*S.ngp,dmg:def.dmg*S.ngp,spd:3.2,lvl:10+S.chapter*3,atkT:0,state:'chase',isBoss:true,region:regionId,phase:1};
 enemies.push(b); bossRef=b;
 $('boss-bar').classList.remove('hidden'); $('boss-name').textContent=def.n;
 sfx('boss'); cinematic(`⚠ ${def.n} ⚠`, 'The air freezes. Dharma itself holds its breath.', 2.6);
 return b;
}
function populateRegionEnemies(){
 // clear far ones
 for(const e of enemies){ if(!e.isBoss){scene.remove(e.mesh);} }
 enemies=enemies.filter(e=>e.isBoss);
 const {region}=getRegionAt(S.pos.x,S.pos.z);
 const count={low:4,medium:7,high:10,ultra:13,cinematic:15}[quality]||7;
 for(let i=0;i<count;i++){
  const a=rand(0,Math.PI*2), d=rand(45,120);
  const x=S.pos.x+Math.cos(a)*d, z=S.pos.z+Math.sin(a)*d;
  if(Math.abs(x)>450||Math.abs(z)>450) continue;
  const kinds=['scout','brute','archer','wraith'];
  const k=kinds[Math.floor(Math.random()*kinds.length)];
  const lvl=S.level+Math.floor(rand(-1,3))+(region.id==='sanctum'?5:0);
  spawnEnemy(k,x,z,Math.max(1,lvl));
 }
}
function buildNPCs(){
 const defs=[
  {n:'Sage Veyas', x:6,z:-208, c:'Chapter I guide', region:'frozen'},
  {n:'Diver-Queen Mira', x:-266,z:52, c:'Sunken royalty', region:'sunken'},
  {n:'Hermit Aranya', x:266,z:72, c:'Forest keeper', region:'forest'},
  {n:'Commander Raka', x:10,z:318, c:'Ashen veteran', region:'ashen'},
  {n:'Merchant Yara', x:-8,z:-190, c:'Sells charms', region:'frozen'},
 ];
 for(const d of defs){
  const g=new THREE.Group();
  const b=new THREE.Mesh(new THREE.CapsuleGeometry(0.38,0.8,3,8),new THREE.MeshStandardMaterial({color:0xd8b878,roughness:0.8})); b.position.y=1.1; b.castShadow=true; g.add(b);
  const h=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,8),new THREE.MeshStandardMaterial({color:0xc98d64})); h.position.y=2.1; g.add(h);
  g.position.set(d.x,terrainH(d.x,d.z),d.z); scene.add(g);
  // marker ring
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.9,1.2,20),new THREE.MeshBasicMaterial({color:0xffd34d,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.y=0.15; g.add(ring);
  npcs.push({...d,mesh:g,ring});
 }
}
function buildPickups(){
 for(let i=0;i<40;i++){
  const x=rand(-420,420),z=rand(-420,420); const {inside}=getRegionAt(x,z); if(!inside) continue;
  const type=Math.random()<0.4?'heal':Math.random()<0.6?'xp':'gold';
  const m=new THREE.Mesh(type==='heal'?new THREE.SphereGeometry(0.5):new THREE.OctahedronGeometry(0.55), new THREE.MeshStandardMaterial({color:type==='heal'?0xff5a6a:type==='xp'?0x6ad8ff:0xffd34d,emissive:type==='heal'?0xaa1122:type==='xp'?0x2266aa:0xaa6a00,emissiveIntensity:1}));
  m.position.set(x,terrainH(x,z)+1,z); scene.add(m); pickups.push({mesh:m,type});
 }
}
function buildQuestActors(){ /* shrines already; nothing extra */ }

// ---------- INPUT ----------
function bindInput(){
 addEventListener('keydown',e=>{ keys[e.code]=true;
  if(e.code==='KeyT') toggleSkills();
  if(e.code==='Escape'){ if(!$('skill-screen').classList.contains('hidden')) toggleSkills(); else togglePause(); }
  if(e.code==='Digit1')S.weapon=0; if(e.code==='Digit2')S.weapon=1; if(e.code==='Digit3')S.weapon=2; if(e.code==='Digit4')S.weapon=3;
  if(e.code==='KeyQ'){S.powIdx=(S.powIdx+POWERS.length-1)%POWERS.length; refreshPowers();}
  if(e.code==='KeyE'&&!dialogueOpen){ // context: cast if no interact, else interact
    if(nearInteract()) doInteract(); else castPower();
  } else if(e.code==='KeyE'&&dialogueOpen){ advanceDialogue(); }
  if(e.code==='KeyF') castPower();
  if(e.code==='KeyR') ultimate();
  if(e.code==='KeyJ') attack(false);
  if(e.code==='KeyK') attack(true);
  if(e.code==='KeyL') bowShot();
  if(e.code==='KeyH') S.blocking=true;
 });
 addEventListener('keyup',e=>{ keys[e.code]=false; if(e.code==='KeyH') S.blocking=false; });
 // mouse orbit
 let drag=false,lx=0,ly=0;
 const cv=$('game-canvas');
 cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;});
 addEventListener('pointermove',e=>{ if(!drag) return; S.yaw-=(e.clientX-lx)*0.005; S.pitch=clamp(S.pitch-(e.clientY-ly)*0.004,-1.1,0.5); lx=e.clientX;ly=e.clientY; });
 addEventListener('pointerup',()=>drag=false);
 cv.addEventListener('wheel',e=>{camDist=clamp(camDist+e.deltaY*0.01,3.5,14);});
 bindTouch();
}
function bindTouch(){
 const isT='ontouchstart' in window;
 if(isT) $('touch').classList.remove('hidden');
 const stick=$('stick'), knob=$('knob'); let sid=null, sx=0, sy=0; window.touchMove={x:0,y:0};
 stick.addEventListener('touchstart',e=>{const t=e.changedTouches[0];sid=t.identifier;sx=t.clientX;sy=t.clientY;},{passive:true});
 addEventListener('touchmove',e=>{ for(const t of e.changedTouches){ if(t.identifier===sid){ const dx=t.clientX-sx, dy=t.clientY-sy; const m=Math.min(50,Math.hypot(dx,dy)); const a=Math.atan2(dy,dx); knob.style.left=(35+Math.cos(a)*m)+'px'; knob.style.top=(35+Math.sin(a)*m)+'px'; window.touchMove.x=Math.cos(a)*(m/50); window.touchMove.y=Math.sin(a)*(m/50); } } },{passive:true});
 addEventListener('touchend',e=>{ for(const t of e.changedTouches){ if(t.identifier===sid){sid=null;knob.style.left='35px';knob.style.top='35px';window.touchMove.x=0;window.touchMove.y=0;}} });
 // camera drag on canvas second finger
 let lastX=0,lastY=0,camId=null;
 $('game-canvas').addEventListener('touchstart',e=>{ if(e.touches.length===2){camId=e.touches[1].identifier;lastX=e.touches[1].clientX;lastY=e.touches[1].clientY;} },{passive:true});
 $('game-canvas').addEventListener('touchmove',e=>{ for(const t of e.touches){ if(t.identifier===camId){ S.yaw-=(t.clientX-lastX)*0.008; S.pitch=clamp(S.pitch-(t.clientY-lastY)*0.006,-1.1,0.5); lastX=t.clientX;lastY=t.clientY; } } },{passive:true});
 document.querySelectorAll('#touch-btns button').forEach(b=>b.addEventListener('touchstart',e=>{e.preventDefault();touchAction(b.dataset.a);},{passive:false}));
}
function touchAction(a){ if(a==='light')attack(false); else if(a==='heavy')attack(true); else if(a==='bow')bowShot(); else if(a==='dodge')dodge(); else if(a==='block'){S.blocking=true;setTimeout(()=>S.blocking=false,400);} else if(a==='cast')castPower(); else if(a==='ult')ultimate(); else if(a==='jump')jump(); else if(a==='interact'){ if(dialogueOpen) advanceDialogue(); else if(nearInteract()) doInteract(); } }

// ---------- COMBAT ----------
function attack(heavy){
 if(!S.started||S.paused||S.dead) return; if(S.atkT>0.25) return;
 if(S.st<(heavy?18:8)) { toast('Exhausted… stamina low'); return; }
 S.st-=heavy?18:8; S.atkT=0; S.atkKind=heavy?1:0;
 S.combo++; S.comboT=1.6; updateCombo();
 sfx(heavy?'heavy':'hit');
 const w=WEAPONS[S.weapon]; const reach=w.reach||3.4;
 const dmg=(heavy?w.dmg*1.9:w.dmg)*(1+S.level*0.08)*(S.skills.fuse&&fusionBuf?1.5:1);
 let hitAny=false;
 for(const e of enemies){ if(e.hp<=0) continue;
  const d=dist2d(S.pos,e.mesh.position); if(d>reach+e.mesh.scale.x+1.2) continue;
  const ang=Math.atan2(e.mesh.position.x-S.pos.x,e.mesh.position.z-S.pos.z);
  let da=Math.abs(((ang-S.yawFace)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI); if(da>1.2) continue;
  damageEnemy(e,dmg,heavy?'HEAVY':'HIT'); hitAny=true;
  // knockback
  const k=heavy?3:1.2; e.mesh.position.x+=Math.sin(S.yawFace)*k*0.4; e.mesh.position.z+=Math.cos(S.yawFace)*k*0.4;
  // execution
  const execHP=(S.skills.exec?0.25:0.12)*e.maxhp;
  if(e.hp<=execHP&&e.hp>0){ execution(e); }
 }
 // swing anim
 S.swingT=0.35;
 if(!hitAny){ /* whiff */ }
 if(S.st<0)S.st=0;
}
let fusionBuf=null;
function bowShot(){
 if(S.st<10) return; S.st-=10; sfx('bow');
 const dir=new THREE.Vector3(Math.sin(S.yawFace),0.05,Math.cos(S.yawFace));
 const m=new THREE.Mesh(new THREE.SphereGeometry(0.16),new THREE.MeshBasicMaterial({color:0xaee2ff}));
 m.position.copy(S.pos).add(new THREE.Vector3(0,1.6,0)); scene.add(m);
 projectiles.push({mesh:m,vel:dir.multiplyScalar(45),dmg:WEAPONS[3].dmg*(1+S.level*0.08),foe:false,life:2});
}
function dodge(){
 if(S.st<12||S.dodgeT>0) return; S.st-=12; S.dodgeT=0.45; S.parryT=0; sfx('dodge');
 const b=new THREE.Vector3(Math.sin(S.yawFace),0,Math.cos(S.yawFace));
 S.pos.addScaledVector(b,-4); // quick step (i-frame)
 burst(S.pos,0xffffff,8);
}
function jump(){ if(S.grounded){ S.vy=8; S.grounded=false; } }
function damageEnemy(e,dmg,label){
 const weatherMod=(S.weather==='rain'&&fusionBuf==='fire')?0.6:1;
 dmg*=weatherMod;
 const crit=Math.random()<0.12; if(crit)dmg*=1.8;
 e.hp-=dmg; S.ult=clamp(S.ult+dmg*0.12,0,100);
 floater(e.mesh.position,(crit?'CRIT ':'')+Math.round(dmg)+(label?' '+label:''),crit?'#ffd34d':'#ffffff');
 burst(e.mesh.position,0xffaa55,6);
 updateBossBar();
 if(e.hp<=0){ killEnemy(e); }
}
function killEnemy(e){
 e.hp=0; sfx('die'); S.kills++;
 burst(e.mesh.position,0xff4444,18);
 const gain=Math.round((20+e.lvl*8)*(S.skills.greed?1.3:1));
 gainXP(gain); S.gold+=Math.round(rand(3,12));
 floater(e.mesh.position,'+'+gain+' XP','#6ad8ff');
 scene.remove(e.mesh);
 if(e.isBoss) onBossDown(e);
}
function execution(e){
 cinematic('DHARMA EXECUTION','',1.2,true);
 S.slowmo=1.2; sfx('ult');
 e.hp=0; killEnemy(e);
}
function gainXP(n){ S.xp+=n; let need=S.level*100; while(S.xp>=need){S.xp-=need;S.level++;S.skillPts++;S.maxhp+=8;S.hp=S.maxhp;S.maxst+=4;need=S.level*100;toast(`✦ Level ${S.level} — Dharma deepens (+skill point)`);sfx('quest');checkPowerUnlocks();} }
function checkPowerUnlocks(){ for(const p of POWERS){ if(!S.unlockedPowers.includes(p.id)&&S.level>=p.unlock){S.unlockedPowers.push(p.id);toast(`✦ Dharma Resonance unlocked: ${p.name} ${p.icon}`);sfx('quest');refreshPowers();} } }
function castPower(){
 const p=POWERS[S.powIdx]; if(!S.unlockedPowers.includes(p.id)){toast('Resonance not yet awakened (level '+p.unlock+')');return;}
 if(S.cds[S.powIdx]>0){toast('Resonance recharging…');return;}
 if(S.st<20){toast('Not enough stamina');return;}
 S.st-=20; S.cds[S.powIdx]=p.id==='kala'?22:8; sfx('fire');
 const P=S.pos.clone(); P.y+=1.6;
 if(p.id==='agni'){ fireball(P); }
 else if(p.id==='vayu'){ S.dodgeT=0.5; burst(P,0xaef2ff,20); for(const e of enemies){ if(dist2d(S.pos,e.mesh.position)<10){ e.mesh.position.lerp(S.pos,-0.15); damageEnemy(e,25*S.ngp,'GALE'); } } }
 else if(p.id==='varuna'){ S.hp=clamp(S.hp+40,0,S.maxhp); sfx('heal'); burst(P,0x4ad8ff,24); ringFX(0x4ad8ff); }
 else if(p.id==='prithvi'){ S.shield=30; burst(P,0x9a7a4a,20); toast('🛡 Stone skin absorbs damage'); }
 else if(p.id==='akasha'){ beam(P); }
 else if(p.id==='kala'){ S.slowmo=(S.skills.kala2?9:6); toast('⏳ KALA — time bows to you'); ringFX(0xaa6aff); }
 // fusions
 detectFusion(p.id);
}
let lastCast=null,lastCastT=0;
function detectFusion(id){
 const now=performance.now()/1000;
 if(lastCast&&now-lastCastT<4&&lastCast!==id){
  const pair=[lastCast,id].sort().join('+');
  const fusions={'agni+vayu':'FIRE VORTEX — burning cyclone!','agni+prithvi':'VOLCANIC STRIKE!','akasha+varuna':'CELESTIAL STORM!'};
  // normalize keys
  const key2=[lastCast,id].sort().join('+');
  let label=null;
  if((lastCast==='agni'&&id==='vayu')||(lastCast==='vayu'&&id==='agni')) label='FIRE VORTEX — burning cyclone!';
  if((lastCast==='agni'&&id==='prithvi')||(lastCast==='prithvi'&&id==='agni')) label='VOLCANIC STRIKE!';
  if((lastCast==='akasha'&&id==='varuna')||(lastCast==='varuna'&&id==='akasha')) label='CELESTIAL STORM!';
  if(label){ fusionBuf='fire'; toast('☯ '+label); sfx('ult'); S.slowmo=Math.max(S.slowmo,0.8);
   for(const e of enemies){ if(dist2d(S.pos,e.mesh.position)<16) damageEnemy(e,(S.skills.fuse?120:80)*(1+S.level*0.05),'FUSION'); }
   burst(S.pos,0xff7a2a,40); setTimeout(()=>fusionBuf=null,5000);
  }
 }
 lastCast=id; lastCastT=now;
}
function fireball(P){
 const dir=new THREE.Vector3(Math.sin(S.yawFace),0.05,Math.cos(S.yawFace));
 const m=new THREE.Mesh(new THREE.SphereGeometry(0.45),new THREE.MeshBasicMaterial({color:0xff7a2a})); m.position.copy(P); scene.add(m);
 const light=new THREE.PointLight(0xff6a1a,3,18); m.add(light);
 projectiles.push({mesh:m,vel:dir.multiplyScalar(32),dmg:(S.skills.agni2?60:42)*(1+S.level*0.06),foe:false,life:3,fire:true,trail:0});
}
function beam(P){
 const dir=new THREE.Vector3(Math.sin(S.yawFace),0,Math.cos(S.yawFace));
 const len=30; const geo=new THREE.CylinderGeometry(0.5,0.5,len,8); geo.rotateX(Math.PI/2);
 const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xaaeeff,transparent:true,opacity:0.85}));
 m.position.copy(P).addScaledVector(dir,len/2); m.lookAt(m.position.clone().add(dir)); scene.add(m);
 setTimeout(()=>scene.remove(m),350);
 const mult=(S.weather==='storm'?1.6:1);
 for(const e of enemies){ const d=dist2d(S.pos,e.mesh.position); if(d<len){ const ang=Math.atan2(e.mesh.position.x-S.pos.x,e.mesh.position.z-S.pos.z); let da=Math.abs(((ang-S.yawFace)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI); if(da<0.35) damageEnemy(e,70*mult*(1+S.level*0.05),'AKASHA'); } }
 burst(P,0xaaeeff,20);
}
function ultimate(){
 if(S.ult<100){toast('Ultimate not ready ('+Math.round(S.ult)+'%)');return;}
 S.ult=0; sfx('ult'); cinematic('☀ CHAKRA UNLEASHED ☀','Dharma burns through you.',1.6,true);
 ringFX(0xffd34d);
 for(const e of enemies){ if(dist2d(S.pos,e.mesh.position)<25) damageEnemy(e,160*(1+S.level*0.05),'ULT'); }
 burst(S.pos,0xffd34d,60);
}
function updateBossBar(){ if(bossRef&&bossRef.hp>0){ $('boss-fill').style.width=(100*bossRef.hp/bossRef.maxhp)+'%'; } }
function onBossDown(b){
 $('boss-bar').classList.add('hidden');
 const r=b.region;
 if(r&&seals[r]){ seals[r].done=true; seals[r].seal.material.color.set(0x3a5a3a); seals[r].seal.material.emissive.set(0x111111); S.seals[r]=true; S.chapter=Math.min(S.chapter+1,CHAPTERS.length-1); gainXP(300); S.gold+=200; toast('✔ Seal cleansed — '+b.name+' falls. ('+Object.values(S.seals).filter(Boolean).length+'/4)'); sfx('quest'); updateObjective(); checkPowerUnlocks();
  if(Object.values(S.seals).every(Boolean)){ S.chapter=8; updateObjective(); toast('☸ All seals cleansed! The Central Sanctum is OPEN — face the Frozen God.'); cinematic('THE SANCTUM OPENS','Four flames become one.',3); dungeonPortal.material.emissiveIntensity=3; }
 }
 if(r==='sanctum'){ victory(); }
 bossRef=null;
}

// ---------- FX ----------
function burst(p,color,n=10){
 for(let i=0;i<n;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(rand(0.06,0.22)),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1})); m.position.set(p.x+rand(-1,1),p.y+rand(0,2),p.z+rand(-1,1)); scene.add(m); particles.push({mesh:m,vel:new THREE.Vector3(rand(-6,6),rand(2,9),rand(-6,6)),life:rand(0.4,0.9)}); }
}
function ringFX(color){
 const m=new THREE.Mesh(new THREE.TorusGeometry(3,0.25,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.9})); m.position.copy(S.pos); m.position.y+=1; m.rotation.x=Math.PI/2; scene.add(m); particles.push({mesh:m,vel:new THREE.Vector3(),life:0.8,ring:true});
}
function floater(pos,text,color='#fff'){
 const d=document.createElement('div'); d.className='floater'; d.textContent=text; d.style.color=color;
 d.style.left=(innerWidth/2+rand(-60,60))+'px'; d.style.top=(innerHeight/2+rand(-80,20))+'px';
 $('floaters').appendChild(d); requestAnimationFrame(()=>{d.style.transform='translateY(-70px)';d.style.opacity='0';}); setTimeout(()=>d.remove(),1050);
}
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add('hidden'),2600); }
let cineH=null;
function cinematic(title,sub,dur=2.5,mini=false){
 if(mini){ /* small */ }
 document.body.classList.add('cine'); $('subtitle').textContent=title+(sub?' — '+sub:'');
 clearTimeout(cineH); cineH=setTimeout(()=>{document.body.classList.remove('cine');$('subtitle').textContent='';},dur*1000);
 showRegionBanner(title,sub);
}
function showRegionBanner(n,s){ $('region-name').textContent=n; $('region-sub').textContent=s||''; $('region-banner').classList.add('show'); clearTimeout(showRegionBanner._h); showRegionBanner._h=setTimeout(()=>$('region-banner').classList.remove('show'),2800); }

// ---------- QUESTS / DIALOGUE ----------
let dialogueOpen=false, dlgQueue=[], dlgName='';
const DLG={
 veyas:[['Sage Veyas','Traveler. The valley did not freeze — time itself was wounded. The Frostbound Guardian keeps the first seal.'],['Sage Veyas','Take AGNI. Dodge at the last breath to bend time. Strike the seal-temple NW. I will keep a shrine fire for you.']],
 mira:[['Diver-Queen Mira','Our palaces drowned when the Dharma froze. My Maharaja — beloved, corrupted — guards the Abyssal seal.'],['Diver-Queen Mira','VARUNA answers the pure. Cleanse him, and the tides will remember your name.']],
 aranya:[['Hermit Aranya','The forest dreams, and its dream has teeth. The Deity wears a thousand faces.'],['Hermit Aranya','Move like VAYU. Do not trust the floating lights — trust your feet.']],
 raka:[['Commander Raka','We burned our own empire to stop the frost. It was not enough. My Emperor sits the cinder throne still.'],['Commander Raka','PRITHVI endures where flame fails. End him. Then end this.']],
 yara:[['Merchant Yara','Charms, relics, warm tea! 50 gold heals all wounds. (Interact again to buy)']],
};
function nearInteract(){
 // NPC, shrine, seal portal, pickup handled by proximity separately
 for(const n of npcs){ if(dist2d(S.pos,n.mesh.position)<4) return {type:'npc',ref:n}; }
 for(const s of shrines){ if(dist2d(S.pos,s.position)<3.5) return {type:'shrine',ref:s}; }
 for(const id of Object.keys(seals)){ const sl=seals[id]; if(dist2d(S.pos,sl.pos)<8) return {type:'seal',ref:id}; }
 if(dist2d(S.pos,dungeonPortal.position)<7) return {type:'sanctum'};
 return null;
}
function doInteract(){
 const it=nearInteract(); if(!it) return;
 if(dialogueOpen){advanceDialogue();return;}
 if(it.type==='npc'){
  const key={ 'Sage Veyas':'veyas','Diver-Queen Mira':'mira','Hermit Aranya':'aranya','Commander Raka':'raka','Merchant Yara':'yara' }[it.ref.n];
  startDialogue(DLG[key]||[[it.ref.n,'The wheel turns.']]);
  if(it.ref.n==='Sage Veyas'&&S.chapter===0){ S.chapter=1; updateObjective(); }
  if(it.ref.n==='Diver-Queen Mira'&&S.chapter<=2){S.chapter=3;updateObjective();}
  if(it.ref.n==='Hermit Aranya'&&S.chapter<=4){S.chapter=5;updateObjective();}
  if(it.ref.n==='Commander Raka'&&S.chapter<=6){S.chapter=7;updateObjective();}
  if(it.ref.n==='Merchant Yara'){ if(S.gold>=50){S.gold-=50;S.hp=S.maxhp;S.st=S.maxst;toast('🍵 Warm tea — fully restored');sfx('heal');} else toast('Need 50 gold (you have '+S.gold+')'); }
 }
 else if(it.type==='shrine'){ S.hp=S.maxhp;S.st=S.maxst; save(); toast('⛩ Shrine — healed & saved'); sfx('heal'); burst(S.pos,0xffd34d,16); }
 else if(it.type==='seal'){
  const id=it.ref;
  if(S.seals[id]){toast('Seal already cleansed. Dharma flows here.');return;}
  const need={frozen:1,sunken:3,forest:5,ashen:7}[id];
  if(S.chapter<need){toast('The seal rejects you — follow your quest first ◆');return;}
  if(!enemies.some(e=>e.isBoss&&e.region===id)) spawnBoss(id);
 }
 else if(it.type==='sanctum'){
  if(!Object.values(S.seals).every(Boolean)){toast('The Sanctum is frozen shut — cleanse 4 seals first ('+Object.values(S.seals).filter(Boolean).length+'/4)');return;}
  if(!enemies.some(e=>e.isBoss&&e.region==='sanctum')){ S.chapter=8; updateObjective(); spawnBoss('sanctum'); }
 }
}
function startDialogue(lines){ dlgQueue=[...lines]; dialogueOpen=true; $('dialogue').classList.remove('hidden'); advanceDialogue(); }
function advanceDialogue(){
 if(!dlgQueue.length){ $('dialogue').classList.add('hidden'); dialogueOpen=false; return; }
 const [n,t]=dlgQueue.shift(); $('dlg-name').textContent=n; $('dlg-text').textContent=t;
}
function updateObjective(){ const c=CHAPTERS[S.chapter]||CHAPTERS[0]; $('objective-title').textContent=c.t; $('objective-text').textContent=c.o; updateQuestMarker(); }
function updateQuestMarker(){
 let t=null;
 if(S.chapter===0) t=npcs[0].mesh.position;
 else if(S.chapter===1) t=seals.frozen.pos;
 else if(S.chapter===2||S.chapter===3) t=(S.chapter===2?npcs[1].mesh.position:seals.sunken.pos);
 else if(S.chapter===4||S.chapter===5) t=(S.chapter===4?npcs[2].mesh.position:seals.forest.pos);
 else if(S.chapter===6||S.chapter===7) t=(S.chapter===6?npcs[3].mesh.position:seals.ashen.pos);
 else t=dungeonPortal.position;
 if(t&&questMarker) questMarker.position.set(t.x,(t.y||terrainH(t.x,t.z))+9,t.z);
}
function victory(){
 S.won=true; $('victory-text').textContent=`All seals cleansed. ${S.kills} foes fallen. Level ${S.level}. The ice remembers spring — because of you.`;
 $('victory-screen').classList.remove('hidden'); S.paused=true; sfx('quest');
}

// ---------- UI ----------
function refreshPowers(){
 const bar=$('powers-bar'); bar.innerHTML='';
 POWERS.forEach((p,i)=>{ const un=S.unlockedPowers.includes(p.id); const d=document.createElement('div'); d.className='pw'+(un?' unlocked':'')+(i===S.powIdx?' active':''); d.innerHTML=`${p.icon}<small>${p.name}</small>`+(S.cds[i]>0?`<div class="cd">${Math.ceil(S.cds[i])}</div>`:''); d.title=p.name+' — '+p.desc; d.onclick=()=>{S.powIdx=i;refreshPowers();}; bar.appendChild(d); });
 $('weapon-name').textContent='⚔ '+WEAPONS[S.weapon].name;
}
function updateCombo(){ const c=$('combo-counter'); if(S.combo>=3){c.classList.remove('hidden');$('combo-num').textContent=S.combo;} else c.classList.add('hidden'); }
function buildSkills(){
 const g=$('skill-grid'); g.innerHTML=''; $('skill-points').textContent=S.skillPts;
 for(const s of SKILLS){ const owned=!!S.skills[s.id]; const d=document.createElement('div'); d.className='skill-card'+(owned?' owned':''); d.innerHTML=`<h4>${s.n} ${owned?'✔':''}</h4><p>${s.d}</p><p>Cost: ${s.cost} pt</p>`; d.onclick=()=>{ if(owned)return; if(S.skillPts>=s.cost){S.skillPts-=s.cost;S.skills[s.id]=1;applySkills();buildSkills();sfx('pickup');} else toast('Not enough skill points — level up'); }; g.appendChild(d); }
}
function applySkills(){ S.maxhp=100+(S.level-1)*8+(S.skills.hp1?25:0); S.maxst=100+(S.level-1)*4+(S.skills.st1?25:0); }
function applyLevel(announce=true){ applySkills(); S.hp=Math.min(S.hp,S.maxhp); }
function toggleSkills(){ const el=$('skill-screen'); el.classList.toggle('hidden'); if(!el.classList.contains('hidden')) buildSkills(); S.paused=!$('skill-screen').classList.contains('hidden')&&S.started; }
function togglePause(){ if(!S.started||S.dead||S.won) return; S.paused=!S.paused; $('pause-screen').classList.toggle('hidden',!S.paused);
 $('stat-sheet').innerHTML=`Level ${S.level} • ${S.kills} kills • ${S.gold} gold • Seals ${Object.values(S.seals).filter(Boolean).length}/4<br>HP ${Math.round(S.hp)}/${S.maxhp} • Weapon ${WEAPONS[S.weapon].name} • Powers: ${S.unlockedPowers.join(', ')}${S.ngp>1?' • NG+'+S.ngp:''}`; }

// ---------- WEATHER / TIME ----------
function updateEnv(dt){
 S.time+=dt*0.03; if(S.time>=24)S.time-=24;
 const day=S.time>6&&S.time<19; const t=(S.time-6)/13;
 const {region}=getRegionAt(S.pos.x,S.pos.z);
 setRegionMusic(region.music);
 // sun path
 const sa=Math.PI*(clamp((S.time-6)/12,0,1));
 sun.position.set(S.pos.x+Math.cos(sa)*80, Math.sin(sa)*90+10, S.pos.z+30);
 sun.target.position.copy(S.pos);
 sun.intensity=day?1.6:0.15; moonLight.intensity=day?0:0.4;
 hemi.intensity=day?0.9:0.35;
 scene.background.set(region.sky); if(!day) scene.background.multiplyScalar(0.18);
 scene.fog.color.set(region.fog); if(!day) scene.fog.color.multiplyScalar(0.3);
 // weather state machine
 S.wthT-=dt; if(S.wthT<=0){ S.wthT=rand(25,60);
  const opts= region.id==='frozen'?['snow','clear','storm']: region.id==='ashen'?['ash','clear','storm']: region.id==='sunken'?['rain','clear','storm']: region.id==='forest'?['rain','clear','clear']:['clear','storm','cosmic'];
  S.weather=opts[Math.floor(Math.random()*opts.length)];
  if(S.weather!=='clear') toast({snow:'❄ Supernatural snow — visibility low',rain:'🌧 Rain — fire weakened',storm:'⛈ Dharma storm — lightning hazards!',ash:'🌋 Ashfall — the Empire breathes',cosmic:'✨ Cosmic event — AKASHA empowered'}[S.weather]);
 }
 // weather particles (simple)
 if(S.weather!=='clear'&&Math.random()<0.5){
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.07),new THREE.MeshBasicMaterial({color:S.weather==='ash'||S.weather==='storm'?0xffaa55:S.weather==='snow'?0xffffff:0x6ad8ff}));
  m.position.set(S.pos.x+rand(-25,25),S.pos.y+rand(5,15),S.pos.z+rand(-25,25)); scene.add(m);
  particles.push({mesh:m,vel:new THREE.Vector3(rand(-2,2),S.weather==='snow'?-3:-9,rand(-2,2)),life:2,weather:true});
 }
 // storm lightning hazard
 if(S.weather==='storm'&&Math.random()<dt*0.08){
  burst(new THREE.Vector3(S.pos.x+rand(-15,15),S.pos.y+1,S.pos.z+rand(-15,15)),0xaaeeff,12); sfx('bow');
  if(Math.random()<0.2) hurtPlayer(4,'lightning');
 }
 // clock UI
 const hh=Math.floor(S.time), mm=Math.floor((S.time-hh)*60);
 $('clock').textContent=(S.time>6&&S.time<19?'☀ ':'🌙 ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' • '+S.weather;
}

// ---------- PLAYER DAMAGE ----------
function hurtPlayer(dmg,src){
 if(dialogueOpen) return;
 if(S.dodgeT>0){ // perfect dodge window
  floater(S.pos,'PERFECT!', '#aee2ff'); S.slowmo=Math.max(S.slowmo,0.7); S.ult=clamp(S.ult+15,0,100); return;
 }
 if(S.blocking){
  const perfect=S.parryT<=0&&Math.random()<0.001?false:false;
  dmg*=0.25; S.st-=10; floater(S.pos,'BLOCK','#9fb3c8'); sfx('parry');
  if(S.st<=0){S.st=0;S.blocking=false;}
 } else if(S.parryT>0){ /* reserved */ }
 if(S.shield>0){ const a=Math.min(S.shield,dmg); S.shield-=a; dmg-=a; floater(S.pos,'WARD','#9a7a4a'); }
 S.hp-=dmg; camShake=Math.min(1,camShake+0.4); $('damage-vignette').style.boxShadow='inset 0 0 120px rgba(200,0,0,.7)';
 setTimeout(()=>$('damage-vignette').style.boxShadow='inset 0 0 120px rgba(200,0,0,0)',180);
 sfx('hit');
 if(S.hp<=0&&!S.dead){ S.hp=0; S.dead=true; $('death-screen').classList.remove('hidden'); S.paused=true; }
}

// ---------- MAIN LOOP ----------
let lastRegion='';
function animate(){
 requestAnimationFrame(animate);
 const rawDt=Math.min(clock.getDelta(),0.05);
 const dt=S.slowmo>0?rawDt*0.3:rawDt;
 if(S.slowmo>0)S.slowmo-=rawDt;
 if(!S.started||S.paused){ renderer.render(scene,camera); return; }
 update(dt,rawDt);
 renderer.render(scene,camera);
}
function update(dt,rawDt){
 // timers
 S.atkT+=dt; S.dodgeT-=dt; S.comboT-=dt; if(S.comboT<=0){S.combo=0;updateCombo();}
 for(let i=0;i<S.cds.length;i++){ if(S.cds[i]>0){S.cds[i]-=rawDt;} }
 S.ult=clamp(S.ult+rawDt*1.2,0,100);
 S.hp=clamp(S.hp+rawDt*1.5,0,S.maxhp); // slow pilgrim regen
 S.st=clamp(S.st+dt*(S.blocking?8:20),0,S.maxst);
 if(S.swingT>0)S.swingT-=dt;
 // movement input
 let ix=0,iz=0;
 if(keys.KeyW)iz+=1; if(keys.KeyS)iz-=1; if(keys.KeyA)ix-=1; if(keys.KeyD)ix+=1;
 ix+=window.touchMove.x; iz-=window.touchMove.y;
 const mag=Math.hypot(ix,iz); if(mag>1){ix/=mag;iz/=mag;}
 const sprint=(keys.ShiftLeft||keys.ShiftRight)&&mag>0.1&&S.st>1;
 const spd=(sprint?10.5:6.2)*(S.slowmo>0?1.2:1);
 // camera-relative
 const f=new THREE.Vector3(Math.sin(S.yaw),0,Math.cos(S.yaw));
 const r=new THREE.Vector3(f.z,0,-f.x);
 const mv=new THREE.Vector3().addScaledVector(f,iz).addScaledVector(r,-ix);
 // dodge double-tap (keyboard): Space = jump, double W = dodge simplified to Space+dir? use Space for jump, Alt/K? Use Space+shift dodge:
 if(keys.Space){ keys.Space=false; if(sprint) dodge(); else jump(); }
 if(mag>0.1){
  const ta=Math.atan2(mv.x,mv.z); S.yawFace=ta;
  S.pos.addScaledVector(mv.normalize(),spd*dt);
  if(sprint)S.st-=8*dt;
  player.rotation.y=ta;
  // walk anim
  const w=performance.now()*0.012*(sprint?1.6:1);
  playerParts.legL.rotation.x=Math.sin(w)*0.7; playerParts.legR.rotation.x=-Math.sin(w)*0.7;
  playerParts.armL.rotation.x=-Math.sin(w)*0.5; playerParts.armR.rotation.x=Math.sin(w)*0.5+(S.swingT>0?-1.8*(S.swingT/0.35):0);
  capeMesh.rotation.x=0.25+(sprint?0.7:0.15*Math.sin(w));
 } else { playerParts.legL.rotation.x*=0.9; playerParts.legR.rotation.x*=0.9; playerParts.armR.rotation.x=S.swingT>0?-1.8*(S.swingT/0.35):0; }
 // gravity / ground
 const gh=terrainH(S.pos.x,S.pos.z);
 S.vy=(S.vy??0)-22*dt; S.pos.y+=S.vy*dt;
 if(S.pos.y<=gh){S.pos.y=gh;S.vy=0;S.grounded=true;} else S.grounded=false;
 // water swim slow
 const {region,inside}=getRegionAt(S.pos.x,S.pos.z);
 if(region.id==='sunken'&&S.pos.y<terrainH(S.pos.x,S.pos.z)+1.2){ /* in shallows */ }
 S.pos.x=clamp(S.pos.x,-460,460); S.pos.z=clamp(S.pos.z,-460,460);
 player.position.copy(S.pos);
 playerParts.aura.material.opacity=S.shield>0?0.25:(S.slowmo>0?0.18:0);
 playerParts.aura.material.color.set(S.slowmo>0?0xaa6aff:0x66d8ff);
 // region banner
 if(region.id!==lastRegion){ lastRegion=region.id; showRegionBanner(region.name,region.sub); }
 // block pose
 if(S.blocking){ playerParts.armL.rotation.x=-1.4; }
 // enemies AI
 updateEnemies(dt);
 // projectiles
 for(let i=projectiles.length-1;i>=0;i--){ const p=projectiles[i]; p.life-=dt; p.mesh.position.addScaledVector(p.vel,dt);
  if(p.fire){ p.trail+=dt; if(p.trail>0.05){p.trail=0; burst(p.mesh.position,0xff7a2a,2);} }
  let dead=p.life<=0;
  if(!p.foe){ for(const e of enemies){ if(e.hp>0&&dist2d(p.mesh.position,e.mesh.position)<1.6){ damageEnemy(e,p.dmg,''); dead=true; break; } } }
  else { if(dist2d(p.mesh.position,S.pos)<1.4&&Math.abs(p.mesh.position.y-(S.pos.y+1.4))<2){ hurtPlayer(p.dmg,'proj'); dead=true; } }
  if(p.mesh.position.y<terrainH(p.mesh.position.x,p.mesh.position.z)) dead=true;
  if(dead){scene.remove(p.mesh);projectiles.splice(i,1);}
 }
 // particles
 for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.life-=dt;
  if(p.ring){ p.mesh.scale.multiplyScalar(1+dt*3); p.mesh.material.opacity=p.life; }
  else { p.mesh.position.addScaledVector(p.vel,dt); p.vel.y-=6*dt; p.mesh.material.opacity=Math.max(0,p.life); }
  if(p.life<=0){scene.remove(p.mesh);particles.splice(i,1);}
 }
 // pickups
 for(let i=pickups.length-1;i>=0;i--){ const pk=pickups[i]; pk.mesh.rotation.y+=dt*2; pk.mesh.position.y+=Math.sin(performance.now()*0.003+i)*dt*0.5;
  if(dist2d(S.pos,pk.mesh.position)<2.2){ if(pk.type==='heal'){S.hp=clamp(S.hp+30,0,S.maxhp);toast('❤ +30 HP');} else if(pk.type==='xp'){gainXP(25);} else {S.gold+=15;toast('+15 gold');} sfx('pickup'); scene.remove(pk.mesh); pickups.splice(i,1); } }
 // quest marker bob
 if(questMarker){ questMarker.rotation.y+=dt*2; questMarker.position.y+=Math.sin(performance.now()*0.004)*dt*2; }
 // seals anim + portal
 for(const id of Object.keys(seals)){ seals[id].seal.rotation.y+=dt; seals[id].seal.position.y=6+Math.sin(performance.now()*0.002)*0.6; }
 dungeonPortal.rotation.z+=dt*0.8;
 // shrine pulse
 // interact prompt
 const ni=nearInteract(); $('interact-prompt').classList.toggle('hidden',!ni||dialogueOpen);
 if(ni) $('interact-prompt').textContent = ni.type==='npc'?'E — Speak ('+ni.ref.n+')': ni.type==='shrine'?'E — Rest & Save': ni.type==='seal'?'E — Challenge Seal Boss': 'E — Enter Sanctum';
 // camera
 updateCamera(rawDt);
 // HUD
 $('hp-fill').style.width=(100*S.hp/S.maxhp)+'%'; $('hp-text').textContent=Math.ceil(S.hp)+' / '+S.maxhp;
 $('st-fill').style.width=(100*S.st/S.maxst)+'%'; $('xp-fill').style.width=(100*S.xp/(S.level*100))+'%';
 $('level-num').textContent=S.level;
 if(bossRef&&bossRef.hp>0){ const d=dist2d(S.pos,bossRef.mesh.position); if(d>120){bossRef=null;$('boss-bar').classList.add('hidden');} }
 if(Math.floor(performance.now()/500)!==update._l){update._l=Math.floor(performance.now()/500);refreshPowers();}
 drawMinimap(region);
 updateEnv(rawDt);
 // ambient enemy respawn
 update._rt=(update._rt||0)+dt; if(update._rt>20){update._rt=0; if(enemies.filter(e=>!e.isBoss).length<4) populateRegionEnemies();}
}
function updateEnemies(dt){
 S.yawFace=S.yawFace??S.yaw;
 for(const e of enemies){
  if(e.hp<=0) continue;
  const d=dist2d(S.pos,e.mesh.position);
  e.atkT-=dt;
  if(dialogueOpen){ e.mesh.lookAt(S.pos.x,e.mesh.position.y,S.pos.z); continue; }
  const slowed=S.slowmo>0?0.45:1;
  if(e.kind==='archer'&&d<22&&d>8){
   // strafe + shoot
   e.mesh.position.x+=Math.sin(performance.now()*0.001+e.lvl)*dt*2;
   if(e.atkT<=0){ e.atkT=2.2; const dir=new THREE.Vector3(S.pos.x-e.mesh.position.x,1.2,S.pos.z-e.mesh.position.z).normalize();
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.16),new THREE.MeshBasicMaterial({color:0xff5555})); m.position.copy(e.mesh.position); m.position.y+=1.6; scene.add(m);
    projectiles.push({mesh:m,vel:dir.multiplyScalar(22),dmg:e.dmg,foe:true,life:3}); }
  } else if(d<2.6*(e.isBoss?2.4:1)){
   // melee
   if(e.atkT<=0){ e.atkT=e.isBoss?(e.phase>=2?0.9:1.5):1.6;
    // telegraph then hit
    const dmg=e.dmg*(e.isBoss&&e.phase>=3?1.4:1);
    setTimeout(()=>{ if(e.hp>0&&dist2d(S.pos,e.mesh.position)<3.4*(e.isBoss?2.2:1)) hurtPlayer(dmg,e.name||e.kind); },e.isBoss?350:250);
    e.mesh.position.y+=0.6; setTimeout(()=>{},0);
    if(e.isBoss&&Math.random()<0.4){ // AoE slam
     setTimeout(()=>{ burst(e.mesh.position,0xff4422,20); if(dist2d(S.pos,e.mesh.position)<9) hurtPlayer(dmg*0.6,'slam'); },400);
    }
   }
  } else if(d<70){
   const dx=S.pos.x-e.mesh.position.x, dz=S.pos.z-e.mesh.position.z; const m=Math.hypot(dx,dz)||1;
   // flank: offset perpendicular
   const flank=Math.sin(e.lvl*3.7)*0.5;
   e.mesh.position.x+=(dx/m*e.spd*slowed + -dz/m*flank)*dt;
   e.mesh.position.z+=(dz/m*e.spd*slowed + dx/m*flank)*dt;
   e.mesh.position.y=terrainH(e.mesh.position.x,e.mesh.position.z);
   e.mesh.lookAt(S.pos.x,e.mesh.position.y,S.pos.z);
  }
  // boss phases
  if(e.isBoss){
   const frac=e.hp/e.maxhp;
   const np=frac<0.33?3:frac<0.66?2:1;
   if(np!==e.phase){ e.phase=np; e.spd+=0.7; e.dmg*=1.15; cinematic(e.name,'Phase '+np+' — the Guardian rages!',2); burst(e.mesh.position,0xffffff,30); sfx('boss');
    // summon adds
    for(let k=0;k<np;k++) spawnEnemy('scout',e.mesh.position.x+rand(-8,8),e.mesh.position.z+rand(-8,8),S.level);
   }
  }
 }
}
function updateCamera(rawDt){
 const shake=$('chk-shake')?.checked;
 if(camShake>0)camShake-=rawDt*2;
 const cd=camDist+(S.slowmo>0? -1.5:0);
 const cx=S.pos.x-Math.sin(S.yaw)*Math.cos(S.pitch)*cd;
 const cz=S.pos.z-Math.cos(S.yaw)*Math.cos(S.pitch)*cd;
 const cy=S.pos.y+2-Math.sin(S.pitch)*cd;
 const target=new THREE.Vector3(cx,cy,cz);
 // obstacle avoid: raise if below terrain
 const th=terrainH(cx,cz)+0.6; if(target.y<th)target.y=th;
 camera.position.lerp(target,1-Math.pow(0.0001,rawDt));
 const look=new THREE.Vector3(S.pos.x,S.pos.y+1.8,S.pos.z);
 if(shake&&camShake>0){ look.x+=rand(-1,1)*camShake*0.4; look.y+=rand(-1,1)*camShake*0.4; }
 // lock-on bias
 if(S.locked&&S.locked.hp>0){ const mid=look.clone().lerp(S.locked.mesh.position,0.25); camera.lookAt(mid.x,mid.y+1.5,mid.z); }
 else camera.lookAt(look);
}
function drawMinimap(region){
 const c=minimap, W=160,H=160; c.clearRect(0,0,W,H);
 c.save(); c.beginPath(); c.arc(80,80,78,0,7); c.clip();
 c.fillStyle='rgba(6,10,18,.9)'; c.fillRect(0,0,W,H);
 const sc=160/260;
 for(const r of REGIONS){ const dx=(r.cx-S.pos.x)*sc, dz=(r.cz-S.pos.z)*sc;
  c.beginPath(); c.arc(80+dx,80+dz,r.r*sc,0,7); c.fillStyle=r.id===region.id?'rgba(120,180,255,.25)':'rgba(80,90,110,.18)'; c.fill(); }
 // seals
 for(const id of Object.keys(seals)){ const p=seals[id].pos; const dx=(p.x-S.pos.x)*sc,dz=(p.z-S.pos.z)*sc;
  c.fillStyle=S.seals[id]?'#3aff7a':'#ff4a4a'; c.fillRect(78+dx,78+dz,4,4); }
 // npcs gold
 c.fillStyle='#ffd34d'; for(const n of npcs){ const dx=(n.mesh.position.x-S.pos.x)*sc,dz=(n.mesh.position.z-S.pos.z)*sc; if(Math.abs(dx)<80&&Math.abs(dz)<80){c.beginPath();c.arc(80+dx,80+dz,3,0,7);c.fill();} }
 // enemies red
 c.fillStyle='#ff5555'; for(const e of enemies){ if(e.hp<=0)continue; const dx=(e.mesh.position.x-S.pos.x)*sc,dz=(e.mesh.position.z-S.pos.z)*sc; if(Math.abs(dx)<80&&Math.abs(dz)<80){c.fillRect(79+dx,79+dz,2.5,2.5);} }
 // player arrow
 c.save(); c.translate(80,80); c.rotate(Math.atan2(Math.sin(S.yawFace??S.yaw),Math.cos(S.yawFace??S.yaw))*0+(-(S.yawFace??S.yaw)+Math.PI)); c.fillStyle='#fff'; c.beginPath(); c.moveTo(0,-7); c.lineTo(5,5); c.lineTo(-5,5); c.closePath(); c.fill(); c.restore();
 c.restore();
}

// ---------- BOOT ----------
function wireUI(){
 $('btn-new').onclick=()=>{ initAudio(); startGame(false); };
 $('btn-continue').onclick=()=>{ initAudio(); if(load()){startGame(true);} else toast('No save found on this device'); };
 $('btn-how').onclick=()=>{ $('title-screen').classList.add('hidden'); $('how-screen').classList.remove('hidden'); };
 $('btn-how-back').onclick=()=>{ $('how-screen').classList.add('hidden'); $('title-screen').classList.remove('hidden'); };
 $('btn-resume').onclick=togglePause; $('btn-save').onclick=save;
 $('btn-skill').onclick=()=>{ $('pause-screen').classList.add('hidden'); S.paused=false; toggleSkills(); };
 $('btn-quit-title').onclick=()=>location.reload();
 $('btn-respawn').onclick=()=>{ S.dead=false;S.hp=S.maxhp;S.st=S.maxst;S.pos.set(6,terrainH(6,-208),-200);S.paused=false;$('death-screen').classList.add('hidden'); };
 $('btn-ngp').onclick=()=>{ S.ngp++; S.won=false; S.paused=false; $('victory-screen').classList.add('hidden'); for(const k of Object.keys(S.seals))S.seals[k]=false; for(const id of Object.keys(seals)){seals[id].done=false;seals[id].seal.material.color.set(0x66d8ff);} S.chapter=0; updateObjective(); toast('NG+ — the frost bites deeper (x'+S.ngp+')'); };
 $('btn-free').onclick=()=>{ S.won=false;S.paused=false;$('victory-screen').classList.add('hidden'); };
 $('btn-skill-close').onclick=toggleSkills;
 $('chk-audio').onchange=e=>setAudioEnabled(e.target.checked);
 for(const id of ['c-skin','c-cloth','c-trim','c-hair','c-build']) $(id).oninput=()=>{ if(player) rebuildPlayerColors(); };
 $('dialogue').onclick=()=>advanceDialogue();
 addEventListener('keydown',e=>{ if(e.code==='KeyE'&&dialogueOpen){advanceDialogue();} });
}
function startGame(continued){
 $('title-screen').classList.add('hidden'); $('how-screen').classList.add('hidden');
 $('hud').classList.remove('hidden'); $('loading').style.display='none';
 S.started=true; S.paused=false; S.yawFace=Math.PI;
 if(!continued && S.chapter===0){ S.chapter=1; }
 applyLevel(false); refreshPowers(); updateObjective(); populateRegionEnemies();
 const r=getRegionAt(S.pos.x,S.pos.z).region; showRegionBanner('FROZEN DHARMA',r.name+' — '+r.sub);
 cinematic('❄ THE FROZEN VALLEY ❄','“There is something beyond that mountain.”',3);
 if(!continued) startDialogue(DLG.veyas);
 sfx('quest');
}
async function boot(){
 $('load-text').textContent='Kindling Agni… building realms…';
 wireUI(); bindInput(); initThree(); buildPlayer(); buildWorld();
 S.pos.set(0,0,-220); S.pos.y=terrainH(0,-220); player.position.copy(S.pos); S.yaw=Math.PI; S.yawFace=Math.PI;
 updateObjective(); refreshPowers();
 $('loading').style.display='none';
 animate();
}
boot();
