/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Graphics
 *  javax.microedition.lcdui.Image
 */
import java.io.InputStream;
import java.util.Enumeration;
import java.util.Random;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public class GraphicObjectManager {
    protected Vector spriteVector = new Vector();
    private Graphics g;
    private mainCanvas canvas;
    private Image gameResourceImage = null;
    private Image p_sprite = null;
    private Image e_sprite1 = null;
    private Image e_sprite2 = null;
    private Image e_sprite3 = null;
    private Image e_sprite4 = null;
    private Image m_sprite = null;
    private Image s_sprite = null;
    private Random numGen = new Random();
    private int[][] drawBuffer;

    /*
     * Enabled aggressive block sorting
     */
    public GraphicObjectManager(mainCanvas mainCanvas2, Image image) {
        this.canvas = mainCanvas2;
        this.g = image.getGraphics();
        this.drawBuffer = new int[12][mainCanvas2.BUFFER_HEIGHT];
        int n = 0;
        while (n < 12) {
            int n2 = 0;
            while (n2 < mainCanvas2.BUFFER_HEIGHT) {
                this.drawBuffer[n][n2] = -1;
                ++n2;
            }
            ++n;
        }
    }

    protected final void loadSpriteGFX() {
        this.p_sprite = this.loadImage("player.png");
        this.m_sprite = this.loadImage("stuff.png");
        this.e_sprite1 = this.loadImage("enemy_hunter.png");
        this.e_sprite2 = this.loadImage("enemy_dog.png");
        this.e_sprite3 = this.loadImage("enemy_wraith.png");
        this.e_sprite4 = this.loadImage("boss_jvh.png");
        this.s_sprite = this.loadImage("sword.png");
    }

    protected final void loadResource(String string) {
        this.gameResourceImage = this.loadImage(string);
    }

    protected final Image loadImage(String string) {
        int n = 0;
        Image image = null;
        int n2 = 0;
        InputStream inputStream = this.getClass().getResourceAsStream("/" + string);
        while (n != -1) {
            try {
                n = inputStream.read();
                ++n2;
            }
            catch (Exception exception) {
                // empty catch block
            }
        }
        try {
            inputStream.close();
        }
        catch (Exception exception) {
            // empty catch block
        }
        byte[] byArray = new byte[n2];
        try {
            inputStream = this.getClass().getResourceAsStream("/" + string);
            n = inputStream.read(byArray);
            inputStream.close();
            image = Image.createImage((byte[])byArray, (int)0, (int)n);
        }
        catch (Exception exception) {
            // empty catch block
        }
        byArray = null;
        System.gc();
        return image;
    }

    /*
     * Enabled aggressive block sorting
     */
    protected final void drawPlayer(Sprite sprite, Graphics graphics) {
        int n;
        int n2;
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

    protected final int getRandom(int n) {
        int n2 = this.numGen.nextInt();
        if (n2 < 0) {
            return 0 - n2 % n;
        }
        return n2 % n;
    }

    /*
     * Enabled aggressive block sorting
     */
    protected final void paint(int n, int n2, int n3, Image image) {
        this.g = image.getGraphics();
        int n4 = 0;
        while (n4 < 12) {
            int n5 = 0;
            while (n5 < this.canvas.BUFFER_HEIGHT) {
                block7: {
                    block8: {
                        if (n5 + (n3 >> 4) - 1 < 0 || n5 + (n3 >> 4) - 1 >= 16 || this.canvas.mapBuffer[n4][n5 + (n3 >> 4) - 1] == -1 || this.drawBuffer[n4][n5] == this.canvas.tileArray[this.canvas.mapBuffer[n4][n5 + (n3 >> 4) - 1]][0]) break block7;
                        this.drawBuffer[n4][n5] = this.canvas.tileArray[this.canvas.mapBuffer[n4][n5 + (n3 >> 4) - 1]][0];
                        this.g.setClip(n4 << 4, n5 << 4, n, n);
                        if (this.drawBuffer[n4][n5] < 37) break block8;
                        if (this.drawBuffer[n4][n5] == 37) {
                            this.g.setColor(160, 244, 255);
                            this.g.fillRect(n4 << 4, n5 << 4, n, n);
                            break block7;
                        } else if (this.drawBuffer[n4][n5] == 38) {
                            this.g.setColor(16, 16, 128);
                            this.g.fillRect(n4 << 4, n5 << 4, n, n);
                        }
                        break block7;
                    }
                    if (this.drawBuffer[n4][n5] >= 10) {
                        this.g.drawImage(this.gameResourceImage, n4 << 4, n5 << 4, 20);
                    } else {
                        this.g.drawImage(this.gameResourceImage, (n4 << 4) - (this.canvas.tileArray[this.canvas.mapBuffer[n4][n5 + (n3 >> 4) - 1]][0] << 4), n5 << 4, 20);
                    }
                }
                ++n5;
            }
            ++n4;
        }
    }

    protected final void paintSprites(Graphics graphics) {
        Enumeration enumeration = this.spriteVector.elements();
        while (enumeration.hasMoreElements()) {
            Sprite sprite = (Sprite)enumeration.nextElement();
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

    /*
     * Enabled aggressive block sorting
     */
    protected final void initializeSpriteManager(Image image) {
        this.g = image.getGraphics();
        int n = 0;
        while (n < 12) {
            int n2 = 0;
            while (n2 < this.canvas.BUFFER_HEIGHT) {
                this.drawBuffer[n][n2] = -1;
                ++n2;
            }
            ++n;
        }
        Enumeration enumeration = this.spriteVector.elements();
        while (enumeration.hasMoreElements()) {
            Sprite sprite = (Sprite)enumeration.nextElement();
            sprite = null;
        }
        this.spriteVector.removeAllElements();
        System.gc();
    }
}

