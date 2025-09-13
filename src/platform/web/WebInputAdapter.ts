/**
 * Adaptador de entrada para plataformas web.
 *
 * Este adaptador abstrae la captura de eventos de teclado y mouse/touch en navegadores web,
 * permitiendo que el motor del juego procese entradas de usuario de forma desacoplada de la plataforma.
 *
 * Ejemplo de uso:
 *   const input = new WebInputAdapter();
 *   input.on('move', (dir) => { ... });
 *
 * Métodos esperados:
 *   - on(event: string, handler: Function): void
 *   - detach(): void
 *
 * Eventos típicos:
 *   - 'move' (dirección)
 *   - 'action' (botón principal)
 */
type WebInputEvent = "move" | "action";
type MoveDirection = "up" | "down" | "left" | "right";

/**
 * Adaptador de entrada para plataformas web.
 * Permite registrar handlers para eventos de movimiento y acción usando teclado.
 */
export class WebInputAdapter {
  private handlers: { [K in WebInputEvent]?: Function[] } = {};
  private keyListener: (e: KeyboardEvent) => void;

  constructor() {
    this.keyListener = (e: KeyboardEvent) => {
      let dir: MoveDirection | null = null;
      switch (e.key) {
        case "ArrowUp":
          dir = "up";
          break;
        case "ArrowDown":
          dir = "down";
          break;
        case "ArrowLeft":
          dir = "left";
          break;
        case "ArrowRight":
          dir = "right";
          break;
        case " ":
          this.emit("action");
          break;
      }
      if (dir) this.emit("move", dir);
    };
    window.addEventListener("keydown", this.keyListener);
  }

  on(event: WebInputEvent, handler: Function) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event]!.push(handler);
  }

  emit(event: WebInputEvent, ...args: any[]) {
    (this.handlers[event] || []).forEach((fn) => fn(...args));
  }

  detach() {
    window.removeEventListener("keydown", this.keyListener);
    this.handlers = {};
  }
}
