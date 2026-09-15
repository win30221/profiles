/* Complete Gaming room by induwarabh, CGTrader #4606915.
   Source files, attribution and material adaptations: assets/models/CREDITS.md.
   Full source mesh detail; no older model sets are loaded. */
'use strict';
window.createWorkspaceScene = async function(host,callbacks) {
  const T=window.THREE,data=window.WorkspaceModelData;
  if(data?.version!==5)throw new Error('Room scene is unavailable');
  function base64Bytes(s){
    if(Uint8Array.fromBase64)return Uint8Array.fromBase64(s);
    const binary=atob(s),bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return bytes;
  }
  // Native streaming decompression preserves every Float32 value/index and
  // lets image decoding proceed concurrently. Replays reuse the CPU buffer.
  const geometryReady=data.decodedGeometry?Promise.resolve(data.decodedGeometry):(async()=>{
    if(data.geometry?.codec!=='deflate')throw new Error('Unsupported room geometry');
    const stream=new Blob([base64Bytes(data.geometry.data)]).stream().pipeThrough(new DecompressionStream('deflate'));
    const buffer=await new Response(stream).arrayBuffer();
    if(buffer.byteLength!==data.geometry.byteLength)throw new Error('Room geometry length mismatch');
    data.decodedGeometry=buffer;return buffer;
  })();
  // Decode self-contained image URLs before the scroll clock starts. Native
  // images are CPU assets; every replay creates and releases its own textures.
  const imagesReady=Promise.all(Object.entries(data.textures).map(([id,source])=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve([id,img]);img.onerror=()=>reject(new Error('Model texture failed: '+id));img.src=source.url;
  })));
  const [geometryBuffer,images]=await Promise.all([geometryReady,imagesReady]);
  const decodedImages=new Map(images),resources=new Set();
  const keep=r=>{resources.add(r);return r;};
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  try {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;host.appendChild(renderer.domElement);
  let viewportWidth=host.clientWidth,viewportHeight=host.clientHeight;
  const scene=new T.Scene();scene.background=new T.Color('#11151b');
  const camera=new T.PerspectiveCamera(42,viewportWidth/viewportHeight,.015,30);
  const textureCache=new Map();
  function texture(ref,color=false){
    const key=JSON.stringify([ref,color]);if(textureCache.has(key))return textureCache.get(key);
    const t=keep(new T.Texture(decodedImages.get(ref.texture)));
    t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
    t.repeat.fromArray(ref.repeat);t.offset.fromArray(ref.offset);t.anisotropy=4;t.needsUpdate=true;
    textureCache.set(key,t);return t;
  }
  const palette=new Map();
  for(const [id,source]of Object.entries(data.materials)){
    const options={color:new T.Color().fromArray(source.color),roughness:source.roughness,metalness:source.metalness,envMapIntensity:.12};
    if(!source.linearColor)options.color.convertSRGBToLinear();
    // The source cutaway's wall faces point outward. An interior camera must
    // also see their reverse side, especially at wide viewport edges.
    // The TV display also has inward-facing source winding; Blender showed
    // both sides, so keep its image visible from the room without moving it.
    if(source.name==='Material'||source.name==='Material.005')options.side=T.DoubleSide;
    for(const slot of ['map','normalMap','bumpMap','emissiveMap'])if(source[slot])options[slot]=texture(source[slot],slot==='map'||slot==='emissiveMap');
    if(source.alphaTest)options.alphaTest=source.alphaTest;
    if(source.bumpMap)options.bumpScale=.00025;
    if(source.normalMap)options.normalScale=new T.Vector2(.4,.4);
    if(source.transparent)Object.assign(options,{transparent:true,opacity:source.opacity,depthWrite:false,side:T.DoubleSide});
    if(source.emissive)Object.assign(options,{emissive:new T.Color().fromArray(source.emissive),emissiveIntensity:source.emissiveIntensity});
    const mat=keep(new T.MeshStandardMaterial(options));mat.name=source.name;palette.set(id,mat);
  }
  const decode=(s,Type)=>new Type(base64Bytes(s).buffer);
  const attribute=(span,Type)=>new Type(geometryBuffer,span.offset,span.count);
  // RectAreaLight needs the r160 LTC tables. Own both WebGL capability
  // variants per scene, so replay/context-loss cleanup also releases them.
  data.areaLightLTC.forEach((encoded,i)=>{
    const floats=decode(encoded,Float32Array);
    for(const [kind,values,type]of [['FLOAT',floats,T.FloatType],['HALF',Uint16Array.from(floats,T.DataUtils.toHalfFloat),T.HalfFloatType]]){
      const lut=keep(new T.DataTexture(values,64,64,T.RGBAFormat,type));
      lut.minFilter=lut.magFilter=T.LinearFilter;lut.needsUpdate=true;
      T.UniformsLib['LTC_'+kind+'_'+(i+1)]=lut;
    }
  });
  const set=new T.Group();set.name='gaming-room';scene.add(set);
  for(const part of data.parts){
    const geometry=keep(new T.BufferGeometry());
    geometry.setAttribute('position',new T.BufferAttribute(attribute(part.position,Float32Array),3));
    geometry.setAttribute('normal',new T.BufferAttribute(attribute(part.normal,Float32Array),3));
    geometry.setAttribute('uv',new T.BufferAttribute(attribute(part.uv,Float32Array),2));
    geometry.setIndex(new T.BufferAttribute(attribute(part.index,part.indexType==='u32'?Uint32Array:Uint16Array),1));
    geometry.computeBoundingSphere();
    const mesh=new T.Mesh(geometry,palette.get(part.material));mesh.name=part.material;
    mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;set.add(mesh);
  }
  // A broad studio reflection environment illuminates the original materials
  // alongside the room’s original architecture and furnishings.
  const ew=128,eh=64,pixels=new Float32Array(ew*eh*4);
  for(let y=0;y<eh;y++)for(let x=0;x<ew;x++){
    const u=x/ew,v=y/eh;
    const panel=(cx,cy,sx,sy)=>Math.exp(-Math.pow((u-cx)/sx,4)-Math.pow((v-cy)/sy,4));
    const key=panel(.22,.63,.12,.23)*.5,fill=panel(.73,.67,.16,.22)*.2;
    const i=(y*ew+x)*4;pixels[i]=.07+key+fill*.8;pixels[i+1]=.08+key*.95+fill*.9;pixels[i+2]=.1+key*.9+fill;pixels[i+3]=1;
  }
  const source=new T.DataTexture(pixels,ew,eh,T.RGBAFormat,T.FloatType);source.mapping=T.EquirectangularReflectionMapping;source.needsUpdate=true;
  const pmrem=new T.PMREMGenerator(renderer),environment=keep(pmrem.fromEquirectangular(source));
  scene.environment=environment.texture;pmrem.dispose();source.dispose();
  const ambient=new T.HemisphereLight('#c2c8ed','#382333',.18);scene.add(ambient);
  const key=new T.DirectionalLight('#e1e6ff',.45);key.position.set(1.2,3.2,2);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:12});key.shadow.normalBias=.003;key.shadow.bias=-.0001;scene.add(key);
  const fill=new T.DirectionalLight('#c4d4f5',.10);fill.position.set(-1,2.6,2.5);scene.add(fill);
  // Authored Blender area-light locations, colors, sizes and relative power.
  // Convert total emitter power to surface intensity; exposure is calibrated
  // for realtime rendering rather than claiming a Cycles-identical result.
  for(const source of data.lights){
    const light=new T.RectAreaLight(new T.Color().fromArray(source.color),source.power/(Math.PI*source.width*source.height),source.width,source.height);
    light.name='source-light-'+source.name;light.position.fromArray(source.position);light.up.fromArray(source.up);
    light.lookAt(light.position.clone().add(new T.Vector3(...source.direction)));scene.add(light);
  }
  const mainMonitor=new T.Group();mainMonitor.name='main-monitor';mainMonitor.position.fromArray(data.screen.center);scene.add(mainMonitor);
  const screenMaterial=keep(new T.MeshBasicMaterial({color:'#030504',toneMapped:false}));
  const screenGeometry=keep(new T.PlaneGeometry(data.screen.width,data.screen.height));
  const display=new T.Mesh(screenGeometry,screenMaterial);display.name='display-surface';mainMonitor.add(display);
  mainMonitor.userData.screenMaterial=screenMaterial;
  const screenLight=new T.PointLight('#b8cfed',0,1.8,2);screenLight.position.copy(mainMonitor.position).add(new T.Vector3(0,-.08,.12));scene.add(screenLight);
  const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
  const pointer={x:0,y:0};
  let disposed=false, qualityReduced=false, lastFrame=null;
  const screenCenter=new T.Vector3(...data.screen.center);
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
    const apertureW=Math.min(data.screen.width,data.screen.height*camera.aspect);
    const apertureH=Math.min(data.screen.height,data.screen.width/camera.aspect);
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
    const endDistance=Math.min(data.screen.height,data.screen.width/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
    // One continuous dolly. Its final pose is exactly front-on to the display.
    // Start inside the room so the cutaway edges and empty exterior stay out of view.
    const startDistance=6.4;
    const distance=T.MathUtils.lerp(startDistance,endDistance,progress);
    const side=T.MathUtils.lerp(2.2,0,align);
    const elevation=T.MathUtils.lerp(1.65,0,smooth((time-3.2)/6.7));
    const parallax=1-smooth((time-4)/3.5);
    camera.position.set(screenCenter.x+side+pointer.x*parallax,screenCenter.y+elevation-pointer.y*parallax,screenCenter.z+distance);
    const target=new T.Vector3(screenCenter.x+.55*(1-align),screenCenter.y+.05*(1-align),screenCenter.z);
    camera.lookAt(target);camera.updateMatrixWorld();
    const reveal=.008+.992*smooth(time/2.8);
    const glowLevel=smooth((bootTime-3.0)/.65);
    renderer.toneMappingExposure=1.25*reveal;
    screenLight.intensity=glowLevel*.18;
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
  }catch(error){
    resources.forEach(resource=>resource.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();throw error;
  }
};
