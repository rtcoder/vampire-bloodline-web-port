#!/usr/bin/env node
/** Replays normal key input against fresh source-map loads; never patches state. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Game } from '../web/js/game.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const REPLAY_PATH=path.join(ROOT,'tests/boss-replays.json');
const bits={left:1,right:2,up:4,down:8,fire:16,fastJump:32};
export function bossInput(game,options={}) {
  const p=game.playerSprite;
  const boss=game.spriteManager.spriteVector.find(s=>s.type>=14&&s.type<=18);
  let input={};
  if(!boss)input={right:true};
  else if(boss.state!==9) {
    const dx=boss.xPos-p.xPos;
    const eligible=boss.state===0||(boss.refireTime>16&&(boss.state===19||boss.state===20));
    if(p.state===16)input={};
    else if(Math.abs(dx)<32&&eligible&&p.refireTime===0&&!game.inAir&&!game.jumping)input={fire:true};
    else if(Math.abs(dx)>(options.spacing??8))input={[dx>0?'right':'left']:true};
  }
  // J2ME responds to edges. Re-press a held direction after an action changes
  // state, instead of reaching inside the game to restore a movement state.
  for(const dir of ['right','left'])if(input[dir]&&game.previousInput[dir]&&p.state!==(dir==='right'?1:2))input={};
  if(input.fire&&game.previousInput.fire)input={};
  return input;
}
export function runBossPolicy(game,maxTicks=3000,options={}) {
  const inputs=[];let minimumHealth=game.playerSprite.health,bossHealth=null;
  while(game.phase==='play'&&inputs.length<maxTicks) {
    const input=inputs.length<(options.initialWait??0)?{}:bossInput(game,options);game.step(input);inputs.push(input);
    minimumHealth=Math.min(minimumHealth,game.playerSprite.health);
    const boss=game.spriteManager.spriteVector.find(s=>s.type>=14&&s.type<=18);
    if(boss)bossHealth=boss.health;
  }
  return {inputs,ticks:inputs.length,minimumHealth,bossHealth,finalPhase:game.phase,finalHealth:game.playerSprite.health};
}
/** Offline search only: each branch starts as a copy; caller replays inputs on
 * the real game. No seed, position, health, or enemy field is adjusted. */
export function findBossRoute(game,copyGame,maxTicks=3000) {
  for(const initialWait of [0,1,2,3,4,6,8,12,16,24,32]) {
    for(const spacing of [8,0,16,24,-8,-16]) {
      const candidate=copyGame(game);
      const result=runBossPolicy(candidate,maxTicks,{initialWait,spacing});
      if((candidate.phase==='transition'||candidate.phase==='completed')&&result.minimumHealth>0)
        return {...result,policy:{initialWait,spacing}};
    }
  }
  return null;
}
function encode(inputs) {
  const runs=[];
  for(const input of inputs) {
    const mask=Object.entries(bits).reduce((n,[name,bit])=>n|(input[name]?bit:0),0);
    if(runs.at(-1)?.[0]===mask)runs.at(-1)[1]++;else runs.push([mask,1]);
  }
  return runs;
}
function decode(mask) {return Object.fromEntries(Object.entries(bits).filter(([,bit])=>mask&bit).map(([name])=>[name,true]));}
export function recordBossReplays(levels) {
  const routes=[];
  for(let chapter=1;chapter<=5;chapter++) {
    const game=new Game(levels,{seed:1}).load(chapter,3);
    const result=runBossPolicy(game);
    assert.equal(result.finalPhase,chapter===5?'completed':'transition',`m${chapter}3 policy failed`);
    assert.ok(result.minimumHealth>0,`m${chapter}3 player died`);
    assert.ok(result.bossHealth<=0,`m${chapter}3 boss remained alive`);
    routes.push({map:`m${chapter}3`,chapter,stage:3,seed:1,initialHealth:100,
      ticks:result.ticks,minimumHealth:result.minimumHealth,finalHealth:result.finalHealth,
      bossTerminalHealth:result.bossHealth,finalPhase:result.finalPhase,runs:encode(result.inputs)});
  }
  return {schemaVersion:1,description:'Normal input only; independent fresh load for each actual arena. This is not a sequential campaign replay.',inputBits:bits,routes};
}
export function verifyBossReplays(levels,replays) {
  const results=[];
  for(const route of replays.routes) {
    const game=new Game(levels,{seed:route.seed}).load(route.chapter,route.stage);
    assert.equal(game.playerSprite.health,100);let ticks=0,minimumHealth=100,bossHealth=null;
    for(const [mask,count] of route.runs)for(let i=0;i<count;i++) {
      assert.equal(game.phase,'play',`${route.map} ended before recorded input`);
      game.step(decode(mask));ticks++;minimumHealth=Math.min(minimumHealth,game.playerSprite.health);
      const boss=game.spriteManager.spriteVector.find(s=>s.type>=14&&s.type<=18);
      if(boss)bossHealth=boss.health;
    }
    assert.equal(ticks,route.ticks);assert.equal(game.phase,route.finalPhase,route.map);
    assert.equal(game.playerSprite.health,route.finalHealth,route.map);
    assert.equal(minimumHealth,route.minimumHealth,route.map);assert.ok(minimumHealth>0);
    assert.equal(bossHealth,route.bossTerminalHealth,route.map);assert.ok(bossHealth<=0);
    results.push({map:route.map,ticks,minimumHealth,finalHealth:game.playerSprite.health,bossTerminalHealth:bossHealth,finalPhase:game.phase});
  }
  assert.equal(results.length,5);return results;
}
function main() {
  const levels=JSON.parse(fs.readFileSync(path.join(ROOT,'web/data/levels.json'),'utf8'));
  if(process.argv.includes('--write'))fs.writeFileSync(REPLAY_PATH,JSON.stringify(recordBossReplays(levels),null,2)+'\n');
  const replay=JSON.parse(fs.readFileSync(REPLAY_PATH,'utf8'));
  const results=verifyBossReplays(levels,replay);
  console.log(JSON.stringify({status:'passed',normalInputsOnly:true,sourceSeed:1,results},null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
