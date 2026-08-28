function generateChunk(cx,cz){
  const id=chunkId(cx,cz);
  if(loadedChunks.has(id)) return;
  const chunk={id,cx,cz,group:new THREE.Group(),blocks:makeChunkBlockMap(cx,cz),meshes:[],animals:[]};
  chunk.group.userData.chunkId=id;
  registerChunkOccupancy(chunk);
  buildChunkVisuals(chunk);
  worldGroup.add(chunk.group);
  loadedChunks.set(id,chunk);
  spawnChunkAnimals(chunk);
}

function unloadChunk(id){
  const chunk=loadedChunks.get(id);
  if(!chunk) return;
  for(const [k,proxy] of chunk.blocks){
    if(occupied.get(k)===proxy) occupied.delete(k);
  }
  for(const mesh of chunk.meshes){
    const i=chunkRaycastMeshes.indexOf(mesh);
    if(i>=0) chunkRaycastMeshes.splice(i,1);
  }
  for(const animal of chunk.animals || []){
    const i=animals.indexOf(animal);
    if(i>=0) animals.splice(i,1);
  }
  worldGroup.remove(chunk.group);
  chunk.group.clear();
  loadedChunks.delete(id);
}

function rebuildChunk(id){
  const chunk=loadedChunks.get(id);
  if(!chunk) return;
  const {cx,cz}=chunk;
  unloadChunk(id);
  generateChunk(cx,cz);
}

function setChunkEdit(x,y,z,value){
  const id=blockChunkId(x,z);
  let edits=editsByChunk.get(id);
  if(!edits){ edits=new Map(); editsByChunk.set(id,edits); }
  edits.set(key(x,y,z),value);
  rebuildChunk(id);
}

function streamChunksAround(x,z,force=false){
  const pcx=chunkCoord(x), pcz=chunkCoord(z);
  if(!force && pcx===lastPlayerChunkX && pcz===lastPlayerChunkZ) return;
  lastPlayerChunkX=pcx; lastPlayerChunkZ=pcz;
  const wanted=new Set();
  for(let dx=-CHUNK_RADIUS;dx<=CHUNK_RADIUS;dx++){
    for(let dz=-CHUNK_RADIUS;dz<=CHUNK_RADIUS;dz++){
      const cx=pcx+dx, cz=pcz+dz;
      const id=chunkId(cx,cz);
      wanted.add(id);
      if(!loadedChunks.has(id)) generateChunk(cx,cz);
    }
  }
  for(const id of [...loadedChunks.keys()]){
    if(!wanted.has(id)) unloadChunk(id);
  }
  updateHUD?.();
}

function blockRaycastObjects(){ return [...cubes,...chunkRaycastMeshes]; }
function blockFromHit(hit){
  if(hit.object?.isInstancedMesh && Number.isInteger(hit.instanceId)){
    return hit.object.userData.instanceBlocks?.[hit.instanceId] || null;
  }
  return hit.object || null;
}

// Water plane
const waterGeo = new THREE.PlaneGeometry(5000,5000);
const waterMat = new THREE.MeshPhongMaterial({
  color:0x4aa8d8, transparent:true, opacity:.58, shininess:100, side:THREE.DoubleSide
});
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI/2;
water.position.y = 0.25;
scene.add(water);
