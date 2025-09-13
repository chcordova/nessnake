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
    };
    // Mock de Renderer con ctx inyectado
    renderer = { ctx } as unknown as Renderer;
    spriteSheet = {} as HTMLImageElement;
  });

  it("dibuja todos los segmentos en el canvas", () => {
    const segments: SnakeSegment[] = [
      { x: 0, y: 0, tipo: "cabeza" },
      { x: 16, y: 0, tipo: "cuerpo" },
      { x: 32, y: 0, tipo: "cola" },
      { x: 48, y: 0, tipo: "curva_bl" },
      { x: 64, y: 0, tipo: "curva_br" },
    ];
    drawSnake(segments, renderer, spriteSheet);
    expect(ctx.drawImage).toHaveBeenCalledTimes(segments.length);
    // Opcional: validar que las posiciones destino sean correctas
    expect(ctx.drawImage.mock.calls[0][5]).toBe(0); // x de cabeza
    expect(ctx.drawImage.mock.calls[1][5]).toBe(16); // x de cuerpo
  });
});
