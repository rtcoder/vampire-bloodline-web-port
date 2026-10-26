import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {Game} from '../web/js/game.js';
import {ACTIONS,ActionState,advanceWithInput} from '../web/js/input.js';
import campaign from './game-replay-campaign.mjs';
import defaultCampaign from './game-replay-default-campaign.mjs';
const defaultHashes={"m11":"3459563110d2d4d0ac63a7076d8c741a8c0869cf345c68d9cbf5a627dd8a3d97","m12":"bfcf8baf3a2842b774d5ecc903dcf7636013cdb9b08f3ae0eb9a04da39a3c858","m13":"873e5be8bb09ac8739e67fa20f9fd6a041119342e1d9f0953997d3c38ca5af9d","m21":"97d0fc04c781f742ccebfdcc00b81b9655b53a7d9ff685ec7829d58bfb9008be","m22":"a4e8e74bbe0423b93f087f1731ae5e8f0c9e040db1ed57266357775fab052c5a","m23":"3bab7c564fa8c86ecbfa18732539b9d454340a21c94b409368b886db341e2025","m31":"59f9d5137ae369adeadff9188a75d2b305d180c0db109107cfeeb6b7f1fdbf21","m32":"53de4a3868f2e8b6dfa6411f9ae37bd2f157c04ec4ec1fdd131e60a9f9b13cd0","m33":"8522f95f9eac6b3254298826e744dda70d0b5dd3798addd1402d80e5b9f89a06","m41":"de06d9e40ae01a8e0dac1e2e47275e042f6910bdcef8f05a93e0be7770020664","m42":"b01f08902ec5b73b163882348dc19fb3ae7b96f8e09fab8e5bebda65d41dae5d","m43":"6b43b86b5bbf9b33d037f7cbb2c8f3df3f2864f50c22ca1d1adf031ae5a13d09","m51":"e0e35a9b96019c74f736f33cb4371a5787cce02baf64e70fd8d0b07f13626485","m52":"1094057a1262fe942c504a6c66ba6f17698c4a5343c5ca13b801923c19a7a877","m53":"22d62a51e077db3f2038de9e474bb3160102580e95b2f0f535a3dc7490cea981"};
const levels=JSON.parse(fs.readFileSync(new URL('../web/data/levels.json',import.meta.url)));
const actions=new Set(['left','right','up','down','fire','fastJump']);
const hashes={"m11":"3459563110d2d4d0ac63a7076d8c741a8c0869cf345c68d9cbf5a627dd8a3d97","m12":"bfcf8baf3a2842b774d5ecc903dcf7636013cdb9b08f3ae0eb9a04da39a3c858","m13":"ef1ada482d15801b98920235c6335a2867b6cc1a1ab4470971285fd2c8e0aa0d","m21":"97d0fc04c781f742ccebfdcc00b81b9655b53a7d9ff685ec7829d58bfb9008be","m22":"a4e8e74bbe0423b93f087f1731ae5e8f0c9e040db1ed57266357775fab052c5a","m23":"c077cee1991925febda7b96433f850e6c19f0160c9e16422634aeb33a688cb1f","m31":"59f9d5137ae369adeadff9188a75d2b305d180c0db109107cfeeb6b7f1fdbf21","m32":"53de4a3868f2e8b6dfa6411f9ae37bd2f157c04ec4ec1fdd131e60a9f9b13cd0","m33":"1c600f8b6889b95521e0341b2f1bdeef5b0402438ea84cd9ca9e6e6b43a74a7d","m41":"de06d9e40ae01a8e0dac1e2e47275e042f6910bdcef8f05a93e0be7770020664","m42":"b01f08902ec5b73b163882348dc19fb3ae7b96f8e09fab8e5bebda65d41dae5d","m43":"d54fa1383d260431a705587bbe2edd53d668c0bbd7e04c3b09b72a38f1f4954f","m51":"e0e35a9b96019c74f736f33cb4371a5787cce02baf64e70fd8d0b07f13626485","m52":"1094057a1262fe942c504a6c66ba6f17698c4a5343c5ca13b801923c19a7a877","m53":"5d099f296507bcd0cd78c545fbc0d4723e8b423b6f498a19015be1bedd6701f8"};
function replay(g,route){for(const a of route.replay){assert.ok(Number.isInteger(a.ticks)&&a.ticks>0);for(const [key,value]of Object.entries(a.input)){assert.ok(actions.has(key));assert.equal(typeof value,'boolean');}for(let n=0;n<a.ticks&&g.phase==='play';n++)g.step(a.input);}}
test('ordinary input replay completes all 15 sequential campaign maps and final boss',()=>{
 const g=new Game(levels,{seed:123});g.load(1,1);let count=0;
 for(const route of campaign){if(route.result!=='transition'&&route.result!=='completed')break;
  assert.equal(g.map.id,route.id);if(hashes[route.id])assert.equal(crypto.createHash('sha256').update(JSON.stringify(route.replay)).digest('hex'),hashes[route.id]);
  replay(g,route);assert.equal(g.phase,route.result,route.id);assert.equal(g.ticker,route.ticks,route.id);assert.ok(g.playerSprite.health>0,route.id);count++;
  if(g.phase==='transition')g.load(g.level,g.sublevel);
 }
 assert.equal(count,15,'all maps complete without state edits');assert.equal(campaign.length,15);assert.equal(g.phase,'completed');assert.equal(g.level,6);
});
for(const filename of fs.readdirSync(new URL('.',import.meta.url)).filter(n=>/^data-route-m\d\d\.json$/.test(n))){
 const route=JSON.parse(fs.readFileSync(new URL(filename,import.meta.url)));if(route.result!=='transition')continue;
 test(`ordinary input replay completes standalone ${route.id}`,()=>{
  const map=levels.levels.find(m=>m.id===route.id);const g=new Game(levels,{seed:route.seed});g.load(map.chapter,map.stage);replay(g,route);assert.equal(g.phase,'transition');assert.equal(g.ticker,route.ticks);assert.equal(g.playerSprite.health,route.health);
 });
}

test('production ActionState adapter completes the same 15-map campaign',()=>{
 const g=new Game(levels,{seed:123});const input=new ActionState();g.load(1,1);let count=0;
 for(const route of campaign){
  assert.equal(g.map.id,route.id);
  for(const macro of route.replay)for(let tick=0;tick<macro.ticks&&g.phase==='play';tick++){
   const previous=input.snapshot();
   // Match Game.step's specified release-all / press-all logical action order.
   for(const action of ACTIONS)if(previous[action]&&!macro.input[action])input.release(action);
   for(const action of ACTIONS)if(macro.input[action]&&!previous[action])input.press(action,action);
   advanceWithInput(g,input);assert.notEqual(g.playerSprite.state,9,route.id);
  }
  assert.equal(g.phase,route.result,route.id);assert.equal(g.ticker,route.ticks,route.id);count++;
  if(g.phase==='transition'){input.clear();g.load(g.level,g.sublevel);}
 }
 assert.equal(count,15);assert.equal(g.phase,'completed');assert.equal(g.level,6);assert.equal(g.playerSprite.health,74);
});

test('unchanged production default seed completes all 15 maps through production input adapter',()=>{
 const g=new Game(levels);const input=new ActionState();g.load(1,1);let count=0;
 for(const route of defaultCampaign){
  assert.equal(g.map.id,route.id);assert.equal(crypto.createHash('sha256').update(JSON.stringify(route.replay)).digest('hex'),defaultHashes[route.id]);
  for(const macro of route.replay)for(let tick=0;tick<macro.ticks&&g.phase==='play';tick++){
   const previous=input.snapshot();for(const action of ACTIONS)if(previous[action]&&!macro.input[action])input.release(action);for(const action of ACTIONS)if(macro.input[action]&&!previous[action])input.press(action,action);advanceWithInput(g,input);assert.notEqual(g.playerSprite.state,9,route.id);
  }
  assert.equal(g.phase,route.result,route.id);assert.equal(g.ticker,route.ticks,route.id);assert.ok(g.playerSprite.health>0);count++;if(g.phase==='transition'){input.clear();g.load(g.level,g.sublevel);}
 }
 assert.equal(count,15);assert.equal(defaultCampaign.length,15);assert.equal(g.phase,'completed');assert.equal(g.level,6);assert.equal(g.playerSprite.health,100);
});
