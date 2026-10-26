import test from 'node:test';
import assert from 'node:assert/strict';
const core = await import('../web/js/game.js').catch(()=>({}));
const entities = await import('../web/js/entities.js').catch(()=>({}));
const fixture = {levels:[{id:'m11',chapter:1,stage:1,tileset:1,width:256,height:16,descriptors:[[0,0,0],[1,1,0],[0,7,0],[25,0,0]],cells:Array.from({length:4096},(_,i)=>i%16===15?1:i===13?2:0)}]};
test('source Sprite collision includes a shared edge and boss health constants',()=>{
 assert.equal(typeof entities.Sprite,'function');
 const a=new entities.Sprite(0,16,32), b=new entities.Sprite(18,16,32);
 a.setPosition(0,0); b.setPosition(16,32); a.setCollisionRectangle(0,0,16,32); b.setCollisionRectangle(0,0,16,32);
 assert.equal(a.isCollidingWith(b),true); b.xPos=17; assert.equal(a.isCollidingWith(b),false);
 assert.deepEqual([14,15,16,17,18].map(t=>new entities.Sprite(t,16,32).health),[60,100,140,160,200]);
});
test('source loader starts with health 100 and four right ticks scroll one column',()=>{
 assert.equal(typeof core.Game,'function'); const g=new core.Game(fixture,{rng:()=>0}); g.load(1,1);
 assert.equal(g.playerSprite.health,100); assert.equal(g.playerSprite.xPos,16); assert.equal(g.stakes,0);
 for(let i=0;i<4;i++) g.step({right:true});
 assert.equal(g.columnCursor,13); assert.equal(g.ofsX,0); assert.equal(g.playerSprite.xPos,16);
});
test('source death arc begins -4 then 0 then 4; presentation commands are read only',()=>{
 assert.equal(typeof core.Game,'function'); const g=new core.Game(fixture,{rng:()=>0}); g.load(1,1);
 g.playerSprite.health=0; const y=g.playerSprite.yPos;
 g.step({}); assert.equal(g.playerSprite.yPos,y-4); g.step({}); assert.equal(g.playerSprite.yPos,y-4);g.step({});assert.equal(g.playerSprite.yPos,y);
 const before=JSON.stringify(g.playerSprite);void g.commands;void g.commands;assert.equal(JSON.stringify(g.playerSprite),before);
});
test('source normal jump applies its table and gravity in the same tick',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);const y=g.playerSprite.yPos;
 const positions=[];for(let i=0;i<11;i++){g.step({up:i===0});positions.push(g.playerSprite.yPos-y);}
 // mainCanvas.jumpAmount {16,16,12,12,8,8,8,4,4,4,0}, then +4 gravity.
 assert.deepEqual(positions,[-12,-24,-32,-40,-44,-48,-52,-52,-52,-52,-48]);
});
test('source stake consumes ammunition immediately and launches at refire 13',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);g.stakes=5;
 g.step({fire:true});assert.equal(g.stakes,4);assert.equal(g.playerSprite.refireTime,15);assert.equal(g.spriteManager.spriteVector.length,0);
 g.step({fire:true});assert.equal(g.spriteManager.spriteVector.length,0);
 g.step({fire:true});assert.equal(g.spriteManager.spriteVector.length,1);assert.equal(g.spriteManager.spriteVector[0].type,101);assert.equal(g.spriteManager.spriteVector[0].xPos,40);
 assert.deepEqual(g.events,[{type:'sound',name:'throw.wav'}]);
 for(let i=0;i<20;i++)g.step({fire:true});assert.equal(g.stakes,4);
});
test('source bite heals 28, inflicts 20, then leaves a cooldown of 11',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);g.playerSprite.health=50;
 const target=g.spawn(10,24,g.playerSprite.yPos);g.step({fire:true});assert.equal(g.playerSprite.state,16);assert.equal(target.state,15);
 for(let i=0;i<15;i++)g.step({});
 assert.equal(g.playerSprite.health,78);assert.equal(target.health,-10);assert.equal(target.state,9);assert.equal(g.playerSprite.refireTime,11);
});
test('source transformations retain 16×32 collision rectangle and expire on their exact counters',()=>{
 for(const [type,mode,ticks]of[[19,'batMode',51],[20,'vaporMode',61],[21,'slowMode',61]]) {
  const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);g.spawn(type,g.playerSprite.xPos,g.playerSprite.yPos);g.step({});
  assert.equal(g[mode],true);assert.equal(g.specialTic,0);assert.equal(g.playerSprite.boundH,32);
  for(let i=0;i<ticks-1;i++)g.step({});assert.equal(g[mode],true);g.step({});assert.equal(g[mode],false);
 }
});
test('source boss bite changes direction, starts its run, and deals 20 damage',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);const b=g.spawn(14,24,g.playerSprite.yPos);
 g.step({fire:true});assert.equal(g.playerSprite.state,16);for(let i=0;i<15;i++)g.step({});
 assert.equal(b.health,40);assert.equal(b.lastDir,true);assert.equal(b.state,2);assert.equal(b.xPos,10);assert.equal(b.refireTime,20);assert.equal(g.lockScreen,true);
});

test('source map read EOF preserves unread cells in the last buffer column',()=>{
 const arena=structuredClone(fixture);arena.levels[0].width=16;arena.levels[0].cells.length=256;
 const g=new core.Game(arena,{rng:()=>0});g.load(1,1);for(let i=0;i<5;i++)g.loadCol();
 assert.equal(g.runOffEnd,true);assert.equal(g.mapBuffer[11][0],-1);assert.equal(g.mapBuffer[11][15],1);
});
test('source map loader carries jump and power counters while replacing player and clearing powers',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);g.jumping=true;g.jumpCount=3;g.inAir=true;g.biteMove=4;g.specialTic=12;g.batMode=true;
 g.load(1,1);assert.equal(g.jumping,true);assert.equal(g.jumpCount,3);assert.equal(g.inAir,true);assert.equal(g.biteMove,4);assert.equal(g.specialTic,12);assert.equal(g.batMode,false);assert.equal(g.playerSprite.health,100);
});
test('source special jump always moves right and continues after key release',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);const y=g.playerSprite.yPos;g.playerSprite.lastDir=false;
 g.step({fastJump:true});assert.equal(g.worldColumn*16+g.ofsX+g.playerSprite.xPos,32);assert.equal(g.playerSprite.yPos,y-12);assert.equal(g.playerSprite.lastDir,true);
 g.step({});assert.equal(g.worldColumn*16+g.ofsX+g.playerSprite.xPos,44);assert.equal(g.playerSprite.state,18);
});
test('source paint-derived pickup bobbing and ray growth occur exactly once per simulation tick',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);const item=g.spawn(19,120,80);const ray=g.spawn(700,136,0);ray.frame=1;ray.setCollisionRectangle(0,0,32,16);
 g.step({});assert.equal(item.yPos,79);assert.equal(ray.frame,2);assert.equal(ray.boundH,32);
 const saved=JSON.stringify([item,ray]);for(let i=0;i<120;i++)void g.commands;assert.equal(JSON.stringify([item,ray]),saved);
 g.step({});assert.equal(item.yPos,80);assert.equal(ray.frame,3);assert.equal(ray.boundH,48);
});
test('source contact damage has no added invulnerability interval',()=>{
 const g=new core.Game(fixture,{rng:()=>0});g.load(1,1);g.spawn(12,g.playerSprite.xPos+16,g.playerSprite.yPos);g.step({});assert.equal(g.playerSprite.health,90);g.step({});assert.equal(g.playerSprite.health,80);
});
