/* EN readable reconstruction: original ES CFR output with the verified 18 UTF8
 * literal changes applied. All bytes after the constant pool are identical.
 * No Java runtime was available to run CFR or compile this reconstruction. */
/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.nokia.mid.sound.Sound
 *  com.nokia.mid.ui.FullCanvas
 *  javax.microedition.lcdui.Graphics
 *  javax.microedition.lcdui.Image
 *  javax.microedition.rms.RecordStore
 *  javax.microedition.rms.RecordStoreNotFoundException
 */
import com.nokia.mid.sound.Sound;
import com.nokia.mid.ui.FullCanvas;
import java.io.DataInputStream;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Vector;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;
import javax.microedition.rms.RecordStore;
import javax.microedition.rms.RecordStoreNotFoundException;

class mainCanvas
extends FullCanvas {
    private Vampire vampire;
    static final int state_idle = 0;
    static final int state_right = 1;
    static final int state_left = 2;
    static final int state_fire = 3;
    static final int state_use = 4;
    static final int state_look = 5;
    static final int state_up = 6;
    static final int state_down = 7;
    static final int state_ladder = 8;
    static final int state_death = 9;
    static final int state_scratch = 10;
    static final int state_duck = 11;
    static final int state_bat = 12;
    static final int state_vapor = 13;
    static final int state_slow = 14;
    static final int state_bitten = 15;
    static final int state_bite = 16;
    static final int state_melee = 17;
    static final int state_fjump = 18;
    static final int state_call_stake = 19;
    static final int state_call_ray = 20;
    static final int CELL_SIZE = 16;
    private static final int LEFT_SOFTKEY = -6;
    private static final int RIGHT_SOFTKEY = -7;
    private static final int MAX_BLOOD = 20;
    private static final int BLOOD_COLOUR = 0xE02020;
    private static final int SPARK_COLOUR = 16308848;
    private static final int SMOKE_COLOUR = 0xAAAAAA;
    private static final int WATER_COLOUR = 28893;
    private static final int TEXT_HEIGHT = 9;
    private static final int TEXT_SPACEHEIGHT = 14;
    private static final int TEXT_WIDTH = 7;
    private static final int TEXT_SPACE_WIDTH = 4;
    private static final int TEXT_PADDING_WIDTH = 2;
    private static final int TOPLEFT = 20;
    private static final int cutScreenLines = 4;
    private static final int TYPE_EMPTY = 0;
    private static final int TYPE_BLOCK = 1;
    private static final int TYPE_UP_SLOPE_B = 2;
    private static final int TYPE_UP_SLOPE_T = 3;
    private static final int TYPE_DOWN_SLOPE_T = 4;
    private static final int TYPE_DOWN_SLOPE_B = 5;
    private static final int TYPE_LADDER = 6;
    private static final int TYPE_START = 7;
    private static final int TYPE_END = 8;
    private static final int S_SLOW = 0;
    private static final int S_BAT = 1;
    private static final int S_VAPOR = 2;
    private static final int S_FJUMP = 3;
    private static final int S_SUCK = 4;
    private static final int S_SUN = 5;
    private static final int S_SWORD = 6;
    private static final int S_THROW = 7;
    private static final int S_DIE = 8;
    protected static final int screen_menu = 1;
    private static final int screen_credits = 4;
    protected static final int screen_play = 5;
    protected static final int screen_ngame = 6;
    protected static final int screen_intro = 8;
    protected static final int screen_startmenu = 9;
    protected static final int screen_load = 10;
    protected static final int screen_setplay = 11;
    private static final int screen_ingameoption = 21;
    protected static final int screen_mapload = 25;
    protected static final int screen_wait = 29;
    private static final int screen_startingameoption = 30;
    private static final int screen_continue = 31;
    private static final int screen_mission = 32;
    private static final int screen_progress = 36;
    private static final int screen_help_menu = 39;
    private static final int screen_parse_help = 40;
    private static final int screen_parse_credits = 41;
    protected static final int screen_help = 3;
    protected static final int screen_start_continue = 42;
    private static final int screen_cut = 43;
    private static final int screen_end = 44;
    private static final int screen_reset = 45;
    private static final int screen_loadgfx = 46;
    protected static final int screen_option = 48;
    private static final int[] letterSize = new int[]{5, 5, 5, 5, 4, 3, 5, 5, 2, 3, 5, 3, 7, 5, 5, 5, 5, 5, 5, 4, 5, 5, 7, 5, 4, 3};
    private static final int[] specialSize = new int[]{2, 5, 6, 4, 7, 6, 2, 3, 3, 5, 5, 2, 3, 2, 3, 5, 3, 5, 5, 5, 5, 5, 3, 5, 5, 2, 2, 6, 6, 6, 6, 6, 4, 4, 2, 6};
    private static final int BUTTON_MORE = 2;
    private static final int BUTTON_TICK = 4;
    private static final int BUTTON_CROSS = 8;
    private static final int STD_MENU_WIDTH = 147;
    private static final int WIDE_MENU_WIDTH = 147;
    private static final int STD_MENU_HEIGHT = 115;
    private static final int TALL_MENU_HEIGHT = 147;
    private int playerLatch;
    private Image curScreen;
    private GraphicObjectManager spriteManager;
    private int width;
    private int height;
    private int halfWidth;
    private int halfHeight;
    protected final int gameWidth;
    protected final int gameHeight;
    protected final int halfGameWidth;
    protected final int halfGameHeight;
    protected int screenType;
    private Timer gametimer;
    private ScrollTimerTask scrolltimertask;
    private int spacePos;
    private int lineWidth;
    private int startTextPos = 0;
    private int nextTextPos = 0;
    private int currentTextPos = 0;
    private String currentLine;
    private int curpos = 0;
    private int charSize = 0;
    private int strLen = 0;
    private int alignValue = 0;
    private char curChar;
    private int thisStrLen = 0;
    private Image letter;
    private Image menu;
    private Image special;
    private Image intro_image;
    private Image gui;
    private Image jvhface;
    private Image eveface;
    private Image ngame;
    private Image title;
    private Image intro;
    private int ofsX = 0;
    private int ofsY = 0;
    private int timeCount = 0;
    private Sprite playerSprite;
    public int totalLoaded = 0;
    public int totalToLoad = 1;
    private boolean adjustFrame = false;
    private int menuFrame = 0;
    protected int menuSelect = 0;
    private int menuGraphicHeight;
    private int menuLines;
    private int menuLength;
    private int menuItem;
    private int menuStart;
    private static final short pagemargin = 12;
    private short[] ruleBreaks;
    protected boolean ingame = false;
    public boolean gameLoaded = false;
    public boolean gameLoading = false;
    private int helpScreen = 0;
    protected int numMenuItems = 0;
    private boolean game_sound = true;
    protected int[][] tileArray;
    protected static final int BUFFER_WIDTH = 12;
    protected int BUFFER_HEIGHT;
    protected int[][] mapBuffer = new int[12][16];
    private int level = 1;
    private int sublevel = 1;
    public boolean mapLoaded = false;
    private DataInputStream map_file = null;
    protected int moveX;
    protected int moveY;
    private static final int[] jumpAmount = new int[]{16, 16, 12, 12, 8, 8, 8, 4, 4, 4, 0};
    private static final int[] fastJumpAmount = new int[]{16, 12, 8, 8, 4, 4, 0};
    private static final int[] deathArc = new int[]{-8, -4, 0, 4, 8, 8, 16};
    private int jumpCount = 0;
    private boolean jumping = false;
    public boolean inAir = false;
    public boolean batMode = false;
    public boolean vaporMode = false;
    public boolean slowMode = false;
    private int biteMove = 0;
    private int stakes = 0;
    public int ticker = 0;
    private int[] streamBlip = new int[]{9, 7, 5, 3, 1, 0, 1, 4, 5, 7};
    private int[] streamX = new int[20];
    private int[] streamY = new int[20];
    private int[] streamCount = new int[20];
    private int[] streamType = new int[20];
    private int drawX;
    private int drawY;
    private static final String RESOURCE_FILE = "dracula.lmp";
    private int movedCount = 18;
    private int selectLength = 0;
    private boolean lockScreen = false;
    private int showCut = 0;
    private boolean bossDead = false;
    private boolean levelCheat = false;
    private int frameTic = 0;
    private int specialTic = 0;
    private boolean gameSound = false;
    private boolean jumpLocked = false;
    private boolean runOffEnd = false;
    private boolean gameCompleted = false;
    public boolean gfxLoaded = false;
    private Sound[] sounds = new Sound[9];
    private boolean is3650 = this.getGameAction(35) == 8;
    private int midPosition = 0;
    private long currentValue = 0L;

    public mainCanvas(Vampire vampire) {
        this.vampire = vampire;
        this.width = Strings.ruleString[0].charAt(0);
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        this.gameWidth = 176;
        this.gameHeight = this.height - (this.height & 0xF);
        this.BUFFER_HEIGHT = (this.gameHeight >> 4) + 2;
        this.halfGameWidth = this.gameWidth >> 1;
        this.halfGameHeight = this.gameHeight >> 1;
        this.curScreen = Image.createImage((int)(this.gameWidth + 16), (int)(this.gameHeight + 32));
        this.spriteManager = new GraphicObjectManager(this, this.curScreen);
        this.drawX = this.halfWidth - (this.gameWidth >> 1);
        this.drawY = this.halfHeight - (this.gameHeight >> 1);
        this.playerLatch = this.gameHeight - (this.halfGameHeight + 16) - (this.gameHeight - (this.halfGameHeight + 16) & 0xF);
        this.midPosition = (this.gameHeight >> 1) - (this.gameHeight >> 1 & 0xF);
        this.special = this.spriteManager.loadImage("special.png");
        this.letter = this.spriteManager.loadImage("letter.png");
        this.intro = this.spriteManager.loadImage("background.png");
        try {
            this.menu = Image.createImage((String)"/menu.png");
        }
        catch (Exception exception) {
            // empty catch block
        }
        this.intro_image = this.spriteManager.loadImage("eve_title.png");
        this.intro = this.spriteManager.loadImage("background.png");
        this.gui = this.spriteManager.loadImage("gui.png");
        this.eveface = this.spriteManager.loadImage("eve.png");
        this.jvhface = this.spriteManager.loadImage("jvh.png");
        this.ngame = this.spriteManager.loadImage("ngame.png");
        this.title = this.spriteManager.loadImage("title.png");
        this.spriteManager.loadSpriteGFX();
        this.sounds[0] = this.loadWAV("slow.wav");
        this.sounds[1] = this.loadWAV("bat.wav");
        this.sounds[2] = this.loadWAV("vapor.wav");
        this.sounds[3] = this.loadWAV("fjump.wav");
        this.sounds[4] = this.loadWAV("suck.wav");
        this.sounds[5] = this.loadWAV("sun.wav");
        this.sounds[6] = this.loadWAV("sword.wav");
        this.sounds[7] = this.loadWAV("throw.wav");
        this.sounds[8] = this.loadWAV("die.wav");
        this.screenType = 6;
        this.ingame = false;
        this.readRecords();
        this.levelCheat = vampire.getAppProperty("MIDlet-CHEAT") != null && vampire.getAppProperty("MIDlet-CHEAT").compareTo("THINGSTHATDONTEXIST") == 0;
        this.gametimer = new Timer();
        this.scrolltimertask = new ScrollTimerTask(this);
        this.gametimer.schedule((TimerTask)this.scrolltimertask, 100L, 100L);
        this.scrolltimertask.splashType = 1;
    }

    private final void readRecords() {
        try {
            RecordStore recordStore = RecordStore.openRecordStore((String)"r", (boolean)false);
            byte[] byArray = recordStore.getRecord(1);
            recordStore.closeRecordStore();
            this.game_sound = byArray[0] == 1;
            this.level = byArray[1];
            if (this.level < 1 || this.level > 5) {
                this.level = 1;
            }
            this.sublevel = byArray[2];
            if (this.sublevel < 1 || this.sublevel > 3) {
                this.sublevel = 1;
            }
            this.gameCompleted = byArray[3] == 1;
        }
        catch (RecordStoreNotFoundException recordStoreNotFoundException) {
            this.writeRecords();
        }
        catch (Exception exception) {}
    }

    private final void writeRecords() {
        try {
            byte[] byArray = new byte[]{(byte)(this.game_sound ? 1 : 0), (byte)this.level, (byte)this.sublevel, (byte)(this.gameCompleted ? 1 : 0)};
            RecordStore recordStore = RecordStore.openRecordStore((String)"r", (boolean)true);
            if (recordStore.getNumRecords() == 0) {
                recordStore.addRecord(byArray, 0, byArray.length);
            } else {
                recordStore.setRecord(1, byArray, 0, byArray.length);
            }
            recordStore.closeRecordStore();
        }
        catch (Exception exception) {}
    }

    private Sound loadWAV(String string) {
        Sound sound = null;
        int n = 0;
        int n2 = 0;
        InputStream inputStream = ((Object)((Object)this)).getClass().getResourceAsStream("/" + string);
        while (n2 != -1) {
            try {
                n2 = inputStream.read();
                ++n;
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
        byte[] byArray = new byte[n];
        try {
            inputStream = ((Object)((Object)this)).getClass().getResourceAsStream("/" + string);
            n = inputStream.read(byArray);
            inputStream.close();
            sound = new Sound(byArray, 5);
            sound.init(byArray, 5);
        }
        catch (Exception exception) {
            // empty catch block
        }
        byArray = null;
        System.gc();
        return sound;
    }

    private final void playSound(int n) {
        block2: {
            if (!this.game_sound) break block2;
            try {
                this.sounds[n].play(1);
            }
            catch (Exception exception) {}
        }
    }

    public final void pause() {
        this.menuSelect = 0;
        this.scrolltimertask.splashType = 3;
        this.scrolltimertask.timeCount = 0;
        this.screenType = 21;
        this.vampire.notifyPaused();
    }

    private final void ParseString(String string) {
        Vector<Integer> vector = new Vector<Integer>();
        int n = 0;
        int n2 = string.length();
        int n3 = 123;
        this.menuLines = (this.gameHeight - (this.gameHeight - 115)) / 14;
        while (n < n2) {
            vector.addElement(new Integer(n));
            int n4 = n;
            this.lineWidth = 0;
            while (this.lineWidth < n3 && n < n2 && string.charAt(n) != '~') {
                this.curChar = string.charAt(n);
                if (this.curChar == ' ') {
                    this.spacePos = this.currentTextPos + 1;
                    this.lineWidth += 4;
                } else {
                    this.lineWidth += this.charWidth(this.curChar) + 2;
                }
                ++n;
            }
            if (this.lineWidth >= n3) {
                int n5 = --n;
                while (n > n4 && string.charAt(n) != ' ') {
                    --n;
                }
                if (n <= n4) {
                    n = n5;
                }
            }
            ++n;
        }
        vector.addElement(new Integer(n));
        this.ruleBreaks = new short[vector.size()];
        int n6 = vector.size() - 1;
        while (n6 >= 0) {
            this.ruleBreaks[n6] = (short)((Integer)vector.elementAt(n6)).intValue();
            --n6;
        }
        vector = null;
        this.gameLoading = false;
    }

    private final void loadMap() {
        InputStream inputStream = null;
        int n = -1;
        boolean bl = false;
        boolean bl2 = false;
        this.totalLoaded = 0;
        this.totalToLoad = 182;
        this.gameLoading = true;
        this.spriteManager.initializeSpriteManager(this.curScreen);
        ++this.totalLoaded;
        int n2 = 0;
        while (n2 < 20) {
            this.streamCount[n2] = 0;
            ++n2;
        }
        this.timeCount = 0;
        ++this.totalLoaded;
        boolean bl3 = false;
        try {
            inputStream = ((Object)((Object)this)).getClass().getResourceAsStream("m" + this.level + "" + this.sublevel);
            this.map_file = new DataInputStream(inputStream);
        }
        catch (Exception exception) {
            // empty catch block
        }
        ++this.totalLoaded;
        try {
            int n3 = this.map_file.readByte();
            this.spriteManager.loadResource("tiles" + (n3 + 1) + ".png");
            this.totalLoaded += 50;
            n3 = this.map_file.readByte();
            this.tileArray = new int[n3][3];
            int n4 = 0;
            while (n4 < n3) {
                this.tileArray[n4][0] = this.map_file.readByte();
                this.tileArray[n4][1] = this.map_file.readByte();
                this.tileArray[n4][2] = this.map_file.readByte();
                ++n4;
            }
            int n5 = 0;
            while (n5 < 12) {
                int n6 = 0;
                while (n6 < 16) {
                    try {
                        this.mapBuffer[n5][n6] = this.map_file.read();
                    }
                    catch (Exception exception) {
                        // empty catch block
                    }
                    try {
                        if (this.tileArray[this.mapBuffer[n5][n6]][1] == 7) {
                            this.ofsY = n6 * 16 - this.playerLatch;
                            if (this.ofsY > 256 - this.gameHeight) {
                                this.playerSprite.setPosition(16, this.playerLatch + (this.ofsY - (256 - this.gameHeight)));
                                this.ofsY = 256 - this.gameHeight;
                            } else if (this.ofsY <= 0) {
                                this.ofsY = 0;
                                this.playerSprite.setPosition(16, n6 << 4);
                            }
                        } else if (this.tileArray[this.mapBuffer[n5][n6]][0] >= 10 && this.tileArray[this.mapBuffer[n5][n6]][0] < 37) {
                            Sprite sprite;
                            if (this.tileArray[this.mapBuffer[n5][n6]][0] == 12 || this.tileArray[this.mapBuffer[n5][n6]][0] > 18) {
                                sprite = new Sprite(this.tileArray[this.mapBuffer[n5][n6]][0], 16, 16);
                                sprite.setCollisionRectangle(0, 0, 16, 16);
                            } else {
                                sprite = new Sprite(this.tileArray[this.mapBuffer[n5][n6]][0], 16, 32);
                                sprite.setCollisionRectangle(0, 0, 16, 32);
                            }
                            sprite.setPosition(n5 << 4, (n6 << 4) - this.ofsY);
                            sprite.state = 0;
                            this.spriteManager.spriteVector.addElement(sprite);
                            sprite = null;
                        }
                    }
                    catch (Exception exception) {
                        // empty catch block
                    }
                    ++this.totalLoaded;
                    ++n6;
                }
                ++n5;
            }
        }
        catch (Exception exception) {
            // empty catch block
        }
        System.gc();
        this.mapLoaded = true;
    }

    private final void loadCol() {
        try {
            int n = 0;
            while (n < 11) {
                System.arraycopy(this.mapBuffer[n + 1], 0, this.mapBuffer[n], 0, 16);
                ++n;
            }
            int n2 = 0;
            while (n2 < 16) {
                this.mapBuffer[11][n2] = this.map_file.read();
                if (this.tileArray[this.mapBuffer[11][n2]][0] >= 10 && this.tileArray[this.mapBuffer[11][n2]][0] < 37) {
                    Sprite sprite;
                    if (this.tileArray[this.mapBuffer[11][n2]][0] == 12 || this.tileArray[this.mapBuffer[11][n2]][0] > 18) {
                        sprite = new Sprite(this.tileArray[this.mapBuffer[11][n2]][0], 16, 16);
                        sprite.setCollisionRectangle(0, 0, 16, 16);
                    } else {
                        sprite = new Sprite(this.tileArray[this.mapBuffer[11][n2]][0], 16, 32);
                        sprite.setCollisionRectangle(0, 0, 16, 32);
                    }
                    sprite.setPosition(176 + this.moveX - this.ofsX, (n2 << 4) - this.ofsY - this.moveY);
                    sprite.state = 0;
                    this.spriteManager.spriteVector.addElement(sprite);
                    sprite = null;
                }
                ++n2;
            }
        }
        catch (Exception exception) {
            this.runOffEnd = true;
        }
    }

    public final void exitGame() {
        this.vampire.destroyApp(true);
        this.vampire.notifyDestroyed();
    }

    private final void clearScreen(Graphics graphics, int n, int n2, int n3) {
        graphics.setColor(n, n2, n3);
        graphics.setClip(0, 0, this.width, this.height);
        graphics.fillRect(0, 0, this.width, this.height);
        graphics.setColor(255, 255, 255);
    }

    private final void drawMenu(Graphics graphics, int n, int n2, int n3, boolean bl) {
        int n4 = this.halfWidth - (n >> 1);
        int n5 = this.halfGameHeight - (n2 >> 1);
        int n6 = 2;
        while (n6 < n - 16) {
            graphics.setClip(n4 + n6, n5, 16, 1);
            graphics.drawImage(this.menu, n4 + n6 - 2, n5 - 1, 20);
            graphics.setClip(n4 + n6, n5 + n2 - 2, 16, 2);
            graphics.drawImage(this.menu, n4 + n6 - 2, n5 + n2 - 2, 20);
            n6 += 16;
        }
        int n7 = 1;
        while (n7 < n2 - 16) {
            graphics.setClip(n4, n5 + n7, 2, 16);
            graphics.drawImage(this.menu, n4, n5 + n7, 20);
            graphics.setClip(n4 + n - 1, n5 + n7, 1, 16);
            graphics.drawImage(this.menu, n4 + n - 1, n5 + n7, 20);
            n7 += 16;
        }
        if (n3 != 0) {
            if ((n3 & 2) != 0) {
                graphics.setClip(this.halfWidth + this.halfGameWidth + 1 - 14, this.gameHeight - 13, 14, 12);
                graphics.drawImage(this.menu, this.halfWidth + this.halfGameWidth + 1 - 14 - 26, this.gameHeight - 13, 20);
                graphics.setClip(this.halfWidth + this.halfGameWidth + 4 - 14, this.gameHeight - 11, 8, 8);
                graphics.drawImage(this.menu, this.halfWidth + this.halfGameWidth + 4 - 24, this.gameHeight - 15, 20);
            } else if ((n3 & 4) != 0) {
                graphics.setClip(this.halfWidth + this.halfGameWidth + 1 - 14, this.gameHeight - 13, 14, 12);
                graphics.drawImage(this.menu, this.halfWidth + this.halfGameWidth + 1 - 14 - 26, this.gameHeight - 13, 20);
                graphics.setClip(this.halfWidth + this.halfGameWidth + 4 - 14, this.gameHeight - 11, 8, 8);
                graphics.drawImage(this.menu, this.halfWidth + this.halfGameWidth + 4 - 32, this.gameHeight - 11, 20);
            }
            if ((n3 & 8) != 0) {
                graphics.setClip(this.halfWidth - this.halfGameWidth + 1, this.gameHeight - 13, 14, 12);
                graphics.drawImage(this.menu, this.halfWidth - this.halfGameWidth + 1 - 26, this.gameHeight - 13, 20);
                graphics.setClip(this.halfWidth - this.halfGameWidth + 4, this.gameHeight - 11, 8, 8);
                graphics.drawImage(this.menu, this.halfWidth - this.halfGameWidth + 4 - 2, this.gameHeight - 15, 20);
            }
        }
        if (bl) {
            graphics.setClip(0, 0, this.width, this.height);
            graphics.setColor(200, 50, 50);
            int n8 = this.halfGameHeight + 57 - (14 * (this.numMenuItems - this.menuSelect) + 4 * (this.numMenuItems - this.menuSelect)) - 2;
            graphics.drawLine(this.halfWidth - (this.selectLength >> 1) - 6, n8 + (this.movedCount >> 1), this.halfWidth + (this.selectLength >> 1) + 4, n8 + (this.movedCount >> 1));
            graphics.drawLine(this.halfWidth - (this.selectLength >> 1) - 6, n8 - (this.movedCount >> 1) + 14 + 1, this.halfWidth + (this.selectLength >> 1) + 4, n8 - (this.movedCount >> 1) + 14 + 1);
            graphics.drawLine(this.halfWidth - (this.selectLength >> 1) - 3, n8 + (this.movedCount >> 1) - 2, this.halfWidth - (this.selectLength >> 1) - 3, n8 - (this.movedCount >> 1) + 14 + 3);
            graphics.drawLine(this.halfWidth + (this.selectLength >> 1) + 1, n8 + (this.movedCount >> 1) - 2, this.halfWidth + (this.selectLength >> 1) + 1, n8 - (this.movedCount >> 1) + 14 + 3);
            this.movedCount = this.movedCount > 0 ? (this.movedCount -= 4) : 0;
            this.menuFrame = this.menuFrame >= 2 ? 0 : ++this.menuFrame;
        }
    }

    public final byte[] getResource(String string) {
        int n = -1;
        int n2 = -1;
        int n3 = 0;
        byte[] byArray = new byte[1];
        try {
            int n4;
            InputStream inputStream = ((Object)((Object)this)).getClass().getResourceAsStream("/dracula.lmp");
            while (n == -1) {
                String string2 = "";
                n4 = inputStream.read();
                ++n3;
                while (n4 != 45) {
                    string2 = string2 + (char)n4;
                    n4 = inputStream.read();
                    ++n3;
                }
                if (string2.compareTo(string) != 0) continue;
                n2 = ((inputStream.read() & 0xFF) << 24) + ((inputStream.read() & 0xFF) << 16) + ((inputStream.read() & 0xFF) << 8) + (inputStream.read() & 0xFF);
                n = ((inputStream.read() & 0xFF) << 8) + (inputStream.read() & 0xFF) + 1;
                n3 += 6;
            }
            while (n3 != n2) {
                n4 = inputStream.read();
                ++n3;
            }
            byArray = new byte[n];
            inputStream.read(byArray);
            inputStream.close();
        }
        catch (Exception exception) {
            // empty catch block
        }
        System.gc();
        return byArray;
    }

    private final int charWidth(char c) {
        if (c != ' ') {
            if (c >= '!' && c <= '@') {
                return specialSize[c - 33];
            }
            if (c >= 'a' && c <= 'z') {
                return letterSize[c - 97];
            }
            if (c >= 'A' && c <= 'Z') {
                return letterSize[c - 65];
            }
            switch (c) {
                case '\u00e0': 
                case '\u00e1': 
                case '\u00e2': 
                case '\u00e3': 
                case '\u00e4': {
                    return letterSize[0];
                }
                case '\u00c9': 
                case '\u00e8': 
                case '\u00e9': 
                case '\u00ea': {
                    return letterSize[4];
                }
                case '\u00ed': 
                case '\u00ee': {
                    return letterSize[8];
                }
                case '\u00f1': {
                    return letterSize[13];
                }
                case '\u00f3': 
                case '\u00f4': 
                case '\u00f5': 
                case '\u00f6': {
                    return letterSize[14];
                }
                case '\u00f9': 
                case '\u00fa': 
                case '\u00fb': 
                case '\u00fc': {
                    return letterSize[20];
                }
                case '\u00a1': {
                    return specialSize[34];
                }
                case '\u00bf': {
                    return specialSize[35];
                }
                case '\u00df': {
                    return specialSize[32];
                }
                case '\u00e7': {
                    return specialSize[33];
                }
            }
        }
        return 2;
    }

    private final void drawGraphicString(Graphics graphics, String string, int n, int n2, char c, int n3) {
        this.thisStrLen = string.length();
        string = string.toLowerCase();
        this.strLen = 0;
        this.curpos = 0;
        if (c != 'l') {
            while (this.curpos < this.thisStrLen) {
                this.curChar = string.charAt(this.curpos);
                this.strLen += this.charWidth(this.curChar) + 2;
                ++this.curpos;
            }
        }
        switch (c) {
            case 'l': {
                this.alignValue = 20;
                break;
            }
            case 'r': {
                this.alignValue = 24;
                n -= this.strLen;
                break;
            }
            case 'c': {
                this.alignValue = 17;
                n -= this.strLen >> 1;
            }
        }
        if (this.menuSelect + 1 == n3) {
            this.selectLength = this.strLen;
        }
        this.strLen = 0;
        this.curpos = 0;
        while (this.curpos < this.thisStrLen) {
            this.curChar = string.charAt(this.curpos);
            if (this.curChar == ' ') {
                this.strLen += 4;
            } else {
                if (this.curChar >= '!' && this.curChar <= '@') {
                    this.charSize = specialSize[this.curChar - 33];
                    graphics.setClip(n + this.strLen, n2, this.charSize, 9);
                    graphics.drawImage(this.special, n + this.strLen + (this.curChar - 33) * -7, n2, 20);
                } else if (this.curChar >= 'a' && this.curChar <= 'z') {
                    this.charSize = letterSize[this.curChar - 97];
                    graphics.setClip(n + this.strLen, n2, this.charSize, 9);
                    graphics.drawImage(this.letter, n + this.strLen + (this.curChar - 97) * -7, n2, 20);
                } else if (this.curChar >= 'A' && this.curChar <= 'Z') {
                    this.charSize = letterSize[this.curChar - 65];
                    graphics.setClip(n + this.strLen, n2, this.charSize, 9);
                    graphics.drawImage(this.letter, n + this.strLen + (this.curChar - 65) * -7, n2, 20);
                } else {
                    switch (this.curChar) {
                        case '\u00e9': {
                            this.charSize = letterSize[4];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -28, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -16 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00c9': {
                            this.charSize = letterSize[4];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -28, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -16 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00e8': {
                            this.charSize = letterSize[4];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -28, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -8 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00ea': {
                            this.charSize = letterSize[4];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -28, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -4 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00e2': {
                            this.charSize = letterSize[0];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + 0, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -4 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00e0': {
                            this.charSize = letterSize[0];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + 0, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -8 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00e3': {
                            this.charSize = letterSize[0];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + 0, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -24 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00e1': {
                            this.charSize = letterSize[0];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + 0, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -16 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00e4': {
                            this.charSize = letterSize[0];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + 0, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00fc': {
                            this.charSize = letterSize[20];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -140, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00fb': {
                            this.charSize = letterSize[20];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -140, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -4 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00f9': {
                            this.charSize = letterSize[20];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -140, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -8 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00fa': {
                            this.charSize = letterSize[20];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -140, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -16 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00f6': {
                            this.charSize = letterSize[14];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -98, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00f4': {
                            this.charSize = letterSize[14];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -98, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -4 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00f5': {
                            this.charSize = letterSize[14];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -98, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -24 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00f3': {
                            this.charSize = letterSize[14];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -98, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -16 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00ed': {
                            this.charSize = letterSize[8];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -56, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -16 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00ee': {
                            this.charSize = letterSize[8];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -56, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -4 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00f1': {
                            this.charSize = letterSize[13];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.letter, n + this.strLen + -91, n2, 20);
                            graphics.setClip(n + this.strLen, n2 - 9, 4, 18);
                            graphics.drawImage(this.special, -24 + n + this.strLen + -252, n2 - 8, 20);
                            break;
                        }
                        case '\u00df': {
                            this.charSize = specialSize[32];
                            graphics.setClip(n + this.strLen, n2 - 9, this.charSize, 18);
                            graphics.drawImage(this.special, n + this.strLen - 224, n2, 20);
                            break;
                        }
                        case '\u00e7': {
                            this.charSize = specialSize[33];
                            graphics.setClip(n + this.strLen, n2, this.charSize, 9);
                            graphics.drawImage(this.special, n + this.strLen - 231, n2, 20);
                            break;
                        }
                        case '\u00a1': {
                            this.charSize = specialSize[34];
                            graphics.setClip(n + this.strLen, n2, this.charSize, 9);
                            graphics.drawImage(this.special, n + this.strLen - 238, n2, 20);
                            break;
                        }
                        case '\u00bf': {
                            this.charSize = specialSize[35];
                            graphics.setClip(n + this.strLen, n2, this.charSize, 9);
                            graphics.drawImage(this.special, n + this.strLen - 245, n2, 20);
                        }
                    }
                }
                this.strLen += this.charSize + 2;
            }
            ++this.curpos;
        }
        graphics.setClip(0, 0, this.width, this.height);
    }

    private boolean showIntroText(Graphics graphics, int n, String string, int n2, boolean bl) {
        this.spacePos = 0;
        this.lineWidth = 0;
        this.startTextPos = this.currentTextPos;
        while (this.lineWidth < n2 && this.currentTextPos < string.length()) {
            this.curChar = string.charAt(this.currentTextPos);
            if (this.curChar == ' ') {
                this.spacePos = this.currentTextPos + 1;
                this.lineWidth += 4;
            } else {
                this.lineWidth += this.charWidth(this.curChar) + 2;
            }
            ++this.currentTextPos;
        }
        if (this.lineWidth >= n2 && this.spacePos > 0) {
            this.currentTextPos = this.spacePos;
        }
        if (this.showCut == 0 && this.level == 1 || this.showCut == 0 && this.level > 1 && this.sublevel != 1 || this.showCut == 1 && this.level > 1 && this.sublevel == 1 && this.level < 6) {
            this.drawGraphicString(graphics, string.substring(this.startTextPos, this.currentTextPos), this.halfWidth, this.halfHeight, 'c', 0);
        } else {
            this.drawGraphicString(graphics, string.substring(this.startTextPos, this.currentTextPos), 20, n, 'l', 0);
        }
        if (this.currentTextPos >= string.length()) {
            ++this.showCut;
            this.startTextPos = 0;
            this.currentTextPos = 0;
            return true;
        }
        return false;
    }

    public void gameLoader() {
        this.batMode = false;
        this.vaporMode = false;
        this.slowMode = false;
        this.lockScreen = false;
        this.bossDead = false;
        this.runOffEnd = false;
        this.playerSprite = new Sprite(0, 16, 32);
        this.playerSprite.setPosition(16, this.playerLatch);
        this.playerSprite.setCollisionRectangle(0, 0, 16, 32);
        this.playerSprite.state = 0;
        this.playerSprite.lastDir = true;
        this.ofsY = 256 - this.gameHeight;
        this.ofsX = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.stakes = 0;
        this.playerSprite.health = 100;
        this.loadMap();
        this.playerSprite.yPos += this.ofsY & 0xF;
        Enumeration enumeration = this.spriteManager.spriteVector.elements();
        while (enumeration.hasMoreElements()) {
            Sprite sprite = (Sprite)enumeration.nextElement();
            sprite.yPos += this.ofsY & 0xF;
        }
        this.ofsY -= this.ofsY & 0xF;
        this.scrolltimertask.timeCount = 0;
        this.scrolltimertask.splashType = 5;
        this.screenType = 11;
        this.repaint();
    }

    public final void paint(Graphics graphics) {
        switch (this.screenType) {
            case 11: {
                this.clearScreen(graphics, 0, 0, 0);
                this.screenType = 5;
            }
            case 5: {
                this.currentValue = Runtime.getRuntime().freeMemory();
                this.drawGraphicString(graphics, "[MEM:" + this.currentValue + "]", this.halfWidth, 20, 'c', 0);
                graphics.translate(this.drawX, this.drawY);
                this.spriteManager.paint(16, this.ofsX, this.ofsY, this.curScreen);
                graphics.setClip(0, 0, this.gameWidth, this.gameHeight);
                graphics.drawImage(this.curScreen, 0 - this.ofsX, 0 - (this.ofsY & 0xF) - 16, 20);
                this.spriteManager.paintSprites(graphics);
                this.spriteManager.drawPlayer(this.playerSprite, graphics);
                graphics.setClip(0, 0, this.gameWidth, this.gameHeight);
                int n = 0;
                while (n < 20) {
                    if (this.streamCount[n] != 0) {
                        graphics.setColor(this.streamType[n]);
                        if (this.streamType[n] == 0xE02020 || this.streamType[n] == 16308848) {
                            graphics.drawLine(this.streamX[n], this.streamY[n], this.streamX[n] + this.streamCount[n], this.streamY[n] + 1);
                            if (this.streamCount[n] < 0) {
                                int n2 = n;
                                this.streamCount[n2] = this.streamCount[n2] + 1;
                                int n3 = n;
                                this.streamX[n3] = this.streamX[n3] - (this.streamBlip[0 - this.streamCount[n]] - this.moveY);
                                int n4 = n;
                                this.streamY[n4] = this.streamY[n4] - (this.streamBlip[0 - this.streamCount[n] + 1] - this.moveY);
                            } else if (this.streamCount[n] > 0) {
                                int n5 = n;
                                this.streamCount[n5] = this.streamCount[n5] - 1;
                                int n6 = n;
                                this.streamX[n6] = this.streamX[n6] + (this.streamBlip[this.streamCount[n]] - this.moveY);
                                int n7 = n;
                                this.streamY[n7] = this.streamY[n7] - (this.streamBlip[this.streamCount[n] + 1] - this.moveY);
                            }
                        } else if (this.streamType[n] == 0xAAAAAA) {
                            graphics.drawLine(this.streamX[n], this.streamY[n], this.streamX[n], this.streamY[n]);
                            int n8 = n;
                            this.streamCount[n8] = this.streamCount[n8] - 1;
                            int n9 = n;
                            this.streamY[n9] = this.streamY[n9] - (1 - this.moveY);
                            int n10 = n;
                            this.streamX[n10] = this.streamX[n10] - this.moveX;
                        } else if (this.streamType[n] == 28893) {
                            if (this.streamX[n] >> 4 >= 12 || this.streamX[n] >> 4 < 0 || this.streamY[n] + this.ofsY >> 4 >= 16 || this.streamY[n] + this.ofsY >> 4 < 0) {
                                this.streamCount[n] = 0;
                            } else if (this.tileArray[this.mapBuffer[this.streamX[n] >> 4][this.streamY[n] + this.ofsY >> 4]][1] == 1) {
                                this.streamCount[n] = 0;
                            } else {
                                graphics.drawLine(this.streamX[n], this.streamY[n], this.streamX[n], this.streamY[n] - 1);
                                int n11 = n;
                                this.streamY[n11] = this.streamY[n11] + (8 - this.moveY);
                                int n12 = n;
                                this.streamX[n12] = this.streamX[n12] - this.moveX;
                            }
                        }
                    }
                    ++n;
                }
                int n13 = 30 - this.playerSprite.health / 3;
                graphics.setClip(5, 5 + n13, 30, 30 - n13);
                graphics.drawImage(this.gui, -31, 5, 20);
                graphics.setClip(0, 0, 36, 36);
                graphics.drawImage(this.gui, 0, 0, 20);
                boolean bl = false;
                if (this.playerSprite.refireTime == 0 && !this.batMode && !this.vaporMode) {
                    Enumeration enumeration = this.spriteManager.spriteVector.elements();
                    while (enumeration.hasMoreElements()) {
                        Sprite sprite = (Sprite)enumeration.nextElement();
                        if (sprite.type != 10 && sprite.type != 11 && (sprite.type <= 13 || sprite.type >= 19 || sprite.state != 0 && (sprite.refireTime <= 16 || sprite.state != 20 && sprite.state != 19)) || sprite.yPos != this.playerSprite.yPos || (sprite.xPos - this.playerSprite.xPos >= 0 ? sprite.xPos - this.playerSprite.xPos : 0 - (sprite.xPos - this.playerSprite.xPos)) >= 32 || sprite.xPos < 0) continue;
                        bl = true;
                        break;
                    }
                }
                if (bl) {
                    graphics.setClip(this.gameWidth - 20, this.gameHeight - 20, 16, 16);
                    graphics.drawImage(this.gui, -67 + (this.gameWidth - 20), -11 + (this.gameHeight - 20), 20);
                } else {
                    int n14 = 1;
                    while (n14 <= this.stakes) {
                        graphics.setClip(this.gameWidth - 4 - (n14 << 2), this.gameHeight - 15, 3, 11);
                        graphics.drawImage(this.gui, -67 + (this.gameWidth - 4 - (n14 << 2)), this.gameHeight - 15, 20);
                        ++n14;
                    }
                }
                graphics.translate(0 - graphics.getTranslateX(), 0 - graphics.getTranslateY());
                graphics.setColor(0, 0, 0);
                graphics.setClip(0, 0, this.width, this.height);
                graphics.fillRect(0, 0, this.drawX, this.height);
                graphics.fillRect(this.width - this.drawX, 0, this.drawX, this.height);
                break;
            }
            case 25: {
                this.clearScreen(graphics, 0, 0, 0);
                this.drawMenu(graphics, 147, 51, 0, false);
                this.drawGraphicString(graphics, "loading", this.halfWidth, this.halfGameHeight - 16, 'c', 0);
                graphics.setColor(0, 0, 0);
                graphics.setClip(this.halfWidth - 21, this.halfGameHeight + 14 - 1, 62, 8);
                graphics.fillRect(this.halfWidth - 21, this.halfGameHeight + 14 - 1, 42, 8);
                this.screenType = 36;
                break;
            }
            case 46: {
                this.clearScreen(graphics, 0, 0, 0);
                this.drawMenu(graphics, 147, 51, 0, false);
                this.drawGraphicString(graphics, "Loading graphics", this.halfWidth, this.halfGameHeight - 16, 'c', 0);
                graphics.setColor(0, 0, 0);
                graphics.setClip(this.halfWidth - 21, this.halfGameHeight + 14 - 1, 62, 8);
                graphics.fillRect(this.halfWidth - 21, this.halfGameHeight + 14 - 1, 42, 8);
                this.screenType = 36;
                break;
            }
            case 36: {
                graphics.setColor(0, 0, 0);
                graphics.setClip(this.halfWidth - 21, this.halfGameHeight + 14 - 1, 62, 8);
                graphics.fillRect(this.halfWidth - 21, this.halfGameHeight + 14 - 1, 42, 8);
                if (this.totalToLoad > 100) {
                    graphics.setClip(this.halfWidth - 20, this.halfGameHeight + 14, 40 * (this.totalLoaded / (this.totalToLoad / 100) + 1 >= 100 ? 100 : this.totalLoaded / (this.totalToLoad / 100)) / 100 + 1, 6);
                }
                graphics.drawImage(this.menu, this.halfWidth - 20, -16 + (this.halfGameHeight + 14), 20);
                break;
            }
            case 6: {
                this.clearScreen(graphics, 0, 0, 0);
                graphics.setClip(0, 0, this.width, this.height);
                graphics.drawImage(this.ngame, this.halfWidth, this.halfHeight, 3);
                this.ngame = null;
                System.gc();
                break;
            }
            case 8: {
                this.clearScreen(graphics, 0, 0, 0);
                graphics.drawImage(this.intro_image, this.width, this.halfHeight, 10);
                graphics.drawImage(this.title, 5, 5, 20);
                this.intro_image = null;
                this.title = null;
                System.gc();
                break;
            }
            case 30: {
                System.gc();
                this.screenType = 21;
            }
            case 21: {
                graphics.drawImage(this.intro, 0, 0, 20);
                this.drawMenu(graphics, 147, 115, 12, true);
                this.drawGraphicString(graphics, "vampire:", this.halfWidth, this.halfGameHeight - 57 + 14, 'c', 0);
                this.drawGraphicString(graphics, "bloodline", this.halfWidth, this.halfGameHeight - 57 + 28, 'c', 0);
                this.drawGraphicString(graphics, "Help", this.halfWidth, this.halfGameHeight + 57 - 54, 'c', 1);
                if (this.game_sound) {
                    this.drawGraphicString(graphics, "Sound: On", this.halfWidth, this.halfGameHeight + 57 - 36, 'c', 2);
                } else {
                    this.drawGraphicString(graphics, "Sound: Off", this.halfWidth, this.halfGameHeight + 57 - 36, 'c', 2);
                }
                this.drawGraphicString(graphics, "Main Menu", this.halfWidth, this.halfGameHeight + 57 - 18, 'c', 3);
                break;
            }
            case 9: {
                this.writeRecords();
                this.numMenuItems = 4;
                this.ingame = false;
                this.playerSprite = null;
                System.gc();
                this.screenType = 1;
            }
            case 1: {
                graphics.drawImage(this.intro, 0, 0, 20);
                this.drawMenu(graphics, 147, 115, 4, true);
                this.drawGraphicString(graphics, "vampire:", this.halfWidth, this.halfGameHeight - 57 + 14, 'c', 0);
                this.drawGraphicString(graphics, "bloodline", this.halfWidth, this.halfGameHeight - 57 + 28, 'c', 0);
                this.drawGraphicString(graphics, "play", this.halfWidth, this.halfGameHeight + 57 - 72, 'c', 1);
                this.drawGraphicString(graphics, "Help", this.halfWidth, this.halfGameHeight + 57 - 54, 'c', 2);
                this.drawGraphicString(graphics, "options", this.halfWidth, this.halfGameHeight + 57 - 36, 'c', 3);
                this.drawGraphicString(graphics, "Exit Game", this.halfWidth, this.halfGameHeight + 57 - 18, 'c', 4);
                break;
            }
            case 41: {
                this.ParseString("Design: Paul Jacobson, Daniel Rammelt ~~ Code: Daniel Rammelt. ~~ Art: Paul Jacobson, Matthew Risley. ~~ Producer: Nic Garner. ~~ Produced by Mforma Europe. ~ Software copyright 2003 Mforma Group. ~~ English Translation by Lanzz, 2021 for Kahvibreak project.");
                this.menuSelect = 0;
                this.menuStart = 1;
                this.menuLength = this.ruleBreaks.length - 1;
                this.screenType = 4;
            }
            case 4: {
                graphics.drawImage(this.intro, 0, 0, 20);
                this.drawMenu(graphics, 147, 147, 4, false);
                this.drawGraphicString(graphics, "Credits", this.halfWidth, this.halfGameHeight - 73 + 3, 'c', 0);
                int n = 0;
                while (n < this.menuLines) {
                    this.drawGraphicString(graphics, "Design: Paul Jacobson, Daniel Rammelt ~~ Code: Daniel Rammelt. ~~ Art: Paul Jacobson, Matthew Risley. ~~ Producer: Nic Garner. ~~ Produced by Mforma Europe. ~ Software copyright 2003 Mforma Group. ~~ English Translation by Lanzz, 2021 for Kahvibreak project.".substring(this.ruleBreaks[this.menuStart + n - 1], this.ruleBreaks[this.menuStart + n] - 1), this.halfWidth - 73 + 12, this.halfGameHeight - 73 + 31 + 14 * n, 'l', 0);
                    ++n;
                }
                break;
            }
            case 39: {
                this.gameLoading = true;
                graphics.drawImage(this.intro, 0, 0, 20);
                this.drawMenu(graphics, 147, 115, 12, true);
                this.drawGraphicString(graphics, "Help", this.halfWidth, this.halfGameHeight - 57 + 14, 'c', 0);
                this.drawGraphicString(graphics, "Story", this.halfWidth, this.halfGameHeight + 57 - 54, 'c', 1);
                this.drawGraphicString(graphics, "General Help", this.halfWidth, this.halfGameHeight + 57 - 36, 'c', 2);
                this.drawGraphicString(graphics, "player controls", this.halfWidth, this.halfGameHeight + 57 - 18, 'c', 3);
                break;
            }
            case 40: {
                if (this.menuSelect == 2 && this.is3650) {
                    this.ParseString(Strings.ruleString[this.menuSelect + 1]);
                } else {
                    this.ParseString(Strings.ruleString[this.menuSelect]);
                }
                this.menuStart = 1;
                this.menuLength = this.ruleBreaks.length - 1;
                this.screenType = 3;
            }
            case 3: {
                graphics.drawImage(this.intro, 0, 0, 20);
                this.drawMenu(graphics, 147, 147, 8, false);
                this.drawGraphicString(graphics, "Help", this.halfWidth, this.halfGameHeight - 73 + 3, 'c', 0);
                int n = 0;
                while (n < this.menuLines) {
                    if (this.menuSelect == 2 && this.is3650) {
                        this.drawGraphicString(graphics, Strings.ruleString[this.menuSelect + 1].substring(this.ruleBreaks[this.menuStart + n - 1], this.ruleBreaks[this.menuStart + n] - 1), this.halfWidth - 73 + 12, this.halfGameHeight - 73 + 31 + 14 * n, 'l', 0);
                    } else {
                        this.drawGraphicString(graphics, Strings.ruleString[this.menuSelect].substring(this.ruleBreaks[this.menuStart + n - 1], this.ruleBreaks[this.menuStart + n] - 1), this.halfWidth - 73 + 12, this.halfGameHeight - 73 + 31 + 14 * n, 'l', 0);
                    }
                    ++n;
                }
                if (this.menuStart > 1) {
                    graphics.setClip(this.halfWidth + 73 - 8, this.halfHeight - 57 + 8, 5, 3);
                    graphics.drawImage(this.menu, this.halfWidth + 73 - 8, -22 + this.halfHeight - 57 + 8, 20);
                }
                if (this.menuStart + this.menuLines > this.menuLength) break;
                graphics.setClip(this.halfWidth + 73 - 8, this.halfHeight + 57 - 8, 5, 3);
                graphics.drawImage(this.menu, this.halfWidth + 73 - 8, -24 + this.halfHeight + 57 - 8, 20);
                break;
            }
            case 42: {
                this.spriteManager.initializeSpriteManager(this.curScreen);
                this.screenType = 31;
            }
            case 31: {
                ++this.timeCount;
                this.clearScreen(graphics, 0, 0, 0);
                this.drawMenu(graphics, 147, 35, 12, false);
                this.drawGraphicString(graphics, "Continue?", this.halfWidth, this.halfGameHeight - 16, 'c', 0);
                this.drawGraphicString(graphics, "" + (10 - this.timeCount / 10), this.halfWidth, this.halfGameHeight + 7, 'c', 0);
                break;
            }
            case 43: {
                this.clearScreen(graphics, 0, 0, 0);
                graphics.setClip(0, 0, this.width, this.height);
                if (this.showCut == 0 && this.sublevel == 1) {
                    if (this.level > 1) {
                        graphics.drawImage(this.jvhface, this.halfWidth, this.halfHeight - 73 + 5, 17);
                    }
                } else if (this.level > 5 && this.showCut > 1) {
                    this.gameCompleted = true;
                    this.title = this.spriteManager.loadImage("coffin.png");
                    graphics.drawImage(this.title, this.halfWidth, this.halfHeight - 73 + 5, 17);
                    if (this.showCut == 2) {
                        this.title = this.spriteManager.loadImage("eyes.png");
                        graphics.drawImage(this.title, this.halfWidth - 16, this.halfHeight - 73 + 24, 20);
                    }
                } else if (this.level == 1 && this.sublevel == 1 && this.showCut == 1 || this.level > 1 && this.sublevel == 1 && this.showCut != 1 || this.sublevel != 1 && this.showCut != 0 || this.level > 5) {
                    if (this.sublevel == 3) {
                        if ((this.showCut & 1) == 1) {
                            graphics.drawImage(this.jvhface, this.halfWidth, this.halfHeight - 73 + 5, 17);
                        } else {
                            graphics.drawImage(this.eveface, this.halfWidth, this.halfHeight - 73 + 5, 17);
                        }
                    } else {
                        graphics.drawImage(this.eveface, this.halfWidth, this.halfHeight - 73 + 5, 17);
                    }
                }
                graphics.setClip(0, 0, this.width, this.height);
                int n = 4;
                while (n > 1) {
                    if (this.showIntroText(graphics, this.height - ((n + 1) * 14 + 16), Strings.cutString[(this.level - 1) * 3 + this.sublevel - 1][this.showCut], 136, true)) break;
                    --n;
                }
                if (this.showCut >= Strings.cutString[(this.level - 1) * 3 + this.sublevel - 1].length) {
                    this.drawMenu(graphics, 147, 147, 4, false);
                    break;
                }
                if (this.level > 5) {
                    this.drawMenu(graphics, 147, 147, 2, false);
                    break;
                }
                this.drawMenu(graphics, 147, 147, 10, false);
                break;
            }
            case 45: {
                graphics.drawImage(this.intro, 0, 0, 20);
                this.drawMenu(graphics, 147, 115, 12, false);
                this.drawGraphicString(graphics, "Restart the game?", this.halfWidth, this.halfGameHeight - 7, 'c', 0);
                break;
            }
            case 48: {
                this.clearScreen(graphics, 0, 0, 0);
                this.drawMenu(graphics, 147, 115, 12, true);
                this.drawGraphicString(graphics, "options", this.halfWidth, this.halfGameHeight - 57 + 14, 'c', 0);
                if (this.game_sound) {
                    this.drawGraphicString(graphics, "Sound: On", this.halfWidth, this.halfGameHeight + 57 - 36, 'c', 1);
                } else {
                    this.drawGraphicString(graphics, "Sound: Off", this.halfWidth, this.halfGameHeight + 57 - 36, 'c', 1);
                }
                this.drawGraphicString(graphics, "Reset game", this.halfWidth, this.halfGameHeight + 57 - 18, 'c', 2);
            }
        }
    }

    protected void keyPressed(int n) {
        switch (this.screenType) {
            case 5: {
                try {
                    if (this.playerSprite.state == 9 || this.playerSprite.state == 16 || this.playerSprite.state == 18) break;
                    this.timeCount = 0;
                    if (n == -7) {
                        this.menuSelect = 0;
                        this.numMenuItems = 3;
                        this.scrolltimertask.timeCount = 0;
                        this.scrolltimertask.splashType = 3;
                        this.screenType = 30;
                        this.repaint();
                        break;
                    }
                    if (n == -6) break;
                    if (this.getGameAction(n) == 1 || !this.is3650 && n == 50) {
                        if (!(this.inAir || this.batMode || this.tileArray[this.mapBuffer[this.playerSprite.xPos >> 4][(this.playerSprite.yPos + this.ofsY >> 4) + 2]][1] == 0 && this.tileArray[this.mapBuffer[(this.playerSprite.xPos >> 4) + 1][(this.playerSprite.yPos + this.ofsY >> 4) + 2]][1] == 0)) {
                            this.jumpCount = 0;
                            this.playerSprite.frame = 0;
                            this.jumping = true;
                            this.jumpLocked = false;
                        }
                        if ((this.getTileVal(1, -8, 0, 0, 1) != 6 || (this.playerSprite.xPos + this.ofsX & 0xF) != 12 && (this.playerSprite.xPos + this.ofsX & 0xF) != 4 && (this.playerSprite.xPos + this.ofsX & 0xF) != 0) && !this.batMode) break;
                        this.playerSprite.state = 6;
                        this.adjustFrame = true;
                        break;
                    }
                    if ((this.getGameAction(n) == 6 || !this.is3650 && n == 56) && this.playerSprite.state != 7) {
                        if ((this.getTileVal(1, -8, 0, 0, 2) != 6 || (this.playerSprite.xPos + this.ofsX & 0xF) != 12 && (this.playerSprite.xPos + this.ofsX & 0xF) != 4 && (this.playerSprite.xPos + this.ofsX & 0xF) != 0) && !this.batMode) break;
                        this.playerSprite.state = 7;
                        this.adjustFrame = true;
                        break;
                    }
                    if (this.getGameAction(n) == 2 || !this.is3650 && n == 52) {
                        this.playerSprite.frame = 0;
                        this.playerSprite.state = 2;
                        break;
                    }
                    if (this.getGameAction(n) == 5 || !this.is3650 && n == 54) {
                        this.playerSprite.frame = 0;
                        this.playerSprite.state = 1;
                        break;
                    }
                    if ((this.getGameAction(n) == 8 || !this.is3650 && n == 53) && this.playerSprite.refireTime == 0 && !this.vaporMode) {
                        this.playerSprite.frame = 0;
                        this.playerSprite.state = 3;
                        break;
                    }
                    if (!this.is3650 && n == 51 || this.is3650 && n == 48) {
                        if (this.batMode || this.tileArray[this.mapBuffer[this.playerSprite.xPos >> 4][(this.playerSprite.yPos + this.ofsY >> 4) + 2]][1] == 0) break;
                        this.jumpLocked = false;
                        this.playerSprite.state = 18;
                        this.playerSprite.frame = 0;
                        this.jumpCount = 0;
                        break;
                    }
                    if ((!this.is3650 && n == 48 || this.is3650 && n == 53 || n == -7) && (this.levelCheat || this.gameCompleted)) {
                        this.spriteManager.initializeSpriteManager(this.curScreen);
                        if (this.sublevel < 3) {
                            ++this.sublevel;
                        } else {
                            this.sublevel = 1;
                            if (this.level < 6) {
                                ++this.level;
                            }
                        }
                        try {
                            this.map_file.close();
                        }
                        catch (Exception exception) {
                            // empty catch block
                        }
                        this.showCut = 0;
                        this.startTextPos = 0;
                        this.currentTextPos = 0;
                        this.scrolltimertask.timeCount = 0;
                        this.scrolltimertask.splashType = 7;
                        this.screenType = 43;
                        this.repaint();
                        return;
                    }
                    if ((!this.is3650 && n == 42 || this.is3650 && n == 54) && this.levelCheat) {
                        int n2 = 0;
                        while (n2 < 16) {
                            this.loadCol();
                            ++n2;
                        }
                        this.ofsY = 16;
                        Enumeration enumeration = this.spriteManager.spriteVector.elements();
                        while (enumeration.hasMoreElements()) {
                            Sprite sprite = (Sprite)enumeration.nextElement();
                            sprite.ttl = 0;
                            sprite.state = 9;
                        }
                        break;
                    }
                    if ((this.is3650 || n != 35) && (!this.is3650 || n != 55) || !this.levelCheat) break;
                    this.batMode = true;
                }
                catch (Exception exception) {}
                break;
            }
            case 6: {
                this.scrolltimertask.timeCount = 0;
                this.scrolltimertask.splashType = 2;
                this.screenType = 8;
                this.repaint();
                break;
            }
            case 8: {
                this.scrolltimertask.timeCount = 0;
                this.scrolltimertask.splashType = 3;
                this.screenType = 9;
                this.repaint();
                break;
            }
            case 1: {
                if (this.getGameAction(n) == 1 || !this.is3650 && n == 50) {
                    this.menuSelect = this.menuSelect == 0 ? this.numMenuItems - 1 : --this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 6 || !this.is3650 && n == 56) {
                    this.menuSelect = this.menuSelect == this.numMenuItems - 1 ? 0 : ++this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) != 8 && (this.is3650 || n != 53) && n != -7) break;
                switch (this.menuSelect) {
                    case 0: {
                        this.showCut = 0;
                        this.startTextPos = 0;
                        this.currentTextPos = 0;
                        this.scrolltimertask.timeCount = 0;
                        this.scrolltimertask.splashType = 7;
                        this.screenType = 43;
                        this.repaint();
                        break;
                    }
                    case 1: {
                        this.menuSelect = 0;
                        this.numMenuItems = 3;
                        this.scrolltimertask.splashType = 3;
                        this.scrolltimertask.timeCount = 0;
                        this.screenType = 39;
                        this.repaint();
                        break;
                    }
                    case 2: {
                        this.menuSelect = 0;
                        this.numMenuItems = 2;
                        this.screenType = 48;
                        break;
                    }
                    case 3: {
                        this.scrolltimertask.splashType = 7;
                        this.scrolltimertask.timeCount = 0;
                        this.screenType = 41;
                        this.repaint();
                    }
                }
                break;
            }
            case 21: {
                if (this.getGameAction(n) == 1 || !this.is3650 && n == 50) {
                    this.menuSelect = this.menuSelect == 0 ? this.numMenuItems - 1 : --this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 6 || !this.is3650 && n == 56) {
                    this.menuSelect = this.menuSelect == this.numMenuItems - 1 ? 0 : ++this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 8 || !this.is3650 && n == 53 || n == -7) {
                    switch (this.menuSelect) {
                        case 0: {
                            this.menuSelect = 0;
                            this.numMenuItems = 3;
                            this.scrolltimertask.splashType = 3;
                            this.scrolltimertask.timeCount = 0;
                            this.screenType = 39;
                            this.repaint();
                            break;
                        }
                        case 1: {
                            this.game_sound = !this.game_sound;
                            break;
                        }
                        case 2: {
                            this.menuSelect = 0;
                            this.numMenuItems = 4;
                            this.scrolltimertask.splashType = 3;
                            this.scrolltimertask.timeCount = 0;
                            this.screenType = 9;
                        }
                    }
                    break;
                }
                if (n != -6) break;
                this.scrolltimertask.timeCount = 0;
                this.scrolltimertask.splashType = 5;
                this.screenType = 11;
                break;
            }
            case 3: {
                if (n == -6) {
                    this.scrolltimertask.splashType = 3;
                    this.scrolltimertask.timeCount = 0;
                    this.menuSelect = 0;
                    this.numMenuItems = 3;
                    this.screenType = 39;
                } else if (this.currentTextPos >= Strings.ruleString[this.menuSelect].length()) {
                    this.currentTextPos = 0;
                    break;
                }
                if ((this.getGameAction(n) == 1 || !this.is3650 && n == 50) && this.menuStart > 1) {
                    --this.menuStart;
                } else if ((this.getGameAction(n) == 6 || !this.is3650 && n == 56) && this.menuStart + this.menuLines <= this.menuLength) {
                    ++this.menuStart;
                }
                this.repaint();
                break;
            }
            case 39: {
                if (this.getGameAction(n) == 1 || !this.is3650 && n == 50) {
                    this.menuSelect = this.menuSelect == 0 ? this.numMenuItems - 1 : --this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 6 || !this.is3650 && n == 56) {
                    this.menuSelect = this.menuSelect == this.numMenuItems - 1 ? 0 : ++this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 8 || !this.is3650 && n == 53 || n == -7) {
                    this.screenType = 40;
                    break;
                }
                if (n != -6) break;
                this.menuSelect = 0;
                if (this.ingame) {
                    this.numMenuItems = 3;
                    this.screenType = 21;
                    break;
                }
                this.numMenuItems = 4;
                this.screenType = 1;
                break;
            }
            case 4: {
                if ((this.getGameAction(n) == 1 || !this.is3650 && n == 50) && this.menuStart > 1) {
                    --this.menuStart;
                } else if ((this.getGameAction(n) == 6 || !this.is3650 && n == 56) && this.menuStart + this.menuLines <= this.menuLength) {
                    ++this.menuStart;
                } else if (n == -7) {
                    this.exitGame();
                }
                this.repaint();
                break;
            }
            case 31: {
                if (n == -7) {
                    this.ingame = true;
                    this.gameLoader();
                    break;
                }
                if (n != -6) break;
                this.ingame = false;
                this.menuSelect = 0;
                this.numMenuItems = 4;
                this.scrolltimertask.splashType = 3;
                this.scrolltimertask.timeCount = 0;
                this.screenType = 9;
                break;
            }
            case 43: {
                if (n == -7) {
                    if (this.showCut >= Strings.cutString[(this.level - 1) * 3 + this.sublevel - 1].length) {
                        if (this.level < 6) {
                            this.ingame = true;
                            this.gameLoader();
                            break;
                        }
                        this.level = 1;
                        this.sublevel = 1;
                        this.ingame = false;
                        this.menuSelect = 0;
                        this.numMenuItems = 4;
                        this.scrolltimertask.splashType = 3;
                        this.scrolltimertask.timeCount = 0;
                        this.screenType = 9;
                        break;
                    }
                    this.repaint();
                    break;
                }
                if (n != -6 || this.level >= 6) break;
                this.ingame = true;
                this.gameLoader();
                break;
            }
            case 48: {
                if (this.getGameAction(n) == 1 || n == 50 || n == this.getKeyCode(1)) {
                    this.menuSelect = this.menuSelect == 0 ? this.numMenuItems - 1 : --this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 6 || n == 56 || n == this.getKeyCode(6)) {
                    this.menuSelect = this.menuSelect == this.numMenuItems - 1 ? 0 : ++this.menuSelect;
                    this.selectLength = 20;
                    this.movedCount = 18;
                    break;
                }
                if (this.getGameAction(n) == 8 || n == 53 || n == -7) {
                    switch (this.menuSelect) {
                        case 0: {
                            this.game_sound = !this.game_sound;
                            break;
                        }
                        case 1: {
                            this.screenType = 45;
                        }
                    }
                    break;
                }
                if (n != -6) break;
                this.screenType = 9;
                break;
            }
            case 45: {
                if (n == -7) {
                    this.level = 1;
                    this.sublevel = 1;
                    this.menuSelect = 0;
                    this.numMenuItems = 2;
                    this.screenType = 48;
                    break;
                }
                if (n != -6) break;
                this.menuSelect = 0;
                this.numMenuItems = 2;
                this.screenType = 48;
            }
        }
    }

    protected void keyReleased(int n) {
        if (this.screenType == 5) {
            if ((this.getGameAction(n) == 2 || n == 52 || n == this.getKeyCode(2) || this.getGameAction(n) == 5 || n == 54 || n == this.getKeyCode(5) || n == 51) && (this.playerSprite.state == 1 || this.playerSprite.state == 2 || this.playerSprite.state == 11) && this.playerSprite.state != 16 || this.batMode) {
                this.playerSprite.state = 0;
                this.playerSprite.frame = 0;
            } else if (!(this.getGameAction(n) != 1 && n != 50 && n != this.getKeyCode(1) && this.getGameAction(n) != 6 && n != 56 && n != this.getKeyCode(6) || this.playerSprite.state == 16 || this.playerSprite.state != 6 && this.playerSprite.state != 7)) {
                this.playerSprite.state = 8;
            }
        }
    }

    private final int getTileVal(int n, int n2, int n3, int n4, int n5) {
        try {
            if ((this.playerSprite.yPos + this.ofsY - n3 >> 4) + n5 < 0 || (this.playerSprite.xPos + this.ofsX - n2 >> 4) + n4 < 0 || (this.playerSprite.yPos + this.ofsY - n3 >> 4) + n5 >= 16 || (this.playerSprite.xPos + this.ofsX - n2 >> 4) + n4 >= 12) {
                return 0;
            }
            return this.tileArray[this.mapBuffer[(this.playerSprite.xPos + this.ofsX - n2 >> 4) + n4][(this.playerSprite.yPos + this.ofsY - n3 >> 4) + n5]][n];
        }
        catch (Exception exception) {
            return 0;
        }
    }

    private final void addParticle(int n, int n2, int n3, int n4) {
        int n5 = 0;
        int n6 = 0;
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

    private final void adjustOnSlope(int n, int n2) {
        int n3 = 0;
        int n4 = this.ofsY;
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

    protected final void updateGame() {
        int n;
        Sprite sprite;
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
            try {
                this.map_file.close();
            }
            catch (Exception exception) {
                // empty catch block
            }
            this.showCut = 0;
            this.startTextPos = 0;
            this.currentTextPos = 0;
            this.scrolltimertask.timeCount = 0;
            this.scrolltimertask.splashType = 7;
            this.screenType = 43;
            this.repaint();
            return;
        }
        if (this.playerSprite.health <= 0 && this.playerSprite.state != 9) {
            this.jumpCount = 0;
            this.playerSprite.state = 9;
            this.playSound(8);
        }
        if (this.vaporMode) {
            int n2 = 0;
            while (n2 < 3) {
                this.addParticle(this.playerSprite.xPos + 4 + this.spriteManager.getRandom(8), this.playerSprite.yPos + 16 - this.spriteManager.getRandom(16), 1, 0xAAAAAA);
                ++n2;
            }
        }
        if (this.playerSprite.refireTime > 0) {
            if (this.playerSprite.refireTime == 1) {
                if (this.playerSprite.state == 16) {
                    Enumeration enumeration = this.spriteManager.spriteVector.elements();
                    while (enumeration.hasMoreElements()) {
                        sprite = (Sprite)enumeration.nextElement();
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
            try {
                this.map_file.close();
            }
            catch (Exception exception) {
                // empty catch block
            }
            this.scrolltimertask.timeCount = 0;
            this.scrolltimertask.splashType = 6;
            this.screenType = 42;
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
            boolean bl = true;
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
            boolean bl = true;
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
                            int n3 = this.playerSprite.yPos - this.playerLatch;
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
            Enumeration enumeration = this.spriteManager.spriteVector.elements();
            while (enumeration.hasMoreElements()) {
                sprite = (Sprite)enumeration.nextElement();
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
            Sprite sprite2 = new Sprite(101, 16, 16);
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
                        int n4 = this.playerSprite.yPos - this.playerLatch;
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
                System.out.println("1 - ap: " + this.ofsY + " - as: " + (this.ofsY - (this.ofsY & 0xF)) + ", " + (this.ofsY & 0xF));
                this.adjustOnSlope(1, 4);
            } else if (this.getTileVal(1, -8 + this.ofsX, 0, 1, 2) == 4) {
                System.out.println("2 - ap: " + this.ofsY + " - as: " + (this.ofsY - (this.ofsY & 0xF)) + ", " + (this.ofsY & 0xF));
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
            Enumeration enumeration = this.spriteManager.spriteVector.elements();
            while (enumeration.hasMoreElements()) {
                Object object;
                sprite = (Sprite)enumeration.nextElement();
                if (sprite.xPos <= -32 || sprite.xPos > 192 || sprite.yPos > this.gameHeight && sprite.state == 9) {
                    this.spriteManager.spriteVector.removeElement(sprite);
                } else if (sprite.type == 10 && sprite.state != 15 && !this.vaporMode) {
                    if (sprite.refireTime == 0 && sprite.state != 9) {
                        if (this.playerSprite.yPos >= sprite.yPos - 32 && this.playerSprite.yPos <= sprite.yPos + 32 && this.playerSprite.xPos >= sprite.xPos - 32 && this.playerSprite.xPos <= sprite.xPos + 32) {
                            Sprite sprite3;
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
                            Sprite sprite4 = new Sprite(100, 16, 16);
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
                                    int n5 = 0;
                                    while (n5 < (this.gameWidth >> 4) - 2) {
                                        object = new Sprite(400, 16, 16);
                                        ((Sprite)object).setCollisionRectangle(6, 2, 4, 12);
                                        ((Sprite)object).setPosition((n5 << 4) + 16, -8);
                                        this.spriteManager.spriteVector.addElement(object);
                                        object = null;
                                        ++n5;
                                    }
                                }
                                if (sprite.state == 20 && sprite.refireTime == 16) {
                                    Sprite sprite5 = new Sprite(700, 16, 16);
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
                                    Sprite sprite6;
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
                                    int n6 = sprite.lastDir && sprite.xPos >= this.halfGameWidth || !sprite.lastDir && sprite.xPos < this.halfGameWidth ? 1 : this.spriteManager.getRandom(3);
                                    if (n6 == 0) {
                                        this.playSound(7);
                                        if (sprite.lastDir) {
                                            object = new Sprite(102, 16, 16);
                                            ((Sprite)object).setPosition(sprite.xPos + 16, sprite.yPos + 8);
                                        } else {
                                            object = new Sprite(100, 16, 16);
                                            ((Sprite)object).setPosition(sprite.xPos - 16, sprite.yPos + 8);
                                        }
                                        ((Sprite)object).setCollisionRectangle(2, 2, 12, 12);
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
                        boolean bl = true;
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
                        boolean bl = true;
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
                                    Sprite sprite7 = (Sprite)object.nextElement();
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
                        boolean bl = true;
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
        Enumeration enumeration = this.spriteManager.spriteVector.elements();
        while (enumeration.hasMoreElements()) {
            sprite = (Sprite)enumeration.nextElement();
            sprite.setPosition(sprite.xPos - this.moveX, sprite.yPos + this.moveY);
            sprite = null;
        }
    }
}

