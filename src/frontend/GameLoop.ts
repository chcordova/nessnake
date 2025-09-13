export class GameLoop {
  private running = false;
  private lastTime = 0;
  private update: (dt: number) => void;
  private render: () => void;

  constructor(update: (dt: number) => void, render: () => void) {
    this.update = update;
    this.render = render;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  };
}
