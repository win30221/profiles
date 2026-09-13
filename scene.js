/* Procedural studio: no model downloads, external textures, or runtime requests. */
'use strict';
window.createWorkspaceScene = function(host, callbacks) {
  const T=window.THREE;
  let renderer;
  try { renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'}); }
  catch(error){callbacks.onFailure?.(error);return ()=>{};}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.setSize(host.clientWidth,host.clientHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  host.appendChild(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color('#0c120f');scene.fog=new T.FogExp2('#0c120f',.041);
  let viewportWidth=host.clientWidth,viewportHeight=host.clientHeight;
  const camera=new T.PerspectiveCamera(42,viewportWidth/viewportHeight,.05,65);
  const resources=new Set();
  function material(color,roughness=.65,metalness=0){const m=new T.MeshStandardMaterial({color,roughness,metalness});resources.add(m);return m;}
  const charcoal=material('#252b28'),black=material('#101613',.6),steel=material('#46504b',.3,.65),wood=material('#655a43',.67),paper=material('#b3b4a0'),green=material('#414f3c');
  function mesh(geometry,mat,parent=scene){resources.add(geometry);const m=new T.Mesh(geometry,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(x,y,z,w,h,d,mat,parent=scene){const m=mesh(new T.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
  function cylinder(x,y,z,r1,r2,h,mat,parent=scene,segments=16){const m=mesh(new T.CylinderGeometry(r1,r2,h,segments),mat,parent);m.position.set(x,y,z);return m;}
  function sphere(x,y,z,r,mat,parent=scene,s=16){const m=mesh(new T.SphereGeometry(r,s,12),mat,parent);m.position.set(x,y,z);return m;}
  function glow(color,intensity=1){const m=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.5});resources.add(m);return m;}
  function line(points,r,mat,parent=scene){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,24,r,6,false),mat,parent);}
  // A quiet architectural shell, with just enough detail to feel occupied.
  box(0,-.12,0,16,.2,16,material('#242c26',.95));
  box(0,3,-3.2,12,6,.16,material('#303a31',.97));
  box(-5,3,1,.16,6,8,material('#242f29',.95));
  for(let x=-5;x<6;x+=.34)box(x,3.1,-3.08,.04,5.5,.09,material(x%2?'#354032':'#2b362e'));
  for(let z=-6;z<7;z+=1.7)box(0,-.01,z,12,.002,.012,black);
  for(let x=-5;x<7;x+=1.7)box(x,-.01,0,.012,.002,12,black);
  // Recessed wall light and shelf.
  box(.3,3.25,-2.92,4.5,.035,.05,glow('#d3bb8e',1.5));
  box(.3,3.32,-2.98,4.6,.12,.28,charcoal);
  box(2.95,2.45,-2.76,2.3,.09,.56,wood);
  for(let i=0;i<7;i++){const book=box(2.1+i*.13,2.69,-2.7,.09,.39+(i%3)*.08,.27,i%2?green:charcoal);book.rotation.z=i===6?-.15:0;}
  // Desk surface and metal supports.
  box(0,1.29,-.23,4.8,.13,1.85,wood);
  box(0,1.36,-.13,3.5,.012,1.12,material('#303932',.95));
  [-2.1,2.1].forEach(x=>{box(x,.63,-.2,.08,1.23,1.5,steel);box(x,.07,-.2,.38,.08,1.7,black);});
  box(0,1.05,-.86,4.25,.1,.07,steel);
  // All displays start powered off; only the main monitor wakes during the shared boot timeline.
  function monitor(x,y,z,w,h,angle){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;scene.add(g);box(0,0,0,w+.09,h+.09,.095,black,g);const m=new T.MeshBasicMaterial({color:'#030504',toneMapped:false});resources.add(m);box(0,0,.051,w,h,.005,m,g);box(0,-h/2-.18,-.025,.07,.33,.06,steel,g);box(0,-h/2-.34,.05,.55,.035,.3,steel,g);const led=box(w/2-.035,-h/2-.025,.057,.013,.005,.008,glow('#030504',0),g);g.userData.led=led;g.userData.screenMaterial=m;return g;}
  const mainMonitor=monitor(-.34,2.075,-.78,1.71,.96,0);
  monitor(1.29,2.03,-.68,1.29,.88,-.28);
  // Laptop and mechanical keyboard.
  const laptop=new T.Group();laptop.position.set(-1.68,1.39,-.17);laptop.rotation.y=.27;scene.add(laptop);box(0,0,0,.73,.033,.5,steel,laptop);const lid=new T.Group();lid.position.set(0,.24,-.22);lid.rotation.x=-.13;laptop.add(lid);box(0,0,0,.73,.47,.026,charcoal,lid);const laptopMat=new T.MeshBasicMaterial({color:'#030504',toneMapped:false});resources.add(laptopMat);box(0,0,.018,.67,.41,.002,laptopMat,lid);for(let r=0;r<4;r++)for(let c=0;c<11;c++)box(-.29+c*.056,.022,-.14+r*.063,.041,.009,.039,black,laptop);
  box(-.15,1.398,.21,1.08,.045,.36,black);
  for(let r=0;r<5;r++)for(let c=0;c<15;c++)box(-.635+c*.069,1.428,.06+r*.059,.055,.024,.046,c===0||c===14?green:material(r===4?'#535f50':'#87917f'));
  const mouse=sphere(.69,1.42,.25,.105,charcoal);mouse.scale.set(.7,.36,1.14);
  // Mug, notebook, pen, NAS, cable routes.
  cylinder(1.86,1.52,.23,.11,.093,.3,paper);cylinder(1.86,1.673,.23,.088,.088,.004,material('#252217'));const handle=mesh(new T.TorusGeometry(.085,.018,7,14),paper);handle.position.set(1.97,1.53,.23);handle.rotation.y=Math.PI/2;
  const notebook=box(-1.13,1.407,.45,.4,.044,.52,material('#979783'));notebook.rotation.y=-.15;box(-1.13,1.435,.45,.012,.006,.52,black);const pen=cylinder(-.88,1.443,.45,.007,.007,.3,charcoal);pen.rotation.z=Math.PI/2;pen.rotation.y=.2;
  box(2.12,.33,-.55,.36,.57,.48,charcoal);for(let i=0;i<3;i++){box(2.12,.17+i*.15,-.3,.29,.11,.015,black);box(2.22,.17+i*.15,-.286,.01,.01,.005,glow('#9ab681'));}
  line([[-.34,1.85,-.89],[-.34,1.36,-1.04],[-.2,.3,-1.1],[1.7,.07,-.9],[2,.23,-.6]],.012,black);
  line([[1.3,1.85,-.87],[1.35,1.25,-1.05],[1.6,.14,-1.1],[2,.1,-.6]],.012,black);
  // Desk lamp: warm, controlled pool of light.
  cylinder(-2.07,1.39,-.5,.2,.22,.035,steel);line([[-2.07,1.41,-.5],[-2.07,2.0,-.5],[-1.96,2.55,-.46],[-1.5,2.5,-.36]],.027,steel);
  const shade=mesh(new T.ConeGeometry(.17,.19,20,1,true),charcoal);shade.position.set(-1.5,2.4,-.36);cylinder(-1.5,2.305,-.36,.125,.125,.009,glow('#ffe1a0',2));
  const deskLight=new T.SpotLight('#ffdfa3',24,6,Math.PI/3,.7,1.8);deskLight.position.set(-1.5,2.3,-.35);deskLight.target.position.set(-.9,1.3,-.1);deskLight.castShadow=true;deskLight.shadow.mapSize.set(512,512);scene.add(deskLight,deskLight.target);
  // Rack hardware keeps the studio grounded in backend engineering.
  const rack=new T.Group();rack.position.set(-3.55,0,-2.24);rack.rotation.y=.22;scene.add(rack);box(0,1.1,0,.96,2.2,.8,black,rack);box(-.46,1.1,.43,.045,2.14,.055,steel,rack);box(.46,1.1,.43,.045,2.14,.055,steel,rack);
  for(let r=0;r<9;r++){box(0,.22+r*.22,.42,.82,.17,.035,charcoal,rack);for(let c=0;c<12;c++)box(-.34+c*.044,.22+r*.22,.446,.018,.052,.01,black,rack);box(.3,.22+r*.22,.449,.013,.011,.008,glow(r%3?'#92b574':'#bcac7c'),rack);box(.34,.22+r*.22,.449,.011,.011,.008,glow('#71925e'),rack);}
  // Small network switch, patched into the rack.
  box(-3.55,2.26,-2.24,.82,.12,.55,charcoal);
  for(let port=0;port<8;port++){box(-3.83+port*.07,2.26,-1.96,.045,.025,.009,black);box(-3.83+port*.07,2.29,-1.951,.01,.006,.005,glow('#829866',.6));}
  line([[-3.8,2.26,-1.95],[-3.9,2.05,-1.75],[-3.82,1.74,-1.75],[-3.63,1.76,-1.8]],.009,green);
  // Empty office chair, parked beside the workstation.
  const chair=new T.Group();chair.position.set(2.6,0,1.6);chair.rotation.y=-.45;scene.add(chair);cylinder(0,.39,0,.035,.04,.62,steel,chair);box(0,.73,0,.69,.14,.58,black,chair);const back=box(0,1.21,.3,.67,.94,.1,charcoal,chair);back.rotation.x=-.08;for(let i=0;i<5;i++){const a=i/5*Math.PI*2;line([[0,.17,0],[Math.cos(a)*.4,.11,Math.sin(a)*.4]],.024,steel,chair);sphere(Math.cos(a)*.4,.07,Math.sin(a)*.4,.06,black,chair);}[-.4,.4].forEach(x=>{box(x,1.02,0,.06,.43,.055,steel,chair);box(x,1.22,-.02,.1,.04,.37,black,chair);});
  // Lighting: screen light, a cool room fill, and a soft rim.
  const ambient=new T.HemisphereLight('#b2c8b8','#1c251d',1.35);scene.add(ambient);
  const key=new T.DirectionalLight('#c6d3bb',2.0);key.position.set(3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.001;scene.add(key);
  const screenLight=new T.PointLight('#b6d8c3',4.2,3,2);screenLight.position.set(0,2,-.35);scene.add(screenLight);
  const wallLight=new T.PointLight('#b9b28b',12,7,2);wallLight.position.set(.1,3,-2.4);scene.add(wallLight);
  const rim=new T.PointLight('#859da0',8,7,2);rim.position.set(3.8,3,0);scene.add(rim);
  // Render only when the shared application clock advances. There is no second boot timer.
  const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
  const pointer={x:0,y:0};
  let disposed=false, qualityReduced=false, lastFrame=null;
  const screenCenter=new T.Vector3(-.34,2.075,-.726);
  const screenOff=new T.Color('#030504'),screenOn=new T.Color('#0b0e0c');
  function pointerMove(e){pointer.x=(e.clientX/innerWidth-.5)*.11;pointer.y=(e.clientY/innerHeight-.5)*.065;}
  function resize(){
    if(disposed)return;
    lastFrame=null;
    // Fullscreen boot hides the studio. Retain a valid viewport when a
    // resize occurs there so rewinding cannot inherit a 0/0 camera aspect.
    viewportWidth=host.clientWidth||window.innerWidth;
    viewportHeight=host.clientHeight||window.innerHeight;
    renderer.setSize(viewportWidth,viewportHeight);
    camera.aspect=viewportWidth/viewportHeight;
    camera.updateProjectionMatrix();
  }
  // A perspective homography maps the ONE HTML boot surface to the monitor.
  // This is CSS3D compositing: DOM typography never changes renderers/fonts.
  function screenProjection(){
    const w=viewportWidth,h=viewportHeight;
    // A fixed viewport-shaped region lives inside the physical widescreen.
    // Never animate this aperture: shrinking it during the dolly makes the
    // projected content overshoot fullscreen size and then visibly retreat.
    const apertureW=Math.min(1.71,.96*camera.aspect);
    const apertureH=Math.min(.96,1.71/camera.aspect);
    const surfaceW=w,surfaceH=h;
    const halfW=apertureW/2,halfH=apertureH/2;
    const points=[[-halfW,halfH],[halfW,halfH],[halfW,-halfH],[-halfW,-halfH]].map(([x,y])=>{
      const v=new T.Vector3(screenCenter.x+x,screenCenter.y+y,screenCenter.z).project(camera);
      return [(v.x+1)*w/2,(1-v.y)*h/2];
    });
    const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
    const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
    const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
    const det=dx1*dy2-dx2*dy1;
    const g=(dx3*dy2-dx2*dy3)/det,k=(dx1*dy3-dx3*dy1)/det;
    const a=x1-x0+g*x1,b=x3-x0+k*x3,d=y1-y0+g*y1,e=y3-y0+k*y3;
    return {transform:`matrix3d(${a/surfaceW},${d/surfaceW},0,${g/surfaceW},${b/surfaceH},${e/surfaceH},0,${k/surfaceH},0,0,1,0,${x0},${y0},0,1)`,points,width:surfaceW,height:surfaceH};
  }
  function render(time,bootTime=time){
    if(disposed)return null;
    // Visitors can pause here indefinitely. Reuse the frame until the camera,
    // computer state, pointer parallax or viewport actually changes.
    if(lastFrame&&lastFrame.time===time&&lastFrame.bootTime===bootTime&&lastFrame.x===pointer.x&&lastFrame.y===pointer.y)return lastFrame.projection;
    const arrival=callbacks.arrival||10.4;
    const progress=smooth(time/arrival);
    const align=smooth((time-3.2)/5.8);
    const endDistance=Math.min(.96,1.71/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
    // One continuous dolly. Its final pose is exactly front-on to the display.
    // Pull back for portrait framing instead of stretching the monitor.
    const startDistance=9.1*Math.max(1,Math.min(1.8,1/camera.aspect));
    const distance=T.MathUtils.lerp(startDistance,endDistance,progress);
    const side=T.MathUtils.lerp(3.8,0,align);
    const elevation=T.MathUtils.lerp(1.28,0,align);
    const parallax=1-smooth((time-4)/3.5);
    camera.position.set(screenCenter.x+side+pointer.x*parallax,screenCenter.y+elevation-pointer.y*parallax,screenCenter.z+distance);
    const target=new T.Vector3(screenCenter.x,screenCenter.y-.48*(1-align),screenCenter.z);
    camera.lookAt(target);camera.updateMatrixWorld();
    const reveal=.008+.992*smooth(time/2.8);
    const power=smooth((bootTime-2.6)/.5);
    const glowLevel=smooth((bootTime-3.0)/.65);
    renderer.toneMappingExposure=1.35*reveal;
    ambient.intensity=1.15;screenLight.intensity=glowLevel*4.2;
    mainMonitor.userData.led.material.color.setRGB(.025+power*.5,.035+power*.65,.025+power*.36);
    mainMonitor.userData.led.material.emissive.copy(mainMonitor.userData.led.material.color);
    mainMonitor.userData.led.material.emissiveIntensity=power;
    mainMonitor.userData.screenMaterial.color.copy(screenOff).lerp(screenOn,glowLevel);
    renderer.render(scene,camera);
    const projection=screenProjection();
    lastFrame={time,bootTime,x:pointer.x,y:pointer.y,projection};
    return projection;
  }
  function reduceQuality(){if(qualityReduced)return;qualityReduced=true;lastFrame=null;renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;}
  function lost(event){event.preventDefault();callbacks.onFailure?.();}
  window.addEventListener('resize',resize);
  window.addEventListener('pointermove',pointerMove,{passive:true});
  renderer.domElement.addEventListener('webglcontextlost',lost);
  resize();
  return {render,reduceQuality,dispose(){
    if(disposed)return;disposed=true;
    window.removeEventListener('resize',resize);window.removeEventListener('pointermove',pointerMove);
    renderer.domElement.removeEventListener('webglcontextlost',lost);
    resources.forEach(resource=>resource.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  }};
};
