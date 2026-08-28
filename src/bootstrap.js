const canvas = document.getElementById('game');
const startButton = document.getElementById('start');
const panel = document.getElementById('panel');

const status = document.createElement('p');
status.id = 'loadStatus';
status.style.marginTop = '14px';
status.style.fontWeight = '700';
status.style.color = '#ffe29a';
panel.appendChild(status);

let ready = false;
let currentPart = '';
let partRuntimeError = null;

function setStatus(message, isError = false){
  status.textContent = message;
  status.style.color = isError ? '#ff9b9b' : '#ffe29a';
}

startButton.disabled = true;
startButton.textContent = 'CARGANDO MUNDO…';
startButton.style.opacity = '0.6';
startButton.style.cursor = 'wait';
setStatus('Preparando motor 3D…');

window.addEventListener('error', (event) => {
  if(currentPart && event.filename && event.filename.includes('/src/part')){
    partRuntimeError = new Error(`${event.message} (${currentPart})`);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if(!ready){
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    setStatus(`Error de carga: ${reason}`, true);
  }
});

async function loadPart(src, index){
  currentPart = src;
  partRuntimeError = null;
  setStatus(`Cargando mundo… ${index}/18`);

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });

  if(partRuntimeError) throw partRuntimeError;
}

async function boot(){
  try{
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js');
    window.THREE = THREE;

    for(let i = 1; i <= 18; i++){
      await loadPart(`./src/part${i}.js`, i);
    }

    currentPart = '';
    ready = true;
    startButton.disabled = false;
    startButton.textContent = 'ENTRAR AL MUNDO';
    startButton.style.opacity = '1';
    startButton.style.cursor = 'pointer';
    setStatus('✓ Mundo listo');
  }catch(error){
    console.error('Worldblock boot error:', error);
    ready = false;
    startButton.disabled = true;
    startButton.textContent = 'ERROR AL CARGAR';
    startButton.style.opacity = '0.7';
    startButton.style.cursor = 'not-allowed';
    setStatus(`Error: ${error?.message || error}`, true);
  }
}

startButton.addEventListener('click', () => {
  if(!ready) return;
  canvas.focus?.();
  try{
    const result = canvas.requestPointerLock();
    if(result && typeof result.catch === 'function'){
      result.catch((error) => {
        console.error('Pointer lock error:', error);
        setStatus('No se pudo capturar el mouse. Haz click nuevamente.', true);
      });
    }
  }catch(error){
    console.error('Pointer lock error:', error);
    setStatus('No se pudo capturar el mouse. Haz click nuevamente.', true);
  }
});

boot();
