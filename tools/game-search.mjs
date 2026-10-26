// Offline deterministic valid-input campaign search. Never modifies game rules or game state.
import fs from 'node:fs';
import {Game} from '../web/js/game.js';
import {Sprite} from '../web/js/entities.js';
import {GraphicObjectManager} from '../web/js/graphics.js';
const noopGraphics={setClip(){},setColor(){},drawImage(){},drawLine(){},fillRect(){}};
function present(){this.spriteManager.paintSprites(noopGraphics);this.recordParticlesAndHUD(noopGraphics);}
export function copyGame(g){
 const c=Object.assign(Object.create(Game.prototype),g);
 for(const k of ['streamX','streamY','streamCount','streamType'])c[k]=g[k].slice();
 c.playerSprite=Object.assign(Object.create(Sprite.prototype),g.playerSprite);
 c.mapBuffer=g.mapBuffer.map(a=>a.slice());c.events=[];c.commands=[];c.previousInput={...g.previousInput};
 c.spriteManager=new GraphicObjectManager(c);c.spriteManager.gameResourceImage=g.spriteManager.gameResourceImage;
 for(const s of g.spriteManager.spriteVector)c.spriteManager.spriteVector.push(Object.assign(Object.create(Sprite.prototype),s));
 c.recordPresentation=present;return c;
}
const controls=[{right:true},{right:true,up:true},{up:true},{right:true,fastJump:true},{fire:true},{right:true,fire:true},{},{down:true},{left:true},{left:true,up:true}];
function key(g){const p=g.playerSprite;return[g.worldColumn,p.xPos,p.yPos,g.ofsX,g.ofsY,p.state,p.refireTime,g.jumpCount,g.jumping,g.inAir,g.jumpLocked,p.lastDir,g.stakes,g.batMode,g.vaporMode,g.slowMode,g.specialTic,Math.trunc(p.health/10),JSON.stringify(g.previousInput),g.spriteManager.spriteVector.filter(s=>s.type<22||s.type>=100).map(s=>[s.type,s.xPos,s.yPos,s.health,s.state,s.refireTime,s.ttl,s.type===700?s.frame:0])].join('/');}
const ladderCache=new WeakMap();
function ladderPenalty(g,x,y){
 let ladders=ladderCache.get(g.map);if(!ladders){ladders=[];for(let col=0;col<g.map.width;col++){let top=16,bottom=-1;for(let row=0;row<16;row++)if(g.tileArray[g.map.cells[col*16+row]]?.[1]===6){top=Math.min(top,row);bottom=row;}if(bottom>=0)ladders.push({col,top,bottom});}ladderCache.set(g.map,ladders);}
 const row=Math.max(0,Math.min(15,y>>4));let wall=-1;
 for(let col=(x+16)>>4;col<=((x+64)>>4)&&col<g.map.width;col++)if(g.tileArray[g.map.cells[col*16+row]]?.[1]===1||g.tileArray[g.map.cells[col*16+Math.min(15,row+1)]]?.[1]===1){wall=col;break;}
 if(wall<0)return 0;
 const ladder=ladders.filter(l=>l.col>=wall-6&&l.col<wall&&y>l.top*16-16&&y<=l.bottom*16+16).sort((a,b)=>Math.abs(a.col*16-x)-Math.abs(b.col*16-x))[0];
 return ladder?2*(Math.abs(x-ladder.col*16)+Math.max(0,y-(ladder.top*16-16))):0;
}
let badZones=[];
export function resetBadZones(){badZones=[];}
export function addBadZone(x,y){badZones.push({x,y});}
function score(g,origin){
 const p=g.playerSprite;if(g.phase==='transition'||g.phase==='completed')return 1e8;if(g.phase!=='play'||p.state===9)return -1e8;
 const x=g.worldColumn*16+g.ofsX+p.xPos;
 let score=x+p.health+(g.ticker-origin.ticker)*.5-ladderPenalty(g,x,p.yPos+g.ofsY);
 if(p.health<30)score-=150;
 for(const z of badZones)if(x>z.x-96&&x<z.x+48&&p.yPos+g.ofsY>z.y-40)score-=10000;
 if(g.inAir&&!g.jumping&&!g.batMode)score-=20+Math.max(0,p.yPos+g.ofsY-176)*.5;
 if(g.sublevel===3){const b=g.spriteManager.spriteVector.find(s=>s.type>=14&&s.type<=18);if(b)score=10000-b.health*20+p.health*2-Math.abs(b.xPos-p.xPos)*.04+(p.state===16?10:0);else score+=500;}
 if(g.batMode)score+=10+2*Math.max(0,192-Math.max(96,p.yPos+g.ofsY));
 return score;
}
export function plan(root,{width=20,depth=10,duration=4}={}){
 let beam=[{g:copyGame(root),actions:[],score:score(root,root)}];let winner=null;
 for(let d=0;d<depth;d++){
  const candidates=[];const seen=new Map();
  for(const node of beam)for(const action of controls)for(const macroTicks of [1,duration]){
   const g=copyGame(node.g);let ticks=0;
   try{for(;ticks<macroTicks&&g.phase==='play';ticks++)g.step(action);}catch{continue;}
   if(g.phase==='dead'||g.playerSprite.state===9||g.playerSprite.health<=0)continue;
   const hash=key(g);const value=score(g,root);if(seen.has(hash)&&seen.get(hash)>=value)continue;seen.set(hash,value);
   const n={g,actions:[...node.actions,{input:action,ticks}],score:score(g,root)};candidates.push(n);

   if(g.phase==='transition'||g.phase==='completed')return n.actions;
  }
  candidates.sort((a,b)=>b.score-a.score);beam=[];const bins=new Map();for(const n of candidates){const p=n.g.playerSprite;const bin=[n.g.worldColumn*16+n.g.ofsX+p.xPos,p.yPos+n.g.ofsY,n.g.jumping,n.g.jumpCount,p.state===16,p.refireTime>0].join('/');const count=bins.get(bin)||0;if(count>=2)continue;bins.set(bin,count+1);beam.push(n);if(beam.length>=width)break;}if(!beam.length)break;winner=beam[0];
 }
 return winner?.actions??[];
}
if(process.env.VB_SEARCH==='1'){
 const data=JSON.parse(fs.readFileSync(new URL('../web/data/levels.json',import.meta.url)));
 const id=process.env.VB_MAP||'m11';let map=data.levels.find(m=>m.id===id);const g=new Game(data,process.env.VB_DEFAULT_SEED==='1'?{}:{seed:123});g.load(map.chapter,map.stage);g.recordPresentation=present;
 let campaign=[];let initialReplay=[];
 if(process.env.VB_RESUME){const old=(await import((process.env.VB_DEFAULT_SEED==='1'?'../tests/game-replay-default-campaign.mjs?':'../tests/game-replay-campaign.mjs?')+Date.now())).default;for(const r of old){if(r.id===process.env.VB_RESUME){if(process.env.VB_CONTINUE==='1'){for(const a of r.replay)for(let i=0;i<a.ticks&&g.phase==='play';i++)g.step(a.input);initialReplay=r.replay;}break;}for(const a of r.replay)for(let i=0;i<a.ticks&&g.phase==='play';i++)g.step(a.input);if(g.phase!=='transition')throw new Error('Cannot resume incomplete '+r.id);campaign.push(r);g.load(g.level,g.sublevel);}map=g.map;}

 while(true){
 let replay=initialReplay;initialReplay=[];let stuck=0;let last=0;let plans=0;let retries=0;let checkpoints=[];badZones=[];const start=Date.now();
 while(g.phase==='play'&&plans<2000){
  let actions=plan(g,{width:+(process.env.VB_WIDTH||32),depth:+(process.env.VB_DEPTH||16)});
  if(stuck>20)actions=[];
  if(!actions.length){
   if(++retries>12||!checkpoints.length){console.log('no safe actions');break;}
   badZones.push({x:g.worldColumn*16+g.ofsX+g.playerSprite.xPos,y:g.playerSprite.yPos+g.ofsY});
   const index=Math.max(0,checkpoints.length-(stuck>20?40:15));stuck=0;const back=checkpoints[index];Object.assign(g,copyGame(back.g));g.spriteManager.canvas=g;replay=replay.slice(0,back.length);checkpoints=checkpoints.slice(0,index);
   console.log('BACKTRACK',map.id,retries,badZones.at(-1),'to tick',g.ticker);continue;
  }
  checkpoints.push({g:copyGame(g),length:replay.length});
  for(const a of actions.slice(0,2)){for(let i=0;i<a.ticks&&g.phase==='play';i++)g.step(a.input);replay.push(a);}
  plans++;
  const progress=score(g,g);if(progress<=last+.1)stuck++;else stuck=0;last=progress;
  if(plans%10===0)console.log(map.id,'plans',plans,'ticks',g.ticker,'x',g.worldColumn*16+g.ofsX+g.playerSprite.xPos,'y',g.playerSprite.yPos+g.ofsY,'hp',g.playerSprite.health,'phase',g.phase,'boss',g.spriteManager.spriteVector.filter(s=>s.type>=14&&s.type<=18).map(s=>[s.health,s.state]),'seconds',((Date.now()-start)/1000).toFixed(1));

 }
 const record={id:map.id,seed:process.env.VB_DEFAULT_SEED==='1'?'default':123,result:g.phase,ticks:g.ticker,replay};campaign.push(record);
 if(g.phase==='transition'||g.phase==='completed')fs.writeFileSync(new URL(`../tests/game-replay-${process.env.VB_DEFAULT_SEED==='1'?'default-':''}${map.id}.mjs`,import.meta.url),'export default '+JSON.stringify(record)+';\n');
 fs.writeFileSync(new URL('../tests/'+(process.env.VB_OUT||(process.env.VB_DEFAULT_SEED==='1'?'game-replay-default-campaign.mjs':'game-replay-campaign.mjs')),import.meta.url),'export default '+JSON.stringify(campaign)+';\n');
 console.log('RESULT',JSON.stringify({id:map.id,result:g.phase,ticks:g.ticker,health:g.playerSprite.health,seconds:(Date.now()-start)/1000}));
 if(process.env.VB_CAMPAIGN!=='1'||g.phase!=='transition')break;
 g.load(g.level,g.sublevel);map=g.map;
 }
}
