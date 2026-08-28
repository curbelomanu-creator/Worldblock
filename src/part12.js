function toggleHorseMount(){
  if(mountedHorse){
    const horse=mountedHorse;
    horse.userData.mounted=false;
    mountedHorse=null;
    const side=new THREE.Vector3(Math.cos(horse.rotation.y),0,-Math.sin(horse.rotation.y));
    const dx=horse.position.x+side.x*1.7, dz=horse.position.z+side.z*1.7;
    const surface=getHighestWalkSurfaceY(dx,dz,horse.position.y+4);
    player.set(dx,surface+eyeHeight,dz);

    reattachAnimalToCurrentChunk(horse);
    updateHUD();
    return;
  }
  const horse=nearestMountableHorse();
  if(!horse) return;

  if(leashedHorse===horse) releaseLeashedHorse(false);
  else detachAnimalFromChunk(horse);
  mountedHorse=horse;
  horse.userData.mounted=true;
  horse.userData.wanderTimer=999;
  horse.userData.rideVelocityY=0;
  horse.userData.rideGrounded=true;
  horse.userData.currentSpeed=0;
  horse.userData.rideSpeed=0;
  updateHUD();
}

// Villagers and trolls
