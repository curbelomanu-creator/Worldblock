const villagers=[];
const villagerPickables=[];
const trolls=[];
const trollPickables=[];

function makePart(w,h,d,material,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  return mesh;
}

function shortestAngleDelta(from,to){
  return Math.atan2(Math.sin(to-from),Math.cos(to-from));
}
function turnToward(group,targetYaw,dt,speed=8){
  group.rotation.y+=shortestAngleDelta(group.rotation.y,targetYaw)*Math.min(1,dt*speed);
}
