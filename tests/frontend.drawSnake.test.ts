import { Renderer } from "../src/frontend/Renderer";
import { drawSnake, SnakeSegment } from "../src/frontend/main";

describe("drawSnake", () => {
  it("dibuja cada segmento usando el sprite correcto", () => {
    // Mock de Renderer y ctx
    const calls: any[] = [];
    const mockCtx = {
      drawImage: (...args: any[]) => calls.push(args),
    } as unknown as CanvasRenderingContext2D;
    const renderer = { ctx: mockCtx } as Renderer;
    // Sprite sheet dummy
    const spriteSheet = {} as HTMLImageElement;
    // Segmentos de prueba
    const segments: SnakeSegment[] = [
      { x: 0, y: 0, tipo: "cabeza" },
      { x: 16, y: 0, tipo: "cuerpo" },
      { x: 32, y: 0, tipo: "cola" },
      { x: 48, y: 0, tipo: "curva_bl" },
      { x: 64, y: 0, tipo: "curva_br" },
    ];
    drawSnake(segments, renderer, spriteSheet);
    // Debe llamar drawImage una vez por segmento
    expect(calls.length).toBe(segments.length);
    // Verifica que las coordenadas de recorte sean correctas
    expect(calls[0][1]).toBe(0); // cabeza sx
    expect(calls[1][1]).toBe(16); // cuerpo sx
    expect(calls[2][1]).toBe(32); // cola sx
    expect(calls[3][1]).toBe(16); // curva_bl sx
    expect(calls[4][1]).toBe(32); // curva_br sx
  });
});
