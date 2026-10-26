/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Display
 *  javax.microedition.lcdui.Displayable
 *  javax.microedition.midlet.MIDlet
 */
import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Displayable;
import javax.microedition.midlet.MIDlet;

public class Vampire
extends MIDlet {
    mainCanvas canvas;
    Display display = Display.getDisplay((MIDlet)this);

    public void startApp() {
        if (this.canvas == null) {
            this.canvas = new mainCanvas(this);
        }
        this.canvas.repaint();
        this.display.setCurrent((Displayable)this.canvas);
    }

    protected void pauseApp() {
        this.canvas.pause();
    }

    protected void destroyApp(boolean bl) {
    }
}

