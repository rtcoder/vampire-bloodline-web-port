#!/usr/bin/env node
// Assemble independently discovered ordinary-input routes against the ACTUAL
// inherited campaign state. Failed candidates never change the live game.
import fs from 'node:fs';
import {Game} from '../web/js/game.js';
import {copyGame} from './game-search.mjs';
import {findBossRoute,runBossPolicy} from './test_boss_routes.mjs';
const levels=JSON.parse(fs.readFileSync(new URL('../web/data/levels.json',import.meta.url)));
const defaultSeed=process.env.VB_DEFAULT_SEED==='1';
const baseCampaign=(await import('../tests/game-replay-campaign.mjs?'+Date.now())).default;
const url=new URL(defaultSeed?'../tests/game-replay-default-campaign.mjs':'../tests/game-replay-campaign.mjs',import.meta.url);
let campaign=fs.existsSync(url)?(await import(url.href+'?'+Date.now())).default.filter(r=>r.result==='transition'||r.result==='completed'):[];
const g=new Game(levels,defaultSeed?{}:{seed:123});g.load(1,1);
function apply(game,replay){for(const a of replay)for(let i=0;i<a.ticks&&game.phase==='play';i++)game.step(a.input);}
for(const route of campaign){if(g.map.id!==route.id)throw Error('Unexpected map');apply(g,route.replay);if(g.phase!==route.result)throw Error('Prefix failed '+route.id);if(g.phase==='transition')g.load(g.level,g.sublevel);}
while(g.phase==='play'){
 const map=g.map;let replay=null;let method='';
 if(map.stage===3){let result=findBossRoute(g,copyGame);if(!result){
  const approach=copyGame(g),prefix=[];while(approach.phase==='play'&&!approach.spriteManager.spriteVector.some(s=>s.type>=14&&s.type<=18)&&prefix.length<200){const input={right:true};approach.step(input);prefix.push(input);}
  outer:for(let wait=0;wait<=64;wait++)for(const spacing of [8,0,16,24,-8,-16]){const c=copyGame(approach);const candidate=runBossPolicy(c,3000,{initialWait:wait,spacing});if((c.phase==='transition'||c.phase==='completed')&&candidate.minimumHealth>0){result={inputs:[...prefix,...candidate.inputs]};break outer;}}
 }if(result){replay=result.inputs.map(input=>({input,ticks:1}));method='adaptive boss policy';}}
 else {
  const candidates=[];const routeURL=new URL(`../tests/data-route-${map.id}.json`,import.meta.url);if(fs.existsSync(routeURL))candidates.push(JSON.parse(fs.readFileSync(routeURL)));const base=baseCampaign.find(r=>r.id===map.id);if(base)candidates.push(base);
  for(const route of candidates){
   if(route.result!=='transition')continue;
   for(const initialWait of [0,1,2,3,4,6,8,12,16,24,32]){
    const candidate=[...(initialWait?[{input:{},ticks:initialWait}]:[]),...route.replay];
    const c=copyGame(g);try{apply(c,candidate);}catch{continue;}
    if(c.phase==='transition'&&c.playerSprite.health>0){replay=candidate;method=`verified inherited-state ordinary route; initial wait ${initialWait}`;break;}
   }
   if(replay)break;
  }
 }
 if(!replay){console.log('NEEDS SEARCH',map.id,'inherited seed',g.seed.toString(),'jumping',g.jumping,'counter',g.jumpCount);break;}
 apply(g,replay);const route={id:map.id,seed:defaultSeed?'default':123,result:g.phase,ticks:g.ticker,health:g.playerSprite.health,method,replay};campaign.push(route);
 fs.writeFileSync(url,'export default '+JSON.stringify(campaign)+';\n');
 fs.writeFileSync(new URL(`../tests/game-replay-${defaultSeed?'default-':''}${map.id}.mjs`,import.meta.url),'export default '+JSON.stringify(route)+';\n');
 console.log('VERIFIED',map.id,g.phase,g.ticker,'ticks',g.playerSprite.health,'HP',method);
 if(g.phase==='transition')g.load(g.level,g.sublevel);
}
console.log('Verified sequential maps:',campaign.length,'phase:',g.phase);
