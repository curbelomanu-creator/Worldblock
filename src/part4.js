function buildTerrainPath(x1,z1,x2,z2,width=1){
  const dx=Math.sign(x2-x1), dz=Math.sign(z2-z1);
  const steps=Math.max(Math.abs(x2-x1),Math.abs(z2-z1));
  for(let i=0;i<=steps;i++){
    const cx=x1+dx*i, cz=z1+dz*i;
    for(let ox=-width;ox<=width;ox++){
      for(let oz=-width;oz<=width;oz++){
        if(dx!==0 && ox!==0) continue;
        if(dz!==0 && oz!==0) continue;
        const x=cx+ox, z=cz+oz;
        const surface=getHighestWalkSurfaceY(x,z,15);
        const blockY=Math.floor(surface-0.5);
        const old=occupied.get(key(Math.round(x),blockY,Math.round(z)));
        if(old) removeBlock(old);
        addBlock(x,blockY,z,'path');
      }
    }
  }
}

function buildWall(x1,z1,x2,z2, y=3, h=5){
  if(x1 === x2){
    for(let z=Math.min(z1,z2); z<=Math.max(z1,z2); z++){
      for(let iy=1; iy<=h; iy++) addBlock(x1,y+iy,z,'stone');
      if((z % 2) === 0) addBlock(x1,y+h+1,z,'stone');
    }
  } else if(z1 === z2){
    for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++){
      for(let iy=1; iy<=h; iy++) addBlock(x,y+iy,z1,'stone');
      if((x % 2) === 0) addBlock(x,y+h+1,z1,'stone');
    }
  }
}

function buildPath(x1,z1,x2,z2, y=3, width=1){
  if(x1 === x2){
    for(let z=Math.min(z1,z2); z<=Math.max(z1,z2); z++){
      for(let w=-width; w<=width; w++) addBlock(x1+w,y,z,'path');
    }
  } else if(z1 === z2){
    for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++){
      for(let w=-width; w<=width; w++) addBlock(x,y,z1+w,'path');
    }
  }
}

function buildPlaza(cx,cz,y=3,size=5){
  for(let x=cx-size; x<=cx+size; x++){
    for(let z=cz-size; z<=cz+size; z++) addBlock(x,y,z,'path');
  }
  for(let h=1; h<=3; h++) addBlock(cx,y+h,cz,'stone');
}

function buildTower(cx, y, cz, radius=2, height=10){
  for(let iy=1; iy<=height; iy++){
    for(let dx=-radius; dx<=radius; dx++){
      for(let dz=-radius; dz<=radius; dz++){
        const edge = Math.abs(dx) === radius || Math.abs(dz) === radius;
        if(edge) addBlock(cx+dx, y+iy, cz+dz, 'stone');
      }
    }
  }
  for(let iy=0; iy<=height; iy+=4){
    for(let dx=-radius+1; dx<=radius-1; dx++){
      for(let dz=-radius+1; dz<=radius-1; dz++) addBlock(cx+dx, y+iy, cz+dz, 'planks');
    }
  }
  for(let dx=-radius; dx<=radius; dx++){
    for(let dz=-radius; dz<=radius; dz++){
      if(Math.abs(dx) === radius || Math.abs(dz) === radius){
        if((dx+dz) % 2 === 0) addBlock(cx+dx, y+height+1, cz+dz, 'stone');
      }
    }
  }
  clearBox(cx, y+1, cz-radius, cx, y+2, cz-radius);
}

function buildMedievalHouse(x, y, z, w=7, d=6, h=4){
  clearBox(x-1, y+1, z-1, x+w, y+9, z+d);

  for(let ix=x; ix<x+w; ix++){
    for(let iz=z; iz<z+d; iz++) addBlock(ix, y, iz, 'planks');
  }

  for(let iy=1; iy<=h; iy++){
    for(let ix=x; ix<x+w; ix++){
      addBlock(ix, y+iy, z, 'planks');
      addBlock(ix, y+iy, z+d-1, 'planks');
    }
    for(let iz=z; iz<z+d; iz++){
      addBlock(x, y+iy, iz, 'planks');
      addBlock(x+w-1, y+iy, iz, 'planks');
    }
  }

  for(const [bx,bz] of [[x,z],[x+w-1,z],[x,z+d-1],[x+w-1,z+d-1]]){
    for(let iy=1; iy<=h+1; iy++) addBlock(bx, y+iy, bz, 'wood');
  }

  clearBox(x+Math.floor(w/2), y+1, z, x+Math.floor(w/2), y+2, z);

  const windowY = y + 2;
  for(const [wx,wz] of [
    [x+1, z], [x+w-2, z+d-1], [x, z+2], [x+w-1, z+2]
  ]){
    clearBox(wx, windowY, wz, wx, windowY, wz);
    addBlock(wx, windowY, wz, 'glass');
  }

  const roofHeight = Math.ceil(Math.max(w,d)/2);
  for(let r=0; r<roofHeight; r++){
    for(let ix=x-1+r; ix<=x+w+r-2; ix++){
      addBlock(ix, y+h+1+r, z-1-r, 'roof');
      addBlock(ix, y+h+1+r, z+d+r, 'roof');
    }
    for(let iz=z-r; iz<=z+d-1+r; iz++){
      addBlock(x-1+r, y+h+1+r, iz, 'roof');
      addBlock(x+w-2+r, y+h+1+r, iz, 'roof');
    }
  }
}
