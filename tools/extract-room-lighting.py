"""Read only the saved area lights from the supplied Blender 3.5 file.
No Blender executable, embedded scripts, or external dependencies are run.
The file's SDNA describes each field offset, including explicit padding.
"""
from pathlib import Path
import struct,re,json
raw=next(Path('assets/models/sources/gaming-room').glob('*.blend')).read_bytes()
assert raw[:12] == b'BLENDER-v305', 'Expected the supplied little-endian 64-bit Blender 3.5 source'
blocks=[];off=12
while off+24<=len(raw):
 code,size,ptr,sdna,count=struct.unpack_from('<4sIQII',raw,off);off+=24
 blocks.append({'code':code.decode(errors='replace'),'ptr':ptr,'sdna':sdna,'count':count,'data':raw[off:off+size]});off+=size
 if code==b'ENDB':break
D=next(b['data'] for b in blocks if b['code']=='DNA1');p=8
num=struct.unpack_from('<I',D,p)[0];p+=4
names=[]
for _ in range(num):e=D.index(0,p);names.append(D[p:e].decode());p=e+1
p=(p+3)//4*4;assert D[p:p+4]==b'TYPE';p+=4
num=struct.unpack_from('<I',D,p)[0];p+=4;types=[]
for _ in range(num):e=D.index(0,p);types.append(D[p:e].decode());p=e+1
p=(p+3)//4*4;assert D[p:p+4]==b'TLEN';p+=4
sizes=list(struct.unpack_from('<'+'H'*num,D,p));p+=2*num;p=(p+3)//4*4;assert D[p:p+4]==b'STRC';p+=4
num=struct.unpack_from('<I',D,p)[0];p+=4;structs=[]
for _ in range(num):
 ti,n=struct.unpack_from('<HH',D,p);p+=4;fields=[];offset=0
 for j in range(n):
  t,na=struct.unpack_from('<HH',D,p);p+=4;name=names[na];count=1
  for dim in re.findall(r'\[(\d+)\]',name):count*=int(dim)
  sz=(8 if '*' in name else sizes[t])*count
  fields.append((re.sub(r'\[.*','',name).lstrip('*'),types[t],offset,sz,name));offset+=sz
 structs.append((types[ti],fields))
byname=dict(structs);byptr={b['ptr']:b for b in blocks}
def field(data,typ,name):
 for key,t,o,s,n in byname[typ]:
  if key!=name:continue
  v=data[o:o+s]
  if '*' in n:return int.from_bytes(v,'little')
  if t=='char':return v.split(b'\0')[0].decode(errors='replace')
  fmt={'float':'f','int':'i','short':'h','ushort':'H','double':'d'}.get(t)
  if fmt:
   val=struct.unpack('<'+fmt*(s//struct.calcsize(fmt)),v);return val[0] if len(val)==1 else list(val)
  return v
 raise KeyError((typ,name))
def get(b,name):return field(b['data'],structs[b['sdna']][0],name)
def idname(b):return field(get(b,'id'),'ID','name')

lights=[]
for obj in blocks:
 if structs[obj['sdna']][0]!='Object' or get(obj,'type')!=10:continue
 lamp=byptr[get(obj,'data')]
 assert get(lamp,'type')==4, 'This source uses area lights'
 lights.append({'name':idname(obj)[2:],'color':[get(lamp,c) for c in ['r','g','b']],
  'power':get(lamp,'energy'),'size':get(lamp,'area_size'),'sizeY':get(lamp,'area_sizey'),
  'shape':get(lamp,'area_shape'),'matrix':get(obj,'obmat')})
print(json.dumps({'source':'Gaming room / original Blender 3.5 area lights','lights':lights},indent=2))
