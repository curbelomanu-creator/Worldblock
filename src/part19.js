// ---------- MOBILE / TOUCH CONTROLS ----------
(() => {
  if(!mobileControlsActive){
    window.WorldblockMobile={start(){},refresh(){}};
    return;
  }

  const style=document.createElement('style');
  style.textContent=`
    #mobileControls{position:fixed;inset:0;z-index:12;display:none;pointer-events:none;touch-action:none;font-family:Arial,Helvetica,sans-serif;-webkit-user-select:none;user-select:none}
    #mobileControls.active{display:block}
    #mobileLookZone{position:absolute;right:0;top:0;width:66%;height:100%;z-index:1;pointer-events:auto;touch-action:none}
    #mobileJoystick{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(22px,env(safe-area-inset-bottom));width:132px;height:132px;border-radius:50%;background:rgba(12,12,12,.34);border:2px solid rgba(255,255,255,.28);z-index:4;pointer-events:auto;touch-action:none;box-sizing:border-box}
    #mobileJoystick::before,#mobileJoystick::after{content:"";position:absolute;background:rgba(255,255,255,.10);pointer-events:none}
    #mobileJoystick::before{left:50%;top:12%;bottom:12%;width:1px}
    #mobileJoystick::after{top:50%;left:12%;right:12%;height:1px}
    #mobileStick{position:absolute;left:50%;top:50%;width:58px;height:58px;margin:-29px;border-radius:50%;background:rgba(255,255,255,.58);border:2px solid rgba(0,0,0,.18);box-sizing:border-box;transform:translate(0px,0px);pointer-events:none}
    #mobileActions{position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));width:190px;height:190px;z-index:4;pointer-events:none}
    .mobileAction{position:absolute;width:66px;height:66px;border-radius:50%;border:2px solid rgba(255,255,255,.42);background:rgba(25,25,25,.62);color:white;font-weight:800;font-size:12px;line-height:1.05;text-align:center;margin:0;padding:4px;box-shadow:0 3px 9px rgba(0,0,0,.28);pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
    .mobileAction:active{transform:scale(.93);background:rgba(65,65,65,.78)}
    .mobileAction[disabled]{opacity:.32}
    #mobileUse{right:0;bottom:46px;width:78px;height:78px;font-size:13px}
    #mobileJump{right:76px;bottom:0}
    #mobilePlace{right:88px;bottom:88px}
    #mobileMount{right:0;bottom:132px;width:58px;height:58px;font-size:11px}
    #mobileHotbar{position:absolute;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:5;pointer-events:auto;padding:5px;border-radius:10px;background:rgba(0,0,0,.25);max-width:calc(100vw - 150px);overflow-x:auto;scrollbar-width:none;touch-action:pan-x}
    #mobileHotbar::-webkit-scrollbar{display:none}
    .mobileSlot{flex:0 0 43px;width:43px;height:43px;margin:0;padding:0;border-radius:7px;border:2px solid rgba(255,255,255,.36);background:rgba(35,35,35,.68);font-size:22px;line-height:39px;text-align:center;color:white;box-shadow:none;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .mobileSlot.active{border:3px solid white;background:rgba(90,90,90,.76)}
    #mobileRotateHint{display:none;position:absolute;top:calc(max(8px,env(safe-area-inset-top)) + 58px);left:50%;transform:translateX(-50%);z-index:5;color:#fff;background:rgba(0,0,0,.46);padding:5px 9px;border-radius:7px;font-size:11px;white-space:nowrap;pointer-events:none}
    #hud{top:calc(max(8px,env(safe-area-inset-top)) + 58px)!important;max-width:145px}
    @media (orientation:portrait){
      #mobileJoystick{width:118px;height:118px;bottom:max(20px,env(safe-area-inset-bottom))}
      #mobileStick{width:52px;height:52px;margin:-26px}
      #mobileActions{width:174px;height:178px;right:max(10px,env(safe-area-inset-right))}
      .mobileAction{width:60px;height:60px}
      #mobileUse{width:72px;height:72px}
      #mobilePlace{right:80px;bottom:84px}
      #mobileJump{right:70px}
      #mobileMount{bottom:124px}
      #mobileRotateHint{display:block}
      #mobileHotbar{max-width:calc(100vw - 22px)}
      #hud{display:none}
    }
  `;
  document.head.appendChild(style);

  const root=document.createElement('div');
  root.id='mobileControls';
  root.innerHTML=`
    <div id="mobileLookZone" aria-label="Área para mover la cámara"></div>
    <div id="mobileHotbar" aria-label="Inventario rápido"></div>
    <div id="mobileRotateHint">↻ En horizontal tendrás más espacio</div>
    <div id="mobileJoystick" aria-label="Joystick de movimiento"><div id="mobileStick"></div></div>
    <div id="mobileActions">
      <button type="button" class="mobileAction" id="mobileUse">USAR</button>
      <button type="button" class="mobileAction" id="mobileJump">↥<br>Saltar</button>
      <button type="button" class="mobileAction" id="mobilePlace">▣<br>Poner</button>
      <button type="button" class="mobileAction" id="mobileMount">🐎<br>Montar</button>
    </div>
  `;
  document.body.appendChild(root);

  const icons=['🟩','🟫','⬜','🪵','⚔️','🪢','🚧'];
  const hotbar=root.querySelector('#mobileHotbar');
  const slotButtons=[];
  icons.forEach((icon,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='mobileSlot';
    button.textContent=icon;
    button.setAttribute('aria-label',slotNames[index]);
    button.addEventListener('pointerdown',event=>{
      event.preventDefault();
      event.stopPropagation();
      selectSlot(index);
      refresh();
    });
    hotbar.appendChild(button);
    slotButtons.push(button);
  });

  const joystick=root.querySelector('#mobileJoystick');
  const stick=root.querySelector('#mobileStick');
  let joystickPointer=null;

  function resetJoystick(){
    joystickPointer=null;
    mobileMove.x=0;
    mobileMove.y=0;
    stick.style.transform='translate(0px,0px)';
  }

  function updateJoystick(event){
    const rect=joystick.getBoundingClientRect();
    const cx=rect.left+rect.width/2;
    const cy=rect.top+rect.height/2;
    const maxRadius=rect.width*0.34;
    let dx=event.clientX-cx;
    let dy=event.clientY-cy;
    const distance=Math.hypot(dx,dy);
    if(distance>maxRadius){
      dx=dx/distance*maxRadius;
      dy=dy/distance*maxRadius;
    }
    let nx=dx/maxRadius;
    let ny=dy/maxRadius;
    const strength=Math.hypot(nx,ny);
    if(strength<0.10){ nx=0; ny=0; }
    mobileMove.x=nx;
    mobileMove.y=ny;
    stick.style.transform=`translate(${dx}px,${dy}px)`;
  }

  joystick.addEventListener('pointerdown',event=>{
    event.preventDefault();
    event.stopPropagation();
    joystickPointer=event.pointerId;
    joystick.setPointerCapture?.(event.pointerId);
    updateJoystick(event);
  });
  joystick.addEventListener('pointermove',event=>{
    if(event.pointerId!==joystickPointer) return;
    event.preventDefault();
    updateJoystick(event);
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']){
    joystick.addEventListener(type,event=>{
      if(joystickPointer!==null && event.pointerId!==undefined && event.pointerId!==joystickPointer) return;
      resetJoystick();
    });
  }

  const lookZone=root.querySelector('#mobileLookZone');
  let lookPointer=null;
  let lastLookX=0;
  let lastLookY=0;

  lookZone.addEventListener('pointerdown',event=>{
    event.preventDefault();
    lookPointer=event.pointerId;
    lastLookX=event.clientX;
    lastLookY=event.clientY;
    lookZone.setPointerCapture?.(event.pointerId);
  });
  lookZone.addEventListener('pointermove',event=>{
    if(event.pointerId!==lookPointer) return;
    event.preventDefault();
    const dx=event.clientX-lastLookX;
    const dy=event.clientY-lastLookY;
    lastLookX=event.clientX;
    lastLookY=event.clientY;
    yaw-=dx*0.0042;
    pitch-=dy*0.0042;
    pitch=Math.max(-Math.PI/2+0.03,Math.min(Math.PI/2-0.03,pitch));
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']){
    lookZone.addEventListener(type,event=>{
      if(lookPointer!==null && event.pointerId!==undefined && event.pointerId!==lookPointer) return;
      lookPointer=null;
    });
  }

  function bindTap(element,handler){
    element.addEventListener('pointerdown',event=>{
      event.preventDefault();
      event.stopPropagation();
      handler();
    });
  }

  function worldAction(button){
    canvas.dispatchEvent(new MouseEvent('mousedown',{
      button,
      buttons:button===0?1:2,
      bubbles:true,
      cancelable:true,
      clientX:innerWidth/2,
      clientY:innerHeight/2
    }));
  }

  const useButton=root.querySelector('#mobileUse');
  const placeButton=root.querySelector('#mobilePlace');
  const jumpButton=root.querySelector('#mobileJump');
  const mountButton=root.querySelector('#mobileMount');

  bindTap(useButton,()=>worldAction(0));
  bindTap(placeButton,()=>worldAction(2));
  bindTap(jumpButton,()=>{
    if(mountedHorse && mountedHorse.userData.rideGrounded){
      horseJumpQueued=true;
    }else if(onGround){
      velocityY=jumpSpeed;
      onGround=false;
    }
  });
  bindTap(mountButton,()=>{
    toggleHorseMount();
    refresh();
  });

  function refresh(){
    slotButtons.forEach((button,index)=>button.classList.toggle('active',index===selectedIndex));
    if(selectedItem==='sword') useButton.innerHTML='⚔️<br>Golpear';
    else if(selectedItem==='lasso') useButton.innerHTML='🪢<br>Lazo';
    else useButton.innerHTML='⛏️<br>Romper';
    placeButton.disabled=selectedItem==='sword'||selectedItem==='lasso';
    mountButton.innerHTML=mountedHorse?'🐎<br>Bajar':'🐎<br>Montar';
  }

  function start(){
    root.classList.add('active');
    resetJoystick();
    refresh();
  }

  window.addEventListener('blur',resetJoystick);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) resetJoystick(); });

  window.WorldblockMobile={start,refresh};
  refresh();
})();
