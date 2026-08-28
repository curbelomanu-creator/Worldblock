function createProceduralAnimal(species,x,z,cid){
  let model;
  if(species==='horse') model=createHorseModel();
  else if(species==='lion') model=createLionModel();
  else model=createElephantModel();
  const g=model.group;
  const surface=getHighestWalkSurfaceY(x,z,30);
  const footOffset=0.06;
  g.position.set(x,surface+footOffset,z);
  const baseSpeed={horse:1.55,lion:1.0,elephant:0.56}[species];
  const scale={horse:1.0,lion:1.0,elephant:1.08}[species];
  g.scale.setScalar(scale);
  g.rotation.y=hash01(Math.floor(x),Math.floor(z),409)*Math.PI*2;
  const maxHealth={horse:4,lion:4,elephant:9}[species];
  g.userData={alive:true,dying:false,kind:'animal',species,chunkId:cid,footOffset,model,walkTime:hash01(Math.floor(x),Math.floor(z),411)*10,
    wanderTimer:0.5+hash01(Math.floor(x),Math.floor(z),413)*3,targetX:x,targetZ:z,speed:baseSpeed,currentSpeed:0,
    mounted:false,leashed:false,pauseTimer:0,knockbackX:0,knockbackZ:0,hitTimer:0,rideVelocityY:0,rideGrounded:true,rideSpeed:0,playerMoved:false,
    health:maxHealth,maxHealth,deathTimer:0,deathSide:1,deathStartZ:0};
  animals.push(g);
  return g;
}

function spawnChunkAnimals(chunk){
  const centerX=chunk.cx*CHUNK_SIZE+CHUNK_SIZE/2;
  const centerZ=chunk.cz*CHUNK_SIZE+CHUNK_SIZE/2;
  if(Math.hypot(centerX,centerZ)<34) return;
  // About one animal per eleven chunks.
  if(hash01(chunk.cx,chunk.cz,501)<=0.91) return;
  const lx=2+Math.floor(hash01(chunk.cx*17,chunk.cz*23,503)*12);
  const lz=2+Math.floor(hash01(chunk.cx*29,chunk.cz*31,509)*12);
  const x=chunk.cx*CHUNK_SIZE+lx, z=chunk.cz*CHUNK_SIZE+lz;
  if(isStaticZone(x,z) || Math.hypot(x,z)<32) return;
  const surface=getHighestWalkSurfaceY(x,z,30);
  if(surface<0.5) return;
  const slope=Math.max(Math.abs(surface-getHighestWalkSurfaceY(x+1,z,30)),Math.abs(surface-getHighestWalkSurfaceY(x-1,z,30)),Math.abs(surface-getHighestWalkSurfaceY(x,z+1,30)),Math.abs(surface-getHighestWalkSurfaceY(x,z-1,30)));
  if(slope>1.35) return;
  const spawnKey=`${chunk.id}:0`;
  if(movedAnimalSpawns.has(spawnKey) || deadAnimalSpawns.has(spawnKey)) return;
  const species=chooseAnimalSpecies(proceduralBiome(x,z),hash01(x,z,521));
  const animal=createProceduralAnimal(species,x,z,chunk.id);
  animal.userData.spawnKey=spawnKey;
  chunk.group.add(animal);
  chunk.animals.push(animal);
}

function animalCanStep(animal,nx,nz){
  if(!animal.userData.mounted && animal!==leashedHorse && (Math.hypot(nx,nz)<27 || isStaticZone(nx,nz))) return false;
  const currentFoot=animal.position.y-animal.userData.footOffset;
  const surface=getNearbyWalkSurfaceY(nx,nz,currentFoot,animal.userData.species==='horse'?1.35:1.05,2.2);
  if(Math.abs(surface-currentFoot)>1.45) return false;
  const ix=Math.round(nx), iz=Math.round(nz);
  const groundCenter=Math.floor(surface-0.5+0.001);
  const clearance=animal.userData.species==='elephant'?3:2;
  for(let y=groundCenter+1;y<=groundCenter+clearance;y++){
    const b=occupied.get(key(ix,y,iz));
    if(b && b.userData.type!=='leaves') return false;
    if(b && b.userData.type==='leaves') return false;
  }
  return true;
}

function setNewAnimalTarget(animal){
  const data=animal.userData;
  const angle=Math.random()*Math.PI*2;
  const distance=3+Math.random()*7;
  data.targetX=animal.position.x+Math.sin(angle)*distance;
  data.targetZ=animal.position.z+Math.cos(angle)*distance;
  data.wanderTimer=3.5+Math.random()*6;
  data.pauseTimer=0.4+Math.random()*1.4;
}

function updateAnimalHit(animal,dt){
  const data=animal.userData;
  if(data.hitTimer<=0) return false;
  data.hitTimer=Math.max(0,data.hitTimer-dt);
  const nx=animal.position.x+data.knockbackX*dt, nz=animal.position.z+data.knockbackZ*dt;
  if(animalCanStep(animal,nx,nz)){ animal.position.x=nx; animal.position.z=nz; }
  const damping=Math.exp(-6.5*dt); data.knockbackX*=damping; data.knockbackZ*=damping;
  const phase=1-data.hitTimer/0.38;
  animal.rotation.z=Math.sin(phase*Math.PI)*(data.species==='elephant'?0.05:0.11);
  const footY=animal.position.y-data.footOffset;
  const surface=getNearbyWalkSurfaceY(animal.position.x,animal.position.z,footY,1.35,2.5);
  animal.position.y+=(surface+data.footOffset-animal.position.y)*Math.min(1,dt*12);
  return true;
}
