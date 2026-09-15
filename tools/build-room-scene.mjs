/* Optimized Gaming room by induwarabh, CGTrader #4606915.
   node tools/build-room-scene.mjs NODE_MODULES
   Per-object simplification preserves material seams, normals and UVs.
   Source originals and adaptations: assets/models/CREDITS.md. */
import fs from 'node:fs';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const modules=path.resolve(process.argv[2]||'node_modules');
const load=p=>import(pathToFileURL(path.join(modules,p)).href);
const T=await load('three/build/three.module.js');
const {OBJLoader}=await load('three/examples/jsm/loaders/OBJLoader.js');
const {mergeGeometries,mergeVertices}=await load('three/examples/jsm/utils/BufferGeometryUtils.js');
const {MeshoptSimplifier}=await load('meshoptimizer/meshopt_simplifier.js');
await MeshoptSimplifier.ready;
const sharp=createRequire(path.join(modules,'../package.json'))('sharp');
const source='assets/models/sources/gaming-room';
const base='uploads_files_4086574_icesometric+gaming+roomlegacy';
// OBJLoader's triangle fan fills concave door/window cutouts. Tessellate
// source n-gons in their own plane, preserving winding, UVs and normals.
const vertices=[],lines=fs.readFileSync(path.join(source,base+'.obj'),'utf8').split('\n');
let sourceFanTriangles=0;
for(let k=0;k<lines.length;k++){
 const line=lines[k];
 if(line.startsWith('v '))vertices.push(new T.Vector3(...line.trim().split(/\s+/).slice(1).map(Number)));
 if(!line.startsWith('f '))continue;
 const refs=line.trim().split(/\s+/).slice(1);sourceFanTriangles+=refs.length-2;
 if(refs.length<=4)continue;
 const pts=refs.map(r=>{const i=Number(r.split('/')[0]);return vertices[i<0?vertices.length+i:i-1];});
 const normal=new T.Vector3();
 for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];normal.x+=(a.y-b.y)*(a.z+b.z);normal.y+=(a.z-b.z)*(a.x+b.x);normal.z+=(a.x-b.x)*(a.y+b.y);}
 const axis=normal.toArray().map(Math.abs).indexOf(Math.max(...normal.toArray().map(Math.abs)));
 const plane=pts.map(p=>new T.Vector2(...p.toArray().filter((_,i)=>i!==axis)));
 const triangles=T.ShapeUtils.triangulateShape(plane,[]);
 if(!triangles.length)continue;
 lines[k]=triangles.map(([a,b,c])=>{
  if(new T.Vector3().subVectors(pts[b],pts[a]).cross(new T.Vector3().subVectors(pts[c],pts[a])).dot(normal)<0)[b,c]=[c,b];
  return 'f '+[refs[a],refs[b],refs[c]].join(' ');
 }).join('\n');
}
const scene=new OBJLoader().parse(lines.join('\n'));
lines.length=0;vertices.length=0;
const materials=new Map();
for(const block of fs.readFileSync(path.join(source,base+'.mtl'),'utf8').split('newmtl ').slice(1)){
 const [name,...lines]=block.trim().split('\n');const mat={};
 for(const line of lines){const i=line.indexOf(' ');if(i>0)mat[line.slice(0,i)]=line.slice(i+1).trim();}materials.set(name.trim(),mat);
}
function slice(g,start,count){const out=new T.BufferGeometry();for(const key of ['position','normal','uv']){const a=g.attributes[key];out.setAttribute(key,new T.BufferAttribute(a?a.array.slice(start*a.itemSize,(start+count)*a.itemSize):new Float32Array(count*2),a?.itemSize||2));}return out;}
function reductionRatio(triangles){
 // The camera is scripted, so dense small props can be reduced much more than
 // silhouettes that occupy a large part of the opening. Tiny meshes stay exact.
 if(triangles>=250000)return .08;
 if(triangles>=50000)return .25;
 if(triangles>=20000)return .35;
 if(triangles>=5000)return .5;
 if(triangles>=1000)return .7;
 return 1;
}
function compactGeometry(geometry,indices){
 const compacted=new Uint32Array(indices),[remap,vertexCount]=MeshoptSimplifier.compactMesh(compacted);
 const out=new T.BufferGeometry(),missing=0xffffffff;
 for(const key of ['position','normal','uv']){
  const source=geometry.attributes[key],array=new source.array.constructor(vertexCount*source.itemSize);
  for(let old=0;old<remap.length;old++){
   const next=remap[old];if(next===missing)continue;
   for(let component=0;component<source.itemSize;component++)array[next*source.itemSize+component]=source.array[old*source.itemSize+component];
  }
  out.setAttribute(key,new T.BufferAttribute(array,source.itemSize));
 }
 out.setIndex(new T.BufferAttribute(compacted,1));return out;
}
function simplifyPart(geometry,objectName){
 const triangles=geometry.index.count/3,ratio=reductionRatio(triangles);
 if(ratio===1||objectName==='Circle.001')return {geometry,error:0};
 const position=geometry.attributes.position.array,normal=geometry.attributes.normal.array,uv=geometry.attributes.uv.array;
 const attributes=new Float32Array((position.length/3)*5);
 for(let i=0;i<position.length/3;i++)attributes.set([normal[i*3],normal[i*3+1],normal[i*3+2],uv[i*2],uv[i*2+1]],i*5);
 const sourceIndices=new Uint32Array(geometry.index.array);
 const target=Math.max(12,Math.floor(sourceIndices.length*ratio/3)*3);
 // A 0.3% object-relative error cap protects visible outlines. Attribute
 // weights retain shading and texture placement without crossing UV seams.
 const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(sourceIndices,position,3,attributes,5,[.5,.5,.5,.25,.25],null,target,.003,['LockBorder','Permissive']);
 if(indices.length>=sourceIndices.length)return {geometry,error};
 return {geometry:compactGeometry(geometry,indices),error};
}
// The original curved panel stays intact. A flat boot aperture sits just in
// front of its chord so the existing HTML BIOS can approach fullscreen.
const primary=scene.getObjectByName('Circle.001');
const sg=primary.geometry.groups.find(g=>primary.material[g.materialIndex].name==='screen');
const display=slice(primary.geometry,sg.start,sg.count),points=display.attributes.position;
let left=new T.Vector3(Infinity,0,0),right=new T.Vector3(-Infinity,0,0);
for(let i=0;i<points.count;i++){const p=new T.Vector3().fromBufferAttribute(points,i);if(p.x<left.x)left.copy(p);if(p.x>right.x)right.copy(p);}
const u=right.clone().sub(left);u.y=0;u.normalize();const v=new T.Vector3(0,1,0),n=new T.Vector3().crossVectors(u,v);
const rotate=new T.Matrix4().makeBasis(u,v,n).invert();display.applyMatrix4(rotate);display.computeBoundingBox();
const box=display.boundingBox,c=box.getCenter(new T.Vector3());c.z=box.max.z+.0005;
const transform=new T.Matrix4().makeTranslation(-c.x,-.173504,-c.z).multiply(rotate);
const data={version:6,source:'induwarabh / Gaming room / CGTrader #4606915',screen:{center:[0,c.y-.173504,0],width:(box.max.x-box.min.x)*.985,height:(box.max.y-box.min.y)*.985},materials:{},textures:{},parts:[],objects:[],excludedObjects:[]};
const files=new Map(fs.readdirSync(path.join(source,'textures')).map(f=>[f.toLowerCase(),f]));
const textures=new Map(),buckets=new Map(),canonical=new Map(),missing=new Set();
const numbers=(s,def)=>s?s.split(/\s+/).map(Number):def;
function mapRef(value,kind){
 if(!value)return;
 const file=value.replaceAll('\\','/').split('/').pop();const actual=files.get(file.toLowerCase());
 if(!actual){missing.add(file);return;}
 if(/\.exr$/i.test(actual))return; // Unsupported scalar roughness export; use the MTL value.
 const scaling=value.match(/-s\s+([\d.-]+)\s+([\d.-]+)/);
 const key=actual+':'+kind;textures.set(key,{file:actual,kind});
 return {texture:key,repeat:scaling?[+scaling[1],+scaling[2]]:[1,1],offset:[0,0]};
}
function material(name){
 const m=materials.get(name)||{};
 let d={color:numbers(m.Kd,[.5,.5,.5]),linearColor:true,roughness:Math.max(.15,Math.sqrt(2/(Number(m.Ns||30)+2))),metalness:0};
 d.roughness=Math.max(d.roughness,/leather|fabric|belt/i.test(name)?.7:.38);
 for(const [src,dst,kind]of [['map_Kd','map','color'],['map_Bump','normalMap','normal']]){const ref=mapRef(m[src],kind);if(ref)d[dst]=ref;}
 if(d.map)d.color=[.8,.8,.8];
 if(d.normalMap&&!/norm|NRM/i.test(d.normalMap.texture)){d.bumpMap=d.normalMap;delete d.normalMap;}
 const emission=numbers(m.Ke,[0,0,0]);
 if(emission.some(v=>v>0))Object.assign(d,{emissive:emission,emissiveIntensity:.7});
 if(m.map_Ke){const ref=mapRef(m.map_Ke,'color');if(ref)Object.assign(d,{emissiveMap:ref,emissive:[1,1,1],emissiveIntensity:.45});}
 if(/Metal|Metallic|Material\.011$/.test(name))d.metalness=.65;
 if(name==='Material.017')Object.assign(d,{color:[.12,.15,.18],transparent:true,opacity:.2,roughness:.12});
 if(name==='Material.018')Object.assign(d,{color:[.16,.24,.32],transparent:true,opacity:.2,roughness:.12});
 // Desk monitors and phone stay off until boot. Preserve the TV's authored
 // color/emission image (Material.005, OIP (5).jpg).
 if(name==='screen'||/^Screen_material(?:\.004)?$/.test(name))d={color:[.003,.005,.008],linearColor:true,roughness:.5,metalness:0};
 // Blender's PS5 light strip used a node-based blue emission. OBJ/MTL kept
 // the material name but exported Ke as black, so restore that authored cue.
 if(name==='emission_blue.003')Object.assign(d,{color:[.015,.02,.05],emissive:[0,.045,1],emissiveIntensity:3.2,roughness:.62});
 if(name==='body_black.003')Object.assign(d,{color:[.004,.006,.01],emissive:[0,.008,.06],emissiveIntensity:.35,roughness:.72});
 if(m.map_d)d.alphaTest=.15;
 const key=JSON.stringify(d);if(canonical.has(key))return canonical.get(key);
 const id='room-'+canonical.size;canonical.set(key,id);data.materials[id]={name,...d};return id;
}
let sourceTriangles=0,retainedTriangles=0,preDecimationTriangles=0,maxSimplificationError=0;
// The laptop is a multi-object export. Remove its whole assembly before
// material batching, including ports, vents, feet, stickers and lid logo.
const laptopObjects=new Set([
 'BackVent_Cube.364','BottomCover_Cube.365','Charge_Cylinder.354','Curve',
 'Ethernet_Cube.366','Feet_Cube.367','Feet2_Cube.368','HDMI_Cube.369',
 'Headphones_Cylinder.355','Hinges_Cube.370','Hinges2_Cube.371',
 'Keyboard_Cube.372','LowDisplay_Cube.373','Mic_Cylinder.356',
 'MidTop_Cube.374','Plane.047_Plane.045','Side_Vent_Cube.375',
 'Side_Vent.001_Cube.376','TopCover_Cube.377','USBPortBack_Cube.378','USBPorts_Cube.379'
]);
scene.traverse(o=>{
 if(!o.isMesh)return;
 const g=o.geometry;sourceTriangles+=g.attributes.position.count/3;
 if(laptopObjects.has(o.name)){
  data.excludedObjects.push({name:o.name,triangles:g.attributes.position.count/3,reason:'laptop'});return;
 }
 g.computeBoundingBox();const b=g.boundingBox;
 // Disconnected export remnants outside the authored room, and opaque
 // Boolean cutter boxes left behind over the door/window openings.
 // Cube.376 and Cube.359 are detached fragments in mid-room / above the
 // window, with no connection to the desk, wall or other supporting mesh.
 if(b.min.y>4.1||b.max.y<0||b.min.x>3.2||o.name==='Buttons.004_Cube.402'||['Cube.008','Plane.034','Cube.376_Cube.396','Cube.359_Cube.361'].includes(o.name)){
  data.excludedObjects.push({name:o.name,triangles:g.attributes.position.count/3});return;
 }
 const world=g.clone().applyMatrix4(transform);world.computeBoundingBox();
 data.objects.push({name:o.name,triangles:g.attributes.position.count/3,bounds:{min:world.boundingBox.min.toArray(),max:world.boundingBox.max.toArray()}});
 const groups=Array.isArray(o.material)?g.groups:[{start:0,count:g.attributes.position.count,materialIndex:0}];
 for(const group of groups){const mat=Array.isArray(o.material)?o.material[group.materialIndex]:o.material;
  const id=material(mat.name),part=slice(world,group.start,group.count);
  // Weld exact duplicate attributes first, then simplify each material slice
  // independently so material borders and the authored UV layout stay intact.
  const indexed=mergeVertices(part,1e-7);
  preDecimationTriangles+=indexed.index.count/3;
  const simplified=simplifyPart(indexed,o.name);retainedTriangles+=simplified.geometry.index.count/3;
  maxSimplificationError=Math.max(maxSimplificationError,simplified.error);
  if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(simplified.geometry);
 }
});
const encode=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
const chunks=[];let geometryBytes=0;
function pack(array){
 const padding=(4-geometryBytes%4)%4;
 if(padding){chunks.push(Buffer.alloc(padding));geometryBytes+=padding;}
 const span={offset:geometryBytes,count:array.length};
 const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
 chunks.push(bytes);geometryBytes+=bytes.length;return span;
}
for(const [id,gs]of buckets){const g=mergeGeometries(gs),large=g.attributes.position.count>65535;const indices=large?new Uint32Array(g.index.array):new Uint16Array(g.index.array);
 data.parts.push({material:id,position:pack(g.attributes.position.array),normal:pack(g.attributes.normal.array),uv:pack(g.attributes.uv.array),index:pack(indices),indexType:large?'u32':'u16',triangles:indices.length/3});
}
const geometryBuffer=Buffer.concat(chunks);
const compressedGeometry=deflateSync(geometryBuffer,{level:6});
const geometryHash=createHash('sha256').update(compressedGeometry).digest('hex').slice(0,12);
const geometryFile=`room-geometry.${geometryHash}.deflate`;
data.geometry={codec:'deflate',byteLength:geometryBuffer.length,sha256:createHash('sha256').update(geometryBuffer).digest('hex'),url:`assets/models/${geometryFile}`};
for(const file of fs.readdirSync('assets/models'))if(/^room-geometry\.[a-f0-9]+\.deflate$/.test(file)&&file!==geometryFile)fs.rmSync(path.join('assets/models',file));
fs.writeFileSync(path.join('assets/models',geometryFile),compressedGeometry);
// The scripted camera never inspects surfaces at point-blank range. Cap large
// textures at 1K and keep extra quality for normal maps to protect shading.
const textureDir='assets/models/textures';fs.mkdirSync(textureDir,{recursive:true});
for(const file of fs.readdirSync(textureDir))if(file.endsWith('.webp'))fs.rmSync(path.join(textureDir,file));
const maxTextureSize=1024,textureQuality={color:84,normal:90};
let textureBytes=0;const offlineTextures={};
for(const [key,spec]of textures){
 if(!Object.values(data.materials).some(m=>Object.values(m).some(v=>v?.texture===key)))continue;
 const image=await sharp(path.join(source,'textures',spec.file)).resize(maxTextureSize,maxTextureSize,{fit:'inside',withoutEnlargement:true}).webp({quality:textureQuality[spec.kind]}).toBuffer(),meta=await sharp(image).metadata();
 const imageHash=createHash('sha256').update(image).digest('hex').slice(0,12),file=`${imageHash}.webp`;
 fs.writeFileSync(path.join(textureDir,file),image);textureBytes+=image.length;
 offlineTextures[key]='data:image/webp;base64,'+image.toString('base64');
 data.textures[key]={width:meta.width,height:meta.height,kind:spec.kind,url:`assets/models/textures/${file}`};
}
// OBJ has no light objects. Recover the original five Blender area lights.
const lightSource=JSON.parse(execFileSync('python3',['tools/extract-room-lighting.py'],{encoding:'utf8'}));
fs.writeFileSync('assets/models/lighting-source.json',JSON.stringify(lightSource,null,2)+'\n');
const zUpToYUp=new T.Matrix4().makeRotationX(-Math.PI/2);
data.lights=lightSource.lights.map(l=>{
 const matrix=transform.clone().multiply(zUpToYUp).multiply(new T.Matrix4().fromArray(l.matrix));
 const x=new T.Vector3().setFromMatrixColumn(matrix,0),y=new T.Vector3().setFromMatrixColumn(matrix,1);
 return {name:l.name,color:l.color,power:l.power,position:new T.Vector3().setFromMatrixPosition(matrix).toArray(),
  direction:new T.Vector3(0,0,-1).transformDirection(matrix).toArray(),up:y.clone().normalize().toArray(),
  width:l.size*x.length(),height:(l.shape===1?l.sizeY:l.size)*y.length()};
});
// Bundle r160's area-light lookup tables; no extra runtime module/CDN load.
const {RectAreaLightUniformsLib}=await load('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
RectAreaLightUniformsLib.init();
data.areaLightLTC=[1,2].map(i=>encode(T.UniformsLib['LTC_FLOAT_'+i].image.data));
const manifest=JSON.stringify(data)+'\n';
fs.writeFileSync('assets/models/room-scene.json',manifest);
const offlineData=structuredClone(data);
delete offlineData.geometry.url;offlineData.geometry.data=compressedGeometry.toString('base64');
for(const [key,texture]of Object.entries(offlineData.textures))texture.url=offlineTextures[key];
const offline='/* Offline Gaming room bundle — generated; not deployed. See CREDITS.md. */\nwindow.WorkspaceModelData='+JSON.stringify(offlineData)+';\n';
fs.writeFileSync('assets/models/room-scene.js',offline);
const stats={sourceFanTriangles,sourceTriangles,preDecimationTriangles,retainedTriangles,excludedTriangles:sourceTriangles-preDecimationTriangles,triangles:retainedTriangles+2,decimation:true,decimationRatio:retainedTriangles/preDecimationTriangles,maxSimplificationError,geometryEncoding:'deflate-float32',geometryBytes:geometryBuffer.length,compressedGeometryBytes:compressedGeometry.length,textureBytes,manifestBytes:Buffer.byteLength(manifest),offlineBundleBytes:Buffer.byteLength(offline),maxTextureSize,textureQuality,drawMeshes:data.parts.length+1,textures:Object.keys(data.textures).length,bytes:Buffer.byteLength(manifest)+compressedGeometry.length+textureBytes,screen:data.screen,missingTextures:[...missing]};
fs.writeFileSync('assets/models/model-stats.json',JSON.stringify(stats,null,2)+'\n');console.log(stats);
