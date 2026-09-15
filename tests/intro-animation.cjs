/* Run with: node tests/intro-animation.cjs. Uses the shipped Three.js math;
   only GPU rendering is stubbed, so the production camera/projection is tested. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),THREE=require(path.join(root,'assets/vendor/three.min.js'));
(async()=>{
let scene,camera;
class Renderer{
  constructor(){this.shadowMap={};this.domElement={addEventListener(){},removeEventListener(){},remove(){}};}
  setPixelRatio(){}setSize(){}render(s,c){scene=s;camera=c;}dispose(){}forceContextLoss(){}
}
// Environment convolution is a GPU operation; geometry, textures, materials,
// instancing and camera math still use the shipped Three.js implementation.
class PMREMGenerator{
  fromEquirectangular(){return new THREE.WebGLRenderTarget(16,16);}dispose(){}
}
const listeners={};
const window={THREE:{...THREE,WebGLRenderer:Renderer,PMREMGenerator},devicePixelRatio:1,addEventListener(k,fn){listeners[k]=fn;},removeEventListener(){}};
class ImageStub{set src(value){this.source=value;queueMicrotask(()=>this.onload());}}
const assetResponse=url=>{
 const body=fs.readFileSync(path.join(root,url));
 return new Response(body,{headers:{'content-length':String(body.length)}});
};
const context=vm.createContext({window,atob,Blob,Response,DecompressionStream,TransformStream,fetch:async url=>assetResponse(url),Image:ImageStub,innerWidth:1280,innerHeight:720});
window.WorkspaceModelData=JSON.parse(fs.readFileSync(path.join(root,'assets/models/room-scene.json'),'utf8'));
vm.runInContext(fs.readFileSync(path.join(root,'scene.js'),'utf8'),context);
const host={clientWidth:1280,clientHeight:720,appendChild(){}};
const model=window.WorkspaceModelData;
delete window.WorkspaceModelData;
await assert.rejects(window.createWorkspaceScene(host,{}),/unavailable/,'Missing models must use simple boot, never the deleted scene');
window.WorkspaceModelData=model;
const encodedGeometry=model.geometry;
model.geometry={...encodedGeometry,codec:'unsupported'};
await assert.rejects(window.createWorkspaceScene(host,{}),/Unsupported room geometry/);
model.geometry={...encodedGeometry,url:'assets/models/model-stats.json'};
await assert.rejects(window.createWorkspaceScene(host,{}),'Corrupt compressed geometry must reject before creating GPU resources');
model.geometry=encodedGeometry;
const studio=await window.createWorkspaceScene(host,{arrival:10.4});
assert.equal(require('node:crypto').createHash('sha256').update(new Uint8Array(model.decodedGeometry)).digest('hex'),encodedGeometry.sha256,'Runtime decompression preserves the exact packed bytes');
studio.render(5);
// Detailed props must keep a bounded draw/triangle budget, and every shared
// surface map, material, geometry and instance buffer must survive until exit.
const liveResources=new Set();let drawCount=0,triangleCount=0;
scene.traverse(object=>{
 if(!object.isMesh)return;
 drawCount++;triangleCount+=(object.geometry.index?.count??object.geometry.attributes.position.count)/3*(object.isInstancedMesh?object.count:1);
 liveResources.add(object.geometry);liveResources.add(object.material);
 if(object.isInstancedMesh)liveResources.add(object);
 for(const value of Object.values(object.material))if(value?.isTexture)liveResources.add(value);
});
assert(drawCount<240,'Material batching bounds draw calls without changing model detail');
const stats=JSON.parse(fs.readFileSync(path.join(root,'assets/models/model-stats.json')));
assert.equal(stats.decimation,true,'The deployed scene should use the optimized fixed-camera mesh');
assert.ok(stats.decimationRatio<.41,'The optimized scene should retain about 40% of the source triangles');
assert.ok(stats.maxSimplificationError<=.0031,'Simplification must stay inside the visual error budget');
assert.equal(stats.maxTextureSize,1024,'Fixed-camera textures should be capped at 1K');
assert(Object.values(model.textures).every(texture=>Math.max(texture.width,texture.height)<=1024),'Every deployed texture respects the 1K cap');
assert.equal(triangleCount,stats.triangles,'The rendered triangle count matches the optimized model statistics');
const set=scene.getObjectByName('gaming-room');assert(set);
assert.equal(set.children.length,model.parts.length);
// TV must emit its original image toward the room despite the source's
// inward winding; laptop parts must be absent from the delivered assembly.
const tv=set.children.find(o=>o.material.name==='Material.005');
assert(tv?.material.emissiveMap&&tv.material.emissiveIntensity>0,'TV retains its emission image');
assert.equal(tv.material.map,tv.material.emissiveMap);
const ps5=set.children.find(o=>o.material.name==='emission_blue.003');
assert(ps5?.material.emissive.b>ps5.material.emissive.r*4&&ps5.material.emissiveIntensity>0,'PS5 restores its cool blue node-based emission');
const ps5Body=set.children.find(o=>o.material.name==='body_black.003');
assert(ps5Body?.material.color.r<.01&&ps5Body.material.emissive.b>ps5Body.material.emissive.r,'PS5 center body remains black with a cool cast');
assert(!scene.getObjectByName('source-light-ps5-blue'),'PS5 uses emissive material without a point-light hotspot');
const tvPoint=new THREE.Vector3(),tvNormal=new THREE.Vector3();
for(let i=0;i<3;i++)tvPoint.add(new THREE.Vector3().fromBufferAttribute(tv.geometry.attributes.position,tv.geometry.index.getX(i)));
tvPoint.divideScalar(3);tvNormal.fromBufferAttribute(tv.geometry.attributes.normal,tv.geometry.index.getX(0));
assert(new THREE.Raycaster(tvPoint.clone().addScaledVector(tvNormal,-.1),tvNormal).intersectObject(tv).length,'TV display is visible from the reverse side facing the room');
const laptopParts=model.excludedObjects.filter(o=>o.reason==='laptop');
assert.equal(laptopParts.length,21);
assert(laptopParts.every(part=>!model.objects.some(o=>o.name===part.name)));
assert.equal(triangleCount,model.parts.reduce((total,part)=>total+part.triangles,0)+2);
for(const name of ['Cube','Plane_Plane.035','Circle.001','Circle.003','Plane.014_Plane.007','Cube.009','Sit_Cube.432'])assert(model.objects.some(o=>o.name===name),'Original room, desk, monitors, bed, window and chair retained');
for(const name of ['flos-kelvin','xiaomi-desk-lamp','gaming-desk','studio-nas','encyclopedia-1'])assert(!scene.getObjectByName(name),'No retired props return');
scene.traverse(o=>{
 if(!o.isMesh)return;
 assert(o.geometry.attributes.position.array.every(Number.isFinite));
 assert(o.geometry.index.array.every(i=>i<o.geometry.attributes.position.count));
 if(o.material.map)assert(o.geometry.attributes.uv,'Textured source parts retain UVs');
});
for(const name of ['Cube.376_Cube.396','Cube.359_Cube.361'])assert(!model.objects.some(o=>o.name===name),'Discard detached floating fragments');
assert(model.excludedObjects.some(o=>o.name==='Cube.376_Cube.396'));
assert.equal(model.lights.length,5,'Recover all five original Blender area lights');
assert.equal(model.lights.filter(l=>l.color[0]>.9&&l.color[1]<.02).length,4,'Keep the four authored red lights');
for(const source of model.lights){
 const light=scene.getObjectByName('source-light-'+source.name);
 assert(light?.isRectAreaLight);assert.equal(light.width,source.width);assert.equal(light.height,source.height);
 assert.deepEqual(light.position.toArray(),Array.from(source.position));
}
for(const kind of ['FLOAT','HALF'])for(const i of [1,2])liveResources.add(THREE.UniformsLib['LTC_'+kind+'_'+i]);
scene.updateMatrixWorld(true);
const center=new THREE.Vector3(...model.screen.center);
for(const x of [-.4,0,.4])for(const y of [-.4,0,.4]){
 const ray=new THREE.Raycaster(center.clone().add(new THREE.Vector3(x*model.screen.width,y*model.screen.height,.2)),new THREE.Vector3(0,0,-1));
 const hits=ray.intersectObject(scene,true).filter(h=>!h.object.material.transparent);
 assert.equal(hits[0]?.object.name,'display-surface','Monitor casing cannot cover the BIOS aperture');
}
const disposedResources=new Set();
liveResources.forEach(resource=>resource.addEventListener('dispose',()=>disposedResources.add(resource)));
function project(p,x,y){
  const m=p.transform.slice(9,-1).split(',').map(Number),den=m[3]*x+m[7]*y+m[15];
  return [(m[0]*x+m[4]*y+m[12])/den,(m[1]*x+m[5]*y+m[13])/den];
}
function scaleAt(p,x,y){
  const a=project(p,x,y),b=project(p,x+1,y),c=project(p,x,y+1);
  return [Math.hypot(b[0]-a[0],b[1]-a[1]),Math.hypot(c[0]-a[0],c[1]-a[1])];
}
const sizes=[[280,900],[320,568],[375,667],[390,844],[430,932],[520,800],[521,800],[699,828],[700,828],[701,828],[773,828],[800,600],[1024,768],[1280,720],[1920,1080],[2560,1080],[568,320],[667,375],[844,390],[1280,400]];
let frameCount=0,maxError=0;
for(const [w,h] of sizes){
 host.clientWidth=context.innerWidth=w;host.clientHeight=context.innerHeight=h;listeners.resize();
 for(const pointer of [[w/2,h/2],[0,0],[w,h]]){
  listeners.pointermove({clientX:pointer[0],clientY:pointer[1]});
  let previous=[],lastDistance=Infinity;
  const frames=[];
  for(let i=0;i<=1040;i++){
   const t=i/100,p=studio.render(t);frameCount++;
   assert.equal(p.width,w);assert.equal(p.height,h,'Boot layout must not resize during scroll');
   const distance=camera.position.distanceTo(center);
   if(i===0&&pointer[0]===w/2){
    for(const x of [-.98,0,.98])for(const y of [-.98,.98]){
     const frameRay=new THREE.Raycaster();frameRay.setFromCamera(new THREE.Vector2(x,y),camera);
     assert(frameRay.intersectObject(scene,true).some(hit=>hit.distance<camera.far),`${w}x${h}: opening frame exposes empty exterior at ${x},${y}`);
    }
   }
   if(w===1280&&h===720&&pointer[0]===w/2&&i>=400&&i%25===0){
    const sightTarget=center.clone().add(new THREE.Vector3(.03,.01,0));
    const sight=new THREE.Raycaster(camera.position,sightTarget.sub(camera.position).normalize());
    const hits=sight.intersectObject(scene,true).filter(hit=>!hit.object.material.transparent);
    assert.equal(hits[0]?.object.name,'display-surface',`The boot camera must clear furnishings at ${t}: ${hits[0]?.object.material.name} / ${hits[0]?.point.toArray()} / camera ${camera.position.toArray()}`);
   }
   assert(distance<=lastDistance+1e-8,`${w}x${h} camera retreats at ${t}`);lastDistance=distance;
   const scales=[];
   for(const [x,y] of [[.5,.5],[.2,.2],[.8,.2],[.2,.8],[.8,.8]])scales.push(...scaleAt(p,w*x,h*y));
   if(t>=4){
    scales.forEach((s,j)=>{
     assert(s<=1.000001,`${w}x${h} zoom overshoots at ${t}: ${s}`);
     if(previous.length)assert(s>=previous[j]-1e-7,`${w}x${h} content shrinks at ${t}`);
    });previous=scales;
   }
   assert(p.points.flat().every(Number.isFinite));frames.push(p.transform);
   const display=scene.getObjectByName('display-surface');
   assert.equal(display.scale.y,1);assert.equal(display.geometry.parameters.height,model.screen.height);
   if(i===1040){
    const corners=[[0,0],[w,0],[w,h],[0,h]];
    const error=Math.max(...p.points.flatMap((pt,j)=>pt.map((v,k)=>Math.abs(v-corners[j][k]))));
    maxError=Math.max(maxError,error);assert(error<.001,'Fullscreen handoff must be continuous');
   }
  }
  // Scroll position is the sole input: rewind and abrupt jumps reproduce
  // the same projection; stopping never starts a catch-up animation.
  for(const i of [1040,1039,990,920,830,610,400,0,950,420]){
   const p=studio.render(i/100);assert.equal(p.transform,frames[i]);assert.equal(studio.render(i/100),p);
  }
 }
}
// A browser resize can arrive while fullscreen boot has display:none on
// the studio. Rewinding must still use the new, nonzero viewport.
host.clientWidth=0;host.clientHeight=0;window.innerWidth=375;window.innerHeight=667;listeners.resize();
const hiddenResize=studio.render(9);
assert.equal(hiddenResize.width,375);assert.equal(hiddenResize.height,667);assert(hiddenResize.points.flat().every(Number.isFinite));
host.clientWidth=375;host.clientHeight=667;listeners.resize();assert.equal(studio.render(9).transform,hiddenResize.transform);
studio.dispose();
assert.equal(disposedResources.size,liveResources.size,'Release shared GPU resources when leaving the intro');
studio.dispose(); // Repeated exit/context-loss cleanup remains harmless.
// A double-clicked index.html cannot fetch sibling files. Its generated,
// deployment-excluded bundle must carry the same scene without any fetch.
const offlineContext=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/models/room-scene.js'),'utf8'),offlineContext);
const offlineModel=offlineContext.window.WorkspaceModelData;
assert.equal(offlineModel.version,6);assert(offlineModel.geometry.data);assert(!offlineModel.geometry.url);
assert(Object.values(offlineModel.textures).every(texture=>texture.url.startsWith('data:image/webp;base64,')));
context.fetch=async()=>{throw new Error('Offline scene must not fetch')};window.WorkspaceModelData=offlineModel;
const offlineStudio=await window.createWorkspaceScene(host,{arrival:10.4});offlineStudio.render(5);offlineStudio.dispose();
console.log(`PASS: ${drawCount} mesh batches, ${triangleCount} triangles; all ${liveResources.size} shared resources released.`);
console.log('PASS: self-contained file:// room bundle requires no fetch.');
console.log(`PASS: ${sizes.length} viewports, ${frameCount} camera frames, five content positions, three pointer positions; no overshoot or retreat. Handoff error < ${Math.max(maxError,1e-12)} px.`);

// Exercise the production application clock without GPU or browser timers.
class Element{
 constructor(){
  const classes=new Set();this.classList={add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},contains(x){return classes.has(x);},toggle(x,on){on??=!classes.has(x);on?classes.add(x):classes.delete(x);return on;}};
  this.style={setProperty(k,v){this[k]=v;}};this.dataset={};this.children=[];this.offsetHeight=405;this.clientHeight=667;this.scrollHeight=2535;this.scrollTop=0;
 }
 append(x){this.children.push(x);}replaceChildren(){this.children=[];}setAttribute(k,v){this[k]=v;}removeAttribute(k){delete this[k];}focus(){}
}
const elements=new Map(),$=selector=>{if(!elements.has(selector))elements.set(selector,new Element());return elements.get(selector);};
const appWindow={innerWidth:375,innerHeight:667,scrollTo(){}};
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const loaderSource=appSource.slice(appSource.indexOf('async function loadRoomManifest'),appSource.indexOf('function showSceneLoading'));
let offlineScriptLoads=0;
const loaderWindow={location:{protocol:'file:'}};
const loaderContext=vm.createContext({window:loaderWindow,loadClassic:async()=>{offlineScriptLoads++;loaderWindow.WorkspaceModelData=offlineModel;},fetch:async()=>{throw new Error('file:// loader must not fetch')}});
vm.runInContext(loaderSource,loaderContext);
assert.equal((await vm.runInContext('loadRoomManifest()',loaderContext)).version,6);assert.equal(offlineScriptLoads,1);
const appContext=vm.createContext({$,document:{hidden:false,body:new Element(),createElement:()=>new Element(),querySelectorAll(selector){return selector==='.boot-stage-rail span'?Array.from({length:4},()=>new Element()):[];}},window:appWindow,navigator:{},reducedMotion:{matches:false},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},loadClassic:async()=>{},loadRoomManifest:async()=>model,showSceneLoading(){},hideSceneLoading(){},AbortController,closeApp(){},console});
vm.runInContext(`let phase='intro',opening=null,openingFrame=0,sceneCleanup=null,sceneLoadController=null,studio=null,introRun=0;`+appSource.slice(appSource.indexOf('// One scroll position'),appSource.indexOf('window.HugoOS?.init();')),appContext);
const run=code=>vm.runInContext(code,appContext);
appContext.assertSceneVisible=()=>assert(!$('#cinematic').classList.contains('hidden'),'Never project from a hidden zero-size scene, including on rewind');
run(`studio={render(){assertSceneVisible();return {transform:'projection'};},reduceQuality(){}};beginClock();`);
const scroller=$('#intro-scroll');
const bootLineTimes=[4.45,5,5.55,6.25,7.35,8.05,8.85,10,11.7,12.25,12.85,13.45,14,14.6,15.25];
for(const time of [0,2.6,3.65,4.15,4.45,7.2,8.05,10.399,10.4,11.55,13.85,15.25,15.64,15.65,10.39,8,0,15]){
 scroller.scrollTop=(time+1e-8)/17.2*(scroller.scrollHeight-scroller.clientHeight);run('tickOpening(1000)');
 assert(Math.abs(Number($('#boot').dataset.elapsed)-time)<.001);
 assert.equal($('#boot-lines').children.filter(e=>!e.classList.contains('hidden')).length,Math.min(7,bootLineTimes.filter(t=>t<=time).length));
 assert.equal($('#boot').dataset.presentation,time<10.4?'monitor':'fullscreen');
 assert.equal($('#boot').classList.contains('hidden'),time<3.65);
 assert.equal($('#boot-ready').classList.contains('hidden'),time<15.65);
 assert.equal($('#boot-log').style.visibility,time>=4.15&&time<15.65?'visible':'hidden');
 const before=$('#boot').dataset.elapsed;run('tickOpening(900000)');assert.equal($('#boot').dataset.elapsed,before,'Paused scroll must not autoplay');
}
// Resize preserves timeline percentage rather than using the old pixel offset.
const resizeSource=appSource.slice(appSource.indexOf("window.addEventListener('resize',"),appSource.indexOf("window.addEventListener('hashchange',"));
appContext.dialog={open:false};appWindow.addEventListener=(_,fn)=>{appContext.resizeIntro=fn;};run(resizeSource);
const beforeResize=Number($('#boot').dataset.elapsed);scroller.clientHeight=375;scroller.scrollHeight=1425;appWindow.innerWidth=667;appWindow.innerHeight=375;run('resizeIntro();tickOpening(900001)');assert(Math.abs(Number($('#boot').dataset.elapsed)-beforeResize)<.001);
// Scroll completion releases the scene; shutdown and re-entry start at zero even on phones.
scroller.scrollTop=scroller.scrollHeight-scroller.clientHeight;run('tickOpening(900002)');assert.equal(run('phase'),'desktop');assert.equal($('#desktop').inert,false);assert.equal(run('studio'),null);
(async()=>{
 appWindow.THREE={};appWindow.createWorkspaceScene=()=>({render(){return {transform:'projection'};},dispose(){}});
 await run('startIntro()');run('tickOpening(1)');assert.equal(Number($('#boot').dataset.elapsed),0);assert.equal(run('phase'),'intro');
 run('enterDesktop()');assert.equal(run('phase'),'desktop');
 appContext.reducedMotion.matches=true;await run('startIntro()');assert.equal(run('opening.interactive'),false);assert.equal(run('opening.time'),15.65);
 for(let t=100;t<=800;t+=100)run(`tickOpening(${t})`);assert.equal(run('phase'),'desktop');
 appContext.reducedMotion.matches=false;appContext.navigator.connection={saveData:true};await run('startIntro()');run('tickOpening(1)');assert.equal(run('opening.start'),4.15);assert.equal(run('opening.interactive'),true);assert.equal(run('studio'),null);
 // WebGL loss mid-intro retains current time and hands off to scroll boot.
 appContext.navigator.connection={};appWindow.createWorkspaceScene=(_,callbacks)=>{appContext.failScene=callbacks.onFailure;return {render(){return {transform:'projection'};},dispose(){}};};
 await run('startIntro()');scroller.scrollTop=12/17.2*(scroller.scrollHeight-scroller.clientHeight);run('tickOpening(1);failScene();tickOpening(2)');assert.equal(Number($('#boot').dataset.elapsed),12);assert.equal(run('opening.start'),4.15);assert.equal(run('studio'),null);
 // Texture decoding is asynchronous. Skipping while it is pending must
 // dispose the late scene and must never restart the intro over the desktop.
 appWindow.WorkspaceModelData={version:6};
 let finishScene,lateDisposals=0;
 appWindow.createWorkspaceScene=()=>new Promise(resolve=>{finishScene=resolve;});
 const pendingIntro=run('startIntro()');while(!finishScene)await Promise.resolve();run('enterDesktop()');
 finishScene({dispose(){lateDisposals++;}});await pendingIntro;
 assert.equal(lateDisposals,1);assert.equal(run('phase'),'desktop');assert.equal(run('studio'),null);
 delete appWindow.WorkspaceModelData;
 appContext.loadRoomManifest=async()=>{throw Error('Missing model bundle');};
 await run('startIntro()');
 assert.equal(run('studio'),null);assert.equal(run('opening.start'),4.15,'Missing set uses lightweight boot');
 console.log('PASS: BIOS stages, reverse scrolling, pause, resize, completion, skip/shutdown, reduced motion, save-data fallback and WebGL context loss.');
})().catch(error=>{console.error(error);process.exitCode=1;});

})().catch(error=>{console.error(error);process.exitCode=1;});
