import {Game} from './game.js';
import {Renderer} from './renderer.js';
import {Input,advanceWithInput} from './input.js';
import {AudioPlayer} from './audio.js';
import {SaveStore} from './storage.js';
import {FixedClock} from './clock.js';
import {loadData} from './data.js';

const $=id=>document.getElementById(id);
const canvas=$('game'), overlay=$('overlay'), panel=$('menu-panel'), title=$('panel-title'), text=$('panel-text'), actions=$('panel-actions');
let state='loading',game,renderer,data,input,save;
let storage;try{storage=window.localStorage;}catch{}
const store=new SaveStore(storage),audio=new AudioPlayer();save=store.read();audio.mute(!save.sound);
const clock=new FixedClock(tick);
const diagnostic={errors:[],ready:false};
function clearInput(){
  input?.clear();
  if(game?.playerSprite){for(const [a,held]of Object.entries(game.previousInput||{}))if(held)game.release(a);game.previousInput={};}
}
function setState(next){state=next;clock.reset();clearInput();$('pause-button').disabled=!['playing','paused'].includes(state);$('pause-button').textContent=state==='paused'?'Wznów':'Pauza';}
function notice(message){$('notice').textContent=message;}
function persist(){if(!store.write(save))notice('Zapis w przeglądarce jest niedostępny. Postęp pozostanie tylko w tej sesji.');}
function menuPanel(heading,body,buttons,{story=false,portrait=null}={}){
  overlay.hidden=false;panel.classList.toggle('story',story);title.textContent=heading;text.textContent=body;
  panel.querySelector('.portrait')?.remove();
  if(portrait){const img=document.createElement('img');img.className='portrait';img.alt='';const a=data.assets.get(portrait);img.src=((renderer.mode==='remastered4x'&&a?.remastered4x)||a?.original)?.src||'';panel.insertBefore(img,title);}
  actions.replaceChildren();
  buttons.forEach(([label,run,kind],i)=>{const b=document.createElement('button');b.textContent=label;b.className=kind||(i===0?'primary':'subtle');b.addEventListener('click',()=>{audio.unlock();run();});actions.append(b);});
  actions.firstElementChild?.focus({preventScroll:true});overlay.scrollTop=0;
}
function drawBackdrop(){
  const art=data.assets.get('eve_title');
  const image=renderer.mode==='remastered4x'?(art.remastered4x||art.original):art.original;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=renderer.mode==='remastered4x';c.drawImage(image,0,0,704,832);
}
function stageName(level,sublevel){return `Rozdział ${level} · etap ${sublevel}/3`;}
function resume(){if(!game||game.phase!=='play')return;setState('playing');overlay.hidden=true;canvas.focus({preventScroll:true});audio.unlock();}
function pause(force=false){
  if(state==='playing'){setState('paused');audio.stop();menuPanel('Noc poczeka.','Gra zatrzymana.',[
    ['Wznów grę',resume],['Od początku etapu',()=>restart()],['Menu główne',showMenu],
  ]);}else if(state==='paused'&&!force)resume();
}
function showMenu(){
  setState('menu');audio.stop();
  const buttons=[];
  if(save.started)buttons.push([`Kontynuuj · ${save.level}.${save.sublevel}`,()=>startStage(save.level,save.sublevel,true)]);
  buttons.push(['Nowa gra',()=>{
    if(save.started)menuPanel('Nowa gra?','Dotychczasowy zapis etapu zostanie zastąpiony.',[['Zacznij nową grę',newGame],['Wróć',showMenu]]);
    else newGame();
  }]);
  buttons.push(['Historia',()=>prologue(showMenu)],['Jak grać',showHelp]);
  menuPanel('Krew pamięta.', 'Odzyskaj szczątki Draculi. Przeprowadź Evę przez pięć rozdziałów i zmierz się z rodem Von Jägerów.',buttons);
  $('chapter-label').textContent=save.completed?'Kampania ukończona':save.started?`Zapis: ${stageName(save.level,save.sublevel)}`:'Pięć rozdziałów. Jedna klątwa.';
}
function newGame(){save={...save,level:1,sublevel:1,completed:false,started:true};persist();prologue(()=>startStage(1,1,true));}
function prologue(done){
  setState('story');const pages=data.strings.ruleString[0].split('~~');let i=0;
  function page(){menuPanel(`Historia · ${i+1}/${pages.length}`,pages[i].replaceAll('~','\n'),[
    [i+1<pages.length?'Dalej':'Dalej',()=>{if(++i<pages.length)page();else done();}],['Pomiń wstęp',done,'subtle'],
  ],{story:true,portrait:'eve'});}page();
}
function scene(level,sublevel,done){
  setState('story');const index=level>5?15:(level-1)*3+sublevel-1;const lines=data.strings.cutString[index];let i=0;
  function page(){
    let portrait=null;
    if(i===0&&sublevel===1){if(level>1)portrait='jvh';}
    else if(level>5&&i>1)portrait='coffin';
    else if((level===1&&sublevel===1&&i===1)||(level>1&&sublevel===1&&i!==1)||(sublevel!==1&&i!==0)||level>5)portrait=sublevel===3?(i%2?'jvh':'eve'):'eve';
    menuPanel(level>5?'Ostatnia noc':stageName(level,sublevel),lines[i].replaceAll('~','\n'),[
      [i+1===lines.length?(level>5?'Zakończenie':'Wejdź w noc'):'Dalej',()=>{if(++i<lines.length)page();else done();}],
      ...(level<=5?[['Pomiń dialog',done,'subtle']]:[]),
    ],{story:true,portrait});
  }page();
}
function startStage(level,sublevel,withStory=false){
  const start=()=>{
    game.load(level,sublevel);save={...save,level,sublevel,started:true};persist();
    $('chapter-label').textContent=stageName(level,sublevel);renderer.draw(game);resume();
  };
  if(withStory)scene(level,sublevel,start);else start();
}
function restart(){startStage(game.level,game.sublevel);}
function finish(){
  save={...save,level:5,sublevel:3,completed:true,started:true};persist();
  scene(6,1,()=>{setState('completed');menuPanel('Dynastia powraca.',data.strings.creditString.replaceAll('~~','\n\n').replaceAll('~','\n')+'\n\n'+data.strings.translationCredit,[['Menu główne',showMenu]],{story:true,portrait:'coffin'});});
}
function tick(){
  if(state!=='playing')return;
  try{
    advanceWithInput(game,input);
    for(const event of game.events){
      if(event.type==='sound')audio.play(event.name.replace(/\.wav$/,''));
      if(event.type==='transition')startStage(event.level,event.sublevel,true);
      if(event.type==='death'){setState('dead');audio.stop();menuPanel('Krew zastygła.','Spróbuj ponownie od początku tego etapu.',[['Spróbuj ponownie',restart],['Menu główne',showMenu]]);}
      if(event.type==='completed')finish();
    }
  }catch(error){fail(error);}
}
function fail(error){diagnostic.errors.push(error.stack||error.message);console.error(error);setState('error');audio.stop();menuPanel('Nie udało się uruchomić gry.',error.message,[['Wczytaj ponownie',()=>location.reload()]]);}
function showHelp(){if(state==='playing')pause(true);$('help-dialog').showModal();}
$('help-button').addEventListener('click',showHelp);
$('pause-button').addEventListener('click',()=>pause());
$('sound-button').addEventListener('click',()=>{save.sound=!save.sound;audio.mute(!save.sound);audio.unlock();updateSound();persist();});
function updateSound(){$('sound-button').textContent=`Dźwięk: ${save.sound?'wł.':'wył.'}`;$('sound-button').setAttribute('aria-pressed',String(!save.sound));$('sound-button').setAttribute('aria-label',save.sound?'Wycisz dźwięk':'Włącz dźwięk');}
$('touch-button').addEventListener('click',()=>{const shown=$('controls').classList.toggle('show');$('touch-button').setAttribute('aria-pressed',String(shown));$('touch-button').textContent=shown?'Ukryj dotyk':'Pokaż dotyk';});
$('graphics-select').addEventListener('change',event=>{save.graphics=event.target.value;renderer.setMode(save.graphics);canvas.classList.toggle('remastered',save.graphics==='remastered4x');persist();if(game?.commands.length)renderer.draw(game);else drawBackdrop();});
window.addEventListener('blur',()=>{clearInput();pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause(true);}});
window.addEventListener('pagehide',()=>{clearInput();pause(true);audio.stop();});
updateSound();
try{
  data=await loadData();game=new Game(data.levels);renderer=new Renderer(canvas,data.assets);
  input=new Input({controls:$('controls'),active:()=>state==='playing',onPause:pause,onInteract:()=>audio.unlock(),blocked:()=>$('help-dialog').open});
  const aiCount=[...data.assets.values()].filter(a=>a.remastered4x).length;
  if(aiCount){$('graphics-select').options[1].disabled=false;$('graphics-select').options[1].textContent=`Remaster AI 4× (${aiCount}/25)`;}
  if(save.graphics==='remastered4x'&&!aiCount)save.graphics='original';
  renderer.setMode(save.graphics);canvas.classList.toggle('remastered',save.graphics==='remastered4x');$('graphics-select').value=save.graphics;
  $('graphics-status').textContent=aiCount===25?'25 grafik po przetworzeniu modelem AI. Przełącznik nie zmienia stanu rozgrywki.':`${aiCount}/25 grafik AI. Pozostałe wyświetlane w oryginale; pełny status w rejestrze projektu.`;
  drawBackdrop();
  diagnostic.ready=true;showMenu();
  if(new URLSearchParams(location.search).has('debug')){
    renderer.debug=true;
    window.vampireDebug={get game(){return game;},get state(){return state;},input,renderer,audio,diagnostic,clock,save:()=>({...save})};
  }
  function frame(now){if(state==='playing'){clock.advance(now);renderer.draw(game);}else clock.reset();requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}catch(error){fail(error);}
