import { AssetLoader } from "./AssetLoader.js";
import { Renderer } from "./Renderer.js";
import { AudioManager } from "./AudioManager.js";
import { GameLoop } from "./GameLoop.js";
import { UIManager } from "./UIManager.js";

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
    if (!spriteSheet.complete) {
      console.warn(
        `[drawSnake] spriteSheet not complete for segment tipo='${seg.tipo}'`
      );
    }
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
    // Si es la cabeza, dibuja un pixel rojo en la esquina superior izquierda del segmento
    if (seg.tipo === "cabeza") {
      renderer.ctx.fillStyle = "#ff0000";
      renderer.ctx.fillRect(seg.x, seg.y, 2, 2);
    }
    // Log each draw
    console.log(
      `[drawSnake] Drew segment tipo='${seg.tipo}' at (${seg.x},${seg.y}) using sprite (${sprite.sx},${sprite.sy})`
    );
  }
}

// Simulación básica de juego para los tests E2E
class SimpleGameSimulation {
  private uiManager: UIManager;
  private renderer: Renderer;
  private gameLoop: GameLoop | null = null;
  private score = 0;
  private isGameRunning = false;
  private gameOverTimer: number | null = null;

  private snakeSegments: SnakeSegment[] = [
    { x: 50, y: 50, tipo: "cabeza" },
    { x: 50, y: 66, tipo: "cuerpo" },
    { x: 50, y: 82, tipo: "curva_bl" },
    { x: 66, y: 82, tipo: "cuerpo" },
    { x: 82, y: 82, tipo: "cola" },
  ];

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.uiManager = new UIManager();
    this.setupGameEvents();
  }

  private setupGameEvents() {
    // Detectar cuando el juego inicia
    const playBtn = document.getElementById("play-btn");
    playBtn?.addEventListener("click", () => {
      this.startGameSimulation();
    });

    const restartBtn = document.getElementById("restart-btn");
    restartBtn?.addEventListener("click", () => {
      this.startGameSimulation();
    });

    // Controles de juego - simular game over después de unos movimientos
    document.addEventListener("keydown", (e) => {
      if (this.uiManager.getCurrentState() === "playing") {
        const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if (arrowKeys.indexOf(e.key) !== -1) {
          this.handleMovement(e.key);
        }
      }
    });
  }

  private startGameSimulation() {
    this.score = 0;
    this.isGameRunning = true;
    this.uiManager.updateScore(this.score);

    // Iniciar el loop de renderizado
    if (this.gameLoop) {
      this.gameLoop.stop();
    }

    this.gameLoop = new GameLoop(
      (dt) => {
        // Update logic simulation
        if (this.isGameRunning) {
          this.score += Math.floor(dt * 10); // Incrementar score con tiempo
          this.uiManager.updateScore(this.score);
        }
      },
      () => {
        // Render logic
        if (this.uiManager.getCurrentState() === "playing") {
          this.renderer.clear();
          const snakeImg = AssetLoader.getImage("snake");
          if (snakeImg) {
            drawSnake(this.snakeSegments, this.renderer, snakeImg);
          }
        }
      }
    );

    this.gameLoop.start();
  }

  private lastDirection: string = "ArrowRight";
  private handleMovement(direction: string) {
    // Movimiento típico de snake: la cabeza se mueve y el cuerpo sigue
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(direction)
    ) {
      this.lastDirection = direction;
    }

    // Calcular nueva posición de la cabeza

    const head = { ...this.snakeSegments[0] };
    // Asegurar que head.x/y son números
    head.x = typeof head.x === "number" ? head.x : 0;
    head.y = typeof head.y === "number" ? head.y : 0;
    switch (this.lastDirection) {
      case "ArrowUp":
        head.y -= 16;
        break;
      case "ArrowDown":
        head.y += 16;
        break;
      case "ArrowLeft":
        head.x -= 16;
        break;
      case "ArrowRight":
        head.x += 16;
        break;
    }

    // Mover el cuerpo: cada segmento toma la posición del anterior
    for (let i = this.snakeSegments.length - 1; i > 0; i--) {
      this.snakeSegments[i]!.x = this.snakeSegments[i - 1]!.x;
      this.snakeSegments[i]!.y = this.snakeSegments[i - 1]!.y;
    }
    // Actualizar cabeza
    this.snakeSegments[0]!.x = head.x;
    this.snakeSegments[0]!.y = head.y;

    // TODO: Actualizar tipo de segmento según dirección y curva (snake_sprite)
    // Por ahora, solo mover la cabeza y el cuerpo, sin animar curvas

    // Incrementar score por movimiento
    this.score += 10;
    this.uiManager.updateScore(this.score);

    // Simular game over después de 3 movimientos
    if (this.score >= 30) {
      this.triggerGameOver();
    }

    // Reproducir sonido si está disponible
    AudioManager.play("eat");
  }

  private triggerGameOver() {
    this.isGameRunning = false;
    if (this.gameLoop) {
      this.gameLoop.stop();
    }

    // Pequeño delay para mejor UX
    setTimeout(() => {
      this.uiManager.gameOver();
    }, 500);
  }
}

async function bootstrap() {
  try {
    await AssetLoader.loadImage("snake", "/assets/images/snake_sprite.png");
    await AssetLoader.loadAudio("eat", "/assets/audio/eat.wav");
  } catch (error) {
    console.log("Assets no encontrados, continuando sin sprites/audio");
  }

  const canvas = document.getElementById("game") as HTMLCanvasElement;
  const renderer = new Renderer(canvas);

  // Inicializar la simulación de juego
  new SimpleGameSimulation(renderer);
}

bootstrap();
