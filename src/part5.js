function makeDecorBox(parent,w,h,d,material,x,y,z,rotY=0){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.rotation.y=rotY;
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  parent.add(mesh);
  return mesh;
}

function buildLanternPost(x,z,rot=0){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot;
  makeDecorBox(g,0.18,2.35,0.18,detailMats.darkWood,0,4.68,0);
  makeDecorBox(g,0.92,0.14,0.16,detailMats.darkWood,0.34,5.72,0);
  makeDecorBox(g,0.10,0.48,0.10,detailMats.iron,0.72,5.43,0);
  makeDecorBox(g,0.30,0.38,0.30,detailMats.lantern,0.72,5.18,0);
  makeDecorBox(g,0.36,0.07,0.36,detailMats.iron,0.72,4.98,0);
  decorGroup.add(g);
}

function buildBench(x,z,rot=0){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot;
  makeDecorBox(g,1.8,0.18,0.52,mats.planks,0,3.82,0);
  makeDecorBox(g,1.8,0.16,0.18,mats.planks,0,4.30,0.20);
  makeDecorBox(g,0.14,0.62,0.14,detailMats.darkWood,-0.65,3.58,0);
  makeDecorBox(g,0.14,0.62,0.14,detailMats.darkWood,0.65,3.58,0);
  decorGroup.add(g);
}

function buildCrates(x,z,rot=0){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot;
  makeDecorBox(g,0.85,0.85,0.85,mats.planks,0,3.93,0);
  makeDecorBox(g,0.72,0.72,0.72,mats.wood,0.55,3.86,0.12);
  makeDecorBox(g,0.58,0.58,0.58,mats.planks,0.17,4.64,0.02);
  decorGroup.add(g);
}

function buildMarketStall(x,z,rot=0,alt=false){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot;
  for(const px of [-1.25,1.25]) for(const pz of [-0.72,0.72])
    makeDecorBox(g,0.14,2.35,0.14,detailMats.darkWood,px,4.65,pz);
  makeDecorBox(g,2.75,0.20,1.55,mats.planks,0,4.25,0);
  for(let i=-2;i<=2;i++){
    const canopyMat=((i+(alt?1:0))&1)?detailMats.clothRed:detailMats.clothGold;
    makeDecorBox(g,0.56,0.13,1.85,canopyMat,i*0.56,5.90,0);
  }
  makeDecorBox(g,0.50,0.32,0.50,mats.wood,-0.72,4.53,0.08);
  makeDecorBox(g,0.42,0.28,0.42,mats.wood,0.10,4.50,-0.12);
  makeDecorBox(g,0.46,0.30,0.46,mats.wood,0.68,4.51,0.13);
  decorGroup.add(g);
}

function buildWell(x,z){
  const g=new THREE.Group(); g.position.set(x,0,z);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    makeDecorBox(g,0.72,0.55,0.45,mats.stone,Math.cos(a)*1.02,3.78,Math.sin(a)*1.02,-a);
  }
  makeDecorBox(g,0.18,2.15,0.18,detailMats.darkWood,-1.10,4.80,0);
  makeDecorBox(g,0.18,2.15,0.18,detailMats.darkWood,1.10,4.80,0);
  makeDecorBox(g,2.55,0.18,0.20,detailMats.darkWood,0,5.75,0);
  makeDecorBox(g,2.65,0.16,1.45,mats.roof,0,6.03,0,0.02);
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.10,2.05,8),detailMats.darkWood);
  axle.rotation.z=Math.PI/2; axle.position.set(0,5.12,0); axle.castShadow=true; g.add(axle);
  decorGroup.add(g);
}

function buildBanner(x,y,z,rotY=0,material=detailMats.clothBlue){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY;
  makeDecorBox(g,0.08,2.10,1.05,material,0,0,0);
  makeDecorBox(g,0.14,2.45,0.14,detailMats.iron,0,0.12,-0.62);
  decorGroup.add(g);
}

function buildFlowerPatch(x,z,variant=0){
  const flowerMat=variant%2?detailMats.flowerGold:detailMats.flowerRed;
  const offsets=[[-.45,-.25],[.05,.18],[.42,-.10],[-.12,.48],[.34,.48]];
  for(const [ox,oz] of offsets){
    makeDecorBox(decorGroup,0.06,0.36,0.06,detailMats.stem,x+ox,3.70,z+oz);
    makeDecorBox(decorGroup,0.18,0.16,0.18,flowerMat,x+ox,3.92,z+oz);
  }
}

function addVillageDetails(){
  for(const [x,z,r] of [[-8,-10,0],[8,-10,Math.PI],[-8,10,0],[8,10,Math.PI],[0,-7,Math.PI/2],[0,7,-Math.PI/2]]) buildLanternPost(x,z,r);
  buildBench(-5,1,Math.PI/2);
  buildBench(5,-1,-Math.PI/2);
  buildWell(0,-5);
  buildMarketStall(-4,5,0,false);
  buildMarketStall(4,5,Math.PI,true);
  buildCrates(-18,-7,0.15);
  buildCrates(17,7,-0.25);
  buildCrates(-13,18,0.4);
  buildBanner(-7.05,8.2,-21.42,0,detailMats.clothRed);
  buildBanner(7.05,8.2,-21.42,0,detailMats.clothBlue);
  buildBanner(0,12.0,10.40,0,detailMats.clothGold);
  buildFlowerPatch(-18,-1,0);
  buildFlowerPatch(18,-1,1);
  buildFlowerPatch(-18,13,1);
  buildFlowerPatch(18,13,0);
}

function buildOpenGateDoors(){
  const makeDoorLeaf=(hingeX,angle,side)=>{
    const pivot=new THREE.Group();
    pivot.position.set(hingeX,6.5,-21.55);
    pivot.rotation.y=angle;
    const door=new THREE.Mesh(new THREE.BoxGeometry(4.2,5.7,0.32),mats.wood);
    door.position.x=side*2.1;
    door.castShadow=true;
    door.receiveShadow=true;
    pivot.add(door);
    for(let y=-1.7;y<=1.7;y+=1.7){
      const brace=new THREE.Mesh(new THREE.BoxGeometry(4.25,0.18,0.40),mats.trollClubMetal);
      brace.position.set(side*2.1,y,0);
      brace.castShadow=true;
      pivot.add(brace);
    }
    scene.add(pivot);
  };
  makeDoorLeaf(-5.7,-1.13,-1);
  makeDoorLeaf(5.7,1.13,1);
}
