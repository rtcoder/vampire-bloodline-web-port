export const SOUND_NAMES=['slow','bat','vapor','fjump','suck','sun','sword','throw','die','bighit','hit','smallhit','vapour'];
export class AudioPlayer {
  constructor(){this.enabled=true;this.context=null;this.buffers=new Map();this.playing=new Set();this.errors=[];}
  async unlock(){
    try {
      if(!this.context){
        const Context=window.AudioContext||window.webkitAudioContext;
        if(!Context)return;
        this.context=new Context();
        this.loading=Promise.all(SOUND_NAMES.map(async name=>{
          try {const r=await fetch(`assets/audio/${name}.wav`);if(!r.ok)throw Error(r.status);this.buffers.set(name,await this.context.decodeAudioData(await r.arrayBuffer()));}
          catch(error){this.errors.push(`${name}: ${error.message}`);}
        }));
      }
      if(this.context.state==='suspended')await this.context.resume();
    }catch(error){this.errors.push(error.message);}
  }
  play(name){
    if(!this.enabled||!this.context||!this.buffers.has(name))return;
    const source=this.context.createBufferSource();source.buffer=this.buffers.get(name);
    const gain=this.context.createGain();gain.gain.value=.4;source.connect(gain);gain.connect(this.context.destination);
    this.playing.add(source);source.onended=()=>{this.playing.delete(source);source.disconnect();gain.disconnect();};source.start();
  }
  stop(){for(const source of this.playing){try{source.stop();}catch{}}this.playing.clear();}
  mute(muted){this.enabled=!muted;if(muted)this.stop();}
}
