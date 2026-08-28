function startDeath(entity){
  const data=entity?.userData;
  if(!data || data.dying) return;
  data.alive=false;
  data.dying=true;
  data.health=0;
  data.deathTimer=0;
  data.deathStartZ=entity.rotation.z || 0;
  const awayX=entity.position.x-player.x;
  const awayZ=entity.position.z-player.z;
  data.deathSide=(awayX*Math.cos(entity.rotation.y)-awayZ*Math.sin(entity.rotation.y))>=0?-1:1;
  data.currentSpeed=0;
  data.rideSpeed=0;
  data.pauseTimer=999;

  // A horse that dies can no longer remain tied to the player.
  if(entity===leashedHorse){
    leashedHorse=null;
    lassoWorldLine.visible=false;
    data.leashed=false;
  }
  if(entity===mountedHorse){
    mountedHorse=null;
    data.mounted=false;
  }
  if(data.kind==='animal' && data.spawnKey) deadAnimalSpawns.add(data.spawnKey);
}

function applyHitReaction(entity,strength=3.2,damage=1){
  if(!entity || !entity.userData.alive || entity.userData.dying) return;
  const data=entity.userData;
  const away=new THREE.Vector3(entity.position.x-player.x,0,entity.position.z-player.z);
  if(away.lengthSq()<0.001){
    camera.getWorldDirection(away);
    away.y=0;
  }
  away.normalize();
  data.knockbackX=away.x*strength;
  data.knockbackZ=away.z*strength;
  data.hitTimer=0.38;
  data.pauseTimer=Math.max(data.pauseTimer||0,0.45);
  data.health=Math.max(0,(data.health ?? data.maxHealth ?? 1)-damage);
  if(data.health<=0) startDeath(entity);
}

function updateDeathAnimation(entity,dt){
  const data=entity.userData;
  if(!data.dying) return false;
  data.deathTimer+=dt;

  // Keep a little momentum from the final hit while the creature begins to fall.
  if(data.deathTimer<0.34){
    entity.position.x+=data.knockbackX*dt;
    entity.position.z+=data.knockbackZ*dt;
    const damping=Math.exp(-7.5*dt);
    data.knockbackX*=damping;
    data.knockbackZ*=damping;
  }

  const fallDuration=0.72;
  const lieDuration=2.65;
  const p=THREE.MathUtils.clamp(data.deathTimer/fallDuration,0,1);
  const eased=p*p*(3-2*p);
  const targetRot=data.deathSide*Math.PI*0.5;
  entity.rotation.z=THREE.MathUtils.lerp(data.deathStartZ,targetRot,eased);

  // Keep the body's pivot touching the local terrain during the fall.
  const footOffset=data.footOffset ?? 0.1;
  const footY=entity.position.y-footOffset;
  const surface=getNearbyWalkSurfaceY(entity.position.x,entity.position.z,footY,1.35,3.2);
  entity.position.y+=(surface+footOffset-entity.position.y)*Math.min(1,dt*10);

  if(data.deathTimer>=fallDuration+lieDuration){
    data.dying=false;
    if(data.kind==='animal'){
      if(entity.parent) entity.parent.remove(entity);
      const i=animals.indexOf(entity); if(i>=0) animals.splice(i,1);
    }else{
      scene.remove(entity);
    }
    return true;
  }
  return false;
}

function updateGroundAndHit(entity,dt,footOffset){
  const data=entity.userData;
  if(data.hitTimer>0){
    data.hitTimer=Math.max(0,data.hitTimer-dt);
    entity.position.x+=data.knockbackX*dt;
    entity.position.z+=data.knockbackZ*dt;
    const damping=Math.exp(-7*dt);
    data.knockbackX*=damping;
    data.knockbackZ*=damping;
  }
  const footY=entity.position.y-footOffset;
  const surface=getNearbyWalkSurfaceY(entity.position.x,entity.position.z,footY,1.05,3.2);
  let targetY=surface+footOffset;
  if(data.hitTimer>0){
    const phase=1-data.hitTimer/0.38;
    targetY+=Math.sin(phase*Math.PI)*(data.kind==='troll'?0.20:0.14);
    entity.rotation.z=Math.sin(phase*Math.PI)*(data.kind==='troll'?0.08:0.14);
  }else{
    entity.rotation.z*=Math.exp(-10*dt);
  }
  entity.position.y+=(targetY-entity.position.y)*Math.min(1,dt*12);
}
