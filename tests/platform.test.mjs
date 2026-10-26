import test from 'node:test';
import assert from 'node:assert/strict';

let clock, storage, input;
try { clock = await import('../web/js/clock.js'); } catch {}
try { storage = await import('../web/js/storage.js'); } catch {}
try { input = await import('../web/js/input.js'); } catch {}

test('10 Hz clock produces 10 steps per second at 30, 60, 120 Hz', () => {
  assert.ok(clock?.FixedClock, 'clock missing');
  for (const fps of [30,60,120]) {
    let steps = 0; const c = new clock.FixedClock(() => steps++);
    c.advance(0);
    for(let i=1;i<=fps;i++) c.advance(i*1000/fps);
    assert.equal(steps,10);
  }
});
test('pause reset drops hidden time and stops catch-up after callback pauses', () => {
  assert.ok(clock?.FixedClock, 'clock missing');
  let steps=0; const c = new clock.FixedClock(() => {steps++; c.reset();});
  c.advance(0); c.advance(500); assert.equal(steps,1);
  c.advance(100000); assert.equal(steps,1);
  c.advance(100100); assert.equal(steps,2);
});
test('save refuses malformed coordinates and recovers corrupt or inaccessible storage', () => {
  assert.ok(storage?.SaveStore, 'save module missing');
  const memory={value:null,getItem(){return this.value},setItem(k,v){this.value=v}};
  const s=new storage.SaveStore(memory);
  assert.equal(s.read().level,1);
  assert.equal(s.write({level:3,sublevel:2,sound:false,completed:false,graphics:'original'}),true);
  assert.equal(s.read().level,3);
  memory.value='{"version":1,"level":99,"sublevel":1}';
  assert.equal(s.read().level,1);
  memory.value='{broken'; assert.equal(s.read().level,1);
  const blocked=new storage.SaveStore({getItem(){throw Error('blocked')},setItem(){throw Error('full')}});
  assert.equal(blocked.read().sublevel,1); assert.equal(blocked.write({level:1,sublevel:1}),false);
});
test('simultaneous touch and key sources do not release each other; clear releases everything', () => {
  assert.ok(input?.ActionState, 'input module missing');
  const s=new input.ActionState();
  s.press('touch:1','right');s.press('touch:2','fire');s.press('key:ArrowRight','right');
  assert.deepEqual(s.snapshot(),{left:false,right:true,up:false,down:false,fire:true,fastJump:false});
  s.release('touch:1');assert.equal(s.snapshot().right,true);
  s.release('key:ArrowRight');assert.equal(s.snapshot().right,false);
  s.clear();assert.equal(s.snapshot().fire,false);
});

test('quick attack tap between ticks is delivered once instead of disappearing', async () => {
  assert.equal(typeof input.advanceWithInput,'function','ordered input adapter missing');
  const {Game}=await import('../web/js/game.js');
  const {readFile}=await import('node:fs/promises');
  const levels=JSON.parse(await readFile(new URL('../web/data/levels.json',import.meta.url),'utf8'));
  const g=new Game(levels).load(1,1);g.stakes=5;
  const s=new input.ActionState();s.press('key:J','fire');s.release('key:J');
  input.advanceWithInput(g,s);
  assert.equal(g.stakes,4);assert.equal(g.playerSprite.refireTime,15);
  for(let i=0;i<20;i++)input.advanceWithInput(g,s);
  assert.equal(g.stakes,4,'tap must not repeat');
});
test('releasing one source does not create a release edge for another held source', () => {
  const s=new input.ActionState();assert.equal(typeof s.consumeEdges,'function','edge queue missing');
  s.press('touch:1','right');s.press('key:D','right');s.release('touch:1');
  assert.deepEqual(s.consumeEdges(),[{type:'press',action:'right'}]);
  s.release('key:D');assert.deepEqual(s.consumeEdges(),[{type:'release',action:'right'}]);
  s.press('key:J','fire');s.clear();assert.deepEqual(s.consumeEdges(),[]);
});

test('quick jump tap retains original keyPressed effect before the next tick', async()=>{
  const {Game}=await import('../web/js/game.js');const {readFile}=await import('node:fs/promises');
  const levels=JSON.parse(await readFile(new URL('../web/data/levels.json',import.meta.url),'utf8'));
  const g=new Game(levels).load(1,1);g.step({});
  const s=new input.ActionState();s.press('key:Space','up');s.release('key:Space');input.advanceWithInput(g,s);
  assert.equal(g.playerSprite.yPos,116);assert.equal(g.jumping,true);
});

test('open help modal leaves Escape native and does not resume gameplay',()=>{
  const prior=globalThis.window;const target=new EventTarget();globalThis.window=target;
  try{
    let pausedCalls=0,blocked=true;
    new input.Input({controls:{querySelectorAll:()=>[]},active:()=>true,onPause:()=>pausedCalls++,onInteract:()=>{},blocked:()=>blocked});
    const key=code=>{const e=new Event('keydown',{cancelable:true});Object.defineProperty(e,'code',{value:code});target.dispatchEvent(e);return e;};
    assert.equal(key('Escape').defaultPrevented,false);assert.equal(pausedCalls,0);
    key('KeyP');assert.equal(pausedCalls,0);
    blocked=false;assert.equal(key('Escape').defaultPrevented,true);assert.equal(pausedCalls,1);
  }finally{if(prior===undefined)delete globalThis.window;else globalThis.window=prior;}
});
