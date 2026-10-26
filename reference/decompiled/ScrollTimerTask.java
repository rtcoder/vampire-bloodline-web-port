/*
 * Decompiled with CFR 0.152.
 */
import java.util.TimerTask;

class ScrollTimerTask
extends TimerTask {
    private mainCanvas canvas;
    public int splashType;
    public int timeCount = 0;

    public ScrollTimerTask(mainCanvas mainCanvas2) {
        this.canvas = mainCanvas2;
        this.timeCount = 0;
    }

    public final void run() {
        switch (this.splashType) {
            case 1: {
                if (this.timeCount >= 30) {
                    this.timeCount = 0;
                    this.splashType = 2;
                    this.canvas.screenType = 8;
                    this.canvas.repaint();
                    break;
                }
                ++this.timeCount;
                break;
            }
            case 2: {
                if (this.timeCount >= 50) {
                    this.timeCount = 0;
                    this.splashType = 3;
                    this.canvas.screenType = 9;
                    this.canvas.repaint();
                    break;
                }
                if (this.canvas.screenType != 8) break;
                ++this.timeCount;
                break;
            }
            case 3: {
                this.canvas.repaint();
                break;
            }
            case 5: {
                this.canvas.updateGame();
                this.canvas.repaint();
                this.canvas.serviceRepaints();
                break;
            }
            case 6: {
                if (this.timeCount >= 99) {
                    this.canvas.ingame = false;
                    this.canvas.menuSelect = 0;
                    this.canvas.numMenuItems = 4;
                    this.splashType = 3;
                    this.timeCount = 0;
                    this.canvas.screenType = 9;
                } else {
                    ++this.timeCount;
                }
                this.canvas.repaint();
                break;
            }
        }
    }
}

