// Procedural cinematic audio: drone + raga-ish motifs + SFX via WebAudio. No external files.
let ctx=null, master=null, musicGain=null, enabled=true, musicTimer=null, curRegion='frozen';
export function setAudioEnabled(v){ enabled=v; if(master) master.gain.value = v?0.9:0; }
export function initAudio(){ if(ctx) return; try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); master=ctx.createGain(); master.gain.value=0.9; master.connect(ctx.destination); musicGain=ctx.createGain(); musicGain.gain.value=0.35; musicGain.connect(master); startDrone(); scheduleMotif(); }catch(e){} }
function startDrone(){ if(!ctx) return; const o1=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(); o1.type='sawtooth';o2.type='sine'; o1.frequency.value=55;o2.frequency.value=55*1.5; g.gain.value=0.05; const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=320; o1.connect(f);o2.connect(f);f.connect(g);g.connect(musicGain); o1.start();o2.start(); }
const SCALES={ frozen:[220,246.9,277.2,329.6,369.9,415.3,493.9], sunken:[196,220,261.6,293.7,329.6,392,440], forest:[261.6,293.7,329.6,392,440,523.3,587.3], ashen:[146.8,174.6,196,220,261.6,293.7,349.2], sanctum:[329.6,369.9,415.3,493.9,554.4,622.3,739.9] };
export function setRegionMusic(r){ curRegion=r; }
function pluck(freq, t, dur=1.2, vol=0.22, type='triangle'){ if(!ctx||!enabled) return; const o=ctx.createOscillator(),g=ctx.createGain(); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g);g.connect(musicGain); o.start(t);o.stop(t+dur+0.1); }
function drum(t, vol=0.4, f=70){ if(!ctx||!enabled) return; const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(35,t+0.25); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.4); o.connect(g);g.connect(master); o.start(t);o.stop(t+0.5); }
function scheduleMotif(){ if(musicTimer) clearTimeout(musicTimer); const loop=()=>{ if(!ctx){musicTimer=setTimeout(loop,1000);return;} const t=ctx.currentTime+0.1; const scale=SCALES[curRegion]||SCALES.frozen; const n=3+Math.floor(Math.random()*3); for(let i=0;i<n;i++){ const f=scale[Math.floor(Math.random()*scale.length)]*(Math.random()<0.2?0.5:1); pluck(f,t+i*0.55,1.6,0.16, i%2?'triangle':'sine'); } if(Math.random()<0.6) drum(t+0.2,0.25); if(Math.random()<0.3) drum(t+1.1,0.3,55); musicTimer=setTimeout(loop, 2800+Math.random()*2500); }; loop(); }
export function sfx(name){ if(!ctx||!enabled) return; const t=ctx.currentTime; try{
 if(name==='hit'){ pluck(180+Math.random()*80,t,0.15,0.3,'square'); }
 else if(name==='heavy'){ pluck(110,t,0.3,0.4,'sawtooth'); drum(t,0.35,60); }
 else if(name==='dodge'){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(900,t); o.frequency.exponentialRampToValueAtTime(250,t+0.18); g.gain.setValueAtTime(0.15,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.2); o.connect(g);g.connect(master);o.start(t);o.stop(t+0.25); }
 else if(name==='parry'){ pluck(1200,t,0.4,0.3,'square'); pluck(1800,t+0.02,0.3,0.2,'sine'); }
 else if(name==='fire'){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(90,t+0.5); g.gain.setValueAtTime(0.25,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.55); const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900; o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+0.6); }
 else if(name==='heal'){ pluck(523,t,0.8,0.2); pluck(659,t+0.12,0.8,0.2); pluck(784,t+0.24,1.0,0.2); }
 else if(name==='bow'){ pluck(700,t,0.12,0.25,'square'); }
 else if(name==='die'){ pluck(220,t,0.6,0.3,'sawtooth'); pluck(110,t+0.1,0.8,0.3,'sawtooth'); }
 else if(name==='pickup'){ pluck(880,t,0.3,0.2); pluck(1320,t+0.08,0.4,0.2); }
 else if(name==='quest'){ pluck(392,t,0.5,0.25); pluck(523,t+0.15,0.5,0.25); pluck(659,t+0.3,0.8,0.25); }
 else if(name==='boss'){ drum(t,0.5,50); drum(t+0.3,0.5,45); pluck(98,t,1.5,0.3,'sawtooth'); }
 else if(name==='ult'){ pluck(130,t,1.2,0.4,'sawtooth'); pluck(523,t+0.1,1.0,0.25); pluck(1046,t+0.2,1.2,0.2); drum(t,0.5,55); }
} catch(e){} }
