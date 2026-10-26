#!/usr/bin/env python3
"""Audit every used native tile adjacency from the decoded campaign."""
import json
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'web/data/levels.json').read_text());result={}
for ts in range(1,5):
 pairs=set();h=16
 for level in data['levels']:
  if level['tileset']!=ts:continue
  def tile(x,y):
   d=level['descriptors'][level['cells'][x*h+y]][0]
   return d if 0<=d<10 else (0 if d<37 else None)
  for x in range(level['width']):
   for y in range(h):
    a=tile(x,y)
    if a is None:continue
    for direction,dx,dy in [('horizontal',1,0),('vertical',0,1)]:
     if x+dx>=level['width'] or y+dy>=h:continue
     b=tile(x+dx,y+dy)
     if b is not None:pairs.add((direction,a,b))
 valid=[]
 for direction,a,b in sorted(pairs):
  n=Image.open(ROOT/f'assets/original/tiles{ts}.png').width//16
  if a<n and b<n:valid.append((direction,a,b))
  else:raise ValueError((ts,a,b))
 cols=5;cellw=232;cellh=174;rows=(len(valid)+cols-1)//cols
 out=Image.new('RGB',(cols*cellw,rows*cellh),(24,24,28));d=ImageDraw.Draw(out)
 for idx,(direction,a,b) in enumerate(valid):
  x=idx%cols*cellw;y=idx//cols*cellh;d.text((x+4,y+2),f'{direction[0]} {a}->{b} | NN / AI',fill='white')
  for k,mode in enumerate(['baseline4x','remastered4x']):
   im=Image.open(ROOT/f'assets/{mode}/tiles{ts}.png').convert('RGBA')
   pa=im.crop((a*64,0,a*64+64,64));pb=im.crop((b*64,0,b*64+64,64))
   # Both horizontal and vertical joins shown at exact 4x texture size.
   if direction=='horizontal':
    panel=Image.new('RGBA',(128,64));panel.paste(pa,(0,0));panel.paste(pb,(64,0));panel.thumbnail((108,128));out.paste(panel,(x+k*116,y+30),panel)
   else:
    out.paste(pa,(x+k*116,y+24),pa);out.paste(pb,(x+k*116,y+88),pb)
 out.save(ROOT/f'reports/remaster/tiles{ts}-used-seams.png')
 result[f'tiles{ts}']={'uniqueUsedAdjacencies':len(valid),'pairs':[{'direction':v[0],'a':v[1],'b':v[2]} for v in valid],'fixture':f'reports/remaster/tiles{ts}-used-seams.png','inputContext':'8px independently wrapped padding around every16x16 tile; same fixed model for all tile slots','geometry':'exact original logical rects, alpha identical at4x; no repacking'}
(ROOT/'reports/remaster-tile-adjacencies.json').write_text(json.dumps(result,indent=2)+'\n')
print({k:v['uniqueUsedAdjacencies'] for k,v in result.items()})
