const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 34, 62);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 200);
scene.add(camera);

// First-person equipment is rendered in a second scene after the world.
// This guarantees that trees, leaves and terrain can never visually cover the sword.
const viewScene = new THREE.Scene();
const viewCamera = new THREE.PerspectiveCamera(75, 1, 0.05, 10);
const viewModel = new THREE.Group();
viewCamera.add(viewModel);
viewScene.add(viewCamera);

const vmSkin = new THREE.MeshBasicMaterial({color:0xd7b48a, depthTest:false, depthWrite:false});
const vmSleeve = new THREE.MeshBasicMaterial({color:0x6b4f9a, depthTest:false, depthWrite:false});
const vmBlade = new THREE.MeshBasicMaterial({color:0xd9e1e8, depthTest:false, depthWrite:false});
const vmHandle = new THREE.MeshBasicMaterial({color:0x5d3a1a, depthTest:false, depthWrite:false});

const armGroup = new THREE.Group();
viewModel.add(armGroup);

const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.20, 0.78), vmSleeve);
upperArm.position.set(0.68, -0.66, -1.10);
upperArm.rotation.set(-0.34, -0.08, -0.18);
upperArm.renderOrder = 1000;
upperArm.frustumCulled = false;
armGroup.add(upperArm);

const hand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.30), vmSkin);
hand.position.set(0.74, -0.70, -1.47);
hand.rotation.set(-0.34, -0.08, -0.18);
hand.renderOrder = 1001;
hand.frustumCulled = false;
armGroup.add(hand);

const swordGroup = new THREE.Group();
swordGroup.position.set(0.73, -0.72, -1.38);
swordGroup.rotation.set(0.05, -0.08, -0.52);
armGroup.add(swordGroup);

const swordHandleVM = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.48, 0.11), vmHandle);
swordHandleVM.position.set(0,0.20,0);
swordHandleVM.renderOrder = 1002;
swordGroup.add(swordHandleVM);

const swordGuardVM = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.10), vmBlade);
swordGuardVM.position.set(0,0.48,0);
swordGuardVM.renderOrder = 1002;
swordGroup.add(swordGuardVM);

const swordBladeVM = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.28, 0.075), vmBlade);
swordBladeVM.position.set(0,1.14,0);
swordBladeVM.renderOrder = 1002;
swordGroup.add(swordBladeVM);

const vmRope = new THREE.MeshBasicMaterial({color:0xb99662, depthTest:false, depthWrite:false});
const lassoGroup = new THREE.Group();
lassoGroup.position.set(0.72,-0.63,-1.45);
lassoGroup.rotation.set(-0.15,0.15,-0.15);
const ropeCoil = new THREE.Mesh(new THREE.TorusGeometry(0.20,0.035,8,20), vmRope);
ropeCoil.rotation.x=Math.PI/2; ropeCoil.renderOrder=1002;
const ropeHandle = new THREE.Mesh(new THREE.BoxGeometry(0.055,0.55,0.055), vmRope);
ropeHandle.position.set(0,-0.30,0); ropeHandle.rotation.z=-0.3; ropeHandle.renderOrder=1002;
lassoGroup.add(ropeCoil,ropeHandle);
armGroup.add(lassoGroup);

const fenceToolGroup = new THREE.Group();
fenceToolGroup.position.set(0.70,-0.62,-1.43);
const fencePreviewPost = new THREE.Mesh(new THREE.BoxGeometry(0.10,0.65,0.10), vmHandle);
fencePreviewPost.position.set(0,-0.05,0); fencePreviewPost.renderOrder=1002;
const fencePreviewRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.58,0.08,0.08), vmHandle);
fencePreviewRail1.position.set(-0.16,0.06,0); fencePreviewRail1.renderOrder=1002;
const fencePreviewRail2 = fencePreviewRail1.clone(); fencePreviewRail2.position.y=-0.18;
fenceToolGroup.add(fencePreviewPost,fencePreviewRail1,fencePreviewRail2);
armGroup.add(fenceToolGroup);

let attackAnim = 0;

const hemi = new THREE.HemisphereLight(0xbfe8ff, 0x6b5b3e, 1.6);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(24, 40, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -70;
sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;
scene.add(sun);

const worldGroup = new THREE.Group();
scene.add(worldGroup);

// Decorative meshes are kept separate from collision blocks. This lets the town
// feel richer without turning every tiny prop into a physics object.
const decorGroup = new THREE.Group();
scene.add(decorGroup);

const blockGeo = new THREE.BoxGeometry(1,1,1);
function mergeBoxGeometry(parts){
  const positions=[], normals=[], uvs=[];
  for(const [w,h,d,x,y,z] of parts){
    const g=new THREE.BoxGeometry(w,h,d).toNonIndexed();
    g.translate(x,y,z);
    positions.push(...g.attributes.position.array);
    normals.push(...g.attributes.normal.array);
    uvs.push(...g.attributes.uv.array);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.computeBoundingSphere();
  return geo;
}
const fenceGeoX=mergeBoxGeometry([[0.16,1.38,0.16,0,0.18,0],[1.00,0.14,0.14,0,0.35,0],[1.00,0.14,0.14,0,-0.03,0]]);
const fenceGeoZ=mergeBoxGeometry([[0.16,1.38,0.16,0,0.18,0],[0.14,0.14,1.00,0,0.35,0],[0.14,0.14,1.00,0,-0.03,0]]);
function geometryForBlock(type){
  if(type==='fenceX') return fenceGeoX;
  if(type==='fenceZ') return fenceGeoZ;
  return blockGeo;
}
const cubes = [];
const occupied = new Map();
const key = (x,y,z) => `${x},${y},${z}`;

// Procedural world streaming: only nearby chunks exist in memory.
const WORLD_SEED = 20260828;
const CHUNK_SIZE = 16;
const CHUNK_RADIUS = 3;
const CHUNK_DEPTH = 4;
const loadedChunks = new Map();
const chunkRaycastMeshes = [];
const editsByChunk = new Map();
let lastPlayerChunkX = null;
let lastPlayerChunkZ = null;

function chunkCoord(v){ return Math.floor(v / CHUNK_SIZE); }
function chunkId(cx,cz){ return `${cx},${cz}`; }
function blockChunkId(x,z){ return chunkId(chunkCoord(x), chunkCoord(z)); }

// The village, gate road and troll patrol lanes remain fixed so NPCs always
// have terrain under them even when the player explores very far away.
