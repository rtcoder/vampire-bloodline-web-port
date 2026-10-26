// Rules are mechanically translated from the supplied Java; adapters implement data/input/presentation.
import { Sprite } from './entities.js';
import { GraphicObjectManager, RecordingGraphics } from './graphics.js';
const jumpAmount=[16,16,12,12,8,8,8,4,4,4,0];
const fastJumpAmount=[16,12,8,8,4,4,0];
const deathArc=[-8,-4,0,4,8,8,16];
const SOUNDS=['slow.wav','bat.wav','vapor.wav','fjump.wav','suck.wav','sun.wav','sword.wav','throw.wav','die.wav'];
export class Game {
 constructor(levels, options={}) {
  this.levels=Array.isArray(levels)?levels:levels.levels;this.options=options;
  this.gameWidth=176;this.gameHeight=208;this.halfGameWidth=88;this.halfGameHeight=104;
  this.BUFFER_HEIGHT=15;this.playerLatch=80;this.midPosition=96;
  this.streamBlip=[9,7,5,3,1,0,1,4,5,7];
  this.streamX=Array(20).fill(0);this.streamY=Array(20).fill(0);this.streamCount=Array(20).fill(0);this.streamType=Array(20).fill(0);
  this.spriteManager=new GraphicObjectManager(this);this.events=[];this.commands=[];this.phase='idle';
  this.seed=(BigInt(options.seed ?? 0x56414d50)^0x5deece66dn)&((1n<<48n)-1n);
  this.gui='gui.png';this.curScreen=null;this.level=1;this.sublevel=1;
  this.jumpCount=0;this.jumping=false;this.inAir=false;this.jumpLocked=false;this.biteMove=0;this.specialTic=0;
 }
 randomInt(n) {
  if(this.options.rng)return Math.floor(this.options.rng()*n)%n;
  this.seed=(this.seed*0x5deece66dn+11n)&((1n<<48n)-1n);
  const signed=Number(BigInt.asIntN(32,this.seed>>16n));return Math.abs(signed%n);
 }
 playSound(n) {this.events.push({type:'sound',name:SOUNDS[n]});}
 load(level=1,sublevel=1) {
  const map=this.levels.find(m=>m.chapter===level&&m.stage===sublevel);
  if(!map)throw new Error(`Missing map m${level}${sublevel}`);
  this.map=map;this.level=level;this.sublevel=sublevel;this.tileArray=map.descriptors;
  this.batMode=false;this.vaporMode=false;this.slowMode=false;this.lockScreen=false;this.bossDead=false;this.runOffEnd=false;
  this.playerSprite=new Sprite(0,16,32);this.playerSprite.setPosition(16,this.playerLatch);this.playerSprite.setCollisionRectangle(0,0,16,32);
  this.playerSprite.lastDir=true;this.playerSprite.health=100;
  this.ofsY=256-this.gameHeight;this.ofsX=0;this.moveX=0;this.moveY=0;this.stakes=0;
  this.timeCount=0;this.ticker=0;this.adjustFrame=false;this.previousInput={};this.events=[];this.streamCount.fill(0);
  this.spriteManager.initializeSpriteManager();this.spriteManager.loadResource(`tiles${map.tileset}.png`);
  this.columnCursor=12;this.worldColumn=0;this.mapBuffer=Array.from({length:12},(_,x)=>map.cells.slice(x*16,x*16+16));
  // The source scans columns in file order; start marker affects the y-offset of subsequent spawns.
  for(let x=0;x<12;x++)for(let y=0;y<16;y++) {
   const d=this.tileArray[this.mapBuffer[x][y]];
   if(d[1]===7){
    this.ofsY=y*16-this.playerLatch;
    if(this.ofsY>256-this.gameHeight){this.playerSprite.setPosition(16,this.playerLatch+this.ofsY-(256-this.gameHeight));this.ofsY=256-this.gameHeight;}
    else if(this.ofsY<=0){this.ofsY=0;this.playerSprite.setPosition(16,y<<4);}
   } else if(d[0]>=10&&d[0]<37)this.spawn(d[0],x<<4,(y<<4)-this.ofsY);
  }
  this.playerSprite.yPos+=this.ofsY&15;
  for(const s of this.spriteManager.spriteVector)s.yPos+=this.ofsY&15;
  this.ofsY-=this.ofsY&15;this.phase='play';this.recordPresentation();return this;
 }
 spawn(type,x,y) {
  const h=type===12||type>18?16:32;const s=new Sprite(type,16,h);s.setCollisionRectangle(0,0,16,h);s.setPosition(x,y);this.spriteManager.spriteVector.addElement(s);return s;
 }
 loadCol() {
  for(let x=0;x<11;x++)this.mapBuffer[x]=this.mapBuffer[x+1].slice();
  const x=this.columnCursor++;this.worldColumn++;
  // read() returns -1 at EOF; original catch after the first missing descriptor marks runOffEnd.
  this.mapBuffer[11]=this.mapBuffer[11].slice();
  for(let y=0;y<16;y++) {
   const value=this.map.cells[x*16+y]??-1;this.mapBuffer[11][y]=value;
   const d=this.tileArray[value];if(!d){this.runOffEnd=true;break;}
   if(d[0]>=10&&d[0]<37)this.spawn(d[0],176+this.moveX-this.ofsX,(y<<4)-this.ofsY-this.moveY);
  }
 }
 press(action) {
  const p=this.playerSprite;if([9,16,18].includes(p.state))return;
  this.timeCount=0;
  if(action==='up') {
   if(!(this.inAir||this.batMode||this.getTileVal(1,this.ofsX,0,0,2)===0&&this.getTileVal(1,this.ofsX,0,1,2)===0)) {this.jumpCount=0;p.frame=0;this.jumping=true;this.jumpLocked=false;}
   if((this.getTileVal(1,-8,0,0,1)!==6||![12,4,0].includes((p.xPos+this.ofsX)&15))&&!this.batMode)return;
   p.state=6;this.adjustFrame=true;
  } else if(action==='down'&&p.state!==7) {
   if((this.getTileVal(1,-8,0,0,2)!==6||![12,4,0].includes((p.xPos+this.ofsX)&15))&&!this.batMode)return;
   p.state=7;this.adjustFrame=true;
  } else if(action==='left'){p.frame=0;p.state=2;}
  else if(action==='right'){p.frame=0;p.state=1;}
  else if(action==='fire'&&p.refireTime===0&&!this.vaporMode){p.frame=0;p.state=3;}
  else if(action==='fastJump'){
   if(this.batMode||this.getTileVal(1,this.ofsX,0,0,2)===0)return;
   this.jumpLocked=false;p.state=18;p.frame=0;this.jumpCount=0;
  }
 }
 release(action) {
  const p=this.playerSprite;
  if((['left','right','fastJump'].includes(action)&&[1,2,11].includes(p.state)&&p.state!==16)||this.batMode){p.state=0;p.frame=0;}
  else if(['up','down'].includes(action)&&p.state!==16&&[6,7].includes(p.state))p.state=8;
 }
 step(input={}) {
  this.events=[];if(this.phase!=='play')return this;
  for(const a of ['left','right','up','down','fire','fastJump'])if(this.previousInput[a]&&!input[a])this.release(a);
  for(const a of ['left','right','up','down','fire','fastJump'])if(input[a]&&!this.previousInput[a])this.press(a);
  this.previousInput={...input};this.updateGame();this.ticker++;
  if(this.phase==='play')this.recordPresentation();return this;
 }
 get snapshot() {
  return {phase:this.phase,level:this.level,sublevel:this.sublevel,ticker:this.ticker,ofsX:this.ofsX,ofsY:this.ofsY,worldColumn:this.worldColumn,stakes:this.stakes,batMode:this.batMode,vaporMode:this.vaporMode,slowMode:this.slowMode,player:{...this.playerSprite},sprites:this.spriteManager.spriteVector.map(s=>({...s})),commands:this.commands};
 }
 recordPresentation() {
  const graphics=new RecordingGraphics(this.gameWidth,this.gameHeight);
  graphics.setColor(0);graphics.fillRect(0,0,this.gameWidth,this.gameHeight);
  // Rebuild tiles each tick. Java's dirty tile cache is a rendering optimization, not game state.
  for(let x=0;x<12;x++)for(let y=0;y<16;y++) {
   const d=this.tileArray[this.mapBuffer[x][y]];if(!d)continue;
   const px=(x<<4)-this.ofsX,py=(y<<4)-this.ofsY;graphics.setClip(px,py,16,16);
   if(d[0]===37||d[0]===38){graphics.setColor(d[0]===37?0xa0f4ff:0x101080);graphics.fillRect(px,py,16,16);}
   else if(d[0]<37)graphics.drawImage(this.spriteManager.gameResourceImage,px-(d[0]>=10?0:d[0]*16),py,20);
  }
  this.spriteManager.paintSprites(graphics);this.spriteManager.drawPlayer(this.playerSprite,graphics);
  graphics.setClip(0,0,this.gameWidth,this.gameHeight);
  this.recordParticlesAndHUD(graphics);this.commands=graphics.commands;
 }
 recordParticlesAndHUD(graphics) {
                var n = 0;
                while (n < 20) {
                    if (this.streamCount[n] != 0) {
                        graphics.setColor(this.streamType[n]);
                        if (this.streamType[n] == 0xE02020 || this.streamType[n] == 16308848) {
                            graphics.drawLine(this.streamX[n], this.streamY[n], this.streamX[n] + this.streamCount[n], this.streamY[n] + 1);
                            if (this.streamCount[n] < 0) {
                                var n2 = n;
                                this.streamCount[n2] = this.streamCount[n2] + 1;
                                var n3 = n;
                                this.streamX[n3] = this.streamX[n3] - (this.streamBlip[0 - this.streamCount[n]] - this.moveY);
                                var n4 = n;
                                this.streamY[n4] = this.streamY[n4] - (this.streamBlip[0 - this.streamCount[n] + 1] - this.moveY);
                            } else if (this.streamCount[n] > 0) {
                                var n5 = n;
                                this.streamCount[n5] = this.streamCount[n5] - 1;
                                var n6 = n;
                                this.streamX[n6] = this.streamX[n6] + (this.streamBlip[this.streamCount[n]] - this.moveY);
                                var n7 = n;
                                this.streamY[n7] = this.streamY[n7] - (this.streamBlip[this.streamCount[n] + 1] - this.moveY);
                            }
                        } else if (this.streamType[n] == 0xAAAAAA) {
                            graphics.drawLine(this.streamX[n], this.streamY[n], this.streamX[n], this.streamY[n]);
                            var n8 = n;
                            this.streamCount[n8] = this.streamCount[n8] - 1;
                            var n9 = n;
                            this.streamY[n9] = this.streamY[n9] - (1 - this.moveY);
                            var n10 = n;
                            this.streamX[n10] = this.streamX[n10] - this.moveX;
                        } else if (this.streamType[n] == 28893) {
                            if (this.streamX[n] >> 4 >= 12 || this.streamX[n] >> 4 < 0 || this.streamY[n] + this.ofsY >> 4 >= 16 || this.streamY[n] + this.ofsY >> 4 < 0) {
                                this.streamCount[n] = 0;
                            } else if (this.tileArray[this.mapBuffer[this.streamX[n] >> 4][this.streamY[n] + this.ofsY >> 4]][1] == 1) {
                                this.streamCount[n] = 0;
                            } else {
                                graphics.drawLine(this.streamX[n], this.streamY[n], this.streamX[n], this.streamY[n] - 1);
                                var n11 = n;
                                this.streamY[n11] = this.streamY[n11] + (8 - this.moveY);
                                var n12 = n;
                                this.streamX[n12] = this.streamX[n12] - this.moveX;
                            }
                        }
                    }
                    ++n;
                }
                var n13 = 30 - Math.trunc(this.playerSprite.health / 3);
                graphics.setClip(5, 5 + n13, 30, 30 - n13);
                graphics.drawImage(this.gui, -31, 5, 20);
                graphics.setClip(0, 0, 36, 36);
                graphics.drawImage(this.gui, 0, 0, 20);
                var bl = false;
                if (this.playerSprite.refireTime == 0 && !this.batMode && !this.vaporMode) {
                    var enumeration = this.spriteManager.spriteVector.elements();
                    while (enumeration.hasMoreElements()) {
                        var sprite = enumeration.nextElement();
                        if (sprite.type != 10 && sprite.type != 11 && (sprite.type <= 13 || sprite.type >= 19 || sprite.state != 0 && (sprite.refireTime <= 16 || sprite.state != 20 && sprite.state != 19)) || sprite.yPos != this.playerSprite.yPos || (sprite.xPos - this.playerSprite.xPos >= 0 ? sprite.xPos - this.playerSprite.xPos : 0 - (sprite.xPos - this.playerSprite.xPos)) >= 32 || sprite.xPos < 0) continue;
                        bl = true;
                        break;
                    }
                }
                if (bl) {
                    graphics.setClip(this.gameWidth - 20, this.gameHeight - 20, 16, 16);
                    graphics.drawImage(this.gui, -67 + (this.gameWidth - 20), -11 + (this.gameHeight - 20), 20);
                } else {
                    var n14 = 1;
                    while (n14 <= this.stakes) {
                        graphics.setClip(this.gameWidth - 4 - (n14 << 2), this.gameHeight - 15, 3, 11);
                        graphics.drawImage(this.gui, -67 + (this.gameWidth - 4 - (n14 << 2)), this.gameHeight - 15, 20);
                        ++n14;
                    }
                }

 }
// BEGIN SOURCE METHODS
    getTileVal(n, n2, n3, n4, n5) {
        try {
            if ((this.playerSprite.yPos + this.ofsY - n3 >> 4) + n5 < 0 || (this.playerSprite.xPos + this.ofsX - n2 >> 4) + n4 < 0 || (this.playerSprite.yPos + this.ofsY - n3 >> 4) + n5 >= 16 || (this.playerSprite.xPos + this.ofsX - n2 >> 4) + n4 >= 12) {
                return 0;
            }
            return this.tileArray[this.mapBuffer[(this.playerSprite.xPos + this.ofsX - n2 >> 4) + n4][(this.playerSprite.yPos + this.ofsY - n3 >> 4) + n5]][n];
        }
        catch (exception) {
            return 0;
        }
    }
    addParticle(n, n2, n3, n4) {
        var n5 = 0;
        var n6 = 0;
        while (n5 < n3 && n6 < 20) {
            if (this.streamCount[n6] <= 0) {
                if (n4 == 0xE02020 || n4 == 16308848) {
                    this.streamX[n6] = n - 4 + this.spriteManager.getRandom(8);
                    this.streamY[n6] = n2 - 4 + this.spriteManager.getRandom(8);
                    this.streamCount[n6] = this.streamX[n6] > n ? -this.spriteManager.getRandom(8) : this.spriteManager.getRandom(8);
                } else {
                    this.streamX[n6] = n;
                    this.streamY[n6] = n2;
                    this.streamCount[n6] = this.spriteManager.getRandom(8);
                }
                this.streamType[n6] = n4;
                ++n5;
            }
            ++n6;
        }
    }
    adjustOnSlope(n, n2) {
        var n3 = 0;
        var n4 = this.ofsY;
        switch (this.ofsX) {
            case 0: 
            case 16: {
                if (n == 1) {
                    if (n2 == 2) {
                        n3 = -2;
                        break;
                    }
                    if (n2 == 3) {
                        n3 = -10;
                        break;
                    }
                    if (n2 == 4) {
                        n3 = -14;
                        break;
                    }
                    if (n2 != 5) break;
                    n3 = -6;
                    break;
                }
                if (n != 2) break;
                if (n2 == 2) {
                    n3 = 14;
                    break;
                }
                if (n2 == 3) {
                    n3 = 6;
                    break;
                }
                if (n2 == 4) {
                    n3 = 2;
                    break;
                }
                if (n2 != 5) break;
                n3 = 10;
                break;
            }
            case 4: {
                if (n == 1) {
                    if (n2 == 2) {
                        n3 = -4;
                        break;
                    }
                    if (n2 == 3) {
                        n3 = -12;
                        break;
                    }
                    if (n2 == 4) {
                        n3 = -12;
                        break;
                    }
                    if (n2 != 5) break;
                    n3 = -4;
                    break;
                }
                if (n != 2) break;
                if (n2 == 2) {
                    n3 = 12;
                    break;
                }
                if (n2 == 3) {
                    n3 = 4;
                    break;
                }
                if (n2 == 4) {
                    n3 = 4;
                    break;
                }
                if (n2 != 5) break;
                n3 = 12;
                break;
            }
            case 8: {
                if (n == 1) {
                    if (n2 == 2) {
                        n3 = -6;
                        break;
                    }
                    if (n2 == 3) {
                        n3 = -14;
                        break;
                    }
                    if (n2 == 4) {
                        n3 = -10;
                        break;
                    }
                    if (n2 != 5) break;
                    n3 = -2;
                    break;
                }
                if (n != 2) break;
                if (n2 == 2) {
                    n3 = 10;
                    break;
                }
                if (n2 == 3) {
                    n3 = 2;
                    break;
                }
                if (n2 == 4) {
                    n3 = 6;
                    break;
                }
                if (n2 != 5) break;
                n3 = 14;
                break;
            }
            case 12: {
                if (n == 1) {
                    if (n2 == 2) {
                        n3 = -8;
                        break;
                    }
                    if (n2 == 3) {
                        n3 = -16;
                        break;
                    }
                    if (n2 == 4) {
                        n3 = -8;
                        break;
                    }
                    if (n2 != 5) break;
                    n3 = 0;
                    break;
                }
                if (n != 2) break;
                if (n2 == 2) {
                    n3 = 8;
                    break;
                }
                if (n2 == 3) {
                    n3 = 0;
                    break;
                }
                if (n2 == 4) {
                    n3 = 8;
                    break;
                }
                if (n2 != 5) break;
                n3 = 16;
            }
        }
        if (this.ofsY == 0 && this.playerSprite.yPos > this.midPosition) {
            this.playerSprite.yPos = n == 2 ? this.playerSprite.yPos - (this.playerSprite.yPos & 0xF) + n3 : this.playerSprite.yPos + (this.playerSprite.yPos & 0xF) + n3;
        } else if (this.ofsY == (this.BUFFER_HEIGHT << 4) - this.gameHeight && this.playerSprite.yPos < this.midPosition) {
            this.playerSprite.yPos = n == 2 ? this.playerSprite.yPos - (this.playerSprite.yPos & 0xF) + n3 : this.playerSprite.yPos + (this.playerSprite.yPos & 0xF) + n3;
        } else {
            this.ofsY = this.ofsY - (this.ofsY & 0xF) + n3;
            this.moveY += n4 - this.ofsY;
        }
        this.inAir = false;
    }
    updateGame() {
        var n;
        var sprite;
        this.moveX = 0;
        this.moveY = 0;
        if (this.getTileVal(1, 0, 0, 0, 0) == 8 || this.getTileVal(1, 0, 0, 0, 1) == 8 || this.getTileVal(1, 0, 0, 0, 2) == 8 || this.bossDead) {
            this.spriteManager.initializeSpriteManager(this.curScreen);
            if (this.sublevel < 3) {
                ++this.sublevel;
            } else {
                this.sublevel = 1;
                if (this.level < 6) {
                    ++this.level;
                }
            }
            this.phase = this.level >= 6 ? 'completed' : 'transition';
            this.events.push({type:this.phase === 'completed' ? 'completed' : 'transition',level:this.level,sublevel:this.sublevel});
            return;
        }
        if (this.playerSprite.health <= 0 && this.playerSprite.state != 9) {
            this.jumpCount = 0;
            this.playerSprite.state = 9;
            this.playSound(8);
        }
        if (this.vaporMode) {
            var n2 = 0;
            while (n2 < 3) {
                this.addParticle(this.playerSprite.xPos + 4 + this.spriteManager.getRandom(8), this.playerSprite.yPos + 16 - this.spriteManager.getRandom(16), 1, 0xAAAAAA);
                ++n2;
            }
        }
        if (this.playerSprite.refireTime > 0) {
            if (this.playerSprite.refireTime == 1) {
                if (this.playerSprite.state == 16) {
                    var enumeration = this.spriteManager.spriteVector.elements();
                    while (enumeration.hasMoreElements()) {
                        sprite = enumeration.nextElement();
                        if (sprite.state != 15) continue;
                        sprite.health -= 20;
                        if (sprite.type >= 14 && sprite.type <= 18) {
                            sprite.lastDir = !sprite.lastDir;
                            sprite.refireTime = 20;
                        }
                        if (sprite.health <= 0) {
                            sprite.refireTime = 0;
                            sprite.ttl = 0;
                            sprite.state = 9;
                            continue;
                        }
                        if (sprite.type >= 14 && sprite.type <= 18) {
                            if (sprite.lastDir) {
                                sprite.state = 2;
                                continue;
                            }
                            sprite.state = 1;
                            continue;
                        }
                        sprite.state = 0;
                    }
                }
                if (this.playerSprite.state == 3 || this.playerSprite.state == 16) {
                    if (this.playerSprite.state == 16) {
                        this.playerSprite.refireTime = 12;
                    }
                    this.playerSprite.state = 0;
                }
            } else if (this.playerSprite.state == 16) {
                this.addParticle(this.playerSprite.xPos + 8, this.playerSprite.yPos + 8, 1, 0xE02020);
            }
            --this.playerSprite.refireTime;
        }
        if (this.playerSprite.yPos >= this.gameHeight) {
            this.phase = 'dead';
            this.events.push({type:'death',level:this.level,sublevel:this.sublevel});
            return;
        }
        if (this.playerSprite.state == 9) {
            if (this.jumpCount < deathArc.length - 1) {
                ++this.jumpCount;
            }
            this.playerSprite.yPos += deathArc[this.jumpCount];
            return;
        }
        if (this.batMode) {
            this.playerSprite.frame = this.playerSprite.frame == 2 ? 0 : ++this.playerSprite.frame;
            if (this.specialTic == 50) {
                this.batMode = false;
            } else {
                ++this.specialTic;
            }
        } else if (this.vaporMode) {
            this.playerSprite.frame ^= 1;
            if (this.specialTic == 60) {
                this.vaporMode = false;
            } else {
                ++this.specialTic;
            }
        } else if (this.slowMode) {
            if (this.specialTic == 60) {
                this.slowMode = false;
            } else {
                ++this.specialTic;
            }
        }
        if (this.playerSprite.state == 6) {
            if (this.getTileVal(1, -4, 0, 0, 0) == 0 && this.batMode || this.getTileVal(1, -8, 4, 0, 1) == 6 && !this.batMode) {
                if (this.adjustFrame && !this.batMode) {
                    if ((this.playerSprite.xPos + this.ofsX & 0xF) == 12) {
                        this.moveX = 4;
                        this.ofsX += 4;
                    } else if ((this.playerSprite.xPos + this.ofsX & 0xF) == 4) {
                        this.playerSprite.xPos -= 4;
                    }
                    this.adjustFrame = false;
                }
                this.jumping = false;
                if (this.playerSprite.yPos > this.playerLatch) {
                    this.playerSprite.yPos -= 4;
                } else if (this.ofsY > 0) {
                    this.ofsY -= 4;
                    this.moveY += 4;
                } else {
                    this.playerSprite.yPos -= 4;
                }
            } else {
                this.playerSprite.state = 0;
            }
            if (!this.batMode && !this.vaporMode) {
                this.playerSprite.frame ^= 1;
            }
        } else if (this.playerSprite.state == 7) {
            if (this.getTileVal(1, 4, 0, 0, 2) == 0 && this.batMode || this.getTileVal(1, -8, 0, 0, 2) == 6 && (this.playerSprite.xPos >= 4 || this.ofsX == 0) && !this.batMode) {
                if (this.adjustFrame && !this.batMode) {
                    if ((this.playerSprite.xPos + this.ofsX & 0xF) == 12) {
                        this.moveX = 4;
                        this.ofsX += 4;
                    } else if ((this.playerSprite.xPos + this.ofsX & 0xF) == 4) {
                        this.playerSprite.xPos -= 4;
                    }
                    this.adjustFrame = false;
                }
                this.jumping = false;
                if (this.playerSprite.yPos < this.playerLatch) {
                    this.playerSprite.yPos += 4;
                } else if (this.ofsY < 256 - this.gameHeight) {
                    this.ofsY += 4;
                    this.moveY -= 4;
                } else {
                    this.playerSprite.yPos += 4;
                }
            } else {
                this.playerSprite.state = 0;
            }
            if (!this.batMode && !this.vaporMode) {
                this.playerSprite.frame ^= 1;
            }
        } else if (this.playerSprite.state == 1) {
            var bl = true;
            if ((this.getTileVal(1, 0, 0, 1, 0) != 1 && this.getTileVal(1, 0, 0, 1, 1) != 1 && !this.inAir || this.getTileVal(1, 0, 0, 1, 0) != 1 && this.getTileVal(1, 0, 0, 1, 1) != 1 && this.getTileVal(1, 0, 0, 1, 2) != 1 && this.inAir || this.getTileVal(1, 0, 0, 1, 0) != 1 && this.getTileVal(1, 0, 0, 1, 1) != 1 && this.getTileVal(1, 0, 0, 1, 2) != 1 && this.getTileVal(1, 0, 0, 0, 2) != 0) && this.playerSprite.xPos < this.gameWidth - 16) {
                if (this.playerSprite.xPos < 16 || this.lockScreen || this.runOffEnd) {
                    this.playerSprite.xPos += 4;
                } else {
                    this.ofsX += 4;
                    this.moveX += 4;
                }
            }
            this.playerSprite.lastDir = true;
            if (!this.batMode && !this.vaporMode) {
                this.playerSprite.frame = this.playerSprite.frame == 2 ? 0 : ++this.playerSprite.frame;
            }
        } else if (this.playerSprite.state == 2) {
            if (this.getTileVal(1, 0, 0, -1, 0) != 1 && this.getTileVal(1, 0, 0, -1, 1) != 1 || this.getTileVal(1, 0, 0, -1, 0) != 1 && this.getTileVal(1, 0, 0, -1, 1) != 1 && this.getTileVal(1, 0, 0, -1, 2) != 1) {
                if (this.playerSprite.xPos > 0) {
                    this.playerSprite.xPos -= 4;
                }
                this.playerSprite.lastDir = false;
                if (!this.batMode && !this.vaporMode) {
                    this.playerSprite.frame = this.playerSprite.frame == 2 ? 0 : ++this.playerSprite.frame;
                }
            }
        } else if (this.playerSprite.state == 18) {
            var bl = true;
            if (this.jumpCount < fastJumpAmount.length && !this.batMode) {
                if (this.getTileVal(1, 0, 0, 1, 0) != 1 && this.getTileVal(1, 0, 0, 1, 1) != 1 && !this.inAir || this.getTileVal(1, 0, 0, 1, 0) != 1 && this.getTileVal(1, 0, 0, 1, 1) != 1 && this.getTileVal(1, 0, 0, 1, 2) != 1 && this.inAir || this.getTileVal(1, 0, 0, 1, 0) != 1 && this.getTileVal(1, 0, 0, 1, 1) != 1 && this.getTileVal(1, 0, 0, 1, 2) != 1 && this.getTileVal(1, 0, 0, 0, 2) != 0 && this.getTileVal(1, 0, 4, 0, 0) == 0 && this.getTileVal(1, 0, 4, this.ofsX == 0 ? 0 : 1, 0) == 0) {
                    if (this.playerSprite.xPos + fastJumpAmount[this.jumpCount] < this.gameWidth - 16) {
                        if (this.playerSprite.xPos < 16 || this.lockScreen || this.runOffEnd) {
                            this.playerSprite.xPos += fastJumpAmount[this.jumpCount];
                        } else {
                            this.ofsX += fastJumpAmount[this.jumpCount];
                            this.moveX += fastJumpAmount[this.jumpCount];
                        }
                        this.playerSprite.lastDir = true;
                        if (this.playerSprite.yPos - fastJumpAmount[this.jumpCount] > this.playerLatch) {
                            this.playerSprite.yPos -= fastJumpAmount[this.jumpCount];
                        } else if (this.ofsY - fastJumpAmount[this.jumpCount] > 0 && !this.jumpLocked) {
                            var n3 = this.playerSprite.yPos - this.playerLatch;
                            this.playerSprite.yPos = this.playerLatch;
                            this.ofsY -= fastJumpAmount[this.jumpCount];
                            this.moveY += fastJumpAmount[this.jumpCount];
                        } else if (!this.jumpLocked) {
                            this.moveY = this.ofsY;
                            this.playerSprite.yPos -= fastJumpAmount[this.jumpCount] - this.ofsY;
                            this.ofsY = 0;
                            this.jumpLocked = true;
                        } else {
                            this.playerSprite.yPos -= fastJumpAmount[this.jumpCount];
                        }
                        if (this.jumpCount == 0) {
                            this.playSound(3);
                        }
                        ++this.jumpCount;
                        if (!this.batMode && !this.vaporMode) {
                            this.playerSprite.frame = this.playerSprite.frame == 2 ? 0 : ++this.playerSprite.frame;
                        }
                    } else {
                        this.jumpCount = 0;
                        this.playerSprite.state = 0;
                    }
                } else {
                    this.jumpCount = 0;
                    this.playerSprite.state = 0;
                }
            } else {
                this.jumpCount = 0;
                this.playerSprite.state = 0;
            }
        } else if (this.playerSprite.state == 3 && this.playerSprite.refireTime == 0) {
            this.playerSprite.refireTime = 15;
            var enumeration = this.spriteManager.spriteVector.elements();
            while (enumeration.hasMoreElements()) {
                sprite = enumeration.nextElement();
                if (!(sprite.type != 10 && sprite.type != 11 && (sprite.type < 14 || sprite.type > 18 || sprite.state != 0 && (sprite.refireTime <= 16 || sprite.state != 20 && sprite.state != 19)) || this.jumping || this.inAir || (sprite.xPos - this.playerSprite.xPos >= 0 ? sprite.xPos - this.playerSprite.xPos : 0 - (sprite.xPos - this.playerSprite.xPos)) >= 32 || sprite.xPos < 0 || (sprite.yPos - this.playerSprite.yPos >= 0 ? sprite.yPos - this.playerSprite.yPos : 0 - (sprite.yPos - this.playerSprite.yPos)) >= 16 || sprite.yPos < 0)) {
                    this.playSound(4);
                    sprite.refireTime = 0;
                    sprite.state = 15;
                    this.playerSprite.state = 16;
                    if (sprite.xPos <= this.playerSprite.xPos || this.lockScreen) {
                        this.playerSprite.xPos = sprite.xPos;
                    } else {
                        this.biteMove = sprite.xPos - this.playerSprite.xPos;
                        this.playerSprite.xPos = sprite.xPos;
                    }
                    this.playerSprite.yPos = sprite.yPos;
                    this.playerSprite.frame = 0;
                    this.addParticle(this.playerSprite.xPos, this.playerSprite.yPos + 8, 5, 0xE02020);
                    break;
                }
                sprite = null;
            }
            if (this.stakes > 0 && this.playerSprite.state != 16) {
                --this.stakes;
            } else if (this.stakes == 0 && this.playerSprite.state != 16) {
                this.playerSprite.refireTime = 0;
                this.playerSprite.state = 0;
            }
        } else if (this.playerSprite.state == 3 && this.playerSprite.refireTime == 13 && this.playerSprite.state != 16) {
            this.playSound(7);
            var sprite2 = new Sprite(101, 16, 16);
            sprite2.lastDir = this.playerSprite.lastDir;
            sprite2.setCollisionRectangle(2, 2, 12, 12);
            if (this.playerSprite.lastDir) {
                sprite2.setPosition(this.playerSprite.xPos + 16, this.playerSprite.yPos + 8);
            } else {
                sprite2.setPosition(this.playerSprite.xPos - 16, this.playerSprite.yPos + 8);
            }
            this.spriteManager.spriteVector.addElement(sprite2);
            sprite2 = null;
        } else if (this.playerSprite.state == 16) {
            this.playerSprite.health = this.playerSprite.health + 2 > 100 ? 100 : (this.playerSprite.health += 2);
            if (this.biteMove > 0) {
                this.ofsX += 4;
                this.playerSprite.xPos -= 4;
                this.moveX += 4;
                this.biteMove -= 4;
            }
        } else if (this.playerSprite.state == 0) {
            if (!this.batMode && !this.vaporMode) {
                this.playerSprite.frame = this.playerSprite.frame == 2 ? 0 : ++this.playerSprite.frame;
            }
        } else if (this.playerSprite.state == 16 && !this.batMode && !this.vaporMode) {
            this.playerSprite.frame ^= 1;
        }
        if (this.jumping && !this.batMode) {
            if (this.jumpCount < jumpAmount.length) {
                if ((this.ofsY & 3) != 0) {
                    this.moveY += this.ofsY & 3;
                    this.ofsY -= this.ofsY & 3;
                }
                if (this.getTileVal(1, 0, 4, 0, 0) == 0 && this.getTileVal(1, 0, 4, this.ofsX == 0 ? 0 : 1, 0) == 0) {
                    if (this.playerSprite.yPos - jumpAmount[this.jumpCount] > this.playerLatch) {
                        this.playerSprite.yPos -= jumpAmount[this.jumpCount];
                    } else if (this.ofsY - jumpAmount[this.jumpCount] >= 0 && !this.jumpLocked) {
                        var n4 = this.playerSprite.yPos - this.playerLatch;
                        this.playerSprite.yPos = this.playerLatch;
                        this.ofsY -= jumpAmount[this.jumpCount] - n4;
                        this.moveY += jumpAmount[this.jumpCount] - n4;
                    } else if (!this.jumpLocked) {
                        this.moveY = this.ofsY;
                        this.playerSprite.yPos -= jumpAmount[this.jumpCount] - this.ofsY;
                        this.ofsY = 0;
                        this.jumpLocked = true;
                    } else {
                        this.playerSprite.yPos -= jumpAmount[this.jumpCount];
                    }
                    ++this.jumpCount;
                    this.playerSprite.frame = this.playerSprite.frame == 2 ? 0 : ++this.playerSprite.frame;
                } else {
                    this.jumping = false;
                }
            } else {
                this.jumping = false;
            }
        }
        if (this.level == 1 && this.spriteManager.getRandom(16) == 1) {
            this.addParticle(this.spriteManager.getRandom(6) + 1 << 4, this.spriteManager.getRandom(2), 1, 28893);
        }
        if (this.ofsX >= 16) {
            this.ofsX -= 16;
            this.loadCol();
        }
        if (this.getTileVal(2, 0, 0, 0, 2) == 2 && this.playerSprite.state != 9) {
            if (this.playerSprite.health - 4 <= 0) {
                this.jumpCount = 0;
                this.playerSprite.state = 9;
                this.playSound(8);
            } else {
                this.addParticle(this.playerSprite.xPos + 4 + this.spriteManager.getRandom(8), this.playerSprite.yPos + 8 - this.spriteManager.getRandom(8), 1, 0xAAAAAA);
                this.playerSprite.health -= 4;
            }
        } else if (this.getTileVal(2, 0, 0, 0, 2) == 3 && this.playerSprite.state != 9) {
            this.playSound(8);
            this.jumpCount = 0;
            this.playerSprite.state = 9;
        }
        if (this.getTileVal(1, 0, 0, 0, 2) != 1 && this.getTileVal(1, -4, 0, this.ofsX == 0 && this.playerSprite.state != 2 && this.getTileVal(1, 0, 0, 0, 2) != 3 ? 0 : 1, 2) != 1 && this.getTileVal(1, 0, 0, 0, 2) != 6 && this.getTileVal(1, -4, 0, this.ofsX == 0 && this.playerSprite.state != 2 ? 0 : 1, 2) != 6 && !this.batMode) {
            if ((this.ofsY & 3) != 0) {
                this.moveY += this.ofsY & 3;
                this.ofsY -= this.ofsY & 3;
            }
            this.inAir = true;
            n = this.ofsY;
            if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 1) == 2) {
                this.adjustOnSlope(1, 2);
            } else if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 2) == 2) {
                this.adjustOnSlope(2, 2);
            } else if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 1) == 3) {
                this.adjustOnSlope(1, 3);
            } else if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 2) == 3) {
                this.adjustOnSlope(2, 3);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 1) == 4) {
                void("1 - ap: " + this.ofsY + " - as: " + (this.ofsY - (this.ofsY & 0xF)) + ", " + (this.ofsY & 0xF));
                this.adjustOnSlope(1, 4);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 2) == 4) {
                void("2 - ap: " + this.ofsY + " - as: " + (this.ofsY - (this.ofsY & 0xF)) + ", " + (this.ofsY & 0xF));
                this.adjustOnSlope(2, 4);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 1) == 5) {
                this.adjustOnSlope(1, 5);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 2) == 5) {
                this.adjustOnSlope(2, 5);
            } else if (this.ofsY < 256 - this.gameHeight) {
                if (this.playerSprite.yPos < this.playerLatch) {
                    this.playerSprite.yPos += 4;
                } else {
                    this.ofsY += 4;
                    this.moveY -= 4;
                }
            } else {
                this.playerSprite.yPos += 4;
            }
        } else {
            this.inAir = false;
            n = this.ofsY;
            if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 1) == 2) {
                this.adjustOnSlope(1, 2);
            } else if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 2) == 2) {
                this.adjustOnSlope(2, 2);
            } else if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 1) == 3) {
                this.adjustOnSlope(1, 3);
            } else if (this.getTileVal(1, 8 + this.ofsX, 0, 1, 2) == 3) {
                this.adjustOnSlope(2, 3);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 1) == 4) {
                this.adjustOnSlope(1, 4);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 2) == 4) {
                this.adjustOnSlope(2, 4);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 1) == 5) {
                this.adjustOnSlope(1, 5);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 2) == 5) {
                this.adjustOnSlope(2, 5);
            }
        }
        if (!this.slowMode || (this.specialTic & 1) == 0) {
            var enumeration = this.spriteManager.spriteVector.elements();
            while (enumeration.hasMoreElements()) {
                var object;
                sprite = enumeration.nextElement();
                if (sprite.xPos <= -32 || sprite.xPos > 192 || sprite.yPos > this.gameHeight && sprite.state == 9) {
                    this.spriteManager.spriteVector.removeElement(sprite);
                } else if (sprite.type == 10 && sprite.state != 15 && !this.vaporMode) {
                    if (sprite.refireTime == 0 && sprite.state != 9) {
                        if (this.playerSprite.yPos >= sprite.yPos - 32 && this.playerSprite.yPos <= sprite.yPos + 32 && this.playerSprite.xPos >= sprite.xPos - 32 && this.playerSprite.xPos <= sprite.xPos + 32) {
                            var sprite3;
                            if (this.playerSprite.xPos < sprite.xPos + 8) {
                                this.playSound(6);
                                sprite3 = new Sprite(500, 64, 20);
                                sprite3.setPosition(sprite.xPos - 32, sprite.yPos - 8);
                                sprite3.setCollisionRectangle(2, 2, 60, 16);
                                sprite3.ttl = 4;
                                this.spriteManager.spriteVector.addElement(sprite3);
                                sprite3 = null;
                                sprite.lastDir = false;
                            } else {
                                this.playSound(3);
                                sprite3 = new Sprite(501, 64, 20);
                                sprite3.setPosition(sprite.xPos - 16, sprite.yPos - 8);
                                sprite3.setCollisionRectangle(2, 2, 60, 16);
                                sprite3.ttl = 4;
                                this.spriteManager.spriteVector.addElement(sprite3);
                                sprite3 = null;
                                sprite.lastDir = true;
                            }
                            sprite.refireTime = 14;
                            sprite.state = 17;
                        } else if (this.playerSprite.yPos >= sprite.yPos - 32 && this.playerSprite.yPos <= sprite.yPos + 32) {
                            this.playSound(7);
                            var sprite4 = new Sprite(100, 16, 16);
                            sprite4.setCollisionRectangle(2, 2, 12, 12);
                            sprite4.setPosition(sprite.xPos - 16, sprite.yPos + 8);
                            this.spriteManager.spriteVector.addElement(sprite4);
                            sprite4 = null;
                            sprite.refireTime = 15;
                            sprite.state = 3;
                        } else if (sprite.state == 9) {
                            if (sprite.ttl < deathArc.length - 1) {
                                ++sprite.ttl;
                            }
                            sprite.yPos += deathArc[sprite.ttl];
                        } else if (sprite.refireTime > 0) {
                            --sprite.refireTime;
                        } else {
                            sprite.state = 0;
                        }
                    } else if (sprite.state == 9) {
                        if (sprite.ttl < deathArc.length - 1) {
                            ++sprite.ttl;
                        }
                        sprite.yPos += deathArc[sprite.ttl];
                    } else if (sprite.refireTime > 0) {
                        --sprite.refireTime;
                    } else {
                        sprite.frame = 0;
                        sprite.refireTime = 10;
                        sprite.state = 0;
                    }
                } else if (sprite.type == 11 && sprite.state != 15) {
                    if (sprite.state == 2) {
                        if (sprite.yPos > 0 && sprite.xPos > 0 && sprite.yPos < this.gameHeight - 32 && sprite.xPos < this.gameWidth - 16 && this.tileArray[this.mapBuffer[sprite.xPos >> 4][(sprite.yPos + this.ofsY >> 4) + 2]][1] == 0) {
                            sprite.yPos += 4;
                        }
                        sprite.xPos -= 4;
                    } else if (sprite.state == 9) {
                        if (sprite.ttl < deathArc.length - 1) {
                            ++sprite.ttl;
                        }
                        sprite.yPos += deathArc[sprite.ttl];
                    } else if (this.playerSprite.yPos >= sprite.yPos - 32 && this.playerSprite.yPos <= sprite.yPos + 32 && this.playerSprite.xPos >= sprite.xPos - 32 && this.playerSprite.xPos <= sprite.xPos + 32 && sprite.state != 9 && sprite.state != 15 && !this.vaporMode) {
                        sprite.state = 2;
                    }
                } else if (sprite.type == 12) {
                    sprite.frame ^= 1;
                    if (sprite.isCollidingWith(this.playerSprite) && !this.vaporMode) {
                        this.addParticle(this.playerSprite.xPos + 8, this.playerSprite.yPos + 8, 1, 0xE02020);
                        this.playerSprite.health -= 10;
                    }
                    if (sprite.state == 9) {
                        if (sprite.ttl < deathArc.length - 1) {
                            ++sprite.ttl;
                        }
                        sprite.yPos += deathArc[sprite.ttl];
                    } else {
                        if (sprite.yPos > 0 && sprite.xPos > 16 && sprite.yPos < this.gameHeight - 32 && sprite.xPos < this.gameWidth - 16 && this.tileArray[this.mapBuffer[(sprite.xPos >> 4) - 1][(sprite.yPos + this.ofsY >> 4) + 1]][1] == 0) {
                            sprite.yPos += 4;
                        }
                        sprite.xPos -= 8;
                    }
                } else if (sprite.type == 13) {
                    if (sprite.isCollidingWith(this.playerSprite) && !this.vaporMode) {
                        this.addParticle(this.playerSprite.xPos + 8, this.playerSprite.yPos + 8, 1, 16308848);
                        this.playerSprite.health -= 5;
                    }
                    if (sprite.state == 9) {
                        if (sprite.ttl < deathArc.length - 1) {
                            ++sprite.ttl;
                        }
                        sprite.yPos += deathArc[sprite.ttl];
                    } else {
                        sprite.xPos -= 4;
                        sprite.refireTime = sprite.refireTime < deathArc.length - 1 ? ++sprite.refireTime : 0;
                        sprite.yPos += deathArc[sprite.refireTime];
                    }
                } else if (sprite.type >= 14 && sprite.type <= 18) {
                    if (!this.lockScreen && sprite.xPos <= this.gameWidth - 16) {
                        this.lockScreen = true;
                    }
                    if (sprite.state != 15) {
                        if (sprite.state == 9) {
                            if (this.level < 5) {
                                if (sprite.xPos < this.gameWidth + 8) {
                                    sprite.xPos += 4;
                                } else {
                                    this.bossDead = true;
                                }
                            } else {
                                if (sprite.ttl < deathArc.length - 1) {
                                    ++sprite.ttl;
                                }
                                sprite.yPos += deathArc[sprite.ttl];
                                if (sprite.yPos > this.gameHeight) {
                                    this.bossDead = true;
                                }
                            }
                        } else {
                            if (sprite.state != 2 && sprite.state != 1) {
                                if (sprite.refireTime - 1 == 0 && sprite.state != 0) {
                                    sprite.state = 0;
                                    if (sprite.state != 17) {
                                        sprite.refireTime = 10;
                                    }
                                    sprite.frame = 0;
                                } else if (!(sprite.refireTime == 0 && sprite.state == 0 || sprite.refireTime == 0 && sprite.state == 17)) {
                                    --sprite.refireTime;
                                }
                                if (sprite.state == 19 && sprite.refireTime == 16) {
                                    var n5 = 0;
                                    while (n5 < (this.gameWidth >> 4) - 2) {
                                        object = new Sprite(400, 16, 16);
                                        (object).setCollisionRectangle(6, 2, 4, 12);
                                        (object).setPosition((n5 << 4) + 16, -8);
                                        this.spriteManager.spriteVector.addElement(object);
                                        object = null;
                                        ++n5;
                                    }
                                }
                                if (sprite.state == 20 && sprite.refireTime == 16) {
                                    var sprite5 = new Sprite(700, 16, 16);
                                    sprite5.frame = 1;
                                    sprite5.setCollisionRectangle(0, 0, 32, 16);
                                    sprite5.setPosition(this.playerSprite.xPos - 8, 0);
                                    this.spriteManager.spriteVector.addElement(sprite5);
                                    sprite5 = null;
                                }
                            } else if (sprite.state == 2) {
                                if (sprite.xPos <= 6) {
                                    if (sprite.lastDir) {
                                        sprite.state = 0;
                                        sprite.refireTime = 5;
                                        sprite.frame = 0;
                                    } else {
                                        sprite.refireTime = 0;
                                        sprite.state = 1;
                                        sprite.frame = 0;
                                    }
                                } else {
                                    sprite.xPos -= 6;
                                }
                            } else if (sprite.xPos + 6 >= this.gameWidth - 16) {
                                if (sprite.lastDir) {
                                    sprite.refireTime = 0;
                                    sprite.state = 2;
                                    sprite.frame = 0;
                                } else {
                                    sprite.state = 0;
                                    sprite.refireTime = 5;
                                    sprite.frame = 0;
                                }
                            } else {
                                sprite.xPos += 6;
                            }
                            if (sprite.refireTime == 0 && sprite.state != 9) {
                                if (this.playerSprite.yPos >= sprite.yPos - 32 && this.playerSprite.yPos <= sprite.yPos + 32 && this.playerSprite.xPos >= sprite.xPos - 32 && this.playerSprite.xPos <= sprite.xPos + 32) {
                                    var sprite6;
                                    if (this.playerSprite.xPos < sprite.xPos + 8) {
                                        this.playSound(6);
                                        if (sprite.state == 2) {
                                            sprite6 = new Sprite(600, 64, 20);
                                        } else {
                                            sprite6 = new Sprite(500, 64, 20);
                                            sprite.lastDir = false;
                                        }
                                        sprite6.setPosition(sprite.xPos - 32, sprite.yPos - 8);
                                        sprite6.setCollisionRectangle(2, 2, 60, 16);
                                        sprite6.ttl = 4;
                                        this.spriteManager.spriteVector.addElement(sprite6);
                                        sprite6 = null;
                                    } else {
                                        this.playSound(6);
                                        if (sprite.state == 1) {
                                            sprite6 = new Sprite(601, 64, 20);
                                        } else {
                                            sprite6 = new Sprite(501, 64, 20);
                                            sprite.lastDir = true;
                                        }
                                        sprite6.setPosition(sprite.xPos - 16, sprite.yPos - 8);
                                        sprite6.setCollisionRectangle(2, 2, 60, 16);
                                        sprite6.ttl = 4;
                                        this.spriteManager.spriteVector.addElement(sprite6);
                                        sprite6 = null;
                                    }
                                    sprite.refireTime = 14;
                                    sprite.frame = 0;
                                    if (sprite.state != 2 && sprite.state != 1) {
                                        sprite.state = 17;
                                    }
                                }
                                if (sprite.state != 2 && sprite.state != 1 && sprite.state != 17) {
                                    var n6 = sprite.lastDir && sprite.xPos >= this.halfGameWidth || !sprite.lastDir && sprite.xPos < this.halfGameWidth ? 1 : this.spriteManager.getRandom(3);
                                    if (n6 == 0) {
                                        this.playSound(7);
                                        if (sprite.lastDir) {
                                            object = new Sprite(102, 16, 16);
                                            (object).setPosition(sprite.xPos + 16, sprite.yPos + 8);
                                        } else {
                                            object = new Sprite(100, 16, 16);
                                            (object).setPosition(sprite.xPos - 16, sprite.yPos + 8);
                                        }
                                        (object).setCollisionRectangle(2, 2, 12, 12);
                                        this.spriteManager.spriteVector.addElement(object);
                                        object = null;
                                        sprite.refireTime = 15;
                                        sprite.state = 3;
                                        sprite.frame = 0;
                                    } else if (n6 == 1) {
                                        this.playSound(3);
                                        sprite.state = sprite.lastDir ? 1 : 2;
                                        sprite.frame = 0;
                                    } else if (n6 == 2) {
                                        this.playSound(5);
                                        sprite.state = this.level == 5 ? 20 : 19;
                                        sprite.frame = 0;
                                        sprite.refireTime = 25;
                                    }
                                }
                            }
                        }
                    }
                } else if (sprite.type == 19) {
                    if (this.playerSprite.isCollidingWith(sprite)) {
                        this.playSound(1);
                        this.batMode = true;
                        this.playerSprite.state = 0;
                        this.playerSprite.frame = 0;
                        this.specialTic = 0;
                        this.spriteManager.spriteVector.removeElement(sprite);
                    }
                } else if (sprite.type == 20) {
                    if (this.playerSprite.isCollidingWith(sprite)) {
                        this.playSound(2);
                        this.vaporMode = true;
                        this.playerSprite.frame = 0;
                        this.specialTic = 0;
                        this.spriteManager.spriteVector.removeElement(sprite);
                    }
                } else if (sprite.type == 21) {
                    if (this.playerSprite.isCollidingWith(sprite)) {
                        this.playSound(0);
                        this.slowMode = true;
                        this.playerSprite.frame = 0;
                        this.specialTic = 0;
                        this.spriteManager.spriteVector.removeElement(sprite);
                    }
                } else if (sprite.type != 22 && sprite.type != 23) {
                    if (sprite.type == 24) {
                        if (sprite.frame < 3) {
                            ++sprite.frame;
                        } else {
                            sprite.frame = 0;
                            this.addParticle(sprite.xPos + this.spriteManager.getRandom(5), sprite.yPos, 1, 0xAAAAAA);
                        }
                    } else if (sprite.type == 25) {
                        if (this.playerSprite.isCollidingWith(sprite)) {
                            this.stakes = 5;
                            this.spriteManager.spriteVector.removeElement(sprite);
                        }
                    } else if (sprite.type == 100 || sprite.type == 102 || sprite.type == 400) {
                        var bl = true;
                        if (sprite.ttl == 0) {
                            this.spriteManager.spriteVector.removeElement(sprite);
                        } else {
                            if (sprite.xPos >> 4 >= 0 && (sprite.xPos >> 4) + 1 < 12 && sprite.yPos + this.ofsY >> 4 >= 0 && (sprite.yPos + this.ofsY >> 4) + 1 < 16 && (this.tileArray[this.mapBuffer[(sprite.xPos >> 4) + 1][sprite.yPos + this.ofsY >> 4]][1] == 1 || this.tileArray[this.mapBuffer[(sprite.xPos >> 4) + 1][(sprite.yPos + this.ofsY - 4 >> 4) + 1]][1] == 1)) {
                                sprite.ttl = 0;
                                this.addParticle(sprite.xPos + 8, sprite.yPos + 8, 5, 16308848);
                                bl = false;
                            }
                            if (bl) {
                                if (sprite.isCollidingWith(this.playerSprite)) {
                                    this.playerSprite.health -= 10;
                                    this.spriteManager.spriteVector.removeElement(sprite);
                                    this.addParticle(this.playerSprite.xPos + 8, this.playerSprite.yPos + 8, 5, 0xE02020);
                                } else if (sprite.type == 100) {
                                    sprite.xPos -= 8;
                                } else if (sprite.type == 102) {
                                    sprite.xPos += 8;
                                    if (sprite.xPos > this.gameWidth) {
                                        this.spriteManager.spriteVector.removeElement(sprite);
                                    }
                                } else {
                                    sprite.yPos += 8;
                                }
                            }
                        }
                    } else if (sprite.type == 101) {
                        var bl = true;
                        if (sprite.ttl == 0) {
                            this.spriteManager.spriteVector.removeElement(sprite);
                        } else {
                            if (sprite.xPos >> 4 >= 0 && (sprite.xPos >> 4) + 1 < 12 && sprite.yPos + this.ofsY >> 4 >= 0 && (sprite.yPos + this.ofsY >> 4) + 1 < 16 && (this.tileArray[this.mapBuffer[(sprite.xPos >> 4) + 1][sprite.yPos + this.ofsY >> 4]][1] == 1 || this.tileArray[this.mapBuffer[(sprite.xPos >> 4) + 1][(sprite.yPos + this.ofsY - 4 >> 4) + 1]][1] == 1)) {
                                sprite.ttl = 0;
                                this.addParticle(sprite.xPos + 8, sprite.yPos + 8, 5, 16308848);
                            }
                            if (bl) {
                                object = this.spriteManager.spriteVector.elements();
                                while (object.hasMoreElements()) {
                                    var sprite7 = object.nextElement();
                                    if (sprite7.type < 10 || sprite7.type > 13 || !sprite.isCollidingWith(sprite7)) continue;
                                    sprite7.health -= 5;
                                    if (sprite7.health <= 0) {
                                        sprite7.ttl = 0;
                                        sprite7.state = 9;
                                    }
                                    this.spriteManager.spriteVector.removeElement(sprite);
                                    this.addParticle(sprite7.xPos + 8, sprite7.yPos + 8, 5, 0xE02020);
                                    bl = false;
                                    break;
                                }
                            }
                            if (bl) {
                                sprite.xPos = sprite.lastDir ? (sprite.xPos += 8) : (sprite.xPos -= 8);
                            }
                        }
                    } else if (sprite.type == 500 || sprite.type == 501 || sprite.type == 600 || sprite.type == 601) {
                        if (sprite.isCollidingWith(this.playerSprite)) {
                            this.playerSprite.health = (sprite.type == 500 || sprite.type == 501) && this.sublevel == 3 ? (this.playerSprite.health -= 8) : (this.playerSprite.health -= 5);
                            this.addParticle(this.playerSprite.xPos + 8, this.playerSprite.yPos + 8, 3, 0xE02020);
                        }
                        if (sprite.type == 600) {
                            sprite.xPos -= 8;
                        } else if (sprite.type == 601) {
                            sprite.xPos += 8;
                        }
                        if (sprite.ttl == 0) {
                            this.spriteManager.spriteVector.removeElement(sprite);
                        } else {
                            --sprite.ttl;
                        }
                    } else if (sprite.type == 700) {
                        var bl = true;
                        if (sprite.ttl == 0) {
                            this.spriteManager.spriteVector.removeElement(sprite);
                        } else {
                            --sprite.ttl;
                        }
                        if (sprite.ttl < 0) {
                            if ((sprite.yPos + this.ofsY >> 4) + sprite.frame + 1 >= this.BUFFER_HEIGHT) {
                                sprite.ttl = 3;
                            } else if (this.tileArray[this.mapBuffer[(sprite.xPos >> 4) + 1][(sprite.yPos + this.ofsY >> 4) + sprite.frame]][1] == 1 || this.tileArray[this.mapBuffer[(sprite.xPos >> 4) + 1][(sprite.yPos + this.ofsY - 4 >> 4) + 1 + sprite.frame]][1] == 1) {
                                sprite.ttl = 3;
                            } else {
                                if (sprite.isCollidingWith(this.playerSprite)) {
                                    this.playerSprite.health -= 15;
                                    sprite.ttl = 2;
                                    sprite.lastDir = true;
                                    this.addParticle(this.playerSprite.xPos + 8, this.playerSprite.yPos + 8, 2, 0xAAAAAA);
                                }
                                sprite.setPosition(sprite.xPos + this.moveX, sprite.yPos - this.moveY);
                            }
                        }
                    }
                }
                sprite = null;
            }
        }
        var enumeration = this.spriteManager.spriteVector.elements();
        while (enumeration.hasMoreElements()) {
            sprite = enumeration.nextElement();
            sprite.setPosition(sprite.xPos - this.moveX, sprite.yPos + this.moveY);
            sprite = null;
        }
    }
// END SOURCE METHODS

}
