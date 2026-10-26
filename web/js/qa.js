import {Game} from './game.js';
import {FixedClock} from './clock.js';
import {loadData} from './data.js';
const frame=document.querySelector('iframe'),output=document.querySelector('#results');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let results=[];
function assert(ok,msg){if(!ok)throw Error(msg);}
function record(name,detail){results.push({name,passed:true,detail});output.textContent=JSON.stringify({status:'running',results},null,2);}
async function test(name,run){try{record(name,await run());}catch(e){results.push({name,passed:false,error:e.message});}}
document.querySelector('#mobile').onclick=()=>{frame.style.width='390px';frame.style.height='844px';output.hidden=true;};
document.querySelector('#desktop').onclick=()=>{frame.style.width='960px';frame.style.height='900px';output.hidden=true;};
document.querySelector('#run').onclick=async()=>{
  results=[];output.hidden=false;output.textContent='Trwają testy…';
  const w=frame.contentWindow,d=frame.contentDocument;
  await test('Start i zasoby runtime',async()=>{
    for(let i=0;i<100&&!w.vampireDebug;i++)await delay(100);
    assert(w.vampireDebug,'Brak startu debug');
    const loaded=await loadData();assert(loaded.levels.levels.length===15,'Nie ma 15 map');
    assert(loaded.assets.size===25,'Nie ma 25 grafik');
    const count=[...loaded.assets.values()].filter(a=>a.remastered4x).length;
    return {maps:15,images:25,ai4x:count};
  });
  const debug=w.vampireDebug;
  if(!debug){output.textContent=JSON.stringify({status:'failed',results},null,2);return;}
  function button(label){return [...d.querySelectorAll('button')].find(b=>b.textContent===label);}
  const click=label=>{const b=button(label);assert(b,`Brak przycisku ${label}`);b.click();};
  await test('Menu, fabuła i nowa gra',async()=>{
    if(debug.state==='playing')d.querySelector('#pause-button').click();
    if(debug.state==='paused')click('Menu główne');
    click('Nowa gra');if(button('Zacznij nową grę'))click('Zacznij nową grę');click('Pomiń wstęp');click('Pomiń dialog');
    assert(debug.state==='playing','Nie uruchomiono gry');assert(debug.game.level===1&&debug.game.sublevel===1,'Niepoprawny etap');
    d.querySelector('#pause-button').click();return {state:debug.state,health:debug.game.playerSprite.health};
  });
  await test('13 lokalnych WAV dekoduje się w Web Audio',async()=>{
    await debug.audio.unlock();await debug.audio.loading;
    assert(debug.audio.buffers.size===13,JSON.stringify(debug.audio.errors));
    return {decoded:debug.audio.buffers.size,context:debug.audio.context.state};
  });
  await test('Renderer oryginalny i AI nie mutują stanu',async()=>{
    const before=JSON.stringify(debug.game.snapshot);
    for(const mode of ['original','remastered4x']){debug.renderer.setMode(mode);for(let i=0;i<120;i++)debug.renderer.draw(debug.game);}
    assert(JSON.stringify(debug.game.snapshot)===before,'Renderer zmienił stan');
    return '240 dodatkowych renderów bez zmiany stanu';
  });
  await test('Ten sam gameplay przy 30/60/120 FPS',async()=>{
    const loaded=await loadData(),runs=[];
    for(const fps of [30,60,120]){
      const g=new Game(loaded.levels,{seed:123});g.load(1,1);const clock=new FixedClock(()=>g.step({right:true,up:g.ticker%19===0,fire:g.ticker%23===0}));clock.advance(0);
      for(let t=1;t<=fps*20;t++)clock.advance(t*1000/fps);
      runs.push(JSON.stringify(g.snapshot));
    }
    assert(runs.every(r=>r===runs[0]),'FPS zmienił symulację');return 'Identyczny pełny stan po 200 krokach';
  });
  await test('Klawiatura jednocześnie ruch + skok',async()=>{
    click('Wznów grę');
    d.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keydown',{code:'ArrowRight',bubbles:true,cancelable:true}));
    d.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keydown',{code:'ArrowUp',bubbles:true,cancelable:true}));
    assert(debug.input.snapshot().right&&debug.input.snapshot().up,'Nie ma dwóch wejść');
    await delay(450);
    assert(debug.game.ticker>=3,'Zegar nie działa');
    d.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keyup',{code:'ArrowUp',bubbles:true}));
    d.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keyup',{code:'ArrowRight',bubbles:true}));
    return {tick:debug.game.ticker,worldColumn:debug.game.worldColumn};
  });
  await test('Utrata focusu czyści wejście i zatrzymuje logikę',async()=>{
    d.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keydown',{code:'ArrowRight',bubbles:true,cancelable:true}));
    w.dispatchEvent(new w.Event('blur'));
    assert(debug.state==='paused','Brak automatycznej pauzy');assert(!Object.values(debug.input.snapshot()).some(Boolean),'Pozostało wejście');
    const tick=debug.game.ticker;await delay(350);assert(tick===debug.game.ticker,'Pauza nie zatrzymuje zegara');return {tick};
  });
  await test('Ukrycie dokumentu zatrzymuje grę i czyści wejścia (zdarzenie testowe)',async()=>{
    click('Wznów grę');
    d.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keydown',{code:'ArrowRight',bubbles:true,cancelable:true}));
    Object.defineProperty(d,'hidden',{configurable:true,value:true});
    try{d.dispatchEvent(new w.Event('visibilitychange'));}finally{delete d.hidden;}
    assert(debug.state==='paused','Ukrycie nie zatrzymało gry');
    assert(!Object.values(debug.input.snapshot()).some(Boolean),'Ukrycie pozostawiło wejścia');
    return 'Sprawdzono rzeczywisty handler z testowym document.hidden=true';
  });
  await test('pointercancel czyści wszystkie wejścia i zatrzymuje grę',async()=>{
    click('Wznów grę');debug.input.press('pointer:1','right');debug.input.press('pointer:2','fire');
    d.querySelector('[data-action="fire"]').dispatchEvent(new w.PointerEvent('pointercancel',{pointerId:2,bubbles:true}));
    assert(debug.state==='paused','pointercancel nie zatrzymał gry');
    assert(!Object.values(debug.input.snapshot()).some(Boolean),'Pozostało trzymane wejście');
    return 'Dwa niezależne źródła wskaźnikowe wyczyszczone przez produkcyjny handler';
  });
  await test('Instrukcja blokuje P i nie uruchamia gry za modalem',async()=>{
    click('Wznów grę');d.querySelector('#help-button').click();
    const event=new w.KeyboardEvent('keydown',{code:'KeyP',bubbles:true,cancelable:true});
    d.querySelector('#help-dialog button').dispatchEvent(event);
    assert(debug.state==='paused'&&d.querySelector('dialog').open,'Modal wznowił symulację');
    assert(!event.defaultPrevented,'Modal przechwycił natywny skrót');
    d.querySelector('dialog').close();return 'Stan pozostaje paused po P';
  });
  await test('Restart etapu, mute i checkpoint',async()=>{
    click('Od początku etapu');assert(debug.game.playerSprite.health===100,'Restart nie odnowił zdrowia');
    d.querySelector('#sound-button').click();assert(!debug.audio.enabled,'Mute nie działa');
    d.querySelector('#sound-button').click();assert(debug.audio.enabled,'Unmute nie działa');
    const save=debug.save();assert(save.started&&save.level===1&&save.sublevel===1,'Niepoprawny checkpoint');
    d.querySelector('#pause-button').click();return {save};
  });
  await test('Adapter zakończenia: testowe completed pokazuje finał, credits i zapis',async()=>{
    // This isolates the UI event adapter. Full real combat is covered by campaign.test.mjs.
    click('Wznów grę');
    const originalStep=debug.game.step;
    try{
      debug.game.step=function(){this.events=[{type:'completed'}];};
      debug.clock.step();
    }finally{debug.game.step=originalStep;}
    assert(debug.state==='story'&&debug.save().completed,'Brak sceny końcowej lub zapisu');
    let pages=0;
    while(debug.state==='story'&&pages<20){click(button('Zakończenie')?'Zakończenie':'Dalej');pages++;}
    assert(debug.state==='completed','Nie osiągnięto credits');
    assert(d.querySelector('#panel-text').textContent.includes('Lanzz'),'Brak atrybucji tłumaczenia');
    click('Menu główne');assert(d.querySelector('#chapter-label').textContent==='Kampania ukończona','Menu nie pokazuje ukończenia');
    click('Nowa gra');click('Zacznij nową grę');click('Pomiń wstęp');click('Pomiń dialog');d.querySelector('#pause-button').click();
    return {pages,scope:'Test adaptera z pojedynczym zdarzeniem testowym; nie dowód przejścia kampanii'};
  });
  await test('Widok 390×844 nie rozszerza pola gry ani nie zasłania go sterowaniem',async()=>{
    frame.style.width='390px';frame.style.height='844px';d.querySelector('#touch-button').click();await delay(100);
    const stage=d.querySelector('.stage').getBoundingClientRect(),controls=d.querySelector('#controls').getBoundingClientRect();
    assert(d.documentElement.scrollWidth<=390,'Przewijanie poziome');assert(controls.top>=stage.bottom,'Przyciski zasłaniają grę');
    assert(Math.abs(stage.width/stage.height-176/208)<.01,'Zmienione proporcje');
    assert(debug.game.gameWidth===176&&debug.game.gameHeight===208,'Zmieniona geometria');
    return {stage:[stage.width,stage.height],controlsTop:controls.top,stageBottom:stage.bottom};
  });
  await test('Zapis odczytuje się po przeładowaniu',async()=>{
    frame.src='index.html?debug&qaReload=1';
    for(let i=0;i<100;i++){await delay(100);if(frame.contentWindow.vampireDebug&&frame.contentWindow.vampireDebug!==debug)break;}
    const nd=frame.contentDocument;assert([...nd.querySelectorAll('button')].some(b=>b.textContent.startsWith('Kontynuuj · 1.1')),'Brak kontynuacji po reload');
    return 'Zapis rozdziału 1, etapu 1 odtworzony';
  });
  output.textContent=JSON.stringify({status:results.every(r=>r.passed)?'passed':'failed',userAgent:navigator.userAgent,results},null,2);
};
