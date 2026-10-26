#!/usr/bin/env python3
"""Render all source crop sequences, offsets, attack holds, and effect clipping."""
import json
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'web/data/frames.json').read_text());outdir=ROOT/'reports/remaster/animations';outdir.mkdir(parents=True,exist_ok=True)
for aid,anim in data['animations'].items():
    if '.tiles' in aid:continue
    samples=[];pw=384;ph=416 if 'column_700' in aid else 320
    for fi,key in enumerate(anim['frames']):
        f=data['frames'][key];x,y,w,h=f['rect'];asset=f['asset'];panels=[]
        ox=160 if asset=='sword' else 64;oy=128;ofs=anim.get('offsets',[f['offset']]*len(anim['frames']))[fi]
        for mode,path,scale in [('Original',ROOT/f'assets/original/{asset}.png',1),('Baseline NN',ROOT/f'assets/baseline4x/{asset}.png',4),('Neural FSRCNN',ROOT/f'assets/remastered4x/{asset}.png',4)]:
            im=Image.open(path).convert('RGBA');crop=im.crop((x*scale,y*scale,(x+w)*scale,(y+h)*scale)).resize((w*4,h*4),Image.Resampling.NEAREST)
            panel=Image.new('RGB',(pw,ph),(24,24,28));d=ImageDraw.Draw(panel)
            for cy in range(20,ph,16):
                for cx in range(0,pw,16):d.rectangle((cx,cy,cx+15,cy+15),fill=(48,48,54) if ((cx//16+cy//16)%2) else (32,32,36))
            d.text((4,2),mode,fill='white');dx=ox+ofs[0]*4;dy=oy+ofs[1]*4
            if 'clipRects' in anim:
                qx,qy,qw,qh=anim['clipRects'][fi];crop=crop.crop((qx*4,qy*4,(qx+qw)*4,(qy+qh)*4));dx+=qx*4;dy+=qy*4
            if crop.width and crop.height:
                for repeat in range(anim.get('repeatCounts',[1]*len(anim['frames']))[fi]):panel.paste(crop,(dx,dy+repeat*h*4),crop)
            d.line((ox,20,ox,ph),fill=(70,130,150));d.line((0,oy+128,pw,oy+128),fill=(70,130,150));panels.append(panel)
        frame=Image.new('RGB',(pw*3,ph+24),(16,16,20));d=ImageDraw.Draw(frame);d.text((4,ph+4),f'{aid} | {key} | sample {fi}',fill='white')
        for i,p in enumerate(panels):frame.paste(p,(i*pw,0))
        samples.append(frame)
    samples[0].save(outdir/f'{aid}.gif',save_all=True,append_images=samples[1:],duration=[v*100 for v in anim.get('durationTicks',[1]*len(samples))],loop=0,disposal=2)
for a in json.loads((ROOT/'assets/remaster-plan.json').read_text())['assets']:
    aid=a['id'];orig=Image.open(ROOT/f'assets/baseline4x/{aid}.png').convert('RGBA');ai=Image.open(ROOT/f'assets/remastered4x/{aid}.png').convert('RGBA')
    sheet=Image.new('RGB',(max(orig.width,600),orig.height*2+56),(30,30,34));d=ImageDraw.Draw(sheet)
    d.text((4,4),f'{aid}: nearest-neighbor baseline 4x',fill='white');sheet.paste(orig,(0,24),orig);d.text((4,orig.height+30),'FSRCNN x4 (source alpha)',fill='white');sheet.paste(ai,(0,orig.height+54),ai)
    sheet.save(ROOT/f'reports/remaster/{aid}-comparison.png')
print(f'{len(list(outdir.glob("*.gif")))} animation GIFs and all 25 comparison sheets generated')
