#!/usr/bin/env node
/** Offline search with the existing core planner; delivery is ordinary input. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Game} from '../web/js/game.js';
import {plan,copyGame,resetBadZones,addBadZone} from '../tests/game-search.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id=process.argv[2]||'m31';const tag=process.env.ROUTE_TAG?'-'+process.env.ROUTE_TAG:'';
const seed=Number(process.env.ROUTE_SEED||123),width=Number(process.env.ROUTE_WIDTH||32),depth=Number(process.env.ROUTE_DEPTH||16);
const levels=JSON.parse(fs.readFileSync(path.join(ROOT,'web/data/levels.json')));
const map=levels.levels.find(m=>m.id===id);if(!map)throw Error('Unknown map '+id);
const game=new Game(levels,{seed}).load(map.chapter,map.stage);
const noop={setClip(){},setColor(){},drawImage(){},drawLine(){},fillRect(){}};
game.recordPresentation=function(){this.spriteManager.paintSprites(noop);this.recordParticlesAndHUD(noop);};
resetBadZones();let replay=[],plans=0,stuck=0,lastX=0,retries=0,checkpoints=[];const start=Date.now();
if(process.env.ROUTE_RESUME) {
 const old=JSON.parse(fs.readFileSync(path.resolve(ROOT,process.env.ROUTE_RESUME),'utf8'));
 const cap=Number(process.env.ROUTE_PREFIX_TICKS||Math.max(0,old.ticks-160));
 for(const a of old.replay) {
  const remaining=cap-game.ticker;if(remaining<=0)break;
  checkpoints.push({game:copyGame(game),length:replay.length});
  const ticks=Math.min(a.ticks,remaining);for(let i=0;i<ticks;i++)game.step(a.input);
  replay.push({input:a.input,ticks});
 }
 console.log('RESUMED',id,game.ticker,'x',game.worldColumn*16+game.ofsX+game.playerSprite.xPos);
}

while(game.phase==='play'&&plans<2000){
 const actions=plan(game,{width,depth});
 if(!actions.length||stuck>60){
  if(++retries>16||!checkpoints.length){console.log('NO_SAFE_ROUTE',id,game.ticker);break;}
  addBadZone(game.worldColumn*16+game.ofsX+game.playerSprite.xPos,game.playerSprite.yPos+game.ofsY);
  const index=Math.max(0,checkpoints.length-15);const back=checkpoints[index];
  Object.assign(game,copyGame(back.game));game.spriteManager.canvas=game;
  replay=replay.slice(0,back.length);checkpoints=checkpoints.slice(0,index);stuck=0;lastX=0;
  console.log('BACKTRACK',id,retries,'tick',game.ticker);continue;
 }
 checkpoints.push({game:copyGame(game),length:replay.length});
 for(const a of actions.slice(0,2)){
  let ticks=0;for(;ticks<a.ticks&&game.phase==='play';ticks++)game.step(a.input);
  if(ticks)replay.push({input:a.input,ticks});
 }
 plans++;const x=game.worldColumn*16+game.ofsX+game.playerSprite.xPos;
 if(x<=lastX)stuck++;else stuck=0;lastX=x;
 if(plans%10===0){
  console.log(id,plans,'ticks',game.ticker,'x',x,'y',game.playerSprite.yPos+game.ofsY,'hp',game.playerSprite.health,'secs',Math.round((Date.now()-start)/1000));
  fs.writeFileSync(path.join(ROOT,`tests/data-route-${id}${tag}.partial.json`),JSON.stringify({id,seed,result:game.phase,ticks:game.ticker,health:game.playerSprite.health,replay})+'\n');
 }
}
const result={id,seed,result:game.phase,ticks:game.ticker,health:game.playerSprite.health,plans,seconds:(Date.now()-start)/1000,replay};
const out=path.join(ROOT,`tests/data-route-${id}${tag}.json`);fs.writeFileSync(out,JSON.stringify(result)+'\n');
console.log('RESULT',JSON.stringify({...result,replay:undefined}));
if(game.phase!=='transition')process.exitCode=1;
