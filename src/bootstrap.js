import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
window.THREE = THREE;

async function loadPart(src){
  await new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.onload=resolve;
    script.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });
}

for(let i=1;i<=18;i++) await loadPart(`./src/part${i}.js`);
