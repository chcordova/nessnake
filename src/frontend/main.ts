import { AssetLoader } from "./AssetLoader";
import { Renderer } from "./Renderer";
import { AudioManager } from "./AudioManager";
import { GameLoop } from "./GameLoop";

const TILE_SIZE = 16;
const snakeSprites = {
  cabeza: { sx: 0, sy: 16 },
  cuerpo: { sx: 16, sy: 16 },
  cola: { sx: 32, sy: 16 },
  curva_bl: { sx: 16, sy: 0 },
  curva_br: { sx: 32, sy: 0 },
};

export type SnakeSegmentType =
  | "cabeza"
  | "cuerpo"
  | "cola"
  | "curva_bl"
  | "curva_br";
export interface SnakeSegment {
  x: number;
  y: number;
  tipo: SnakeSegmentType;
}

export function drawSnake(
  snakeSegments: SnakeSegment[],
  renderer: Renderer,
  spriteSheet: HTMLImageElement
) {
  for (const seg of snakeSegments) {
    const sprite = snakeSprites[seg.tipo as SnakeSegmentType];
    if (!sprite) continue;
    renderer.ctx.drawImage(
      spriteSheet,
      sprite.sx,
      sprite.sy,
      TILE_SIZE,
      TILE_SIZE, // src rect
      seg.x,
      seg.y,
      TILE_SIZE,
      TILE_SIZE // dest rect
    );
  }
}

async function bootstrap() {
  await AssetLoader.loadImage("snake", "/assets/images/snake_sprite.png");
  await AssetLoader.loadAudio("eat", "/assets/audio/eat.wav");
  // ...cargar más assets según necesidad

  const canvas = document.getElementById("game") as HTMLCanvasElement;
  const renderer = new Renderer(canvas);

  // Demo: segmentos de ejemplo
  const snakeSegments: SnakeSegment[] = [
    { x: 50, y: 50, tipo: "cabeza" },
    { x: 50, y: 66, tipo: "cuerpo" },
    { x: 50, y: 82, tipo: "curva_bl" },
    { x: 66, y: 82, tipo: "cuerpo" },
    { x: 82, y: 82, tipo: "cola" },
  ];

  // Ejemplo de render loop
  const loop = new GameLoop(
    (dt) => {
      // update logic (game state, movement, etc)
    },
    () => {
      renderer.clear();
      const snakeImg = AssetLoader.getImage("snake");
      if (snakeImg) drawSnake(snakeSegments, renderer, snakeImg);
      renderer.drawText("Score: 100", 10, 20);
    }
  );
  loop.start();

  // Ejemplo de sonido
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") AudioManager.play("eat");
  });
}

bootstrap();
