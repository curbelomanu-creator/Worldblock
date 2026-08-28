function isStaticZone(x,z){
  if(Math.abs(x)<=24 && Math.abs(z)<=24) return true;
  if(Math.abs(x)<=4 && z<=-22 && z>=-44) return true;
  if(Math.abs(x+29)<=2 && z>=-20 && z<=10) return true;
  if(Math.abs(x-29)<=2 && z>=-12 && z<=18) return true;
  if(Math.abs(z+30)<=2 && x>=-16 && x<=16) return true;
  if(Math.abs(z-30)<=2 && x>=-24 && x<=24) return true;
  return false;
}

function mat(color){ return new THREE.MeshLambertMaterial({color}); }
const mats = {
  grassTop: mat(0x6aaa3b),
  grassSide: mat(0x5f8c35),
  dirt: mat(0x8a5a34),
  stone: mat(0x8b8b8b),
  wood: mat(0x8b5a2b),
  planks: mat(0xb88a54),
  roof: mat(0x7b3f1d),
  leaves: new THREE.MeshLambertMaterial({color:0x3d7d32, transparent:true, opacity:.94}),
  sand: mat(0xd5c388),
  path: mat(0x9a8b72),
  glass: new THREE.MeshLambertMaterial({color:0xcfefff, transparent:true, opacity:.65}),
  villagerRobe: mat(0x7b5b95),
  villagerSkin: mat(0xd7b48a),
  villagerHair: mat(0x5c3b20),
  trollSkin: mat(0x6e9b56),
  trollBelly: mat(0x7f6a4a),
  trollHair: mat(0x3a2b1b),
  trollClubWood: mat(0x6a4121),
  trollClubMetal: mat(0x747474),
  horseBrown: mat(0x8b5a35),
  horseDark: mat(0x3e2a1d),
  horseCream: mat(0xd8c09a),
  cowWhite: mat(0xe8e6df),
  cowDark: mat(0x3b332d),
  giraffeGold: mat(0xd6a34b),
  giraffeSpot: mat(0x754322),
  lionGold: mat(0xb88739),
  lionMane: mat(0x6a3f20),
  elephantGray: mat(0x85898b),
  elephantTusk: mat(0xe8dfc8),
  fence: mat(0x80562f),
  swordBlade: mat(0xcfd7de),
  swordHandle: mat(0x5d3a1a)
};
// fallback in case typo path above executes unexpectedly
mats.glass = new THREE.MeshLambertMaterial({color:0xcfefff, transparent:true, opacity:.65});

const detailMats = {
  iron: mat(0x4e5154),
  darkWood: mat(0x5a351d),
  clothRed: mat(0x8f2f2f),
  clothGold: mat(0xc59b43),
  clothBlue: mat(0x355a86),
  lantern: new THREE.MeshBasicMaterial({color:0xffc45b}),
  flowerRed: new THREE.MeshLambertMaterial({color:0xb93d3d}),
  flowerGold: new THREE.MeshLambertMaterial({color:0xe0b84c}),
  stem: new THREE.MeshLambertMaterial({color:0x4f7c39})
};

function addBlock(x,y,z,type='grass'){
  x = Math.round(x); y = Math.round(y); z = Math.round(z);
  if (occupied.has(key(x,y,z))) return;

  let materials;
  if(type === 'grass'){
    materials = [mats.grassSide,mats.grassSide,mats.grassTop,mats.dirt,mats.grassSide,mats.grassSide];
  } else if(type === 'dirt') materials = mats.dirt;
  else if(type === 'stone') materials = mats.stone;
  else if(type === 'wood') materials = mats.wood;
  else if(type === 'planks') materials = mats.planks;
  else if(type === 'roof') materials = mats.roof;
  else if(type === 'leaves') materials = mats.leaves;
  else if(type === 'sand') materials = mats.sand;
  else if(type === 'path') materials = mats.path;
  else if(type === 'glass') materials = mats.glass;
  else if(type === 'fenceX' || type === 'fenceZ') materials = mats.fence;
  else materials = mats.stone;

  const mesh = new THREE.Mesh(geometryForBlock(type), materials);
  mesh.position.set(x,y,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = {type, x,y,z};
  worldGroup.add(mesh);
  cubes.push(mesh);
  occupied.set(key(x,y,z), mesh);
}

function removeBlock(mesh){
  if(!mesh) return;
  occupied.delete(key(mesh.userData.x, mesh.userData.y, mesh.userData.z));
  const i = cubes.indexOf(mesh);
  if(i >= 0) cubes.splice(i,1);
  worldGroup.remove(mesh);
}

function clearBox(x1,y1,z1,x2,y2,z2){
  for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++){
    for(let y=Math.min(y1,y2); y<=Math.max(y1,y2); y++){
      for(let z=Math.min(z1,z2); z<=Math.max(z1,z2); z++){
        const cube = occupied.get(key(x,y,z));
        if(cube) removeBlock(cube);
      }
    }
  }
}
