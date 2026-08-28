function updateAnimals(dt){
  for(const animal of [...animals]){
    const data=animal.userData;
    if(data.dying){ updateDeathAnimation(animal,dt); continue; }
    if(!data.alive) continue;
    if(data.mounted) continue;
    if(data.playerMoved && animal!==leashedHorse && !isStaticZone(animal.position.x,animal.position.z) && !loadedChunks.has(blockChunkId(animal.position.x,animal.position.z))) continue;
    if(updateAnimalHit(animal,dt)) continue;
    animal.rotation.z*=Math.exp(-10*dt);
    if(animal===leashedHorse){
      const dx=player.x-animal.position.x, dz=player.z-animal.position.z, dist=Math.hypot(dx,dz);
      if(dist>2.8){
        const vx=dx/(dist||1), vz=dz/(dist||1);
        turnToward(animal,Math.atan2(vx,vz),dt,5.5);
        const desired=Math.min(5.2,1.8+(dist-2.8)*0.9);
        data.currentSpeed+=(desired-data.currentSpeed)*Math.min(1,dt*4.5);
        const fx=Math.sin(animal.rotation.y), fz=Math.cos(animal.rotation.y);
        const nx=animal.position.x+fx*data.currentSpeed*dt, nz=animal.position.z+fz*data.currentSpeed*dt;
        if(animalCanStep(animal,nx,nz)){ animal.position.x=nx; animal.position.z=nz; }
      }else data.currentSpeed*=Math.exp(-5*dt);
    }else{
      data.wanderTimer-=dt;
      if(data.pauseTimer>0){
        data.pauseTimer=Math.max(0,data.pauseTimer-dt);
        data.currentSpeed*=Math.exp(-4*dt);
      }else{
        const dx=data.targetX-animal.position.x, dz=data.targetZ-animal.position.z, dist=Math.hypot(dx,dz);
        if(data.wanderTimer<=0 || dist<0.55){ setNewAnimalTarget(animal); continue; }
        const vx=dx/(dist||1), vz=dz/(dist||1);
        turnToward(animal,Math.atan2(vx,vz),dt,data.species==='horse'?3.4:(data.species==='elephant'?2.2:4.0));
        const desired=data.speed*Math.min(1,dist/2.0);
        data.currentSpeed+=(desired-data.currentSpeed)*Math.min(1,dt*(data.species==='horse'?2.8:2.2));
        const fx=Math.sin(animal.rotation.y), fz=Math.cos(animal.rotation.y);
        const nx=animal.position.x+fx*data.currentSpeed*dt, nz=animal.position.z+fz*data.currentSpeed*dt;
        if(animalCanStep(animal,nx,nz)){ animal.position.x=nx; animal.position.z=nz; }
        else { data.currentSpeed=0; setNewAnimalTarget(animal); }
      }
    }
    const footY=animal.position.y-data.footOffset;
    const surface=getNearbyWalkSurfaceY(animal.position.x,animal.position.z,footY,1.35,2.5);
    animal.position.y+=(surface+data.footOffset-animal.position.y)*Math.min(1,dt*10);
    const moving=data.currentSpeed>0.12;
    data.walkTime+=dt*(moving?4.6+data.currentSpeed:1.0);
    const swing=moving?Math.sin(data.walkTime)*Math.min(0.42,0.18+data.currentSpeed*0.08):Math.sin(data.walkTime)*0.025;
    const legs=data.model.legs||[];
    if(legs[0]) legs[0].rotation.x=swing; if(legs[1]) legs[1].rotation.x=-swing; if(legs[2]) legs[2].rotation.x=-swing; if(legs[3]) legs[3].rotation.x=swing;
    if(data.model.tail) data.model.tail.rotation.y=Math.sin(data.walkTime*0.65)*0.25;
    if(data.model.trunk) data.model.trunk.rotation.x=0.08+Math.sin(data.walkTime*0.7)*0.10;
    if(data.model.ears){ data.model.ears[0].rotation.z=Math.sin(data.walkTime*0.5)*0.07; data.model.ears[1].rotation.z=-Math.sin(data.walkTime*0.5)*0.07; }
  }
}

function updateLassoLine(){
  if(!leashedHorse){ lassoWorldLine.visible=false; return; }
  const pos=lassoWorldLine.geometry.attributes.position;
  pos.setXYZ(0,player.x,player.y-0.35,player.z);
  pos.setXYZ(1,leashedHorse.position.x,leashedHorse.position.y+1.6,leashedHorse.position.z);
  pos.needsUpdate=true;
  lassoWorldLine.geometry.computeBoundingSphere();
  lassoWorldLine.visible=true;
}

function detachAnimalFromChunk(animal){
  const oldChunk=loadedChunks.get(animal.userData.chunkId);
  if(oldChunk){
    const i=oldChunk.animals.indexOf(animal); if(i>=0) oldChunk.animals.splice(i,1); oldChunk.group.remove(animal);
  }
  worldGroup.add(animal);
  if(animal.userData.spawnKey) movedAnimalSpawns.add(animal.userData.spawnKey);
}
function reattachAnimalToCurrentChunk(animal){
  // Player-interacted horses stay persistent instead of being destroyed when a chunk unloads.
  // Only these few horses remain as standalone objects, so memory impact stays tiny.
  if(animal.parent) animal.parent.remove(animal);
  worldGroup.add(animal);
  animal.userData.chunkId=null;
  animal.userData.playerMoved=true;
}
function releaseLeashedHorse(reattach=true){
  if(!leashedHorse) return;
  const horse=leashedHorse; horse.userData.leashed=false; leashedHorse=null; lassoWorldLine.visible=false;
  if(reattach && horse!==mountedHorse) reattachAnimalToCurrentChunk(horse);
}
function toggleHorseLasso(){
  if(leashedHorse){ releaseLeashedHorse(true); updateHUD(); return; }
  const horse=nearestMountableHorse(6.5);
  if(!horse || horse===mountedHorse) return;
  detachAnimalFromChunk(horse); leashedHorse=horse; horse.userData.leashed=true; horse.userData.currentSpeed=0; updateHUD();
}

function nearestMountableHorse(maxDistance=3.2){
  let best=null, bestD=maxDistance;
  for(const a of animals){
    if(a.userData.species!=='horse' || a.userData.mounted) continue;
    const d=Math.hypot(a.position.x-player.x,a.position.z-player.z);
    if(d<bestD){best=a;bestD=d;}
  }
  return best;
}
