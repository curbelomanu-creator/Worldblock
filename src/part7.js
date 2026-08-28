// ---------- PROCEDURAL CHUNKS ----------
function blockMaterial(type){
  if(type==='grass') return [mats.grassSide,mats.grassSide,mats.grassTop,mats.dirt,mats.grassSide,mats.grassSide];
  if(type==='dirt') return mats.dirt;
  if(type==='stone') return mats.stone;
  if(type==='wood') return mats.wood;
  if(type==='leaves') return mats.leaves;
  if(type==='sand') return mats.sand;
  if(type==='fenceX' || type==='fenceZ') return mats.fence;
  return mats.stone;
}

function setProceduralBlock(blocks,x,y,z,type,cid){
  if(isStaticZone(x,z)) return;
  const k=key(x,y,z);
  if(blocks.has(k)) return;
  blocks.set(k,{userData:{type,x,y,z,chunkId:cid,procedural:true}});
}

function createProceduralTree(blocks,cx,cz,gx,gz,groundY,cid,giant=false){
  const h=giant ? 9+Math.floor(hash01(gx,gz,311)*5) : 5+Math.floor(hash01(gx,gz,313)*4);
  const trunkSize=giant?2:1;
  for(let ox=0;ox<trunkSize;ox++) for(let oz=0;oz<trunkSize;oz++){
    for(let y=groundY+1;y<=groundY+h;y++) setProceduralBlock(blocks,gx+ox,y,gz+oz,'wood',cid);
  }
  const top=groundY+h;
  const radius=giant?3:2;
  for(let dy=-2;dy<=2;dy++){
    const rr=Math.max(1,radius-(dy===2?1:0));
    for(let dx=-rr;dx<=rr;dx++) for(let dz=-rr;dz<=rr;dz++){
      if(dx*dx+dz*dz > rr*rr+1) continue;
      setProceduralBlock(blocks,gx+dx,top+dy,gz+dz,'leaves',cid);
    }
  }
}

function createProceduralBoulder(blocks,gx,gz,groundY,cid){
  setProceduralBlock(blocks,gx,groundY+1,gz,'stone',cid);
  if(hash01(gx,gz,401)>0.48) setProceduralBlock(blocks,gx+1,groundY+1,gz,'stone',cid);
  if(hash01(gx,gz,403)>0.70) setProceduralBlock(blocks,gx,groundY+2,gz,'stone',cid);
}

function makeChunkBlockMap(cx,cz){
  const cid=chunkId(cx,cz);
  const blocks=new Map();
  const startX=cx*CHUNK_SIZE, startZ=cz*CHUNK_SIZE;

  for(let lx=0;lx<CHUNK_SIZE;lx++){
    for(let lz=0;lz<CHUNK_SIZE;lz++){
      const x=startX+lx, z=startZ+lz;
      if(isStaticZone(x,z)) continue;
      const h=terrainHeight(x,z);
      const biome=proceduralBiome(x,z);
      let topType='grass';
      if(h<=1 || biome==='dry') topType='sand';
      if(biome==='highlands' && h>=7) topType='stone';
      const bottom=Math.max(-2,h-CHUNK_DEPTH+1);
      for(let y=bottom;y<=h;y++){
        let type='stone';
        if(y===h) type=topType;
        else if(y>=h-2 && topType!=='stone') type='dirt';
        setProceduralBlock(blocks,x,y,z,type,cid);
      }
    }
  }

  // Deterministic trees. Candidates stay away from chunk borders so trees
  // never belong to two chunks and can be unloaded cleanly.
  for(let lx=4;lx<=11;lx+=7){
    for(let lz=4;lz<=11;lz+=7){
      const gx=startX+lx, gz=startZ+lz;
      if(isStaticZone(gx,gz)) continue;
      const dist=Math.hypot(gx,gz);
      const biome=proceduralBiome(gx,gz);
      const ringForest=dist>25 && dist<110;
      const density=ringForest ? 0.82 : (biome==='forest'?0.72:(biome==='plains'?0.28:0.12));
      const roll=hash01(gx,gz,227);
      if(roll>density) continue;
      const h=terrainHeight(gx,gz);
      const slope=Math.max(
        Math.abs(h-terrainHeight(gx+1,gz)),
        Math.abs(h-terrainHeight(gx-1,gz)),
        Math.abs(h-terrainHeight(gx,gz+1)),
        Math.abs(h-terrainHeight(gx,gz-1))
      );
      if(slope>1 || h<=1) continue;
      const giant=ringForest && hash01(gx,gz,229)>0.48;
      createProceduralTree(blocks,cx,cz,gx,gz,h,cid,giant);
    }
  }

  // Sparse rocks add landmarks without adding many draw calls.
  for(const [lx,lz] of [[3,12],[12,3]]){
    const gx=startX+lx, gz=startZ+lz;
    if(isStaticZone(gx,gz) || hash01(gx,gz,397)>0.18) continue;
    const h=terrainHeight(gx,gz);
    const slope=Math.max(Math.abs(h-terrainHeight(gx+1,gz)),Math.abs(h-terrainHeight(gx,gz+1)));
    if(h>1 && slope<=1) createProceduralBoulder(blocks,gx,gz,h,cid);
  }

  // Apply player modifications made in this chunk during the current session.
  const edits=editsByChunk.get(cid);
  if(edits){
    for(const [k,value] of edits){
      if(value===null) blocks.delete(k);
      else{
        const [x,y,z]=k.split(',').map(Number);
        blocks.set(k,{userData:{type:value,x,y,z,chunkId:cid,procedural:true,edited:true}});
      }
    }
  }
  return blocks;
}

function registerChunkOccupancy(chunk){
  for(const [k,proxy] of chunk.blocks){
    if(!occupied.has(k)) occupied.set(k,proxy);
  }
}

function buildChunkVisuals(chunk){
  const byType=new Map();
  for(const proxy of chunk.blocks.values()){
    const type=proxy.userData.type;
    if(!byType.has(type)) byType.set(type,[]);
    byType.get(type).push(proxy);
  }
  const dummy=new THREE.Object3D();
  for(const [type,items] of byType){
    const mesh=new THREE.InstancedMesh(geometryForBlock(type),blockMaterial(type),items.length);
    mesh.castShadow=type!=='leaves';
    mesh.receiveShadow=true;
    mesh.userData.instanceBlocks=items;
    mesh.userData.chunkId=chunk.id;
    for(let i=0;i<items.length;i++){
      const b=items[i].userData;
      dummy.position.set(b.x,b.y,b.z);
      dummy.rotation.set(0,0,0);
      dummy.scale.set(1,1,1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i,dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
    chunk.group.add(mesh);
    chunk.meshes.push(mesh);
    chunkRaycastMeshes.push(mesh);
  }
}
