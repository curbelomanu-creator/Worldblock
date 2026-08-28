const clock = new THREE.Clock();

function updatePlayer(dt){
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if(forward.lengthSq() === 0) forward.set(0,0,-1);
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

  const move = new THREE.Vector3();
  let moveIntensity = 1;

  if(keys['KeyW']) move.add(forward);
  if(keys['KeyS']) move.sub(forward);
  if(keys['KeyD']) move.add(right);
  if(keys['KeyA']) move.sub(right);

  if(mobileControlsActive){
    const touchStrength=Math.min(1,Math.hypot(mobileMove.x,mobileMove.y));
    if(touchStrength>0.04){
      move.addScaledVector(right,mobileMove.x);
      move.addScaledVector(forward,-mobileMove.y);
      moveIntensity=touchStrength;
    }
  }

  if(move.lengthSq() > 0) move.normalize();

  if(mountedHorse){
    const horse=mountedHorse, data=horse.userData;
    const ridingSpeed=9.6;
    if(horseJumpQueued && data.rideGrounded){ data.rideVelocityY=7.2; data.rideGrounded=false; horseJumpQueued=false; }
    if(move.lengthSq()>0){
      turnToward(horse,Math.atan2(move.x,move.z),dt,5.2);
      const targetRideSpeed=ridingSpeed*moveIntensity;
      data.rideSpeed+=(targetRideSpeed-data.rideSpeed)*Math.min(1,dt*3.6);
      const fx=Math.sin(horse.rotation.y), fz=Math.cos(horse.rotation.y);
      const nx=horse.position.x+fx*data.rideSpeed*dt, nz=horse.position.z+fz*data.rideSpeed*dt;
      if(!data.rideGrounded || animalCanStep(horse,nx,nz)){ horse.position.x=nx; horse.position.z=nz; }
      data.walkTime+=dt*(data.rideGrounded?5.0+4.0*moveIntensity:5.0);
      const swing=Math.sin(data.walkTime)*(data.rideGrounded?0.48*moveIntensity:0.22), legs=data.model.legs||[];
      if(legs[0]) legs[0].rotation.x=swing; if(legs[1]) legs[1].rotation.x=-swing; if(legs[2]) legs[2].rotation.x=-swing; if(legs[3]) legs[3].rotation.x=swing;
    }else{
      data.rideSpeed*=Math.exp(-5*dt);
      for(const leg of (data.model.legs||[])) leg.rotation.x*=Math.exp(-8*dt);
    }

    const footY=horse.position.y-data.footOffset;
    const groundSurface=getNearbyWalkSurfaceY(horse.position.x,horse.position.z,footY,1.55,3.4);
    const groundY=groundSurface+data.footOffset;
    if(!data.rideGrounded){
      data.rideVelocityY-=gravity*0.82*dt; horse.position.y+=data.rideVelocityY*dt;
      if(horse.position.y<=groundY && data.rideVelocityY<=0){ horse.position.y=groundY; data.rideVelocityY=0; data.rideGrounded=true; }
    }else horse.position.y+=(groundY-horse.position.y)*Math.min(1,dt*13);

    const horseForward=new THREE.Vector3(Math.sin(horse.rotation.y),0,Math.cos(horse.rotation.y));
    player.set(horse.position.x-horseForward.x*1.08,horse.position.y+3.78,horse.position.z-horseForward.z*1.08);
    velocityY=0; onGround=data.rideGrounded;
    camera.position.copy(player); camera.rotation.order='YXZ'; camera.rotation.y=yaw; camera.rotation.x=pitch;
    streamChunksAround(player.x,player.z);
    return;
  }

  if(move.lengthSq() > 0) move.multiplyScalar(moveSpeed * dt * moveIntensity);

  let attempt = player.clone();
  attempt.x += move.x;
  if(!solidCollision(attempt)) player.x = attempt.x;

  attempt = player.clone();
  attempt.z += move.z;
  if(!solidCollision(attempt)) player.z = attempt.z;

  velocityY -= gravity * dt;
  attempt = player.clone();
  attempt.y += velocityY * dt;
  if(!solidCollision(attempt)){
    player.y = attempt.y;
    onGround = false;
  } else {
    if(velocityY < 0) onGround = true;
    velocityY = 0;
  }

  if(player.y < -10){
    player.copy(SPAWN_POSITION);
    yaw = 0;
    pitch = 0;
    velocityY = 0;
  }

  camera.position.copy(player);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
  streamChunksAround(player.x,player.z);
}

function updateViewModel(dt){
  const moving=keys['KeyW']||keys['KeyA']||keys['KeyS']||keys['KeyD']||(mobileControlsActive&&Math.hypot(mobileMove.x,mobileMove.y)>0.08);
  const t=performance.now()*0.008;
  const bobY=moving?Math.sin(t)*0.014:0;
  const bobX=moving?Math.cos(t*0.5)*0.010:0;
  armGroup.position.set(bobX,bobY,0);
  if(attackAnim>0){
    attackAnim=Math.max(0,attackAnim-dt*5.8);
    const p=1-attackAnim;
    const swing=Math.sin(p*Math.PI);
    armGroup.rotation.x=-swing*0.30;
    armGroup.rotation.y=swing*0.16;
    armGroup.rotation.z=-swing*0.48;
  }else{
    armGroup.rotation.x*=Math.exp(-12*dt);
    armGroup.rotation.y*=Math.exp(-12*dt);
    armGroup.rotation.z*=Math.exp(-12*dt);
  }
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .035);
  updatePlayer(dt);
  updateVillagers(dt);
  updateTrolls(dt);
  updateAnimals(dt);
  updateLassoLine();
  updateViewModel(dt);
  renderer.autoClear=true;
  renderer.render(scene, camera);
  renderer.autoClear=false;
  renderer.clearDepth();
  renderer.render(viewScene, viewCamera);
  renderer.autoClear=true;
}
streamChunksAround(player.x,player.z,true);
updateHUD();
animate();
