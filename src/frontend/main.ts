import { AssetLoader } from "./AssetLoader.js";
import { Renderer } from "./Renderer.js";
import { AudioManager } from "./AudioManager.js";
import { GameLoop } from "./GameLoop.js";
import { UIManager } from "./UIManager.js";
import {
  advanceSnakePath,
  classifySnakePath,
  createSnakePath,
  SnakeDirection,
  SnakePathState,
} from "./SnakePath.js";

const TILE_SIZE = 16;
const DEBUG_MODE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("debug") === "1";

// Dimensiones de sprites
const SPRITE_HEIGHT = 16;
const SPRITE_WIDTH_CABEZA = 18; // cabeza (ajustado a 18px)
const SPRITE_WIDTH_CUERPO = 18; // cuerpo (ajustado a 18px)
const SPRITE_WIDTH_COLA = 16; // cola (ajustado a 16px)
const SPRITE_WIDTH_CURVA = 12; // curva (ajustado a 12px)
const SNAKE_STEP = 48;

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
    connectionPoints: [
      { x: SPRITE_WIDTH_CURVA / 2, y: SPRITE_HEIGHT },
      { x: SPRITE_WIDTH_CURVA, y: 4 },
    ],
    transform: { rotate: 0, flipX: false, flipY: false },
  },
  curva_u_invertida_der: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    connectionPoints: [
      { x: SPRITE_WIDTH_CURVA / 2, y: SPRITE_HEIGHT },
      { x: SPRITE_WIDTH_CURVA, y: 4 },
    ],
    transform: { rotate: 0, flipX: true, flipY: false },
  },
  curva_u_normal_izq: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    connectionPoints: [
      { x: SPRITE_WIDTH_CURVA, y: 4 },
      { x: SPRITE_WIDTH_CURVA / 2, y: SPRITE_HEIGHT },
    ],
    transform: { rotate: 270, flipX: false, flipY: false },
  },
  curva_u_normal_der: {
    sx: 52,
    sy: 0,
    width: SPRITE_WIDTH_CURVA,
    height: SPRITE_HEIGHT,
    connectionPoints: [
      { x: SPRITE_WIDTH_CURVA, y: 4 },
      { x: SPRITE_WIDTH_CURVA / 2, y: SPRITE_HEIGHT },
    ],
    transform: { rotate: 90, flipX: true, flipY: false },
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
  connectionPoints?: [{ x: number; y: number }, { x: number; y: number }];
}

export interface SnakeSegment {
  x: number;
  y: number;
  tipo: SnakeSegmentType;
  direction?: SnakeDirection;
  incoming?: SnakeDirection;
  outgoing?: SnakeDirection;
}

const canonicalCurveConnectionPoints: [
  { x: number; y: number },
  { x: number; y: number },
] = [
  { x: 0, y: TILE_SIZE / 2 }, // Punto A: Conecta a la Izquierda
  { x: TILE_SIZE / 2, y: 0 }, // Punto B: Conecta Arriba
];

function getCurveTransformForDirections(
  segment: SnakeSegment,
  sprite: SpriteConfig,
):
  | {
      transform: NonNullable<SpriteConfig["transform"]>;
      connectionPoints: typeof canonicalCurveConnectionPoints;
    }
  | undefined {
  if (!segment.incoming || !segment.outgoing) return undefined;

  const turn = `${segment.incoming}:${segment.outgoing}`;
  let transform: NonNullable<SpriteConfig["transform"]>;

  // El sprite base conecta visualmente Izquierda y Arriba.
  switch (turn) {
    // Conecta Izquierda y Arriba
    case "right:up":
    case "down:left":
      transform = { rotate: 0, flipX: false, flipY: false };
      break;

    // Conecta Derecha y Arriba
    case "left:up":
    case "down:right":
      transform = { rotate: 0, flipX: true, flipY: false };
      break;

    // Conecta Izquierda y Abajo
    case "right:down":
    case "up:left":
      transform = { rotate: 0, flipX: false, flipY: true };
      break;

    // Conecta Derecha y Abajo
    case "left:down":
    case "up:right":
      transform = { rotate: 0, flipX: true, flipY: true };
      break;

    default:
      return undefined;
  }

  return { transform, connectionPoints: canonicalCurveConnectionPoints };
}

function getDebugSegmentLabel(type: SnakeSegmentType): string {
  const labels: Record<SnakeSegmentType, string> = {
    cabeza: "H",
    cuerpo: "B",
    cola: "T",
    curva_u_invertida_izq: "C1",
    curva_u_invertida_der: "C2",
    curva_u_normal_izq: "C3",
    curva_u_normal_der: "C4",
  };

  return labels[type];
}

function getTransformedConnectionPoint(
  segment: SnakeSegment,
  sprite: SpriteConfig,
  point: { x: number; y: number },
  scale: number,
): { x: number; y: number } {
  const centerX = segment.x + (sprite.width * scale) / 2;
  const centerY = segment.y + (sprite.height * scale) / 2;
  const localX = point.x * scale - (sprite.width * scale) / 2;
  const localY = point.y * scale - (sprite.height * scale) / 2;
  const flippedX = sprite.transform?.flipX ? -localX : localX;
  const flippedY = sprite.transform?.flipY ? -localY : localY;
  const angle = ((sprite.transform?.rotate ?? 0) * Math.PI) / 180;

  return {
    x: centerX + flippedX * Math.cos(angle) - flippedY * Math.sin(angle),
    y: centerY + flippedX * Math.sin(angle) + flippedY * Math.cos(angle),
  };
}

function drawDebugConnectionGuide(
  renderer: Renderer,
  point: { x: number; y: number },
  expected: { x: number; y: number },
  color: string,
) {
  renderer.ctx.beginPath();
  renderer.ctx.strokeStyle = color;
  renderer.ctx.lineWidth = 2;
  renderer.ctx.moveTo(point.x, point.y);
  renderer.ctx.lineTo(expected.x, expected.y);
  renderer.ctx.stroke();
  renderer.ctx.fillStyle = color;
  renderer.ctx.fillRect(expected.x - 5, expected.y - 5, 10, 10);
}

// Función de ayuda para debugging
function drawDebugInfo(renderer: Renderer) {
  if (!DEBUG_MODE) return;

  // Panel de información de debugging - movido a esquina superior derecha
  const panelWidth = 250;
  const panelHeight = 230;
  const panelX = renderer.ctx.canvas.width - panelWidth - 10;
  const panelY = 10;

  // Fondo semi-transparente para el panel
  renderer.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  renderer.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  // Borde del panel
  renderer.ctx.lineWidth = 1;
  renderer.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  // Texto de información - restaurado a tamaño legible
  renderer.ctx.fillStyle = "#ffffff";
  renderer.ctx.font = "10px monospace";
  let y = panelY + 15;
  const line = 15;
  renderer.ctx.fillText("DEBUG MODE: ON", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Canvas: 65x16px", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Cabeza: 18x16", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Cuerpo: 18x16", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Cola: 16x16", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Curva: 12x16", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Curvas usan transf.", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Verde: Segmentos", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Magenta: Fuente", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Rojo: Cabeza", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Amarillo: Sheet", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("C: Circular", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Flechas: Mover", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Conexion A: Rojo", panelX + 5, y);
  y += line;
  renderer.ctx.fillText("Conexion B: Azul", panelX + 5, y);
}

// Función para aplicar transformaciones de canvas con escalado
function applyTransformations(
  ctx: CanvasRenderingContext2D,
  transform: { rotate: number; flipX: boolean; flipY: boolean } | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number = 1,
) {
  if (!transform) return;

  // EL SECRETO: Pivotar SIEMPRE sobre el centro del Tile lógico (16x16)
  const centerX = x + (TILE_SIZE * scale) / 2;
  const centerY = y + (TILE_SIZE * scale) / 2;

  ctx.translate(centerX, centerY);

  if (transform.rotate !== 0) {
    ctx.rotate((transform.rotate * Math.PI) / 180);
  }

  const scaleX = transform.flipX ? -1 : 1;
  const scaleY = transform.flipY ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Trasladar de vuelta al origen del Tile
  ctx.translate(-(TILE_SIZE * scale) / 2, -(TILE_SIZE * scale) / 2);
}

// Función para obtener las transformaciones basadas en la dirección
function getDirectionalTransform(
  direction: string,
  segmentType: "cabeza" | "cuerpo" | "cola",
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
export function getCurveType(
  directionIn: string,
  directionOut: string,
): SnakeSegmentType {
  const turnKey = `${directionIn}:${directionOut}`;
  const curveByTurn: Record<string, SnakeSegmentType> = {
    "up:right": "curva_u_normal_izq",
    "right:up": "curva_u_normal_der",
    "right:down": "curva_u_invertida_der",
    "down:right": "curva_u_invertida_der",
    "down:left": "curva_u_normal_der",
    "left:down": "curva_u_normal_der",
    "left:up": "curva_u_invertida_izq",
    "up:left": "curva_u_invertida_der",
  };

  return curveByTurn[turnKey] ?? "cuerpo";
}

// Función para generar una serpiente de prueba con movimiento circular de 360°
function generateCircularSnake(): SnakeSegment[] {
  const segments: SnakeSegment[] = [];
  // Centrar en el canvas (1200x800)
  const centerX = 600;
  const centerY = 400;
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
  movementDirection?: string, // Nueva parámetro opcional para la dirección de movimiento
) {
  if (
    DEBUG_MODE &&
    typeof renderer.ctx.fillRect === "function" &&
    typeof renderer.ctx.strokeRect === "function" &&
    typeof renderer.ctx.fillText === "function" &&
    Number.isFinite(spriteSheet.width) &&
    Number.isFinite(spriteSheet.height) &&
    spriteSheet.width > 0 &&
    spriteSheet.height > 0
  ) {
    console.log(`[DEBUG] Drawing snake with ${snakeSegments.length} segments`);
    console.log(
      `[DEBUG] Sprite sheet dimensions: ${spriteSheet.width}x${spriteSheet.height}`,
    );
  }

  for (let i = 0; i < snakeSegments.length; i++) {
    const seg = snakeSegments[i];
    if (!seg) continue; // Verificar que el segmento existe

    const sprite =
      snakeSprites[seg.tipo as SnakeSegmentType] ??
      (seg.tipo === ("curva_bl" as SnakeSegmentType)
        ? snakeSprites.curva_u_invertida_izq
        : seg.tipo === ("curva_br" as SnakeSegmentType)
          ? snakeSprites.curva_u_invertida_der
          : undefined);
    if (!sprite) {
      if (DEBUG_MODE) {
        console.warn(`[DEBUG] No sprite found for tipo: ${seg.tipo}`);
      }
      continue;
    }

    const renderX = seg.x;
    const renderY = seg.y;

    // El fondo de inspección solo debe aparecer en modo diagnóstico.
    const scale = 3;
    if (DEBUG_MODE && typeof renderer.ctx.fillRect === "function") {
      renderer.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      renderer.ctx.fillRect(
        renderX - 2,
        renderY - 2,
        sprite.width * scale + 4,
        sprite.height * scale + 4,
      );
    }

    if (spriteSheet.complete === false) {
      console.warn(
        `[drawSnake] spriteSheet not complete for segment tipo='${seg.tipo}'`,
      );
      continue;
    }

    // Determinar dirección para transformaciones direccionales
    const direction = seg.direction || movementDirection || "right";

    // Guardar estado del contexto antes de aplicar transformaciones
    const canTransform =
      typeof renderer.ctx.save === "function" &&
      typeof renderer.ctx.restore === "function";
    if (canTransform) renderer.ctx.save();

    // Determinar qué transformación aplicar
    let finalTransform = sprite.transform;
    let connectionPoints = sprite.connectionPoints;
    const curveRenderData = getCurveTransformForDirections(seg, sprite);
    if (curveRenderData) {
      finalTransform = curveRenderData.transform;
      connectionPoints = curveRenderData.connectionPoints;
    }

    // Para cabeza, cuerpo y cola, aplicar transformaciones direccionales
    if (seg.tipo === "cabeza" || seg.tipo === "cuerpo" || seg.tipo === "cola") {
      finalTransform = getDirectionalTransform(
        direction,
        seg.tipo as "cabeza" | "cuerpo" | "cola",
      );
    }

    // Aplicar transformaciones si existen
    if (finalTransform && canTransform) {
      applyTransformations(
        renderer.ctx,
        finalTransform,
        renderX,
        renderY,
        sprite.width,
        sprite.height,
        scale, // Pasar el escalado a la función de transformaciones
      );

      // El contexto ya está trasladado al origen local del segmento.
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        0,
        0,
        sprite.width * scale,
        sprite.height * scale,
      );

      if (DEBUG_MODE && connectionPoints) {
        const connectionColors = ["#ff3333", "#33aaff"];
        const [headPoint, tailPoint] = connectionPoints;
        if (headPoint && tailPoint) {
          renderer.ctx.beginPath();
          renderer.ctx.strokeStyle = "#ffe45c";
          renderer.ctx.lineWidth = 2;
          renderer.ctx.moveTo(headPoint.x * scale, headPoint.y * scale);
          renderer.ctx.lineTo(tailPoint.x * scale, tailPoint.y * scale);
          renderer.ctx.stroke();
        }

        connectionPoints.forEach((point, index) => {
          const markerX = point.x * scale;
          const markerY = point.y * scale;
          renderer.ctx.fillStyle = connectionColors[index] ?? "#ffffff";
          renderer.ctx.fillStyle = "#000000";
          renderer.ctx.fillRect(markerX - 7, markerY - 7, 14, 14);
          renderer.ctx.fillStyle = connectionColors[index] ?? "#ffffff";
          renderer.ctx.fillRect(markerX - 5, markerY - 5, 10, 10);
          renderer.ctx.fillStyle = "#ffffff";
          renderer.ctx.font = "bold 10px monospace";
          renderer.ctx.fillText(
            index === 0 ? "A" : "B",
            markerX + 7,
            markerY - 7,
          );
        });
      }
    } else {
      // Para sprites sin transformación, dibujar normalmente - escalado 3x para mejor visibilidad
      const scale = 3; // Escalar 3x para hacer la serpiente más visible
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        renderX,
        renderY,
        sprite.width * scale,
        sprite.height * scale,
      );
    } // Restaurar estado del contexto
    if (canTransform) renderer.ctx.restore();

    if (
      DEBUG_MODE &&
      connectionPoints &&
      i > 0 &&
      i < snakeSegments.length - 1
    ) {
      const previous = snakeSegments[i - 1];
      const next = snakeSegments[i + 1];
      if (previous && next) {
        const actualHeadPoint = getTransformedConnectionPoint(
          { ...seg, x: renderX, y: renderY },
          { ...sprite, transform: finalTransform },
          connectionPoints[0],
          scale,
        );
        const actualTailPoint = getTransformedConnectionPoint(
          { ...seg, x: renderX, y: renderY },
          { ...sprite, transform: finalTransform },
          connectionPoints[1],
          scale,
        );
        const expectedHeadPoint = {
          x: (seg.x + previous.x) / 2,
          y: (seg.y + previous.y) / 2,
        };
        const expectedTailPoint = {
          x: (seg.x + next.x) / 2,
          y: (seg.y + next.y) / 2,
        };

        drawDebugConnectionGuide(
          renderer,
          actualHeadPoint,
          expectedHeadPoint,
          "#ff8c00",
        );
        drawDebugConnectionGuide(
          renderer,
          actualTailPoint,
          expectedTailPoint,
          "#b56cff",
        );
      }
    }

    if (DEBUG_MODE) {
      // Log de cada dibujo
      console.log(
        `[DEBUG] Drew ${seg.tipo} at (${seg.x},${seg.y}) using sprite coords (${sprite.sx},${sprite.sy}) size ${sprite.width}x${sprite.height}`,
      );

      // Dibujar marco de debugging alrededor del segmento renderizado - ajustado para escala 3x
      const scale = 3;
      if (typeof renderer.ctx.strokeRect === "function") {
        renderer.ctx.strokeStyle = "#00ff00";
        renderer.ctx.lineWidth = 1;
        renderer.ctx.strokeRect(
          renderX,
          renderY,
          sprite.width * scale,
          sprite.height * scale,
        );
      }

      if (typeof renderer.ctx.fillText === "function") {
        renderer.ctx.fillStyle = "#ffffff";
        renderer.ctx.font = "10px monospace";
        renderer.ctx.fillText(
          getDebugSegmentLabel(seg.tipo),
          renderX + 2,
          renderY - 4,
        );
      }
    }

    // Siempre mostrar punto rojo en la cabeza para seguimiento de movimiento
    if (seg.tipo === "cabeza") {
      if (typeof renderer.ctx.fillRect !== "function") continue;
      renderer.ctx.fillStyle = "#ff0000";

      // Determinar posición del punto según dirección de movimiento - ajustado para escala 3x
      const scale = 3;
      let pointX = seg.x;
      let pointY = seg.y;

      switch (direction) {
        case "right":
          pointX = seg.x + sprite.width * scale - 4; // Extremo derecho escalado
          pointY = seg.y + (sprite.height * scale) / 2 - 2; // Centro vertical escalado
          break;
        case "left":
          pointX = seg.x; // Extremo izquierdo
          pointY = seg.y + (sprite.height * scale) / 2 - 2; // Centro vertical escalado
          break;
        case "up":
          pointX = seg.x + (sprite.width * scale) / 2 - 2; // Centro horizontal escalado
          pointY = seg.y; // Extremo superior
          break;
        case "down":
          pointX = seg.x + (sprite.width * scale) / 2 - 2; // Centro horizontal escalado
          pointY = seg.y + sprite.height * scale - 4; // Extremo inferior escalado
          break;
      }

      renderer.ctx.fillRect(pointX, pointY, 4, 4); // Punto más grande para mayor visibilidad
    }
  }

  if (
    DEBUG_MODE &&
    typeof renderer.ctx.fillRect === "function" &&
    typeof renderer.ctx.strokeRect === "function" &&
    typeof renderer.ctx.fillText === "function" &&
    Number.isFinite(spriteSheet.width) &&
    Number.isFinite(spriteSheet.height) &&
    spriteSheet.width > 0 &&
    spriteSheet.height > 0
  ) {
    // Dibujar la imagen completa del sprite sheet escalada con mejor dimensionamiento
    const targetSize = 400; // Aumentar el tamaño objetivo para mejor visibilidad
    const scale = Math.min(
      targetSize / spriteSheet.width,
      targetSize / spriteSheet.height,
    );
    const sheetWidth = spriteSheet.width * scale;
    const sheetHeight = spriteSheet.height * scale;

    // Posicionar en la esquina superior izquierda con margen
    const sheetX = 10;
    const sheetY = 10;

    // Fondo semi-transparente para el sprite sheet
    renderer.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    renderer.ctx.fillRect(
      sheetX - 5,
      sheetY - 5,
      sheetWidth + 10,
      sheetHeight + 10,
    );

    renderer.ctx.drawImage(
      spriteSheet,
      sheetX,
      sheetY,
      sheetWidth,
      sheetHeight,
    );

    // Marco amarillo alrededor del sprite sheet
    renderer.ctx.strokeStyle = "#ffff00";
    renderer.ctx.lineWidth = 2;
    renderer.ctx.strokeRect(sheetX, sheetY, sheetWidth, sheetHeight);

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

      // Calcular posición en el sprite sheet escalado con offset
      const srcX = sheetX + sprite.sx * scale;
      const srcY = sheetY + sprite.sy * scale;
      const srcW = sprite.width * scale;
      const srcH = sprite.height * scale;

      // Dibujar recuadro magenta en el sprite sheet - más sutil
      renderer.ctx.strokeStyle = "#ff00ff60"; // Magenta con transparencia (60 = 37% opacidad)
      renderer.ctx.lineWidth = 0.5; // Línea más delgada
      renderer.ctx.strokeRect(srcX, srcY, srcW, srcH);

      // Etiquetas mejoradas en el sprite sheet con dimensiones
      renderer.ctx.fillStyle = "#ff00ff";
      renderer.ctx.font = "10px monospace";

      // Número del sprite
      renderer.ctx.fillText((index + 1).toString(), srcX, srcY - 2);

      // Dimensiones del sprite en una línea debajo
      const dimensions = `${sprite.width}x${sprite.height}px`;
      renderer.ctx.fillStyle = "#ffffff";
      renderer.ctx.font = "8px monospace";
      renderer.ctx.fillText(dimensions, srcX, srcY + srcH + 12);
    });

    // Etiqueta del sprite sheet con título y leyenda de dimensiones
    renderer.ctx.fillStyle = "#ffffff";
    renderer.ctx.font = "20px monospace";
    renderer.ctx.fillText("Sprite Sheet", sheetX, sheetY + sheetHeight + 24);

    // Leyenda de dimensiones por tipo de sprite
    renderer.ctx.font = "12px monospace";
    renderer.ctx.fillStyle = "#cccccc";
    const legendY = sheetY + sheetHeight + 50;
    renderer.ctx.fillText("Dimensiones:", sheetX, legendY);
    renderer.ctx.fillText(
      `Cabeza: ${SPRITE_WIDTH_CABEZA}x${SPRITE_HEIGHT}px`,
      sheetX,
      legendY + 15,
    );
    renderer.ctx.fillText(
      `Cuerpo: ${SPRITE_WIDTH_CUERPO}x${SPRITE_HEIGHT}px`,
      sheetX,
      legendY + 30,
    );
    renderer.ctx.fillText(
      `Cola: ${SPRITE_WIDTH_COLA}x${SPRITE_HEIGHT}px`,
      sheetX,
      legendY + 45,
    );
    renderer.ctx.fillText(
      `Curva: ${SPRITE_WIDTH_CURVA}x${SPRITE_HEIGHT}px`,
      sheetX,
      legendY + 60,
    );

    // Mostrar sprites extraídos individualmente para verificación
    drawExtractedSprites(renderer, spriteSheet);
  }
}

// Función para mostrar sprites extraídos individualmente para verificación
function drawExtractedSprites(
  renderer: Renderer,
  spriteSheet: HTMLImageElement,
) {
  if (!DEBUG_MODE) return;

  // Centrar la sección de sprites extraídos en la parte inferior del canvas - triplicar espaciado
  const spacing = 165; // Triplicado para sprites más grandes
  const totalWidth = spacing * 7;
  const startX = (renderer.ctx.canvas.width - totalWidth) / 2;
  const startY = renderer.ctx.canvas.height - 250; // Más espacio para sprites grandes

  renderer.ctx.fillStyle = "#ffffff";
  renderer.ctx.font = "20px monospace"; // Duplicar fuente del título
  renderer.ctx.fillText(
    "Sprites Extraídos (con transformaciones aplicadas):",
    startX,
    startY,
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
    const y = startY + 30; // Más espacio para el título más grande
    const previewScale = 4.5;
    const previewWidth = sprite.width * previewScale;
    const previewHeight = sprite.height * previewScale;
    const centerX = x + previewWidth / 2;
    const centerY = y + previewHeight / 2;

    // Guardar estado del contexto para aplicar transformaciones
    renderer.ctx.save();

    // Aplicar transformaciones si existen
    if (sprite.transform) {
      renderer.ctx.translate(centerX, centerY);
      renderer.ctx.rotate((sprite.transform.rotate * Math.PI) / 180);
      renderer.ctx.scale(
        sprite.transform.flipX ? -1 : 1,
        sprite.transform.flipY ? -1 : 1,
      );

      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        -previewWidth / 2,
        -previewHeight / 2,
        previewWidth,
        previewHeight,
      );
    } else {
      renderer.ctx.drawImage(
        spriteSheet,
        sprite.sx,
        sprite.sy,
        sprite.width,
        sprite.height,
        x,
        y,
        previewWidth,
        previewHeight,
      );
    }

    if (DEBUG_MODE && sprite.connectionPoints) {
      const connectionColors = ["#ff3333", "#33aaff"];
      sprite.connectionPoints.forEach((point, pointIndex) => {
        renderer.ctx.fillStyle = connectionColors[pointIndex] ?? "#ffffff";
        const pointX = point.x * previewScale - previewWidth / 2;
        const pointY = point.y * previewScale - previewHeight / 2;
        renderer.ctx.fillRect(pointX - 3, pointY - 3, 6, 6);
      });
    }

    // Restaurar estado del contexto
    renderer.ctx.restore();

    const isQuarterTurn =
      sprite.transform &&
      (sprite.transform.rotate === 90 ||
        sprite.transform.rotate === 270 ||
        sprite.transform.rotate === -90);
    const frameWidth = isQuarterTurn ? previewHeight : previewWidth;
    const frameHeight = isQuarterTurn ? previewWidth : previewHeight;
    const frameX = centerX - frameWidth / 2;
    const frameY = centerY - frameHeight / 2;

    // Marco alrededor del sprite extraído - marco más sutil y ajustado
    renderer.ctx.strokeStyle = "#ff00ff40"; // Magenta con transparencia (40 = 25% opacidad)
    renderer.ctx.lineWidth = 0.5; // Línea más delgada para no dominar visualmente
    renderer.ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

    // Etiqueta mejorada con información de transformación - duplicar fuente
    renderer.ctx.fillStyle = "#ffffff";
    renderer.ctx.font = "14px monospace";

    // Etiqueta principal más corta
    const shortLabel = tipo.replace("curva_u_", "c_").replace("_", "");
    renderer.ctx.fillText(shortLabel, x, y + sprite.height * 4.5 + 20);

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
          y + sprite.height * 4.5 + 40,
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
  private useCircularSnake = false; // Flag para alternar entre serpientes

  private snakePath: SnakePathState = createSnakePath(
    [
      { x: 600, y: 400 },
      { x: 552, y: 400 },
      { x: 504, y: 400 },
    ],
    "right",
  );
  private snakeSegments: SnakeSegment[] = this.buildSnakeSegments();

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.uiManager = new UIManager();
    this.setupGameEvents();
  }

  private buildSnakeSegments(): SnakeSegment[] {
    return classifySnakePath(this.snakePath).map((segment) => ({
      x: segment.x,
      y: segment.y,
      direction: segment.direction,
      incoming: segment.incoming,
      outgoing: segment.outgoing,
      tipo:
        segment.type === "head"
          ? "cabeza"
          : segment.type === "tail"
            ? "cola"
            : segment.type === "corner" && segment.incoming && segment.outgoing
              ? getCurveType(segment.incoming, segment.outgoing)
              : "cuerpo",
    }));
  }

  private resetSnakePath() {
    this.snakePath = createSnakePath(
      [
        { x: 600, y: 400 },
        { x: 552, y: 400 },
        { x: 504, y: 400 },
      ],
      "right",
    );
    this.snakeSegments = this.buildSnakeSegments();
    this.movementDirection = "right";
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
      this.snakePath = createSnakePath(
        this.snakeSegments.map(({ x, y }) => ({ x, y })),
        "right",
      );
      console.log("[DEBUG] Switched to circular snake for 360° rotation test");
    } else {
      this.resetSnakePath();
      console.log("[DEBUG] Switched to normal snake (centered)");
    }
  }

  private startGameSimulation() {
    this.resetSnakePath();
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
              this.movementDirection,
            );
          }
          // Dibujar información de debugging
          drawDebugInfo(this.renderer);
        }
      },
    );

    this.gameLoop.start();
  }

  private movementDirection: SnakeDirection = "right";

  private handleMovement(direction: string) {
    const directionByKey: Record<string, SnakeDirection> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const requestedDirection = directionByKey[direction];
    if (!requestedDirection) return;

    this.snakePath = advanceSnakePath(
      this.snakePath,
      requestedDirection,
      SNAKE_STEP,
      24,
    );
    this.movementDirection = this.snakePath.direction;
    this.snakeSegments = this.buildSnakeSegments();

    if (DEBUG_MODE) {
      console.log(
        "[DEBUG][movement]",
        JSON.stringify({
          requestedDirection,
          direction: this.snakePath.direction,
          segments: this.snakeSegments.map(
            ({ x, y, tipo, direction: segmentDirection }) => ({
              x,
              y,
              tipo,
              direction: segmentDirection,
            }),
          ),
        }),
      );
    }

    // Verificar colisión con bordes del canvas - actualizado para nuevo tamaño
    const headSegment = this.snakeSegments[0];
    if (headSegment) {
      const canvasWidth = 1200;
      const canvasHeight = 800;
      if (
        headSegment.x < 0 ||
        headSegment.x >= canvasWidth ||
        headSegment.y < 0 ||
        headSegment.y >= canvasHeight
      ) {
        console.log(
          `[DEBUG] Collision detected! Head at (${headSegment.x}, ${headSegment.y}), Canvas size: ${canvasWidth}x${canvasHeight}`,
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
      "/assets/images/snake-sprite-65x16.png",
    );
  } catch (error) {
    console.log("Sprite no encontrado, continuando sin sprites");
  }

  void AssetLoader.loadAudio("eat", "/assets/audio/eat.wav").catch(() => {
    console.log("Audio no encontrado, continuando sin sonido");
  });

  const canvas = document.getElementById("game") as HTMLCanvasElement;
  // Aumentar el tamaño del canvas para mejor UX
  canvas.width = 1200;
  canvas.height = 800;
  const renderer = new Renderer(canvas);

  // Inicializar la simulación de juego
  new SimpleGameSimulation(renderer);
}

bootstrap();
