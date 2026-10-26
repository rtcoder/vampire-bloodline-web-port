#!/usr/bin/env python3
"""Reproducibly translate bounded source methods; handwritten adapter remains in game.js."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/'reference/decompiled'

def method(src,name):
 m=re.search(r'^    (?:public|protected|private)(?: final)? (?:void|boolean|int) '+name+r'\([^\n]+\{',src,re.M)
 if not m: raise ValueError(name)
 start=m.start(); pos=m.end(); depth=1
 while depth:
  if src[pos]=='{': depth+=1
  elif src[pos]=='}': depth-=1
  pos+=1
 return src[start:pos]

def trans(s):
 s=re.sub(r'/\*.*?\*/','',s,flags=re.S)
 s=re.sub(r'//[^\n]*','',s)
 s=re.sub(r'\b(?:public|private|protected)\s+(?:final\s+)?(?:void|boolean|int)\s+(\w+)\(',r'\1(',s)
 s=re.sub(r'\b(?:Graphics|Image|Sprite|int|boolean|String|Object|Enumeration)\s+(\w+)(?=\s*[,)=])',r'\1',s) # params first, declarations restored below
 # Local declarations are recovered by start-of-line pattern from original instead below.
 s=re.sub(r'\((?:Sprite|int)\)', '',s)
 s=re.sub(r'catch \(Exception (\w+)\)',r'catch (\1)',s)
 s=s.replace('System.gc();','').replace('System.out.println(', 'void(')
 s=s.replace('deathArc.length','deathArc.length')
 return s

def translate(s):
 # Mark local variable declarations before removing Java parameter types.
 s=re.sub(r'(^\s*)(?:int|boolean|Sprite|Object|Enumeration) (\w+)(\s*(?:=|;))',r'\1var \2\3',s,flags=re.M)
 return trans(s)

sprite=(REF/'Sprite.java').read_text()
fields=sprite[sprite.index('    protected int xPos'):sprite.index('    public Sprite(')]
fields=re.sub(r'\s*(?:protected|private) (?:int|boolean) (\w+)(?: = ([^;]+))?;',lambda m:'\n        this.'+m[1]+' = '+(m[2] or '0')+';',fields)
ctor=sprite[sprite.index('    public Sprite('):sprite.index('    protected final void draw')]
ctor=re.sub(r'public Sprite\(int n, int n2, int n3\)', 'constructor(n, n2, n3)',ctor)
ctor=ctor.replace('        this.type = n;',fields+'\n        this.type = n;',1)
out='// Mechanical port of reference/decompiled/Sprite.java. Draw mutations execute once per tick.\nexport class Sprite {\n'+ctor
for name in ['draw','isCollidingWith','setCollisionRectangle','setPosition']:
 out+=translate(method(sprite,name))+'\n'
out+='}\n'
(ROOT/'web/js/entities.js').write_text(out)
manager=(REF/'GraphicObjectManager.java').read_text()
out='''// Original sprite selection and atlas placement, recorded for a read-only renderer.
import { Sprite } from './entities.js';
export class SpriteVector extends Array {
 addElement(s) { this.push(s); }
 removeElement(s) { const i=this.indexOf(s); if(i>=0)this.splice(i,1); }
 removeAllElements() { this.length=0; }
 elements() { let i=0;const a=this;return {hasMoreElements:()=>i<a.length,nextElement:()=>a[i++]}; }
}
export class RecordingGraphics {
 constructor(width=176,height=208) { this.width=width;this.height=height;this.commands=[];this.clip=[0,0,width,height];this.color=0; }
 setClip(x,y,w,h) {this.clip=[x,y,Math.max(0,w),Math.max(0,h)];}
 setColor(r,g,b) {this.color=g===undefined?r:(r<<16)|(g<<8)|b;}
 drawImage(image,x,y,anchor=20) {this.commands.push({op:'image',image,x,y,anchor,clip:[...this.clip]});}
 fillRect(x,y,w,h) {this.commands.push({op:'fill',color:this.color,x,y,w,h,clip:[...this.clip]});}
 drawLine(x,y,x2,y2) {this.commands.push({op:'line',color:this.color,x,y,x2,y2,clip:[...this.clip]});}
}
export class GraphicObjectManager {
 constructor(canvas) {this.canvas=canvas;this.spriteVector=new SpriteVector();this.p_sprite='player.png';this.m_sprite='stuff.png';this.e_sprite1='enemy_hunter.png';this.e_sprite2='enemy_dog.png';this.e_sprite3='enemy_wraith.png';this.e_sprite4='boss_jvh.png';this.s_sprite='sword.png';}
 getRandom(n) {return this.canvas.randomInt(n);}
 initializeSpriteManager() {this.spriteVector.removeAllElements();}
 loadResource(name) {this.gameResourceImage=name;}
'''
for name in ['drawPlayer','paintSprites']:
 out+=translate(method(manager,name))+'\n'
out+='}\n'
(ROOT/'web/js/graphics.js').write_text(out)
main=(REF/'mainCanvas.java').read_text()
parts=[]
for name in ['getTileVal','addParticle','adjustOnSlope','updateGame']:
 s=translate(method(main,name))
 if name=='updateGame':
  start=s.index('            try {')
  end=s.index('            return;',start)
  s=s[:start]+'''            this.phase = this.level >= 6 ? 'completed' : 'transition';
            this.events.push({type:this.phase === 'completed' ? 'completed' : 'transition',level:this.level,sublevel:this.sublevel});
'''+s[end:]
  start=s.index('            try {',s.index('if (this.playerSprite.yPos >= this.gameHeight)'))
  end=s.index('            return;',start)
  s=s[:start]+'''            this.phase = 'dead';
            this.events.push({type:'death',level:this.level,sublevel:this.sublevel});
'''+s[end:]
 parts.append(s)
# Save methods separately inside bounded generated markers, preserving wrapper edits.
path=ROOT/'web/js/game.js'
wrapper=path.read_text() if path.exists() else ''
body='\n'.join(parts)
if '// BEGIN SOURCE METHODS' in wrapper:
 wrapper=wrapper[:wrapper.index('// BEGIN SOURCE METHODS')]+'// BEGIN SOURCE METHODS\n'+body+'\n// END SOURCE METHODS'+wrapper[wrapper.index('// END SOURCE METHODS')+len('// END SOURCE METHODS'):]
else: wrapper='// BEGIN SOURCE METHODS\n'+body+'\n// END SOURCE METHODS\n'
path.write_text(wrapper)
