// Mechanical port of reference/decompiled/Sprite.java. Draw mutations execute once per tick.
export class Sprite {
    constructor(n, n2, n3) {

        this.xPos = -99999;
        this.yPos = -99999;
        this.boundX = 0;
        this.boundY = 0;
        this.boundW = 0;
        this.boundH = 0;
        this.width = 0;
        this.height = 0;
        this.type = 0;
        this.frame = 0;
        this.refireTime = 0;
        this.ttl = 0;
        this.state = 0;
        this.lastDir = 0;
        this.health = 2;
        this.upCount = 0;


        this.type = n;
        this.width = n2;
        this.height = n3;
        this.frame = 0;
        this.refireTime = 0;
        this.ttl = -1;
        this.state = 0;
        this.lastDir = false;
        if (n == 10 || this.type == 13) {
            this.health = 10;
        } else if (n == 14) {
            this.health = 60;
        } else if (n == 15) {
            this.health = 100;
        } else if (n == 16) {
            this.health = 140;
        } else if (n == 17) {
            this.health = 160;
        } else if (n == 18) {
            this.health = 200;
        }
    }

    draw(graphics, image, image2) {
        if (this.type >= 19 && this.type <= 21 || this.type == 25) {
            if (this.lastDir) {
                if (this.upCount == 3) {
                    ++this.yPos;
                    this.lastDir = false;
                } else {
                    ++this.yPos;
                    ++this.upCount;
                }
            } else if (this.upCount == 0) {
                --this.yPos;
                this.lastDir = true;
            } else {
                --this.yPos;
                --this.upCount;
            }
        }
        if (this.type < 19) {
            graphics.setClip(this.xPos - 8, this.yPos, 32, 32);
        } else {
            graphics.setClip(this.xPos, this.yPos, this.width, this.height);
        }
        switch (this.type) {
            case 10: {
                if (this.state == 3 || this.state == 17) {
                    if (this.refireTime < 12) {
                        graphics.drawImage(image, -256 + this.xPos - 8, this.yPos, 20);
                    } else if (this.refireTime < 13) {
                        graphics.drawImage(image, -224 + this.xPos - 8, this.yPos, 20);
                    } else {
                        graphics.drawImage(image, -192 + this.xPos - 8, this.yPos, 20);
                    }
                    if (this.state != 17) break;
                    if (this.refireTime < 12) {
                        graphics.setClip(-27 + this.xPos - 8, -1 + this.yPos, 32, 32);
                        graphics.drawImage(image2, -27 + this.xPos - 8 - 64, -1 + this.yPos, 20);
                        break;
                    }
                    if (this.refireTime < 13) {
                        graphics.setClip(-8 + this.xPos - 8, -22 + this.yPos, 32, 32);
                        graphics.drawImage(image2, -8 + this.xPos - 8 - 32, -22 + this.yPos, 20);
                        break;
                    }
                    graphics.setClip(17 + this.xPos - 8, -13 + this.yPos, 32, 32);
                    graphics.drawImage(image2, 17 + this.xPos - 8, -13 + this.yPos, 20);
                    break;
                }
                this.frame = this.frame == 2 ? 0 : ++this.frame;
                if (this.state == 9) {
                    graphics.drawImage(image, -288 + this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                    break;
                }
                graphics.drawImage(image, this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                break;
            }
            case 11: {
                this.frame = this.frame == 2 ? 0 : ++this.frame;
                if (this.state == 2) {
                    graphics.drawImage(image, -96 + this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                    break;
                }
                if (this.state == 9) {
                    graphics.drawImage(image, -288 + this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                    break;
                }
                graphics.drawImage(image, this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                break;
            }
            case 12: {
                graphics.setClip(this.xPos, this.yPos, 32, 16);
                graphics.drawImage(image, this.xPos - (this.frame << 5), this.yPos, 20);
                break;
            }
            case 13: {
                this.frame = this.frame == 2 ? 0 : ++this.frame;
                graphics.drawImage(image, this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                break;
            }
            case 14: 
            case 15: 
            case 16: 
            case 17: 
            case 18: {
                if (this.state == 2) {
                    this.frame = this.frame == 2 ? 0 : ++this.frame;
                    graphics.drawImage(image, -96 + this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                    break;
                }
                if (this.state == 1 || this.state == 9 && this.type != 18) {
                    this.frame = this.frame == 2 ? 0 : ++this.frame;
                    graphics.drawImage(image, -288 + this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                    break;
                }
                if (this.state == 3 || this.state == 17) {
                    if (!this.lastDir) {
                        if (this.refireTime < 12) {
                            graphics.drawImage(image, -256 + this.xPos - 8, this.yPos, 20);
                        } else if (this.refireTime < 13) {
                            graphics.drawImage(image, -224 + this.xPos - 8, this.yPos, 20);
                        } else {
                            graphics.drawImage(image, -192 + this.xPos - 8, this.yPos, 20);
                        }
                    } else if (this.refireTime < 12) {
                        graphics.drawImage(image, -448 + this.xPos - 8, this.yPos, 20);
                    } else if (this.refireTime < 13) {
                        graphics.drawImage(image, -416 + this.xPos - 8, this.yPos, 20);
                    } else {
                        graphics.drawImage(image, -384 + this.xPos - 8, this.yPos, 20);
                    }
                    if (this.state != 17) break;
                    if (!this.lastDir) {
                        if (this.refireTime < 12) {
                            graphics.setClip(-23 + this.xPos - 8, -1 + this.yPos, 32, 32);
                            graphics.drawImage(image2, -23 + this.xPos - 8 - 64, -1 + this.yPos, 20);
                            break;
                        }
                        if (this.refireTime < 13) {
                            graphics.setClip(-8 + this.xPos - 8, -21 + this.yPos, 32, 32);
                            graphics.drawImage(image2, -8 + this.xPos - 8 - 32, -21 + this.yPos, 20);
                            break;
                        }
                        graphics.setClip(19 + this.xPos - 8, -12 + this.yPos, 32, 32);
                        graphics.drawImage(image2, 19 + this.xPos - 8, -12 + this.yPos, 20);
                        break;
                    }
                    if (this.refireTime < 12) {
                        graphics.setClip(23 + this.xPos - 8, -1 + this.yPos, 32, 32);
                        graphics.drawImage(image2, 23 + this.xPos - 8, -1 + this.yPos, 20);
                        break;
                    }
                    if (this.refireTime < 13) {
                        graphics.setClip(8 + this.xPos - 8, -22 + this.yPos, 32, 32);
                        graphics.drawImage(image2, 8 + this.xPos - 8 - 32, -22 + this.yPos, 20);
                        break;
                    }
                    graphics.setClip(-15 + this.xPos - 8, -13 + this.yPos, 32, 32);
                    graphics.drawImage(image2, -15 + this.xPos - 8 - 64, -13 + this.yPos, 20);
                    break;
                }
                if (this.state == 19 || this.state == 20) {
                    if (this.refireTime < 13) {
                        if (!this.lastDir) {
                            graphics.drawImage(image, -256 + this.xPos - 8, this.yPos, 20);
                            break;
                        }
                        graphics.drawImage(image, -448 + this.xPos - 8, this.yPos, 20);
                        break;
                    }
                    if (this.refireTime < 16) {
                        if (!this.lastDir) {
                            graphics.drawImage(image, -224 + this.xPos - 8, this.yPos, 20);
                            break;
                        }
                        graphics.drawImage(image, -416 + this.xPos - 8, this.yPos, 20);
                        break;
                    }
                    if (this.refireTime < 18) {
                        graphics.drawImage(image, -544 + this.xPos - 8, this.yPos, 20);
                        break;
                    }
                    if (this.refireTime < 20) {
                        graphics.drawImage(image, -512 + this.xPos - 8, this.yPos, 20);
                        break;
                    }
                    graphics.drawImage(image, -480 + this.xPos - 8, this.yPos, 20);
                    break;
                }
                this.frame = this.frame == 2 ? 0 : ++this.frame;
                if (!this.lastDir) {
                    graphics.drawImage(image, this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                    break;
                }
                graphics.drawImage(image, -576 + this.xPos - 8 - (this.frame << 5), this.yPos, 20);
                break;
            }
            case 19: {
                this.frame ^= 1;
                graphics.drawImage(image, this.xPos - (this.frame << 4), -16 + this.yPos, 20);
                break;
            }
            case 20: {
                this.frame ^= 1;
                graphics.drawImage(image, this.xPos - (this.frame << 4), this.yPos, 20);
                break;
            }
            case 21: {
                this.frame ^= 1;
                graphics.drawImage(image, -32 + this.xPos - (this.frame << 4), this.yPos, 20);
                break;
            }
            case 22: {
                graphics.setClip(this.xPos, this.yPos, 5, 16);
                graphics.drawImage(image, -57 + this.xPos, -16 + this.yPos, 20);
                break;
            }
            case 23: {
                graphics.setClip(this.xPos, this.yPos, 5, 16);
                graphics.drawImage(image, -52 + this.xPos, -16 + this.yPos, 20);
                break;
            }
            case 24: {
                graphics.setClip(this.xPos, this.yPos, 5, 16);
                graphics.drawImage(image, -32 + this.xPos - this.frame * 5, -16 + this.yPos, 20);
                break;
            }
            case 25: {
                this.frame ^= 1;
                graphics.setClip(this.xPos, this.yPos - 4, 16, 16);
                graphics.drawImage(image, this.xPos - (this.frame << 4), -88 + this.yPos - 4, 20);
                break;
            }
            case 100: 
            case 101: 
            case 102: {
                this.frame = this.frame == 3 ? 0 : ++this.frame;
                graphics.drawImage(image, this.xPos - (this.frame << 4), -32 + this.yPos, 20);
                break;
            }
            case 400: {
                graphics.drawImage(image, -32 + this.xPos, -32 + this.yPos, 20);
                break;
            }
            case 500: 
            case 600: {
                if (this.ttl > 2) {
                    graphics.setClip(this.xPos + (this.ttl - 3 << 5), this.yPos, 5 - this.ttl << 5, this.height);
                } else {
                    graphics.setClip(this.xPos, this.yPos, this.ttl << 5, this.height);
                }
                graphics.drawImage(image, this.xPos, -48 + this.yPos, 20);
                break;
            }
            case 501: 
            case 601: {
                if (this.ttl > 2) {
                    graphics.setClip(this.xPos, this.yPos, 5 - this.ttl << 5, this.height);
                } else {
                    graphics.setClip(this.xPos + (2 - this.ttl << 5), this.yPos, this.ttl << 5, this.height);
                }
                graphics.drawImage(image, this.xPos, -68 + this.yPos, 20);
                break;
            }
            case 700: {
                if (this.ttl < 0 || this.lastDir) {
                    ++this.frame;
                    this.setCollisionRectangle(0, 0, 32, this.frame << 4);
                }
                var n = 0;
                while (n < this.frame) {
                    graphics.setClip(this.xPos, this.yPos + (n << 4), 32, this.height);
                    graphics.drawImage(image, -32 + this.xPos, -88 + this.yPos + (n << 4), 20);
                    ++n;
                }
                break;
            }
        }
    }
    isCollidingWith(sprite) {
        var n = sprite.yPos + sprite.boundY + sprite.boundH;
        var n2 = this.yPos + this.boundY;
        if (n < n2) {
            return false;
        }
        var n3 = sprite.yPos + sprite.boundY;
        var n4 = this.yPos + this.boundY + this.boundH;
        if (n3 > n4) {
            return false;
        }
        var n5 = sprite.xPos + sprite.boundX + sprite.boundW;
        var n6 = this.xPos + this.boundX;
        if (n5 < n6) {
            return false;
        }
        var n7 = sprite.xPos + sprite.boundX;
        var n8 = this.xPos + this.boundX + this.boundW;
        return n7 <= n8;
    }
    setCollisionRectangle(n, n2, n3, n4) {
        this.boundX = n;
        this.boundY = n2;
        this.boundW = n3;
        this.boundH = n4;
    }
    setPosition(n, n2) {
        this.xPos = n;
        this.yPos = n2;
    }
}
