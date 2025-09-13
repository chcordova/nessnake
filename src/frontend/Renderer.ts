export class Renderer {
  public ctx: CanvasRenderingContext2D;
  // ...existing code...
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    this.ctx.drawImage(img, x, y, w, h);
  }

  drawText(text: string, x: number, y: number, color = "#fff", size = 24) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.fillText(text, x, y);
  }
}
