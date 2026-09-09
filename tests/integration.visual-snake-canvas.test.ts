import { Renderer } from "../src/frontend/Renderer";
import { drawSnake, SnakeSegment } from "../src/frontend/main";

describe("Integración visual: render de snake en canvas", () => {
  let renderer: Renderer;
  let ctx: any;
  let spriteSheet: HTMLImageElement;

  beforeEach(() => {
    // Mock manual de ctx
    ctx = {
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      canvas: { width: 1200, height: 800 },
    };
    // Mock de Renderer con ctx inyectado
    renderer = { ctx } as unknown as Renderer;
    spriteSheet = {
      complete: true,
      width: 65,
      height: 16,
    } as HTMLImageElement;
  });

  it("dibuja todos los segmentos en el canvas", () => {
    const segments: SnakeSegment[] = [
      { x: 0, y: 0, tipo: "cabeza" },
      { x: 16, y: 0, tipo: "cuerpo" },
      { x: 32, y: 0, tipo: "cola" },
      { x: 48, y: 0, tipo: "curva_u_invertida_izq" },
      { x: 64, y: 0, tipo: "curva_u_invertida_der" },
    ];
    drawSnake(segments, renderer, spriteSheet);
    const segmentDraws = ctx.drawImage.mock.calls.slice(0, segments.length);
    expect(segmentDraws).toHaveLength(segments.length);
    // Opcional: validar que las posiciones destino sean correctas
    expect(segmentDraws[0][5]).toBe(0); // x de cabeza
    expect(segmentDraws[1][5]).toBe(16); // x de cuerpo
  });
});
