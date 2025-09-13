/**
 * Adaptador de entrada para plataformas móviles.
 *
 * Este adaptador abstrae la captura de gestos táctiles y botones virtuales en dispositivos móviles,
 * permitiendo que el motor del juego procese entradas de usuario sin depender de la plataforma.
 *
 * Ejemplo de uso:
 *   const input = new MobileInputAdapter();
 *   input.on('move', (dir) => { ... });
 *
 * Métodos esperados:
 *   - on(event: string, handler: Function): void
 *   - detach(): void
 *
 * Eventos típicos:
 *   - 'move' (swipe o d-pad virtual)
 *   - 'action' (tap/botón principal)
 */
type MobileInputEvent = "move" | "action";
type MoveDirection = "up" | "down" | "left" | "right";

/**
 * Adaptador de entrada para plataformas móviles.
 * Permite registrar handlers para eventos de movimiento y acción usando gestos o botones virtuales.
 * (En entorno no móvil, los métodos son stubs para pruebas.)
 */
export class MobileInputAdapter {
  private handlers: { [K in MobileInputEvent]?: Function[] } = {};

  // Simulación de eventos para pruebas
  simulateMove(dir: MoveDirection) {
    this.emit("move", dir);
  }
  simulateAction() {
    this.emit("action");
  }

  on(event: MobileInputEvent, handler: Function) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event]!.push(handler);
  }

  emit(event: MobileInputEvent, ...args: any[]) {
    (this.handlers[event] || []).forEach((fn) => fn(...args));
  }

  detach() {
    this.handlers = {};
  }
}
