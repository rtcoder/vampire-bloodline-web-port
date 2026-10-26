/** The MIDlet schedules updateGame + paint once every 100 ms. */
export class FixedClock {
  constructor(step) { this.step = step; this.reset(); }
  reset() { this.last = null; this.accumulator = 0; this.generation = (this.generation || 0) + 1; }
  advance(now) {
    if (this.last === null) { this.last = now; return; }
    this.accumulator += Math.max(0, Math.min(now - this.last, 500));
    this.last = now;
    const generation = this.generation;
    while (this.accumulator >= 100 - 1e-7) {
      this.accumulator -= 100;
      this.step();
      if (this.generation !== generation) break;
    }
  }
}
