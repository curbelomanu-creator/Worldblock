function hash01(ix,iz,salt=0){
  let n = Math.imul(ix + WORLD_SEED + salt*1013, 374761393) ^ Math.imul(iz - WORLD_SEED + salt*1619, 668265263);
  n = (n ^ (n >>> 13));
  n = Math.imul(n, 1274126177);
  n = n ^ (n >>> 16);
  return (n >>> 0) / 4294967295;
}

function smoothstep(t){ return t*t*(3-2*t); }
function valueNoise(x,z,salt=0){
  const x0=Math.floor(x), z0=Math.floor(z);
  const tx=smoothstep(x-x0), tz=smoothstep(z-z0);
  const a=hash01(x0,z0,salt), b=hash01(x0+1,z0,salt);
  const c=hash01(x0,z0+1,salt), d=hash01(x0+1,z0+1,salt);
  const ab=a+(b-a)*tx, cd=c+(d-c)*tx;
  return ab+(cd-ab)*tz;
}

function fbm(x,z,salt=0){
  let total=0, amp=0.5, freq=1, norm=0;
  for(let i=0;i<4;i++){
    total += valueNoise(x*freq,z*freq,salt+i*19)*amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return total/norm;
}

function terrainHeight(x,z){
  const broad=fbm(x*0.018,z*0.018,11);
  const hills=fbm(x*0.045,z*0.045,37);
  const detail=fbm(x*0.11,z*0.11,73);
  const ridge=Math.abs(hills*2-1);
  return Math.floor(1 + broad*6 + hills*3 + detail*1.5 + Math.max(0,0.48-ridge)*3);
}

function proceduralBiome(x,z){
  const moisture=fbm(x*0.014+47,z*0.014-91,101);
  const rugged=fbm(x*0.02-150,z*0.02+80,141);
  if(rugged>0.73) return 'highlands';
  if(moisture>0.57) return 'forest';
  if(moisture<0.28) return 'dry';
  return 'plains';
}

function fillColumn(x,z,topY){
  for(let y=-3; y<=topY; y++){
    let type = 'stone';
    if(y === topY) type = 'grass';
    else if(y >= topY-2) type = 'dirt';
    addBlock(x,y,z,type);
  }
}

function setGroundPatch(x1,z1,x2,z2,topY=3,topType='grass'){
  for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++){
    for(let z=Math.min(z1,z2); z<=Math.max(z1,z2); z++){
      clearBox(x,-3,z,x,20,z);
      for(let y=-3;y<topY;y++){
        const baseType = y < topY-2 ? 'stone' : 'dirt';
        addBlock(x,y,z,baseType);
      }
      addBlock(x,topY,z,topType);
    }
  }
}

function buildTree(x,baseY,z,height=4){
  for(let t=1;t<=height;t++) addBlock(x,baseY+t,z,'wood');
  const top=baseY+height;
  for(let dx=-2;dx<=2;dx++){
    for(let dz=-2;dz<=2;dz++){
      for(let dy=-1;dy<=1;dy++){
        if(Math.abs(dx)+Math.abs(dz)+Math.abs(dy) < 4){
          addBlock(x+dx,top+dy,z+dz,'leaves');
        }
      }
    }
  }
}

const walkGroundTypes = new Set(['grass','path','sand','dirt','stone']);

function getHighestWalkSurfaceY(x,z,maxY=30){
  const ix=Math.round(x), iz=Math.round(z);
  for(let y=Math.floor(maxY);y>=-3;y--){
    const cube=occupied.get(key(ix,y,iz));
    if(cube && walkGroundTypes.has(cube.userData.type)) return y+0.5;
  }
  return -2.5;
}

function getNearbyWalkSurfaceY(x,z,currentFootY,maxStepUp=1.05,maxDrop=3.0){
  const ix=Math.round(x), iz=Math.round(z);
  const maxSurface=currentFootY+maxStepUp;
  const minSurface=currentFootY-maxDrop;
  for(let y=Math.floor(maxSurface-0.5);y>=-3;y--){
    const cube=occupied.get(key(ix,y,iz));
    if(!cube || !walkGroundTypes.has(cube.userData.type)) continue;
    const surface=y+0.5;
    if(surface<=maxSurface+0.001 && surface>=minSurface) return surface;
  }
  return getHighestWalkSurfaceY(x,z,currentFootY+2);
}

function buildGiantTree(x,z,height=10){
  const groundBlockY=Math.floor(getHighestWalkSurfaceY(x,z,12)-0.5);
  for(let t=1;t<=height;t++){
    addBlock(x,groundBlockY+t,z,'wood');
    addBlock(x+1,groundBlockY+t,z,'wood');
    addBlock(x,groundBlockY+t,z+1,'wood');
    addBlock(x+1,groundBlockY+t,z+1,'wood');
  }
  const top=groundBlockY+height;
  for(let dy=-2;dy<=3;dy++){
    const radius=dy>=2?2:3;
    for(let dx=-radius;dx<=radius;dx++){
      for(let dz=-radius;dz<=radius;dz++){
        if(dx*dx+dz*dz<=radius*radius+1) addBlock(x+dx,top+dy,z+dz,'leaves');
      }
    }
  }
}
