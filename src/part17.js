canvas.addEventListener('mousedown',e=>{
  if(!pointerLocked) return;

  ray.setFromCamera(new THREE.Vector2(0,0),camera);

  if(selectedItem==='lasso' && e.button===0){ toggleHorseLasso(); return; }

  if(selectedItem === 'sword' && e.button === 0){
    attackAnim=1;
    const targetHits=ray.intersectObjects([...villagerPickables,...trollPickables,...animals.filter(a=>a!==mountedHorse)],true);
    const blockHits=ray.intersectObjects(blockRaycastObjects(),false);
    const nearestBlockDistance=blockHits.length?blockHits[0].distance:Infinity;
    for(const targetHit of targetHits){
      if(targetHit.distance>4.25 || targetHit.distance>=nearestBlockDistance) break;
      const obj=targetHit.object;
      let target=null;
      let cursor=obj;
      while(cursor && !target){
        if(cursor.userData?.kind==='animal') target=cursor;
        cursor=cursor.parent;
      }
      if(!target && obj.userData.trollRef) target=obj.userData.trollRef;
      if(!target && obj.userData.villagerRef) target=obj.userData.villagerRef;
      if(!target || !target.userData.alive || target.userData.dying) continue;

      if(target.userData.kind==='animal'){
        const strength=target.userData.species==='elephant'?1.4:(target.userData.species==='horse'?2.8:3.1);
        applyHitReaction(target,strength,1);
        target.userData.pauseTimer=Math.max(target.userData.pauseTimer||0,0.7);
      }else if(target.userData.kind==='troll'){
        applyHitReaction(target,2.5,1);
      }else{
        applyHitReaction(target,3.8,1);
      }
      updateHUD();
      return;
    }
  }

  if(selectedItem === 'sword' || selectedItem==='lasso') return;

  const hits = ray.intersectObjects(blockRaycastObjects(),false);
  if(!hits.length) return;
  const hit = hits[0];
  const block = blockFromHit(hit);
  if(!block?.userData) return;
  const b=block.userData;

  if(e.button === 0){
    if(b.y > -2){
      if(b.procedural) setChunkEdit(b.x,b.y,b.z,null);
      else removeBlock(block);
    }
  } else if(e.button === 2){
    const n = hit.face.normal.clone();
    const px=Math.round(b.x+n.x), py=Math.round(b.y+n.y), pz=Math.round(b.z+n.z);
    const blockBox = new THREE.Box3(
      new THREE.Vector3(px-.5,py-.5,pz-.5),
      new THREE.Vector3(px+.5,py+.5,pz+.5)
    );
    if(!playerBoxAt(player).intersectsBox(blockBox) && !occupied.has(key(px,py,pz))){
      let placeType=selectedItem;
      if(selectedItem==='fence') placeType=Math.abs(Math.sin(yaw))>Math.abs(Math.cos(yaw))?'fenceZ':'fenceX';
      if(isStaticZone(px,pz)) addBlock(px,py,pz,placeType);
      else setChunkEdit(px,py,pz,placeType);
    }
  }
});

function resize(){
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w,h,false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  viewCamera.aspect = w/h;
  viewCamera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
