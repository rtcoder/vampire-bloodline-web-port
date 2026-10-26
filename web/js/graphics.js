// Original sprite selection and atlas placement, recorded for a read-only renderer.
import { Sprite } from './entities.js';
export class SpriteVector extends Array {
 addElement(s) { this.push(s); }
 removeElement(s) { const i=this.indexOf(s); if(i>=0)this.splice(i,1); }
 removeAllElements() { this.length=0; }
 elements() { let i=0;const a=this;return {hasMoreElements:()=>i<a.length,nextElement:()=>a[i++]}; }
}
export class RecordingGraphics {
 constructor(width=176,height=208) { this.width=width;this.height=height;this.commands=[];this.clip=[0,0,width,height];this.color=0; }
 setClip(x,y,w,h) {this.clip=[x,y,Math.max(0,w),Math.max(0,h)];}
 setColor(r,g,b) {this.color=g===undefined?r:(r<<16)|(g<<8)|b;}
 drawImage(image,x,y,anchor=20) {this.commands.push({op:'image',image,x,y,anchor,clip:[...this.clip]});}
 fillRect(x,y,w,h) {this.commands.push({op:'fill',color:this.color,x,y,w,h,clip:[...this.clip]});}
 drawLine(x,y,x2,y2) {this.commands.push({op:'line',color:this.color,x,y,x2,y2,clip:[...this.clip]});}
}
export class GraphicObjectManager {
 constructor(canvas) {this.canvas=canvas;this.spriteVector=new SpriteVector();this.p_sprite='player.png';this.m_sprite='stuff.png';this.e_sprite1='enemy_hunter.png';this.e_sprite2='enemy_dog.png';this.e_sprite3='enemy_wraith.png';this.e_sprite4='boss_jvh.png';this.s_sprite='sword.png';}
 getRandom(n) {return this.canvas.randomInt(n);}
 initializeSpriteManager() {this.spriteVector.removeAllElements();}
 loadResource(name) {this.gameResourceImage=name;}
    drawPlayer(sprite, graphics) {
        var n;
        var n2;
        block15: {
            block14: {
                n2 = sprite.lastDir ? -32 : 0;
                n = sprite.xPos - 8;
                graphics.setClip(n, sprite.yPos, 32, 32);
                if (this.canvas.batMode) {
                    graphics.setClip(sprite.xPos, sprite.yPos + 8, 16, 16);
                    graphics.drawImage(this.p_sprite, -384 + sprite.xPos - (sprite.frame << 4), sprite.yPos + 8, 20);
                    return;
                }
                if (this.canvas.vaporMode) {
                    return;
                }
                if (this.canvas.inAir) {
                    graphics.drawImage(this.p_sprite, -288 + n - (sprite.frame << 5), n2 + sprite.yPos, 20);
                    return;
                }
                if (sprite.state == 0) {
                    graphics.drawImage(this.p_sprite, n - (sprite.frame << 5), n2 + sprite.yPos, 20);
                    return;
                }
                if (sprite.state == 18) {
                    graphics.drawImage(this.p_sprite, -288 + n - (sprite.frame << 5), n2 + sprite.yPos, 20);
                    return;
                }
                if (sprite.state == 2) {
                    graphics.drawImage(this.p_sprite, -96 + n - (sprite.frame << 5), sprite.yPos, 20);
                    return;
                }
                if (sprite.state == 1) {
                    graphics.drawImage(this.p_sprite, -96 + n - (sprite.frame << 5), -32 + sprite.yPos, 20);
                    return;
                }
                if (sprite.state == 6) break block14;
                if (sprite.state == 7) break block14;
                if (sprite.state != 8) break block15;
            }
            graphics.drawImage(this.p_sprite, -384 + n - (sprite.frame << 5), -32 + sprite.yPos, 20);
            return;
        }
        if (sprite.state == 3) {
            if (sprite.refireTime < 12) {
                graphics.drawImage(this.p_sprite, -256 + n, n2 + sprite.yPos, 20);
                return;
            }
            if (sprite.refireTime < 13) {
                graphics.drawImage(this.p_sprite, -224 + n, n2 + sprite.yPos, 20);
                return;
            }
            graphics.drawImage(this.p_sprite, -192 + n, n2 + sprite.yPos, 20);
            return;
        }
        if (sprite.state == 16) {
            graphics.drawImage(this.p_sprite, -432 + n - (sprite.frame << 5), sprite.yPos, 20);
            return;
        }
        if (sprite.state != 9) return;
        graphics.drawImage(this.p_sprite, -288 + n - (sprite.frame << 5), n2 + sprite.yPos, 20);
    }
    paintSprites(graphics) {
        var enumeration = this.spriteVector.elements();
        while (enumeration.hasMoreElements()) {
            var sprite = enumeration.nextElement();
            if (sprite.width > 0) {
                if (sprite.type == 10 || sprite.type == 11) {
                    sprite.draw(graphics, this.e_sprite1, this.s_sprite);
                } else if (sprite.type == 12) {
                    sprite.draw(graphics, this.e_sprite2, null);
                } else if (sprite.type == 13) {
                    sprite.draw(graphics, this.e_sprite3, null);
                } else if (sprite.type >= 14 && sprite.type <= 18) {
                    sprite.draw(graphics, this.e_sprite4, this.s_sprite);
                } else if (sprite.type > 18) {
                    sprite.draw(graphics, this.m_sprite, null);
                }
            }
            sprite = null;
        }
    }
}
