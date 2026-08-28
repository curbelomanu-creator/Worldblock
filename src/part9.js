// ---------- PROCEDURAL FAUNA ----------
const animals=[];
const movedAnimalSpawns=new Set();
const deadAnimalSpawns=new Set();
let mountedHorse=null;
let leashedHorse=null;
let horseJumpQueued=false;
const lassoWorldMaterial=new THREE.LineBasicMaterial({color:0xb99662});
const lassoWorldGeometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
const lassoWorldLine=new THREE.Line(lassoWorldGeometry,lassoWorldMaterial);
lassoWorldLine.visible=false;
lassoWorldLine.frustumCulled=false;
scene.add(lassoWorldLine);

function animalPart(w,h,d,material,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  return mesh;
}

function addAnimalParts(group,parts){
  for(const part of parts) group.add(part);
}

function createHorseModel(){
  const g=new THREE.Group();
  const body=animalPart(1.55,0.85,2.15,mats.horseBrown,0,1.25,0);
  const neck=animalPart(0.58,1.25,0.62,mats.horseBrown,0,2.0,0.72);
  neck.rotation.x=-0.18;
  const head=animalPart(0.68,0.62,0.9,mats.horseBrown,0,2.62,1.02);
  const muzzle=animalPart(0.52,0.42,0.55,mats.horseCream,0,2.48,1.62);
  const mane=animalPart(0.18,1.35,0.32,mats.horseDark,0,2.15,0.42);
  const tail=animalPart(0.22,1.05,0.22,mats.horseDark,0,1.25,-1.35); tail.rotation.x=-0.38;
  const legs=[
    animalPart(0.24,1.25,0.24,mats.horseDark,-0.52,0.52,0.72),
    animalPart(0.24,1.25,0.24,mats.horseDark,0.52,0.52,0.72),
    animalPart(0.24,1.25,0.24,mats.horseDark,-0.52,0.52,-0.72),
    animalPart(0.24,1.25,0.24,mats.horseDark,0.52,0.52,-0.72)
  ];
  addAnimalParts(g,[body,neck,head,muzzle,mane,tail,...legs]);
  return {group:g,legs,tail,head,neck,muzzle};
}

function createCowModel(){
  const g=new THREE.Group();
  const body=animalPart(1.65,1.0,2.1,mats.cowWhite,0,1.15,0);
  const patch=animalPart(0.65,0.55,2.14,mats.cowDark,-0.35,1.25,0.05);
  const head=animalPart(0.82,0.75,0.82,mats.cowWhite,0,1.65,1.36);
  const muzzle=animalPart(0.66,0.36,0.42,mats.horseCream,0,1.48,1.92);
  const legs=[
    animalPart(0.25,0.95,0.25,mats.cowDark,-0.55,0.45,0.68),
    animalPart(0.25,0.95,0.25,mats.cowDark,0.55,0.45,0.68),
    animalPart(0.25,0.95,0.25,mats.cowDark,-0.55,0.45,-0.68),
    animalPart(0.25,0.95,0.25,mats.cowDark,0.55,0.45,-0.68)
  ];
  addAnimalParts(g,[body,patch,head,muzzle,...legs]);
  return {group:g,legs};
}

function createGiraffeModel(){
  const g=new THREE.Group();
  const body=animalPart(1.35,0.9,1.9,mats.giraffeGold,0,1.55,0);
  const neck=animalPart(0.48,3.1,0.48,mats.giraffeGold,0,3.15,0.64);
  const neckSpot=animalPart(0.5,0.52,0.5,mats.giraffeSpot,0,3.0,0.64);
  const head=animalPart(0.62,0.55,0.86,mats.giraffeGold,0,4.8,0.94);
  const muzzle=animalPart(0.52,0.32,0.42,mats.giraffeGold,0,4.68,1.52);
  const legs=[
    animalPart(0.22,1.65,0.22,mats.giraffeGold,-0.44,0.72,0.62),
    animalPart(0.22,1.65,0.22,mats.giraffeGold,0.44,0.72,0.62),
    animalPart(0.22,1.65,0.22,mats.giraffeGold,-0.44,0.72,-0.62),
    animalPart(0.22,1.65,0.22,mats.giraffeGold,0.44,0.72,-0.62)
  ];
  const spots=[];
  for(const [x,y,z] of [[-.5,1.65,.2],[.45,1.45,-.35],[0,2.2,.6],[0,3.75,.64]]) spots.push(animalPart(.34,.34,.12,mats.giraffeSpot,x,y,z));
  addAnimalParts(g,[body,neck,neckSpot,head,muzzle,...legs,...spots]);
  return {group:g,legs};
}

function createLionModel(){
  const g=new THREE.Group();
  const body=animalPart(1.25,0.72,1.75,mats.lionGold,0,0.95,0);
  const mane=animalPart(1.18,1.05,0.72,mats.lionMane,0,1.45,0.8);
  const head=animalPart(0.76,0.72,0.72,mats.lionGold,0,1.48,1.2);
  const muzzle=animalPart(0.55,0.32,0.38,mats.horseCream,0,1.35,1.68);
  const tail=animalPart(0.18,0.18,1.3,mats.lionGold,0,1.02,-1.42); tail.rotation.x=0.2;
  const tuft=animalPart(0.32,0.32,0.32,mats.lionMane,0,1.12,-2.08);
  const legs=[
    animalPart(0.22,0.72,0.22,mats.lionGold,-0.42,0.34,0.58),
    animalPart(0.22,0.72,0.22,mats.lionGold,0.42,0.34,0.58),
    animalPart(0.22,0.72,0.22,mats.lionGold,-0.42,0.34,-0.58),
    animalPart(0.22,0.72,0.22,mats.lionGold,0.42,0.34,-0.58)
  ];
  addAnimalParts(g,[body,mane,head,muzzle,tail,tuft,...legs]);
  return {group:g,legs,tail};
}

function createElephantModel(){
  const g=new THREE.Group();
  const body=animalPart(2.2,1.65,2.7,mats.elephantGray,0,1.65,0);
  const head=animalPart(1.55,1.45,1.25,mats.elephantGray,0,1.9,1.72);
  const earL=animalPart(0.18,1.25,1.0,mats.elephantGray,-0.9,2.0,1.5);
  const earR=animalPart(0.18,1.25,1.0,mats.elephantGray,0.9,2.0,1.5);
  const trunk=animalPart(0.42,1.55,0.42,mats.elephantGray,0,1.05,2.35); trunk.rotation.x=0.08;
  const tuskL=animalPart(0.12,0.12,0.82,mats.elephantTusk,-0.42,1.52,2.45); tuskL.rotation.x=-0.22;
  const tuskR=animalPart(0.12,0.12,0.82,mats.elephantTusk,0.42,1.52,2.45); tuskR.rotation.x=-0.22;
  const legs=[
    animalPart(0.5,1.35,0.5,mats.elephantGray,-0.72,0.58,0.82),
    animalPart(0.5,1.35,0.5,mats.elephantGray,0.72,0.58,0.82),
    animalPart(0.5,1.35,0.5,mats.elephantGray,-0.72,0.58,-0.82),
    animalPart(0.5,1.35,0.5,mats.elephantGray,0.72,0.58,-0.82)
  ];
  addAnimalParts(g,[body,head,earL,earR,trunk,tuskL,tuskR,...legs]);
  return {group:g,legs,trunk,ears:[earL,earR]};
}

function chooseAnimalSpecies(biome,roll){
  if(roll<0.60) return 'horse';
  if(roll<0.94) return 'lion';
  return 'elephant';
}
