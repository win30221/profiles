/* Run with: node tests/intro-animation.cjs. Uses the shipped Three.js math;
   only GPU rendering is stubbed, so the production camera/projection is tested. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),THREE=require(path.join(root,'assets/vendor/three.min.js'));
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
const context=vm.createContext({window,innerWidth:1280,innerHeight:720});
vm.runInContext(fs.readFileSync(path.join(root,'scene.js'),'utf8'),context);
const host={clientWidth:1280,clientHeight:720,appendChild(){}};
const studio=window.createWorkspaceScene(host,{arrival:10.4});
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
assert(drawCount<250,'Repeated details must be batched to bound draw calls');
assert(triangleCount<160000,'Keep the stylized scene within its geometry budget');
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
   const distance=camera.position.distanceTo(new THREE.Vector3(-.34,2.075,-.726));
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
   const monitor=scene.children.find(o=>o.userData?.led&&o.position.x===-.34);
   assert.equal(monitor.children[1].scale.y,1);assert.equal(monitor.children[1].geometry.parameters.height,.96);
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
console.log(`PASS: ${drawCount} mesh batches, ${triangleCount} triangles; all ${liveResources.size} shared resources released.`);
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
const appContext=vm.createContext({$,document:{hidden:false,body:new Element(),createElement:()=>new Element()},window:appWindow,navigator:{},reducedMotion:{matches:false},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},loadClassic:async()=>{},closeApp(){},console});
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
vm.runInContext(`let phase='intro',opening=null,openingFrame=0,sceneCleanup=null,studio=null,introRun=0;`+appSource.slice(appSource.indexOf('// One scroll position'),appSource.indexOf("$('#app-nav').innerHTML=")),appContext);
const run=code=>vm.runInContext(code,appContext);
appContext.assertSceneVisible=()=>assert(!$('#cinematic').classList.contains('hidden'),'Never project from a hidden zero-size scene, including on rewind');
run(`studio={render(){assertSceneVisible();return {transform:'projection'};},reduceQuality(){}};beginClock();`);
const scroller=$('#intro-scroll');
for(const time of [0,2.6,3.65,4,4.5,7,9,10.399,10.4,12.4,13.2,13.35,10.39,8,0,12.4]){
 scroller.scrollTop=(time+1e-8)/14.8*(scroller.scrollHeight-scroller.clientHeight);run('tickOpening(1000)');
 assert(Math.abs(Number($('#boot').dataset.elapsed)-time)<.001);
 assert.equal($('#boot-lines').children.filter(e=>!e.classList.contains('hidden')).length,[4.5,5.2,6.1,7,8,9,10.7,11.5,12.4].filter(t=>t<=time).length);
 assert.equal($('#boot').dataset.presentation,time<10.4?'monitor':'fullscreen');
 assert.equal($('#boot').classList.contains('hidden'),time<3.65);
 assert.equal($('#boot-ready').classList.contains('hidden'),time<13.35);
 assert.equal($('#boot-log').style.visibility,time>=4&&time<13.15?'visible':'hidden');
 const before=$('#boot').dataset.elapsed;run('tickOpening(900000)');assert.equal($('#boot').dataset.elapsed,before,'Paused scroll must not autoplay');
}
// Resize preserves timeline percentage rather than using the old pixel offset.
const resizeSource=appSource.slice(appSource.indexOf("window.addEventListener('resize',"),appSource.indexOf("window.addEventListener('hashchange',"));
appContext.dialog={open:false};appWindow.addEventListener=(_,fn)=>{appContext.resizeIntro=fn;};run(resizeSource);
const beforeResize=Number($('#boot').dataset.elapsed);scroller.clientHeight=375;scroller.scrollHeight=1425;appWindow.innerWidth=667;appWindow.innerHeight=375;run('resizeIntro();tickOpening(900001)');assert(Math.abs(Number($('#boot').dataset.elapsed)-beforeResize)<.001);
// Scroll completion releases the scene; replay starts at zero even on phones.
scroller.scrollTop=scroller.scrollHeight-scroller.clientHeight;run('tickOpening(900002)');assert.equal(run('phase'),'desktop');assert.equal($('#desktop').inert,false);assert.equal(run('studio'),null);
(async()=>{
 appWindow.THREE={};appWindow.createWorkspaceScene=()=>({render(){return {transform:'projection'};},dispose(){}});
 await run('startIntro()');run('tickOpening(1)');assert.equal(Number($('#boot').dataset.elapsed),0);assert.equal(run('phase'),'intro');
 run('enterDesktop()');assert.equal(run('phase'),'desktop');
 appContext.reducedMotion.matches=true;await run('startIntro()');assert.equal(run('opening.interactive'),false);assert.equal(run('opening.time'),13.35);
 for(let t=100;t<=800;t+=100)run(`tickOpening(${t})`);assert.equal(run('phase'),'desktop');
 appContext.reducedMotion.matches=false;appContext.navigator.connection={saveData:true};await run('startIntro()');run('tickOpening(1)');assert.equal(run('opening.start'),4);assert.equal(run('opening.interactive'),true);assert.equal(run('studio'),null);
 // WebGL loss mid-intro retains current time and hands off to scroll boot.
 appContext.navigator.connection={};appWindow.createWorkspaceScene=(_,callbacks)=>{appContext.failScene=callbacks.onFailure;return {render(){return {transform:'projection'};},dispose(){}};};
 await run('startIntro()');scroller.scrollTop=9/14.8*(scroller.scrollHeight-scroller.clientHeight);run('tickOpening(1);failScene();tickOpening(2)');assert.equal(Number($('#boot').dataset.elapsed),9);assert.equal(run('opening.start'),4);assert.equal(run('studio'),null);
 console.log('PASS: BIOS stages, reverse scrolling, pause, resize, completion, skip/replay, reduced motion, save-data fallback and WebGL context loss.');
})().catch(error=>{console.error(error);process.exitCode=1;});
