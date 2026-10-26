#!/usr/bin/env python3
"""Export source rectangles from audited Java draw/clip expressions; no auto-centering."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
frames={}; animations={}
def add(asset,name,x,y,w,h,offset=(0,0),**kw):
    key=f'{asset}.{name}'
    frames[key]={'asset':asset,'rect':[x,y,w,h],'rect4x':[v*4 for v in (x,y,w,h)],'logicalSize':[w,h],'offset':list(offset),'anchor':[-offset[0],-offset[1]],**kw}
    return key
def seq(asset,name,x,y,w,h,count,offset=(0,0),order=None,**kw):
    keys=[add(asset,f'{name}.{i}',x+i*w,y,w,h,offset,**kw) for i in range(count)]
    animations[f'{asset}.{name}']={'frames':[keys[i] for i in (order or range(count))],'tickMs':100,'timing':'source simulation state controls cadence; this is nominal tick only','loop':True}
for y,d in [(0,'right'),(32,'left')]:
    for name,x in [('idle',0),('walk',96),('attack',192),('air_hurt',288)]:
        seq('player',f'{name}_{d}',x,y,32,32,3,(-8,0),order=None,source='GraphicObjectManager.drawPlayer')
seq('player','transform',384,32,32,32,3,(-8,0),source='GraphicObjectManager.drawPlayer states 6/7/8')
seq('player','bite',432,0,32,32,2,(-8,0),source='GraphicObjectManager.drawPlayer state 16')
seq('player','bat',384,0,16,16,3,(0,8),source='GraphicObjectManager.drawPlayer batMode')
for asset,count in [('enemy_hunter',12),('enemy_wraith',3),('boss_jvh',24)]:
    for i in range(count):add(asset,str(i),32*i,0,32,32,(-8,0),source='Sprite.draw; clip xPos-8,yPos,32,32')
seq('enemy_dog','run',0,0,32,16,2,source='Sprite.draw case 12')
for asset in ['enemy_hunter','boss_jvh']:
    for name,ids in [('idle',[0,1,2]),('walk',[3,4,5]),('attack',[6,7,8]),('hurt',[9,10,11])]:
        animations[f'{asset}.{name}']={'frames':[f'{asset}.{i}' for i in ids],'tickMs':100,'timing':'Sprite.draw presentation tick; attacks use refireTime','loop':name!='attack'}
animations['enemy_wraith.float']={'frames':[f'enemy_wraith.{i}' for i in range(3)],'tickMs':100,'loop':True}
for name,ids in [('idle_left',[18,19,20]),('attack_left',[12,13,14]),('special',[15,16,17,7,8])]:
    animations[f'boss_jvh.{name}']={'frames':[f'boss_jvh.{i}' for i in ids],'tickMs':100,'loop':True,'timing':'actual refireTime determines special holds'}
seq('sword','swing',0,0,32,32,3,source='Sprite.draw state 17; attached via per-stage offsets')
for typ,offsets in [('hunter',[(-35,-1),(-16,-22),(9,-13)]),('boss_right',[(-31,-1),(-16,-21),(11,-12)]),('boss_left',[(15,-1),(0,-22),(-23,-13)])]:
    animations[f'sword.{typ}']={'frames':['sword.swing.0','sword.swing.1','sword.swing.2'] if typ!='boss_left' else ['sword.swing.2','sword.swing.1','sword.swing.0'],'offsets':[list(o) for o in reversed(offsets)],'tickMs':100,'timing':'refireTime <12, <13, otherwise; independent of sprite image offset','loop':False}
seq('stuff','pickup_19',0,16,16,16,2,source='Sprite.draw case 19')
seq('stuff','pickup_20',0,0,16,16,2,source='Sprite.draw case 20')
seq('stuff','pickup_21',32,0,16,16,2,source='Sprite.draw case 21')
add('stuff','pickup_22',57,16,5,16,source='Sprite.draw case 22')
add('stuff','pickup_23',52,16,5,16,source='Sprite.draw case 23')
seq('stuff','pickup_24',32,16,5,16,4,source='Sprite.draw case 24')
seq('stuff','pickup_25',0,88,16,16,2,(0,-4),source='Sprite.draw case 25; source y=88, destination yPos-4')
seq('stuff','projectile',0,32,16,16,4,source='Sprite.draw cases 100/101/102')
add('stuff','projectile_400',32,32,16,16,source='Sprite.draw case 400')
add('stuff','slash_right',0,48,64,20,source='Sprite.draw cases 500/600; TTL dynamic clipping')
add('stuff','slash_left',0,68,64,20,source='Sprite.draw cases 501/601; TTL dynamic clipping')
add('stuff','column_700',32,88,32,16,source='Sprite.draw case 700; repeated vertically, source clip width 32')
animations['stuff.slash_right']={'frames':['stuff.slash_right']*5,'clipRects':[[64,0,0,20],[32,0,32,20],[0,0,64,20],[0,0,64,20],[0,0,32,20]],'tickMs':100,'loop':False,'timing':'Sprite.draw TTL5..1, types500/600; crop changes without image motion'}
animations['stuff.slash_left']={'frames':['stuff.slash_left']*5,'clipRects':[[0,0,0,20],[0,0,32,20],[0,0,64,20],[0,0,64,20],[32,0,32,20]],'tickMs':100,'loop':False,'timing':'Sprite.draw TTL5..1, types501/601'}
animations['stuff.column_700']={'frames':['stuff.column_700']*4,'repeatCounts':[1,2,3,4],'tickMs':100,'loop':False,'timing':'Diagnostic growth preview. Source repeats same32x16 fragment frame times; growth depends on ttl<0 or lastDir, not a fixed four-frame animation'}
for asset,count in [('tiles1',10),('tiles2',10),('tiles3',10),('tiles4',8)]:
    seq(asset,'tiles',0,0,16,16,count,source='GraphicObjectManager.paint; native tile size 16')
letter_widths=[5,5,5,5,4,3,5,5,2,3,5,3,7,5,5,5,5,5,5,4,5,5,7,5,4,3]
special_widths=[2,5,6,4,7,6,2,3,3,5,5,2,3,2,3,5,3,5,5,5,5,5,3,5,5,2,2,6,6,6,6,6,4,4,2,6]
for i,w in enumerate(letter_widths): add('letter',chr(65+i),i*7,0,w,9,advance=w+2,source='mainCanvas.parseText; 7px slots, variable clipping')
for i,w in enumerate(special_widths):add('special',str(i+33),i*7,0,w,9,advance=w+2,source='mainCanvas.parseText; slots 0..31 ASCII !..@, extended 32..35')
for i in range(7): add('special',f'accent.{i}',252+i*4,0,4,9,source='mainCanvas.parseText accent overlay offsets')
for name,r in {'health_frame':(0,0,36,36),'health_orb':(36,0,30,30),'fangs':(67,11,16,16),'power_segment':(67,0,3,11)}.items():add('gui',name,*r,source='mainCanvas.paint HUD')
for name,r in {'border_tile':(0,0,20,16),'button_more':(2,4,8,8),'button_tick':(10,4,8,8),'button_cross':(18,4,8,8),'button_frame':(26,0,14,12),'bar':(0,16,40,6),'arrow_up':(0,22,5,3),'arrow_down':(0,24,5,3)}.items():add('menu',name,*r,source='mainCanvas.drawMenu/paint; clip rectangles')
for d in ['right','left']:
    animations[f'player.attack_{d}'].update(durationTicks=[3,1,11],loop=False,timing='refireTime starts at15 and decrements; source x=192 for>=13,224 for12,256 for1..11; state returns idle on next tick')
plan=json.loads((ROOT/'assets/remaster-plan.json').read_text())
assets={}
for a in plan['assets']:
    p=ROOT/a['source_path'];im=Image.open(p)
    assets[a['id']]={'width':im.width,'height':im.height,'scale':4,'source':a['source_path'],'sourceMode':im.mode,'hasAlpha':im.convert('RGBA').getextrema()[3][0]<255}
    if not any(f['asset']==a['id'] for f in frames.values()):add(a['id'],'full',0,0,im.width,im.height,source='mainCanvas whole-image draw; Java anchor handled at destination')
result={'schemaVersion':1,'coordinateSpace':'source logical pixels; rect4x is texture-only','layout':'unchanged source atlas layout, no trimming/repacking','simulationScale':1,'nominalTickMs':100,'sourceFiles':['reference/decompiled/GraphicObjectManager.java','reference/decompiled/Sprite.java','reference/decompiled/mainCanvas.java'],'assets':assets,'frames':frames,'animations':animations}
(ROOT/'web/data').mkdir(parents=True,exist_ok=True)
(ROOT/'web/data/frames.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'Exported {len(frames)} crop records, {len(animations)} playback sequences for {len(assets)} assets')
if __name__=='__main__':
    for name,f in frames.items():
        x,y,w,h=f['rect'];a=assets[f['asset']]
        assert 0<=x<x+w<=a['width'] and 0<=y<y+h<=a['height'],(name,f)
