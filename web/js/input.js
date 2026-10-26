export const ACTIONS = ['left','right','up','down','fire','fastJump'];
const keys = {
  ArrowLeft:'left', KeyA:'left', Digit4:'left', Numpad4:'left',
  ArrowRight:'right', KeyD:'right', Digit6:'right', Numpad6:'right',
  ArrowUp:'up', KeyW:'up', Space:'up', Digit2:'up', Numpad2:'up',
  ArrowDown:'down', KeyS:'down', Digit8:'down', Numpad8:'down',
  KeyJ:'fire', KeyZ:'fire', Digit5:'fire', Numpad5:'fire',
  KeyK:'fastJump', KeyX:'fastJump', Digit3:'fastJump', Numpad3:'fastJump',
};
export class ActionState {
  constructor() { this.sources = new Map(); this.edges = []; }
  press(source,action) {
    if(!ACTIONS.includes(action)||this.sources.get(source)===action)return;
    if(this.sources.has(source))this.release(source);
    const alreadyHeld=[...this.sources.values()].includes(action);
    this.sources.set(source,action);
    if(!alreadyHeld)this.edges.push({type:'press',action});
  }
  release(source) {
    const action=this.sources.get(source);if(!action)return;
    this.sources.delete(source);
    if(![...this.sources.values()].includes(action))this.edges.push({type:'release',action});
  }
  clear() { this.sources.clear(); this.edges.length=0; }
  consumeEdges() { return this.edges.splice(0); }
  snapshot() { const held = new Set(this.sources.values()); return Object.fromEntries(ACTIONS.map(a=>[a,held.has(a)])); }
}
/** Preserve all ordered key/touch edges between the original 100 ms updates. */
export function advanceWithInput(game,input) {
  const held=input.snapshot();
  for(const edge of input.consumeEdges())game[edge.type](edge.action);
  // Edges were applied explicitly; do not apply them a second time in Game.step.
  game.previousInput={...held};
  return game.step(held);
}
export class Input extends ActionState {
  constructor({controls,active,onPause,onInteract,blocked=()=>false}) {
    super(); this.controls=controls; this.active=active;
    const refresh=()=>{const s=this.snapshot(); controls.querySelectorAll('[data-action]').forEach(b=>b.classList.toggle('held',s[b.dataset.action]));};
    this.refresh=refresh;
    window.addEventListener('keydown',event=>{
      if(blocked()||event.target.closest?.('input,select,textarea')) return;
      if((event.code==='Escape'||event.code==='KeyP')&&!event.repeat) {event.preventDefault();onPause();return;}
      const action=keys[event.code];
      if(!action||!active()) return;
      event.preventDefault(); onInteract(); this.press(`key:${event.code}`,action);refresh();
    });
    window.addEventListener('keyup',event=>{this.release(`key:${event.code}`);refresh();});
    for(const button of controls.querySelectorAll('[data-action]')) {
      button.addEventListener('pointerdown',event=>{
        event.preventDefault(); if(!active())return;
        onInteract(); button.setPointerCapture(event.pointerId);
        this.press(`pointer:${event.pointerId}`,button.dataset.action);refresh();
      });
      const release=event=>{this.release(`pointer:${event.pointerId}`);refresh();};
      button.addEventListener('pointerup',release);
      button.addEventListener('lostpointercapture',release);
      button.addEventListener('pointercancel',()=>{this.clear();onPause(true);});
      button.addEventListener('contextmenu',event=>event.preventDefault());
    }
  }
  clear(){super.clear();this.refresh?.();}
}
