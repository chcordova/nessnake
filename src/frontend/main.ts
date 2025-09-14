import { AssetLoader } from "./AssetLoader.js";
import { Renderer } from "./Renderer.js";
import { AudioManager } from "./AudioManager.js";
import { GameLoop } from "./GameLoop.js";
import { UIManager } from "./UIManager.js";

const TILE_SIZE = 16;
const DEBUG_MODE = true; // Cambiar a false para desactivar el debugging

// Dimensiones de sprites
const SPRITE_HEIGHT = 16;
const SPRITE_WIDTH_CABEZA = 18; // cabeza (ajustado a 18px)
const SPRITE_WIDTH_CUERPO = 18; // cuerpo (ajustado a 18px)
const SPRITE_WIDTH_COLA = 16; // cola (ajustado a 16px)
const SPRITE_WIDTH_CURVA = 12; // curva (ajustado a 12px)

/*
 * Estructura del sprite sheet (65x16px):
 * - Orientación: cuerpo horizontal, cabeza apuntando hacia la izquierda
 * - El    } else {
      // Resetear a serpiente básica CORREGIDA
      this.snakeSegments = [
        { x: 70, y: 50, tipo: "cabeza" },   // Cabeza al frente moviéndose hacia la derecha
        { x: 50, y: 50, tipo: "cuerpo" },   // Cuerpo en el medio  
        { x: 30, y: 50, tipo: "cola" },     // Cola al final
      ];
      console.log("[DEBUG] Switched to normal snake");
    }[cabeza][cuerpo][cola][curva ∩ der]
 * - Dimensiones: 22px + 13px + 18px + 12px = 65px total
 * - Solo una curva base que se rota/voltea para crear todas las variaciones
 * - Cabeza y cola deben rotarse según dirección de movimiento
 */

const snakeSprites: Record<SnakeSegmentType, SpriteConfig> = {
  // Cabeza apuntando hacia la izquierda (orientación original del sprite)
  cabeza: { sx: 0, sy: 0, width: SPRITE_WIDTH_CABEZA, height: SPRITE_HEIGHT },
  // Cuerpo horizontal
  cuerpo: { sx: 18, sy: 0, width: SPRITE_WIDTH_CUERPO, height: SPRITE_HEIGHT },
  // Cola horizontal
  cola: { sx: 36, sy: 0, width: SPRITE_WIDTH_COLA, height: SPRITE_HEIGHT },

  // Variaciones de curva con transformaciones corregidas para casos específicos de giro
  curva_u_invertida_izq: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    transform: { rotate: -90, flipX: false, flipY: false }, // -90° izquierda para casos específicos
  },
  curva_u_invertida_der: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    transform: { rotate: 0, flipX: true, flipY: false }, // flip horizontal (reserva)
  },
  curva_u_normal_izq: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    transform: { rotate: 270, flipX: false, flipY: false }, // 270° (reserva)
  },
  curva_u_normal_der: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    transform: { rotate: 90, flipX: false, flipY: false }, // +90° derecha para casos específicos
  },
};

export type SnakeSegmentType =
  | "cabeza"
  | "cuerpo"
  | "cola"
  | "curva_u_invertida_izq"
  | "curva_u_invertida_der"
  | "curva_u_normal_izq"
  | "curva_u_normal_der";

export interface SpriteConfig {
  sx: number;
  sy: number;
  width: number;
  height: number;
  transform?: {
    rotate: number;
    flipX: boolean;
    flipY: boolean;
  };
}

export interface SnakeSegment {
  x: number;
  y: number;
  tipo: SnakeSegmentType;
}

// Función de ayuda para debugging
function drawDebugInfo(renderer: Renderer) {
  if (!DEBUG_MODE) return;

  // Panel de información de debugging
  const panelX = 10;
  const panelY = 150;
  const panelWidth = 250;
  const panelHeight = 180;

  // Fondo semi-transparente para el panel
  renderer.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  renderer.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  // Borde del panel
  renderer.ctx.strokeStyle = "#00ff00";
  renderer.ctx.lineWidth = 1;
  renderer.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  // Texto de información
  renderer.ctx.fillStyle = "#ffffff";
  renderer.ctx.font = "10px monospace";
  renderer.ctx.fillText("DEBUG MODE: ON", panelX + 5, panelY + 15);
  renderer.ctx.fillText("Canvas: 65x16px", panelX + 5, panelY + 30);
  renderer.ctx.fillText(
    "Cabeza → izquierda (22x16px)",
    panelX + 5,
    panelY + 45
  );
  renderer.ctx.fillText(
    "Cuerpo: horizontal (13x16px)",
    panelX + 5,
    panelY + 60
  );
  renderer.ctx.fillText("Cola: horizontal (16x16px)", panelX + 5, panelY + 75);
  renderer.ctx.fillText("Curva base: 14x16px", panelX + 5, panelY + 90);
  renderer.ctx.fillText(
    "(curvas usan transformaciones)",
    panelX + 5,
    panelY + 105
  );
  renderer.ctx.fillText("Verde: Segmentos dibujados", panelX + 5, panelY + 120);
  renderer.ctx.fillText("Magenta: Área fuente", panelX + 5, panelY + 135);
  renderer.ctx.fillText("Rojo: Cabeza", panelX + 5, panelY + 150);
  renderer.ctx.fillText("Amarillo: Sprite sheet", panelX + 5, panelY + 165);
  renderer.ctx.fillText("", panelX + 5, panelY + 180);
  renderer.ctx.fillText("CONTROLES DE PRUEBA:", panelX + 5, panelY + 195);
  renderer.ctx.fillText(
    "C = Alternar serpiente circular",
    panelX + 5,
    panelY + 210
  );
  renderer.ctx.fillText(
    "Flechas = Mover (modo normal)",
    panelX + 5,
    panelY + 225
  );
}

// Función para aplicar transformaciones de canvas
function applyTransformations(
  ctx: CanvasRenderingContext2D,
  transform: { rotate: number; flipX: boolean; flipY: boolean } | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) {
  if (!transform) return;

  // Para sprites rotados, necesitamos ajustar el centro para mantener la posición visual
  let centerX = x + width / 2;
  let centerY = y + height / 2;

  // Ajuste especial para sprites de cuerpo cuando se rotan 90° (vertical)
  // Esto corrige el desplazamiento de 2 píxeles que ocurre en movimiento vertical
  if (
    width === SPRITE_WIDTH_CUERPO &&
    (transform.rotate === 90 || transform.rotate === -90)
  ) {
    // Centrar en el TILE_SIZE estándar (16px) en lugar del ancho del sprite (13px)
    centerX = x + TILE_SIZE / 2;
  }

  // Mover al centro del sprite para aplicar transformaciones
  ctx.translate(centerX, centerY);

  // Aplicar rotación
  if (transform.rotate !== 0) {
    ctx.rotate((transform.rotate * Math.PI) / 180);
  }

  // Aplicar escalado para flip
  const scaleX = transform.flipX ? -1 : 1;
  const scaleY = transform.flipY ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Mover de vuelta (ahora el origen está en el centro)
  ctx.translate(-width / 2, -height / 2);
}

// Función para calcular la dirección entre dos puntos
function getDirection(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "down" : "up";
  }
}

// Función para obtener las transformaciones basadas en la dirección
function getDirectionalTransform(
  direction: string,
  segmentType: "cabeza" | "cuerpo" | "cola"
): { rotate: number; flipX: boolean; flipY: boolean } | undefined {
  // Sprite original: cabeza apunta a la izquierda, cuerpo y cola horizontales

  if (segmentType === "cabeza") {
    switch (direction) {
      case "left":
        return undefined; // Sin transformación (orientación original)
      case "right":
        return { rotate: 0, flipX: true, flipY: false }; // Flip horizontal
      case "up":
        return { rotate: 90, flipX: false, flipY: false }; // Rotar 90° horario (CORREGIDO)
      case "down":
        return { rotate: -90, flipX: false, flipY: false }; // Rotar 90° antihorario (CORREGIDO)
    }
  }

  if (segmentType === "cuerpo") {
    switch (direction) {
      case "left":
      case "right":
        return undefined; // Sin transformación (horizontal)
      case "up":
      case "down":
        return { rotate: 90, flipX: false, flipY: false }; // Rotar 90° para vertical
    }
  }

  if (segmentType === "cola") {
    switch (direction) {
      case "left":
        return undefined; // Sin transformación (orientación original)
      case "right":
        return { rotate: 0, flipX: true, flipY: false }; // Flip horizontal
      case "up":
        return { rotate: 90, flipX: false, flipY: false }; // Rotar 90° horario (CORREGIDO)
      case "down":
        return { rotate: -90, flipX: false, flipY: false }; // Rotar 90° antihorario (CORREGIDO)
    }
  }

  return undefined;
}

// Función para determinar el tipo de curva basado en las direcciones de entrada y salida
function getCurveType(
  directionIn: string,
  directionOut: string
): SnakeSegmentType {
  // directionIn: dirección desde el segmento anterior
  // directionOut: dirección hacia el siguiente segmento

  // Mapeo corregido basado en los casos específicos de comportamiento:

  // Casos horizontales con giro:
  if (directionIn === "left" && directionOut === "down") {
    // snake horizontal izquierda + giro abajo: curva debe estar +90° derecha
    return "curva_u_normal_der";
  }
  if (directionIn === "left" && directionOut === "up") {
    // snake horizontal izquierda + giro arriba: curva debe estar -90° izquierda
    return "curva_u_invertida_izq";
  }
  if (directionIn === "right" && directionOut === "up") {
    // snake horizontal derecha + giro arriba: curva debe estar +90° derecha
    return "curva_u_normal_der";
  }
  if (directionIn === "right" && directionOut === "down") {
    // snake horizontal derecha + giro abajo: curva debe estar -90° izquierda
    return "curva_u_invertida_izq";
  }

  // Casos verticales con giro:
  if (directionIn === "up" && directionOut === "right") {
    // snake vertical arriba + giro derecha: curva debe estar +90° derecha
    return "curva_u_normal_der";
  }
  if (directionIn === "up" && directionOut === "left") {
    // snake vertical arriba + giro izquierda: curva debe estar +90° derecha
    return "curva_u_normal_der";
  }
  if (directionIn === "down" && directionOut === "right") {
    // snake vertical abajo + giro derecha: curva debe estar -90° izquierda
    return "curva_u_invertida_izq";
  }
  if (directionIn === "down" && directionOut === "left") {
    // snake vertical abajo + giro izquierda: curva debe estar +90° derecha
    return "curva_u_normal_der";
  }

  // Si no hay cambio de dirección, es cuerpo normal
  return "cuerpo";
}

// Función para actualizar tipos de segmento según el movimiento real de la serpiente
function updateSnakeSegmentTypes(segments: SnakeSegment[]): void {
  if (segments.length < 2) return;

  // La cabeza siempre es cabeza
  if (segments[0]) {
    segments[0].tipo = "cabeza";
  }

  // La cola siempre es cola
  const lastIndex = segments.length - 1;
  if (segments[lastIndex]) {
    segments[lastIndex].tipo = "cola";
  }

  // Actualizar segmentos intermedios
  for (let i = 1; i < segments.length - 1; i++) {
    const current = segments[i];
    const previous = segments[i - 1];
    const next = segments[i + 1];

    if (!current || !previous || !next) continue;

    // Determinar direcciones
    const directionIn = getDirection(previous, current);
    const directionOut = getDirection(current, next);

    // Si las direcciones son iguales, es un segmento recto (cuerpo)
    if (directionIn === directionOut) {
      current.tipo = "cuerpo";
    } else {
      // Si las direcciones son diferentes, es una curva
      current.tipo = getCurveType(directionIn, directionOut);
    }
  }
}

// Función para generar una serpiente de prueba con movimiento circular de 360°
function generateCircularSnake(): SnakeSegment[] {
  const segments: SnakeSegment[] = [];
  const centerX = 200;
  const centerY = 150;
  const radius = 60;
  const segmentCount = 16; // 16 segmentos para formar un círculo

  for (let i = 0; i < segmentCount; i++) {
    const angle = ((i * 360) / segmentCount) * (Math.PI / 180); // Ángulo en radianes
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    let tipo: SnakeSegmentType;
    if (i === 0) {
      tipo = "cabeza";
    } else if (i === segmentCount - 1) {
      tipo = "cola";
    } else if (i % 4 === 2) {
      // Cada 4 segmentos, poner una curva
      tipo = "curva_u_invertida_izq"; // Por ahora usamos una curva básica
    } else {
      tipo = "cuerpo";
    }

    segments.push({ x: Math.round(x), y: Math.round(y), tipo });
  }

  return segments;
}

// Función mejorada de drawSnake que aplica transformaciones direccionales
export function drawSnake(
  snakeSegments: SnakeSegment[],
  renderer: Renderer,
  spriteSheet: HTMLImageElement,
  movementDirection?: string // Nueva parámetro opcional para la dirección de movimiento
) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] Drawing snake with ${snakeSegments.length} segments`);
    console.log(
      `[DEBUG] Sprite sheet dimensions: ${spriteSheet.width}x${spriteSheet.height}`
    );
  }

  for (let i = 0; i < snakeSegments.length; i++) {
    const seg = snakeSegments[i];
    if (!seg) continue; // Verificar que el segmento existe

    const sprite = snakeSprites[seg.tipo as SnakeSegmentType];
    if (!sprite) {
      if (DEBUG_MODE) {
        console.warn(`[DEBUG] No sprite found for tipo: ${seg.tipo}`);
      }
      continue;
    }

    if (!spriteSheet.complete) {
      console.warn(
        `[drawSnake] spriteSheet not complete for segment tipo='${seg.tipo}'`
      );
      continue;
    }

    // Determinar dirección para transformaciones direccionales
    let direction = movementDirection || "right"; // Usar movementDirection directamente, con fallback a "right"

    // Guardar estado del contexto antes de aplicar transformaciones
    renderer.ctx.save();

    // Determinar qué transformación aplicar
    let finalTransform = sprite.transform; // Transformación del sprite (para curvas)

    // Para cabeza, cuerpo y cola, aplicar transformaciones direccionales
    if (seg.tipo === "cabeza" || seg.tipo === "cuerpo" || seg.tipo === "cola") {
      finalTransform = getDirectionalTransform(
        direction,
        seg.tipo as "cabeza" | "cuerpo" | "cola"
      );
    }

    // Aplicar transformaciones si existen
    if (finalTransform) {
      applyTransformations(
        renderer.ctx,
        finalTransform,
        seg.x,
        seg.y,
        sprite.width,
        sprite.height
      );

      // Para sprites transformados, dibujar desde el origen (ya transformado)
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        0,
        0,
        sprite.width,
        sprite.height
      );
    } else {
      // Para sprites sin transformación, dibujar normalmente
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        seg.x,
        seg.y,
        sprite.width,
        sprite.height
      );
    } // Restaurar estado del contexto
    renderer.ctx.restore();

    if (DEBUG_MODE) {
      // Log de cada dibujo
      console.log(
        `[DEBUG] Drew ${seg.tipo} at (${seg.x},${seg.y}) using sprite coords (${sprite.sx},${sprite.sy}) size ${sprite.width}x${sprite.height}`
      );

      // Dibujar marco de debugging alrededor del segmento renderizado
      renderer.ctx.strokeStyle = "#00ff00"; // Verde
      renderer.ctx.lineWidth = 1;
      renderer.ctx.strokeRect(seg.x, seg.y, sprite.width, sprite.height);

      // Etiqueta del tipo de segmento
      renderer.ctx.fillStyle = "#ffffff";
      renderer.ctx.font = "8px monospace";
      renderer.ctx.fillText(seg.tipo, seg.x, seg.y - 2);
    }

    // Siempre mostrar punto rojo en la cabeza para seguimiento de movimiento
    if (seg.tipo === "cabeza") {
      renderer.ctx.fillStyle = "#ff0000";

      // Determinar posición del punto según dirección de movimiento
      let pointX = seg.x;
      let pointY = seg.y;

      switch (direction) {
        case "right":
          pointX = seg.x + sprite.width - 2; // Extremo derecho
          pointY = seg.y + sprite.height / 2 - 1; // Centro vertical
          break;
        case "left":
          pointX = seg.x; // Extremo izquierdo
          pointY = seg.y + sprite.height / 2 - 1; // Centro vertical
          break;
        case "up":
          pointX = seg.x + sprite.width / 2 - 1; // Centro horizontal
          pointY = seg.y; // Extremo superior
          break;
        case "down":
          pointX = seg.x + sprite.width / 2 - 1; // Centro horizontal
          pointY = seg.y + sprite.height - 2; // Extremo inferior
          break;
      }

      renderer.ctx.fillRect(pointX, pointY, 2, 2);
    }
  }

  if (DEBUG_MODE) {
    // Dibujar la imagen completa del sprite sheet escalada en la esquina
    const scale = Math.min(100 / spriteSheet.width, 100 / spriteSheet.height);
    renderer.ctx.drawImage(
      spriteSheet,
      0,
      0, // posición en canvas
      spriteSheet.width * scale,
      spriteSheet.height * scale
    );

    // Marco amarillo alrededor del sprite sheet
    renderer.ctx.strokeStyle = "#ffff00";
    renderer.ctx.lineWidth = 2;
    renderer.ctx.strokeRect(
      0,
      0,
      spriteSheet.width * scale,
      spriteSheet.height * scale
    );

    // Mostrar las áreas de extracción en el sprite sheet con recuadros magenta
    // Mostrar TODOS los tipos de sprites disponibles, no solo los en uso
    const allSpriteTypes: SnakeSegmentType[] = [
      "cabeza",
      "cuerpo",
      "cola",
      "curva_u_invertida_izq",
      "curva_u_invertida_der",
      "curva_u_normal_izq",
      "curva_u_normal_der",
    ];

    allSpriteTypes.forEach((tipo, index) => {
      const sprite = snakeSprites[tipo];
      if (!sprite) return;

      // Calcular posición en el sprite sheet escalado
      const srcX = sprite.sx * scale;
      const srcY = sprite.sy * scale;
      const srcW = sprite.width * scale;
      const srcH = sprite.height * scale;

      // Dibujar recuadro magenta en el sprite sheet
      renderer.ctx.strokeStyle = "#ff00ff"; // Magenta
      renderer.ctx.lineWidth = 1;
      renderer.ctx.strokeRect(srcX, srcY, srcW, srcH);

      // Etiqueta en el sprite sheet con numeración
      renderer.ctx.fillStyle = "#ff00ff";
      renderer.ctx.font = "6px monospace";
      renderer.ctx.fillText((index + 1).toString(), srcX, srcY - 1);
    });

    // Etiqueta del sprite sheet
    renderer.ctx.fillStyle = "#ffffff";
    renderer.ctx.font = "10px monospace";
    renderer.ctx.fillText("Sprite Sheet", 2, spriteSheet.height * scale + 12);

    // Mostrar sprites extraídos individualmente para verificación
    drawExtractedSprites(snakeSegments, renderer, spriteSheet);
  }
}

// Función para mostrar sprites extraídos individualmente para verificación
function drawExtractedSprites(
  snakeSegments: SnakeSegment[],
  renderer: Renderer,
  spriteSheet: HTMLImageElement
) {
  if (!DEBUG_MODE) return;

  // Mover a una posición que no sobresalga del canvas
  const startX = 10;
  const startY = 350; // Más abajo para no interferir con el juego
  const spacing = 55; // Más espacio entre sprites para evitar superposición

  renderer.ctx.fillStyle = "#ffffff";
  renderer.ctx.font = "10px monospace";
  renderer.ctx.fillText(
    "Sprites Extraídos (con transformaciones aplicadas):",
    startX,
    startY
  );

  // Mostrar TODOS los tipos de sprites disponibles, no solo los en uso
  const allSpriteTypes: SnakeSegmentType[] = [
    "cabeza",
    "cuerpo",
    "cola",
    "curva_u_invertida_izq",
    "curva_u_invertida_der",
    "curva_u_normal_izq",
    "curva_u_normal_der",
  ];

  allSpriteTypes.forEach((tipo, index) => {
    const sprite = snakeSprites[tipo];
    if (!sprite) return;

    const x = startX + index * spacing;
    const y = startY + 15;

    // Guardar estado del contexto para aplicar transformaciones
    renderer.ctx.save();

    // Aplicar transformaciones si existen
    if (sprite.transform) {
      applyTransformations(
        renderer.ctx,
        sprite.transform,
        x,
        y,
        sprite.width * 1.5,
        sprite.height * 1.5
      );

      // Dibujar el sprite transformado escalado 1.5x para mejor visualización
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        0,
        0,
        sprite.width * 1.5,
        sprite.height * 1.5
      );
    } else {
      // Dibujar el sprite sin transformación escalado 1.5x
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        x,
        y,
        sprite.width * 1.5,
        sprite.height * 1.5
      );
    }

    // Restaurar estado del contexto
    renderer.ctx.restore();

    // Marco alrededor del sprite extraído (dibujado después de restaurar)
    renderer.ctx.strokeStyle = "#ff00ff";
    renderer.ctx.lineWidth = 1;
    renderer.ctx.strokeRect(x, y, sprite.width * 1.5, sprite.height * 1.5);

    // Etiqueta mejorada con información de transformación
    renderer.ctx.fillStyle = "#ffffff";
    renderer.ctx.font = "7px monospace";

    // Etiqueta principal más corta
    const shortLabel = tipo.replace("curva_u_", "c_").replace("_", "");
    renderer.ctx.fillText(shortLabel, x, y + sprite.height * 1.5 + 10);

    // Información de transformación si existe
    if (sprite.transform) {
      const transformInfo = [];
      if (sprite.transform.flipX) transformInfo.push("flipX");
      if (sprite.transform.flipY) transformInfo.push("flipY");
      if (sprite.transform.rotate !== 0)
        transformInfo.push(`${sprite.transform.rotate}°`);

      if (transformInfo.length > 0) {
        renderer.ctx.fillStyle = "#ffff00"; // Amarillo para transformaciones
        renderer.ctx.fillText(
          transformInfo.join(","),
          x,
          y + sprite.height * 1.5 + 20
        );
      }
    }
  });
}

// Simulación básica de juego para los tests E2E
class SimpleGameSimulation {
  private uiManager: UIManager;
  private renderer: Renderer;
  private gameLoop: GameLoop | null = null;
  private score = 0;
  private isGameRunning = false;
  private gameOverTimer: number | null = null;
  private useCircularSnake = false; // Flag para alternar entre serpientes

  // Posiciones iniciales perfectamente conectadas:
  // Cabeza: x=90..107 (18px)
  // Cuerpo: x=72..89 (18px)
  // Cola:   x=56..71 (16px)
  private snakeSegments: SnakeSegment[] = [
    { x: 90, y: 48, tipo: "cabeza" }, // Cabeza al frente (90 a 107)
    { x: 72, y: 48, tipo: "cuerpo" }, // Cuerpo conectado (72 a 89)
    { x: 56, y: 48, tipo: "cola" }, // Cola atrás (56 a 71)
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

        // Tecla 'C' para alternar entre serpiente normal y circular
        if (e.key === "c" || e.key === "C") {
          this.toggleSnakeType();
        }
      }
    });
  }

  private toggleSnakeType() {
    this.useCircularSnake = !this.useCircularSnake;
    if (this.useCircularSnake) {
      this.snakeSegments = generateCircularSnake();
      console.log("[DEBUG] Switched to circular snake for 360° rotation test");
    } else {
      // Resetear a serpiente básica CORREGIDA
      this.snakeSegments = [
        { x: 90, y: 48, tipo: "cabeza" }, // Cabeza al frente (90 a 107)
        { x: 72, y: 48, tipo: "cuerpo" }, // Cuerpo conectado (72 a 89)
        { x: 56, y: 48, tipo: "cola" }, // Cola atrás (56 a 71)
      ];
      console.log("[DEBUG] Switched to normal snake");
    }
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
            drawSnake(
              this.snakeSegments,
              this.renderer,
              snakeImg,
              this.movementDirection
            );
          }
          // Dibujar información de debugging
          drawDebugInfo(this.renderer);
        }
      }
    );

    this.gameLoop.start();
  }

  private lastDirection: string = "ArrowRight";
  private movementDirection: string = "right"; // Dirección para orientación de sprites

  private handleMovement(direction: string) {
    // --- NUEVA LÓGICA DE SLOTS IGUALES EN EJE X ---

    const SPRITE_WIDTHS = [
      SPRITE_WIDTH_CABEZA,
      SPRITE_WIDTH_CUERPO,
      SPRITE_WIDTH_COLA,
    ];
    const SLOT_WIDTH = 18; // Mantener slot de 18px para cabeza y cuerpo, la cola se ajusta visualmente

    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(direction)
    ) {
      this.lastDirection = direction;
      switch (direction) {
        case "ArrowUp":
          this.movementDirection = "up";
          break;
        case "ArrowDown":
          this.movementDirection = "down";
          break;
        case "ArrowLeft":
          this.movementDirection = "left";
          break;
        case "ArrowRight":
          this.movementDirection = "right";
          break;
      }
    }

    // --- Movimiento horizontal con slots ---
    if (
      (this.lastDirection === "ArrowLeft" ||
        this.lastDirection === "ArrowRight") &&
      this.snakeSegments[0]
    ) {
      const dir = this.lastDirection === "ArrowRight" ? 1 : -1;
      let baseSlotX = this.snakeSegments[0].x + dir * SLOT_WIDTH;
      let baseY = this.snakeSegments[0].y;
      for (let i = 0; i < this.snakeSegments.length; i++) {
        const spriteW = SPRITE_WIDTHS[i] || SPRITE_WIDTH_CUERPO;
        let xPos = Math.round(baseSlotX - spriteW / 2 + SLOT_WIDTH / 2);
        // Si es la cola, compensar la diferencia de ancho (slot 18px, cola 16px)
        if (
          i === this.snakeSegments.length - 1 &&
          spriteW === SPRITE_WIDTH_COLA
        ) {
          // Ajustar +1px si vamos a la derecha, -1px si vamos a la izquierda
          xPos += dir * 1;
        }
        if (this.snakeSegments[i] !== undefined) {
          this.snakeSegments[i]!.x = xPos;
          this.snakeSegments[i]!.y = baseY;
        }
        baseSlotX -= dir * SLOT_WIDTH;
      }
    } else if (this.snakeSegments[0]) {
      // Movimiento vertical clásico (mantener X, mover Y por TILE_SIZE)
      const dir = this.lastDirection === "ArrowDown" ? 1 : -1;
      let baseX = this.snakeSegments[0].x;
      let baseSlotY = this.snakeSegments[0].y + dir * TILE_SIZE;
      for (let i = 0; i < this.snakeSegments.length; i++) {
        if (this.snakeSegments[i] !== undefined) {
          this.snakeSegments[i]!.x = baseX;
          this.snakeSegments[i]!.y = baseSlotY;
        }
        baseSlotY -= dir * TILE_SIZE;
      }
    }

    // Actualizar tipos de segmento basado en posiciones reales
    updateSnakeSegmentTypes(this.snakeSegments);

    console.log(
      "[DEBUG] Snake segments after movement (SLOTS):",
      this.snakeSegments.map((s) => `${s.tipo} at (${s.x},${s.y})`)
    );

    // Verificar colisión con bordes del canvas
    const headSegment = this.snakeSegments[0];
    if (headSegment) {
      const canvasWidth = 800;
      const canvasHeight = 600;
      if (
        headSegment.x < 0 ||
        headSegment.x >= canvasWidth ||
        headSegment.y < 0 ||
        headSegment.y >= canvasHeight
      ) {
        console.log(
          `[DEBUG] Collision detected! Head at (${headSegment.x}, ${headSegment.y}), Canvas size: ${canvasWidth}x${canvasHeight}`
        );
        this.triggerGameOver();
        return;
      }
    }

    // Incrementar score por movimiento
    this.score += 10;
    this.uiManager.updateScore(this.score);
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
    await AssetLoader.loadImage(
      "snake",
      "/assets/images/snake-sprite-65x16.png"
    );
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
