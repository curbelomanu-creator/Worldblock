function createVillager(x,y,z,axis='x',min=-4,max=4,speed=1){
  const group=new THREE.Group();
  const footOffset=0.15;
  group.position.set(x,getHighestWalkSurfaceY(x,z,12)+footOffset,z);
  const robe=makePart(0.9,1.2,0.6,mats.villagerRobe,0,0.9,0);
  const head=makePart(0.7,0.7,0.7,mats.villagerSkin,0,1.9,0);
  const hair=makePart(0.72,0.2,0.72,mats.villagerHair,0,2.25,0);
  const nose=makePart(0.12,0.18,0.18,mats.villagerSkin,0,1.85,0.42);
  const armL=makePart(0.18,0.9,0.18,mats.villagerSkin,-0.55,0.95,0);
  const armR=makePart(0.18,0.9,0.18,mats.villagerSkin,0.55,0.95,0);
  const legL=makePart(0.2,0.7,0.2,mats.wood,-0.18,0.2,0);
  const legR=makePart(0.2,0.7,0.2,mats.wood,0.18,0.2,0);
  for(const part of [robe,head,hair,nose,armL,armR,legL,legR]){
    part.userData.villagerRef=group;
    group.add(part);
    villagerPickables.push(part);
  }
  group.userData={alive:true,dying:false,kind:'villager',axis,originX:x,originZ:z,min,max,dir:1,speed,
    walkTime:Math.random()*10,pauseTimer:Math.random()*0.6,knockbackX:0,knockbackZ:0,hitTimer:0,
    footOffset,health:3,maxHealth:3,deathTimer:0,deathSide:1,deathStartZ:0,limbs:{armL,armR,legL,legR}};
  scene.add(group);
  villagers.push(group);
}

function createTroll(x,y,z,axis='x',min=-5,max=5,speed=0.65){
  const group=new THREE.Group();
  const footOffset=0.16;
  group.position.set(x,getHighestWalkSurfaceY(x,z,14)+footOffset,z);
  const body=makePart(1.6,1.8,1.0,mats.trollSkin,0,1.9,0);
  const belly=makePart(1.0,0.8,0.9,mats.trollBelly,0,1.5,0.1);
  const head=makePart(1.2,1.0,1.1,mats.trollSkin,0,3.2,0);
  const hair=makePart(1.25,0.25,1.15,mats.trollHair,0,3.75,0);

  const leftArmPivot=new THREE.Group();
  leftArmPivot.position.set(-1.0,2.65,0);
  const armL=makePart(0.35,1.7,0.35,mats.trollSkin,0,-0.85,0);
  leftArmPivot.add(armL);
  group.add(leftArmPivot);

  const rightArmPivot=new THREE.Group();
  rightArmPivot.position.set(1.0,2.65,0);
  const armR=makePart(0.35,1.7,0.35,mats.trollSkin,0,-0.85,0);
  rightArmPivot.add(armR);
  const clubGroup=new THREE.Group();
  clubGroup.position.set(0,-1.60,0);
  clubGroup.rotation.z=-0.48;
  const clubHandle=makePart(0.22,1.8,0.22,mats.trollClubWood,0,0.55,0);
  const clubHead=makePart(0.75,0.85,0.75,mats.trollClubMetal,0,1.55,0);
  clubGroup.add(clubHandle,clubHead);
  rightArmPivot.add(clubGroup);
  group.add(rightArmPivot);

  const legL=makePart(0.45,1.4,0.45,mats.trollSkin,-0.4,0.6,0);
  const legR=makePart(0.45,1.4,0.45,mats.trollSkin,0.4,0.6,0);
  for(const part of [body,belly,head,hair,armL,armR,clubHandle,clubHead,legL,legR]){
    part.userData.trollRef=group;
    trollPickables.push(part);
  }
  group.add(body,belly,head,hair,legL,legR);
  group.scale.setScalar(1.55);
  group.userData={alive:true,dying:false,kind:'troll',axis,originX:x,originZ:z,min,max,dir:1,speed,
    walkTime:Math.random()*10,pauseTimer:Math.random()*0.5,knockbackX:0,knockbackZ:0,hitTimer:0,
    footOffset,health:6,maxHealth:6,deathTimer:0,deathSide:1,deathStartZ:0,limbs:{leftArmPivot,rightArmPivot,legL,legR,clubGroup}};
  scene.add(group);
  trolls.push(group);
}

createVillager(-10,4,0,'z',-6,6,0.9);
createVillager(10,4,0,'z',-6,6,1.0);
createVillager(0,4,-8,'x',-7,7,0.9);
createVillager(0,4,8,'x',-7,7,1.1);
createVillager(-6,4,12,'x',-3,3,0.8);
createVillager(8,4,12,'x',-3,3,0.85);

createTroll(-29,4,-10,'z',-8,18,0.58);
createTroll(29,4,8,'z',-18,8,0.60);
createTroll(0,4,-30,'x',-14,14,0.63);
createTroll(-12,4,30,'x',-10,16,0.56);
createTroll(12,4,30,'x',-16,10,0.56);

function updatePatrolMovement(entity,dt){
  const data=entity.userData;
  const dirX=data.axis==='x'?data.dir:0;
  const dirZ=data.axis==='z'?data.dir:0;
  turnToward(entity,Math.atan2(dirX,dirZ),dt,data.kind==='troll'?4.5:7.5);
  let moving=false;
  if(data.pauseTimer>0){
    data.pauseTimer=Math.max(0,data.pauseTimer-dt);
  }else if(data.hitTimer<=0){
    moving=true;
    if(data.axis==='x'){
      entity.position.x+=data.dir*data.speed*dt;
      if(entity.position.x>data.originX+data.max || entity.position.x<data.originX+data.min){
        entity.position.x=THREE.MathUtils.clamp(entity.position.x,data.originX+data.min,data.originX+data.max);
        data.dir*=-1; data.pauseTimer=0.55+Math.random()*0.65; moving=false;
      }
    }else{
      entity.position.z+=data.dir*data.speed*dt;
      if(entity.position.z>data.originZ+data.max || entity.position.z<data.originZ+data.min){
        entity.position.z=THREE.MathUtils.clamp(entity.position.z,data.originZ+data.min,data.originZ+data.max);
        data.dir*=-1; data.pauseTimer=0.55+Math.random()*0.65; moving=false;
      }
    }
  }
  return moving;
}

function updateVillagers(dt){
  for(const villager of villagers){
    const data=villager.userData;
    if(data.dying){ updateDeathAnimation(villager,dt); continue; }
    if(!data.alive) continue;
    const moving=updatePatrolMovement(villager,dt);
    updateGroundAndHit(villager,dt,data.footOffset);
    data.walkTime+=dt*(moving?7:2);
    const swing=moving?Math.sin(data.walkTime)*0.42:Math.sin(data.walkTime)*0.04;
    data.limbs.armL.rotation.x=swing;
    data.limbs.armR.rotation.x=-swing;
    data.limbs.legL.rotation.x=-swing;
    data.limbs.legR.rotation.x=swing;
  }
}

function updateTrolls(dt){
  for(const troll of trolls){
    const data=troll.userData;
    if(data.dying){ updateDeathAnimation(troll,dt); continue; }
    if(!data.alive) continue;
    const moving=updatePatrolMovement(troll,dt);
    updateGroundAndHit(troll,dt,data.footOffset);
    data.walkTime+=dt*(moving?4.7:1.8);
    const swing=moving?Math.sin(data.walkTime)*0.34:Math.sin(data.walkTime)*0.045;
    data.limbs.leftArmPivot.rotation.x=swing*0.7;
    data.limbs.rightArmPivot.rotation.x=-0.20-swing*0.9;
    data.limbs.rightArmPivot.rotation.z=0.05+Math.sin(data.walkTime*0.5)*0.05;
    data.limbs.clubGroup.rotation.y=Math.sin(data.walkTime*0.7)*0.10;
    data.limbs.legL.rotation.x=-swing;
    data.limbs.legR.rotation.x=swing;
  }
}

// Player
