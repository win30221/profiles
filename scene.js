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
  renderer.toneMappingExposure=1.2;
  host.appendChild(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color('#0c0e11');scene.fog=new T.FogExp2('#0c0e11',.032);
  let viewportWidth=host.clientWidth,viewportHeight=host.clientHeight;
  const camera=new T.PerspectiveCamera(42,viewportWidth/viewportHeight,.05,65);
  const resources=new Set(),geometryCache=new Map();
  function keep(resource){resources.add(resource);return resource;}
  function material(color,roughness=.65,metalness=0,extra={}){
    return keep(new T.MeshStandardMaterial({color,roughness,metalness,envMapIntensity:.32,...extra}));
  }
  // Small, deterministic, tileable surface maps. No downloads or canvas APIs;
  // the same materials work from file:// and are released with the scene.
  function surface(kind,repeatX=1,repeatY=1){
    const size=128,data=new Uint8Array(size*size*4);
    let seed=641;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const noise=(seed/4294967296-.5)*12;
      const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
      let value=230+noise;
      if(kind==='wood')value=223+noise*.35+10*Math.sin(v*18+1.2*Math.sin(u*2)) + 5*Math.sin(v*43+.6*Math.sin(u*3));
      if(kind==='fabric')value=229+noise*.5+8*Math.cos(u*32)*Math.cos(v*32);
      if(kind==='brushed')value=231+noise*.25+7*Math.sin(v*48);
      const i=(y*size+x)*4;
      data[i]=data[i+1]=data[i+2]=Math.round(value);data[i+3]=255;
    }
    const tex=keep(new T.DataTexture(data,size,size,T.RGBAFormat));
    tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(repeatX,repeatY);
    tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;
    return tex;
  }
  const grain=surface('wood',2,2),plasticGrain=surface('plastic',2,2),weave=surface('fabric',6,3),brushed=surface('brushed',2,2);
  const charcoal=material('#282c32',.76,.08,{roughnessMap:plasticGrain,bumpMap:plasticGrain,bumpScale:.0006});
  const black=material('#111419',.86,0,{roughnessMap:plasticGrain});
  const steel=material('#6d747d',.4,.82,{roughnessMap:brushed,envMapIntensity:.55});
  const wood=material('#413831',.78,0,{map:grain,roughnessMap:grain,bumpMap:grain,bumpScale:.0012});
  const paper=material('#a6a39a',.96),green=material('#46504a',.85);
  const ceramic=keep(new T.MeshPhysicalMaterial({color:'#aaa79f',roughness:.29,metalness:0,clearcoat:.23,clearcoatRoughness:.32,roughnessMap:plasticGrain,envMapIntensity:.45}));
  const cloth=material('#24282e',.97,0,{roughnessMap:weave,bumpMap:weave,bumpScale:.0008});
  const rubber=material('#111317',.98),pageEdge=material('#787972',.98);
  const keys=material('#656a6e',.84,0,{roughnessMap:plasticGrain,bumpMap:plasticGrain,bumpScale:.0004});
  const modifierKeys=material('#363c43',.86,0,{roughnessMap:plasticGrain});
  const paintedMetal=material('#30363d',.65,.48,{roughnessMap:plasticGrain,bumpMap:plasticGrain,bumpScale:.0005});
  const glass=keep(new T.MeshPhysicalMaterial({color:'#080a0d',roughness:.22,metalness:0,clearcoat:.65,clearcoatRoughness:.2,envMapIntensity:.18}));
  const ledGreen=glow('#82ad8d',.45),ledAmber=glow('#b6a07a',.35);
  function mesh(geometry,mat,parent=scene){keep(geometry);const m=new T.Mesh(geometry,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function cached(key,build){if(!geometryCache.has(key))geometryCache.set(key,keep(build()));return geometryCache.get(key);}
  function box(x,y,z,w,h,d,mat,parent=scene){
    const m=mesh(cached(`box:${w}:${h}:${d}`,()=>new T.BoxGeometry(w,h,d)),mat,parent);m.position.set(x,y,z);return m;
  }
  // Real rounded geometry with planar faces and two small bevel segments.
  // Exact outer dimensions are preserved; shared shapes keep GPU memory small.
  function bevel(x,y,z,w,h,d,r,mat,parent=scene){
    r=Math.min(r,w/2-.00001,h/2-.00001,d/2-.00001);
    const geometry=cached(`bevel:${w}:${h}:${d}:${r}`,()=>{
      const g=new T.BoxGeometry(1,1,1,5,5,5),p=g.attributes.position,n=g.attributes.normal;
      const half=[w/2,h/2,d/2],v=new T.Vector3(),core=new T.Vector3(),normal=new T.Vector3();
      for(let i=0;i<p.count;i++){
        v.fromBufferAttribute(p,i);
        ['x','y','z'].forEach((axis,j)=>{
          const a=half[j],samples=[-a,-a+r*.293,-a+r,a-r,a-r*.293,a];
          v[axis]=samples[Math.round((v[axis]+.5)*5)];core[axis]=T.MathUtils.clamp(v[axis],-a+r,a-r);
        });
        normal.copy(v).sub(core).normalize();v.copy(core).addScaledVector(normal,r);
        p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
      }
      g.parameters={width:w,height:h,depth:d,radius:r};g.computeBoundingSphere();return g;
    });
    const m=mesh(geometry,mat,parent);m.position.set(x,y,z);return m;
  }
  function cylinder(x,y,z,r1,r2,h,mat,parent=scene,segments=24){
    const m=mesh(cached(`cylinder:${r1}:${r2}:${h}:${segments}`,()=>new T.CylinderGeometry(r1,r2,h,segments)),mat,parent);m.position.set(x,y,z);return m;
  }
  function sphere(x,y,z,r,mat,parent=scene,s=20){const m=mesh(cached(`sphere:${r}:${s}`,()=>new T.SphereGeometry(r,s,12)),mat,parent);m.position.set(x,y,z);return m;}
  function glow(color,intensity=1){return keep(new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.5}));}
  function line(points,r,mat,parent=scene){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,24,r,8,false),mat,parent);}
  function rod(a,b,r,mat,parent=scene){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const m=cylinder(0,0,0,r,r,delta.length(),mat,parent,16);m.position.copy(start).add(end).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
  }
  function ring(x,y,z,r,t,mat,parent=scene){
    const m=mesh(cached(`ring:${r}:${t}`,()=>new T.TorusGeometry(r,t,8,32)),mat,parent);m.position.set(x,y,z);return m;
  }
  function screw(x,y,z,parent=scene){const m=cylinder(x,y,z,.009,.009,.004,steel,parent,12);m.rotation.x=Math.PI/2;box(x,y,z+.003,.010,.0015,.001,black,parent);}
  // A restrained studio reflection environment: broad soft sources, no HDRI
  // download and no mirror-like sci-fi highlights. Prefiltered once for PBR.
  const envWidth=256,envHeight=128,envPixels=new Float32Array(envWidth*envHeight*4);
  for(let y=0;y<envHeight;y++)for(let x=0;x<envWidth;x++){
    const u=x/envWidth,v=y/envHeight;
    const panel=(cx,cy,sx,sy)=>Math.exp(-Math.pow((u-cx)/sx,4)-Math.pow((v-cy)/sy,4));
    const warm=panel(.2,.67,.075,.17)*2.5,cool=panel(.72,.62,.11,.12)*1.8,ceiling=panel(.48,.88,.3,.06)*1.2;
    const i=(y*envWidth+x)*4;
    envPixels[i]=.035+warm+cool*.81+ceiling;
    envPixels[i+1]=.039+warm*.91+cool*.9+ceiling;
    envPixels[i+2]=.046+warm*.8+cool+ceiling;envPixels[i+3]=1;
  }
  const environmentSource=new T.DataTexture(envPixels,envWidth,envHeight,T.RGBAFormat,T.FloatType);
  environmentSource.mapping=T.EquirectangularReflectionMapping;environmentSource.needsUpdate=true;
  const pmrem=new T.PMREMGenerator(renderer);
  const environment=keep(pmrem.fromEquirectangular(environmentSource));scene.environment=environment.texture;
  environmentSource.dispose();pmrem.dispose();
  // Quiet architectural shell, same composition in neutral charcoal.
  box(0,-.12,0,16,.2,16,material('#202329',.98));
  box(0,3,-3.2,12,6,.16,material('#303339',.98));
  box(-5,3,1,.16,6,8,material('#24272d',.98));
  const slat=material('#33363b',.93);
  for(let x=-5;x<6;x+=.34)bevel(x,3.1,-3.08,.04,5.5,.09,.008,slat);
  for(let z=-6;z<7;z+=1.7)box(0,-.01,z,12,.002,.012,black);
  for(let x=-5;x<7;x+=1.7)box(x,-.01,0,.012,.002,12,black);
  // Recessed diffuser and shelf, with bound books instead of solid blocks.
  bevel(.3,3.25,-2.92,4.5,.035,.05,.01,glow('#e1d5c2',.9));
  bevel(.3,3.32,-2.98,4.6,.12,.28,.02,charcoal);
  bevel(2.95,2.45,-2.76,2.3,.09,.56,.016,wood);
  function book(parent,w,h,d,cover){
    bevel(0,0,0,w-.015,h-.014,d-.026,.004,paper,parent);
    [-1,1].forEach(sign=>bevel(sign*(w/2-.004),0,0,.008,h,d,.003,cover,parent));
    bevel(0,0,d/2-.005,w,h,.014,.004,cover,parent);
    for(let i=1;i<4;i++)box(-w/2+.009+i*(w-.018)/4,0,-d/2+.012,.001,h-.025,.002,pageEdge,parent);
    box(0,h*.28,d/2+.003,w*.65,.008,.001,pageEdge,parent);
  }
  for(let i=0;i<7;i++){
    const b=new T.Group();b.position.set(2.1+i*.13,2.69+(i%3)*.04,-2.7);b.rotation.z=i===6?-.15:0;scene.add(b);
    book(b,.09,.39+(i%3)*.08,.27,i%2?green:charcoal);
  }
  // Satin dark wood edge, inset textile mat, rubber backing and stitched edge.
  bevel(0,1.29,-.23,4.8,.13,1.85,.033,wood);
  bevel(0,1.367,-.13,3.5,.018,1.12,.008,rubber);
  bevel(0,1.377,-.13,3.48,.009,1.10,.004,cloth);
  const stitch=material('#555960',.98);
  for(let i=0;i<86;i++)for(const z of [-.664,.404])box(-1.7+i*.04,1.382,z,.013,.0008,.0015,stitch);
  for(let i=0;i<25;i++)for(const x of [-1.723,1.723])box(x,1.382,-.625+i*.04,.0015,.0008,.013,stitch);
  [-2.1,2.1].forEach(x=>{
    bevel(x,.63,-.2,.08,1.23,1.5,.015,paintedMetal);
    bevel(x,.07,-.2,.38,.08,1.7,.023,black);
    bevel(x,1.18,-.2,.3,.035,1.5,.01,paintedMetal);
    [-.86,.46].forEach(z=>cylinder(x,.018,z,.085,.09,.035,rubber));
  });
  bevel(0,1.05,-.86,4.25,.1,.07,.013,paintedMetal);
  bevel(-.1,1.11,-.94,2.9,.12,.25,.014,black);
  // The main display's front face remains at z=.054 for the CSS3D BIOS.
  // Secondary displays use subtle dark glass and always remain powered off.
  function monitor(x,y,z,w,h,angle,main=false){
    const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;scene.add(g);
    bevel(0,0,-.009,w+.09,h+.09,.113,.018,charcoal,g);
    const m=main?keep(new T.MeshBasicMaterial({color:'#030504',toneMapped:false})):glass;
    const display=box(0,0,.051,w,h,.006,m,g);display.castShadow=false;
    bevel(0,0,-.076,w*.85,h*.78,.049,.021,black,g);
    bevel(0,-h/2-.035,.047,w+.056,.024,.018,.007,black,g);
    const baseY=1.38-y,stemHeight=-h/2-baseY+.04;
    bevel(0,baseY+stemHeight/2,-.045,.10,stemHeight,.10,.018,paintedMetal,g);
    bevel(0,baseY+stemHeight/2,.009,.036,stemHeight-.04,.006,.003,steel,g);
    const pivot=cylinder(0,-h*.35,-.09,.065,.065,.18,paintedMetal,g);pivot.rotation.z=Math.PI/2;
    bevel(0,baseY,.045,.57,.044,.32,.019,paintedMetal,g);
    bevel(0,baseY-.023,.045,.49,.006,.265,.002,rubber,g);
    for(let i=0;i<18;i++)box(-w*.35+i*w*.7/17,h*.36,-.104,.022,.043,.004,black,g);
    const led=box(w/2-.035,-h/2-.025,.058,.013,.005,.004,glow('#030504',0),g);
    g.userData.led=led;g.userData.screenMaterial=m;
    if(main){
      // A very low-opacity glass layer fades as the terminal comes on, so
      // reflections cannot wash out the HTML boot or its fullscreen handoff.
      const sheen=keep(new T.MeshPhysicalMaterial({color:'#11151c',roughness:.24,metalness:0,transparent:true,opacity:.1,depthWrite:false,envMapIntensity:.25,clearcoat:.5}));
      const pane=box(0,0,.0545,w,h,.0005,sheen,g);pane.castShadow=false;pane.receiveShadow=false;g.userData.glassMaterial=sheen;
    }
    return g;
  }
  const mainMonitor=monitor(-.34,2.075,-.78,1.71,.96,0,true);
  monitor(1.29,2.03,-.68,1.29,.88,-.28);
  // Anodized laptop: recessed keyboard, trackpad seam, side ports and hinge.
  const laptop=new T.Group();laptop.position.set(-1.68,1.4,-.17);laptop.rotation.y=.27;scene.add(laptop);
  bevel(0,-.008,0,.73,.03,.5,.012,steel,laptop);
  bevel(0,-.025,0,.714,.006,.484,.002,black,laptop);
  bevel(0,.008,-.062,.644,.004,.276,.001,black,laptop);
  bevel(0,.009,.153,.245,.003,.114,.001,black,laptop);
  bevel(0,.011,.153,.235,.003,.104,.001,steel,laptop);
  const hinge=cylinder(0,.019,-.222,.023,.023,.56,steel,laptop);hinge.rotation.z=Math.PI/2;
  [-.22,.22].forEach(x=>{const seam=cylinder(x,.019,-.222,.0235,.0235,.009,black,laptop);seam.rotation.z=Math.PI/2;});
  const lid=new T.Group();lid.position.set(0,.02,-.222);lid.rotation.x=-.13;laptop.add(lid);
  bevel(0,.235,0,.73,.47,.029,.012,steel,lid);
  bevel(0,.235,.016,.699,.441,.008,.003,black,lid);
  box(0,.235,.021,.667,.407,.002,glass,lid).castShadow=false;
  sphere(0,.452,.022,.004,black,lid,12);
  for(let r=0;r<4;r++)for(let c=0;c<11;c++)bevel(-.28+c*.056,.015,-.165+r*.052,.045,.01,.041,.003,modifierKeys,laptop);
  bevel(0,.015,.044,.23,.009,.035,.003,modifierKeys,laptop);
  for(let i=0;i<3;i++)bevel(-.366,-.008,-.11+i*.064,.003,.009,.037,.001,black,laptop);
  // Mechanical keyboard, five sculpted rows with proper modifier/space keys.
  const keyboard=new T.Group();keyboard.position.set(-.15,1.399,.21);scene.add(keyboard);
  bevel(0,0,0,1.1,.035,.375,.013,paintedMetal,keyboard);
  bevel(0,-.016,0,1.07,.014,.35,.005,rubber,keyboard);
  bevel(0,.018,-.001,1.067,.008,.342,.003,black,keyboard);
  function keycap(x,z,w,row,mat){
    const cap=bevel(x,.044+(4-row)*.002,z,w,.032,.05,.006,mat,keyboard);cap.rotation.x=-.055+(row*.016);
    // A tiny shallow top facet gives a molded cap profile without noisy legends.
    bevel(x,.060+(4-row)*.002,z+.001,w-.010,.002,.037,.0009,mat,keyboard);
  }
  for(let r=0;r<4;r++)for(let c=0;c<14;c++)keycap(-.476+c*.073,-.133+r*.064,.060,r,c===0?(r===0?green:modifierKeys):c===13?modifierKeys:keys);
  [-.466,-.38,-.294].forEach(x=>keycap(x,.128,.073,4,modifierKeys));
  keycap(-.025,.128,.40,4,keys);
  [.242,.328,.414,.49].forEach(x=>keycap(x,.128,.064,4,modifierKeys));
  const mouse=sphere(.69,1.416,.25,.108,charcoal);mouse.scale.set(.74,.4,1.16);
  line([[.69,1.438,.14],[.69,1.455,.185],[.69,1.459,.24]],.0016,black);
  const wheel=cylinder(.69,1.459,.19,.012,.012,.014,rubber);wheel.rotation.z=Math.PI/2;
  // Ceramic vessel is a closed lathed cross-section with an open cavity.
  const mug=new T.Group();mug.position.set(1.86,1.355,.23);scene.add(mug);
  const profile=[[0,0],[.077,0],[.092,.008],[.098,.026],[.112,.273],[.111,.292],[.106,.301],[.099,.298],[.096,.287],[.086,.04],[.078,.024],[0,.024]];
  const vessel=mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),32),ceramic,mug);vessel.name='ceramic-mug';
  const handle=ring(.14,.165,0,.081,.019,ceramic,mug);handle.scale.set(.85,1.15,1);
  sphere(.093,.252,0,.026,ceramic,mug);sphere(.087,.078,0,.024,ceramic,mug);
  cylinder(0,.227,0,.091,.091,.002,material('#1b1410',.23,0,{envMapIntensity:.18}),mug,32);
  cylinder(0,.004,0,.076,.081,.008,material('#75716b',.91),mug);
  // Bound notebook: independent covers, page block, page edges and elastic.
  const notebook=new T.Group();notebook.position.set(-1.13,1.388,.45);notebook.rotation.y=-.15;scene.add(notebook);
  bevel(0,0,0,.4,.012,.52,.005,charcoal,notebook);
  bevel(.004,.023,0,.38,.034,.494,.004,paper,notebook);
  bevel(0,.046,0,.4,.012,.52,.005,charcoal,notebook);
  bevel(-.193,.023,0,.015,.043,.52,.006,charcoal,notebook);
  for(let i=0;i<5;i++)box(.012,.011+i*.006,.248,.36,.0008,.001,pageEdge,notebook);
  bevel(.116,.054,0,.019,.004,.514,.001,rubber,notebook);
  box(-.06,.006,.274,.022,.001,.04,green,notebook);
  rod([-.89,1.435,.34],[-.83,1.435,.62],.007,paintedMetal);
  rod([-.89,1.435,.34],[-.9,1.435,.31],.004,steel);
  line([[-.837,1.443,.59],[-.839,1.45,.55],[-.85,1.45,.51]],.002,steel);
  // NAS: separate drive sleds, latches, perforations, feet and status lights.
  bevel(2.12,.34,-.55,.38,.58,.49,.025,paintedMetal);
  [-1,1].forEach(s=>bevel(2.12+s*.12,.036,-.55,.06,.035,.34,.009,rubber));
  for(let i=0;i<3;i++){
    const y=.17+i*.15;
    bevel(2.12,y,-.298,.315,.124,.025,.007,black);
    bevel(2.11,y,-.281,.274,.104,.016,.005,charcoal);
    bevel(2.205,y,-.269,.017,.065,.008,.003,steel);
    for(let c=0;c<6;c++)box(2.005+c*.027,y,-.271,.011,.05,.002,black);
    box(2.244,y,-.275,.006,.008,.005,ledGreen);
  }
  for(let i=0;i<9;i++)box(2.312,.31,-.71+i*.033,.002,.24,.012,black);
  // Cable slack stays behind the equipment, with a couple of visible desk runs.
  line([[-.34,1.85,-.89],[-.34,1.36,-1.04],[-.2,.3,-1.1],[1.7,.07,-.9],[2,.23,-.6]],.01,rubber);
  line([[1.3,1.85,-.87],[1.35,1.25,-1.05],[1.6,.14,-1.1],[2,.1,-.6]],.01,rubber);
  line([[-.49,1.41,.018],[-.6,1.388,-.09],[-.68,1.388,-.35],[-.61,1.387,-.65],[-.5,1.31,-1.13]],.004,rubber);
  line([[.69,1.414,.137],[.73,1.389,-.03],[.91,1.388,-.35],[.85,1.385,-.63]],.0035,rubber);
  // Articulated task lamp with physical pivots, paired arms and rolled shade.
  cylinder(-2.07,1.362,-.5,.199,.199,.014,rubber);
  cylinder(-2.07,1.382,-.5,.203,.217,.028,paintedMetal);
  cylinder(-2.07,1.404,-.5,.075,.084,.028,charcoal);
  const joints=[[-2.07,1.43,-.5],[-2.09,2.02,-.5],[-1.96,2.55,-.46],[-1.5,2.5,-.36]];
  for(let i=0;i<joints.length-1;i++)for(const offset of [-.026,.026])rod(joints[i].map((v,j)=>j===2?v+offset:v),joints[i+1].map((v,j)=>j===2?v+offset:v),.012,paintedMetal);
  joints.forEach(([x,y,z])=>{const pivot=cylinder(x,y,z,.043,.043,.085,paintedMetal);pivot.rotation.x=Math.PI/2;screw(x,y,z+.047);});
  rod([-1.5,2.5,-.36],[-1.5,2.43,-.36],.026,steel);
  const shadeProfile=[[.043,.19],[.055,.187],[.164,.025],[.17,.009],[.166,0],[.154,0],[.151,.018],[.046,.171]];
  const shade=mesh(new T.LatheGeometry(shadeProfile.map(p=>new T.Vector2(...p)),32),paintedMetal);shade.position.set(-1.5,2.3,-.36);
  const lip=ring(-1.5,2.309,-.36,.16,.006,steel);lip.rotation.x=Math.PI/2;
  cylinder(-1.5,2.311,-.36,.143,.143,.007,glow('#f4e3cc',1.3));
  line([[-2.07,1.388,-.52],[-2.22,1.384,-.65],[-2.23,1.38,-1.12],[-2.24,.92,-1.19]],.004,rubber);
  const deskLight=new T.SpotLight('#f3dfc5',12,4.5,Math.PI/3.3,.95,2);
  deskLight.position.set(-1.5,2.29,-.35);deskLight.target.position.set(-1.1,1.3,.03);deskLight.castShadow=true;
  deskLight.shadow.mapSize.set(1024,1024);deskLight.shadow.bias=-.0002;deskLight.shadow.normalBias=.012;scene.add(deskLight,deskLight.target);
  // Rack hardware: rack ears, screws, inset vents, handles and quiet LEDs.
  const rack=new T.Group();rack.position.set(-3.55,0,-2.24);rack.rotation.y=.22;scene.add(rack);
  bevel(0,1.1,0,.96,2.2,.8,.025,black,rack);
  [-.46,.46].forEach(x=>bevel(x,1.1,.43,.045,2.14,.055,.008,paintedMetal,rack));
  for(let r=0;r<9;r++){
    const y=.22+r*.22;
    bevel(0,y,.427,.83,.178,.045,.008,paintedMetal,rack);
    bevel(-.08,y,.453,.52,.125,.014,.004,black,rack);
    for(let row=0;row<3;row++)for(let c=0;c<12;c++)box(-.31+c*.041,y-.038+row*.038,.462,.023,.013,.002,charcoal,rack);
    [-.391,.391].forEach(x=>screw(x,y,.459,rack));
    [-.35,.22].forEach(x=>line([[x,y-.047,.462],[x,y-.045,.491],[x,y+.045,.491],[x,y+.047,.462]],.006,steel,rack));
    box(.30,y+.028,.455,.007,.006,.003,r%3?ledGreen:ledAmber,rack);
    box(.33,y+.028,.455,.006,.006,.003,ledGreen,rack);
    bevel(.30,y-.022,.457,.062,.029,.006,.002,black,rack);
  }
  const network=new T.Group();network.position.set(0,2.26,0);rack.add(network);
  bevel(0,0,0,.82,.12,.55,.015,paintedMetal,network);
  for(let port=0;port<8;port++){
    const x=-.28+port*.07;
    bevel(x,0,.278,.053,.032,.009,.003,steel,network);
    box(x,0,.284,.041,.022,.003,black,network);box(x,.035,.281,.006,.005,.003,ledGreen,network);
  }
  line([[-.28,2.26,.29],[-.36,2.07,.48],[-.26,1.78,.51],[.04,1.76,.47]],.008,green,rack);
  // Empty chair, same placement, with rounded fabric cushions and arm pads.
  const chair=new T.Group();chair.position.set(2.6,0,1.6);chair.rotation.y=-.45;scene.add(chair);
  cylinder(0,.39,0,.035,.04,.62,steel,chair);bevel(0,.73,0,.69,.14,.58,.06,cloth,chair);
  const back=bevel(0,1.21,.3,.67,.94,.1,.045,cloth,chair);back.rotation.x=-.08;
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;rod([0,.17,0],[Math.cos(a)*.4,.11,Math.sin(a)*.4],.024,paintedMetal,chair);sphere(Math.cos(a)*.4,.07,Math.sin(a)*.4,.06,rubber,chair);}
  [-.4,.4].forEach(x=>{bevel(x,1.02,0,.06,.43,.055,.012,paintedMetal,chair);bevel(x,1.22,-.02,.1,.04,.37,.018,black,chair);});
  // Neutral room fill and broad key reveal the bevels. Green is local to the
  // main display, aimed down toward the keycaps instead of washing the room.
  const ambient=new T.HemisphereLight('#cbd2df','#29262a',.7);scene.add(ambient);
  const key=new T.DirectionalLight('#e4e7ed',2.0);key.position.set(1.5,6,3.5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;
  key.shadow.bias=-.0003;key.shadow.normalBias=.018;key.shadow.radius=3;scene.add(key);
  const screenLight=new T.SpotLight('#a9cdb8',0,2.5,Math.PI/2.7,.95,2);
  screenLight.position.set(-.34,1.98,-.65);screenLight.target.position.set(-.15,1.35,.24);scene.add(screenLight,screenLight.target);
  const wallLight=new T.PointLight('#e3d4bd',7,6,2);wallLight.position.set(.1,3,-2.4);scene.add(wallLight);
  const rim=new T.PointLight('#c4cfdf',6,6,2);rim.position.set(3.8,3,0);scene.add(rim);
  // Repeated keycaps, vents, stitches and bolts share geometry and draw calls.
  // The main monitor remains intact because its material changes with scroll.
  scene.updateMatrixWorld(true);
  const animated=new Set();mainMonitor.traverse(o=>animated.add(o));
  const batches=new Map();
  scene.traverse(o=>{
    if(!o.isMesh||animated.has(o))return;
    const id=`${o.geometry.uuid}:${o.material.uuid}:${o.castShadow}:${o.receiveShadow}`;
    if(!batches.has(id))batches.set(id,[]);batches.get(id).push(o);
  });
  batches.forEach(objects=>{
    if(objects.length<3)return;
    const first=objects[0],batch=keep(new T.InstancedMesh(first.geometry,first.material,objects.length));
    batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    objects.forEach((object,i)=>{batch.setMatrixAt(i,object.matrixWorld);object.removeFromParent();});
    batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();scene.add(batch);
  });
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
    renderer.toneMappingExposure=1.2*reveal;
    ambient.intensity=.7;screenLight.intensity=glowLevel*1.45;
    mainMonitor.userData.glassMaterial.opacity=.1*(1-glowLevel);
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
