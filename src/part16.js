let yaw = 0, pitch = 0;
let pointerLocked = false;
const keys = {};
let velocityY = 0;
let onGround = false;
// Spawn in the central plaza, facing the monumental north gate (-Z).
const SPAWN_POSITION = new THREE.Vector3(2, 5.15, 2);
const player = SPAWN_POSITION.clone();
const eyeHeight = 1.65;
const moveSpeed = 5.5;
const gravity = 17;
const jumpSpeed = 7.2;

function playerBoxAt(pos){
  return new THREE.Box3(
    new THREE.Vector3(pos.x-.3, pos.y-eyeHeight, pos.z-.3),
    new THREE.Vector3(pos.x+.3, pos.y+.15, pos.z+.3)
  );
}

function solidCollision(pos){
  const box = playerBoxAt(pos);
  const minX=Math.floor(box.min.x-.5), maxX=Math.floor(box.max.x+.5);
  const minY=Math.floor(box.min.y-.5), maxY=Math.floor(box.max.y+.5);
  const minZ=Math.floor(box.min.z-.5), maxZ=Math.floor(box.max.z+.5);
  for(let x=minX;x<=maxX;x++) for(let y=minY;y<=maxY;y++) for(let z=minZ;z<=maxZ;z++){
    const cube=occupied.get(key(x,y,z));
    if(cube && cube.userData.type !== 'leaves' && cube.userData.type !== 'glass'){
      const cb = new THREE.Box3(
        new THREE.Vector3(x-.5,y-.5,z-.5),
        new THREE.Vector3(x+.5,y+.5,z+.5)
      );
      if(box.intersectsBox(cb)) return true;
    }
  }
  return false;
}

const hud = document.getElementById('hud');
const slotNames = ['Bloque de césped', 'Bloque de tierra', 'Bloque de piedra', 'Bloque de madera', 'Espada', 'Lazo', 'Corral / cerca'];
function updateHUD(){
  const living=villagers.filter(v=>v.userData.alive).length;
  const livingTrolls=trolls.filter(t=>t.userData.alive).length;
  const counts={horse:0,lion:0,elephant:0};
  for(const a of animals) if(counts[a.userData.species]!==undefined) counts[a.userData.species]++;
  const horseHint=mountedHorse?'E: desmontar caballo':'E: montar caballo cercano';
  const leashHint=leashedHorse?'Click con lazo: soltar caballo':'Click con lazo: enlazar caballo';
  hud.innerHTML=`WASD: mover · Mouse: mirar<br>${mountedHorse?'Caballo: WASD · Space: saltar':'Espacio: saltar'} · ${horseHint}<br>${selectedItem==='lasso'?leashHint:'6: lazo'} · 7: corral/cerca<br>ESC: liberar mouse<br>Click izq: ${selectedItem==='sword'?'usar espada':(selectedItem==='lasso'?'usar lazo':'romper bloque')}<br>Click der: ${['sword','lasso'].includes(selectedItem)?'—':'colocar bloque'}<br>1-7: seleccionar<br><strong>Seleccionado:</strong> ${slotNames[selectedIndex]}<br><strong>Fauna cargada:</strong> 🐎 ${counts.horse} · 🦁 ${counts.lion} · 🐘 ${counts.elephant}<br><strong>Aldeanos:</strong> ${living} · <strong>Trolls:</strong> ${livingTrolls}<br><strong>Chunks:</strong> ${loadedChunks.size} · <strong>Seed:</strong> ${WORLD_SEED}`;
}

// Controls
const selectTypes = ['grass','dirt','stone','wood','sword','lasso','fence'];
let selectedIndex = 0;
let selectedItem = selectTypes[selectedIndex];

function selectSlot(i){
  selectedIndex = i;
  selectedItem = selectTypes[i];
  document.querySelectorAll('.slot').forEach((s,n)=>s.classList.toggle('active',n===i));
  swordGroup.visible = selectedItem === 'sword';
  lassoGroup.visible = selectedItem === 'lasso';
  fenceToolGroup.visible = selectedItem === 'fence';
  updateHUD();
}
selectSlot(0);

document.addEventListener('keydown',e=>{
  keys[e.code] = true;
  if(e.code === 'Digit1') selectSlot(0);
  if(e.code === 'Digit2') selectSlot(1);
  if(e.code === 'Digit3') selectSlot(2);
  if(e.code === 'Digit4') selectSlot(3);
  if(e.code === 'Digit5') selectSlot(4);
  if(e.code === 'Digit6') selectSlot(5);
  if(e.code === 'Digit7') selectSlot(6);
  if(e.code === 'KeyE' && !e.repeat) toggleHorseMount();
  if(e.code === 'Space' && !e.repeat){
    if(mountedHorse && mountedHorse.userData.rideGrounded) horseJumpQueued=true;
    else if(onGround){ velocityY=jumpSpeed; onGround=false; }
  }
});
document.addEventListener('keyup',e=> keys[e.code] = false);

document.addEventListener('mousemove',e=>{
  if(!pointerLocked) return;
  yaw -= e.movementX * .0022;
  pitch -= e.movementY * .0022;
  pitch = Math.max(-Math.PI/2 + .01, Math.min(Math.PI/2 - .01, pitch));
});

document.addEventListener('pointerlockchange',()=>{
  pointerLocked = document.pointerLockElement === canvas;
  document.getElementById('overlay').style.display = pointerLocked ? 'none' : 'flex';
});

document.addEventListener('pointerlockerror',()=>{
  pointerLocked = false;
  document.getElementById('overlay').style.display = 'flex';
  const status=document.getElementById('loadStatus');
  if(status){
    status.textContent='No se pudo capturar el mouse. Haz click nuevamente.';
    status.style.color='#ff9b9b';
  }
});

canvas.addEventListener('click',()=>{ if(!pointerLocked) canvas.requestPointerLock(); });
canvas.addEventListener('contextmenu',e=> e.preventDefault());

const ray = new THREE.Raycaster();
ray.far = 6;
