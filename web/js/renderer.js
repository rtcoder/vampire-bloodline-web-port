/** Replays immutable presentation commands. Never advances simulation or RNG. */
export class Renderer {
  constructor(canvas,assets) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.assets=assets;
    this.mode='original';this.debug=false;
  }
  setMode(mode){this.mode=mode;}
  draw(game) {
    const c=this.ctx, scale=this.canvas.width/176;
    c.setTransform(scale,0,0,scale,0,0);
    c.fillStyle='#080609';c.fillRect(0,0,176,208);
    c.imageSmoothingEnabled=this.mode==='remastered4x';
    for(const command of game.commands || []) {
      c.save();
      const [x,y,w,h]=command.clip||[0,0,176,208];
      c.beginPath();c.rect(x,y,w,h);c.clip();
      if(command.op==='image'){
        const id=command.image.replace(/\.png$/,'');
        const asset=this.assets.get(id);
        const image=(this.mode==='remastered4x'&&asset?.remastered4x)||asset?.original;
        if(image)c.drawImage(image,command.x,command.y,asset.width,asset.height);
      } else {
        const color=`#${(command.color>>>0).toString(16).padStart(6,'0')}`;
        c.fillStyle=color;c.strokeStyle=color;
        if(command.op==='fill')c.fillRect(command.x,command.y,command.w,command.h);
        if(command.op==='line'){
          // J2ME drawLine includes both endpoints (including a one-pixel point).
          let x0=command.x,y0=command.y;
          const dx=Math.abs(command.x2-x0),dy=-Math.abs(command.y2-y0);
          const sx=x0<command.x2?1:-1,sy=y0<command.y2?1:-1;let err=dx+dy;
          while(true){c.fillRect(x0,y0,1,1);if(x0===command.x2&&y0===command.y2)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
        }
      }
      c.restore();
    }
    if(this.debug&&game.playerSprite){
      const p=game.playerSprite;c.strokeStyle='#6dff9b';c.lineWidth=.5;
      c.strokeRect(p.xPos+(p.boundX||0),p.yPos+(p.boundY||0),p.boundW||p.width,p.boundH||p.height);
    }
  }
}
