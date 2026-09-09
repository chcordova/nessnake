import { Renderer } from "../src/frontend/Renderer";
import { drawSnake, SnakeSegment } from "../src/frontend/main";

describe("drawSnake", () => {
  it("dibuja cada segmento usando el sprite correcto", () => {
    // Mock de Renderer y ctx
    const calls: any[] = [];
    const mockCtx = {
      drawImage: (...args: any[]) => calls.push(args),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      canvas: { width: 1200, height: 800 },
    } as unknown as CanvasRenderingContext2D;
    const renderer = { ctx: mockCtx } as Renderer;
    // Sprite sheet dummy
    const spriteSheet = {
      complete: true,
      width: 65,
      height: 16,
    } as HTMLImageElement;
    // Segmentos de prueba
    const segments: SnakeSegment[] = [
      { x: 0, y: 0, tipo: "cabeza" },
      { x: 16, y: 0, tipo: "cuerpo" },
      { x: 32, y: 0, tipo: "cola" },
      { x: 48, y: 0, tipo: "curva_u_invertida_izq" },
      { x: 64, y: 0, tipo: "curva_u_invertida_der" },
    ];
    drawSnake(segments, renderer, spriteSheet);
    // Las primeras llamadas corresponden a los segmentos; el modo debug dibuja muestras adicionales.
    expect(calls.slice(0, segments.length)).toHaveLength(segments.length);
    // Verifica que las coordenadas de recorte sean correctas
    expect(calls[0][1]).toBe(0); // cabeza sx
    expect(calls[1][1]).toBe(18); // cuerpo sx
    expect(calls[2][1]).toBe(36); // cola sx
    expect(calls[3][1]).toBe(52); // curva izquierda sx
    expect(calls[4][1]).toBe(52); // curva derecha sx
  });
});
