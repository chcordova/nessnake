/**
 * Bridge para funcionalidades nativas usando Capacitor.
 *
 * Permite acceder a APIs nativas del dispositivo (vibración, almacenamiento, sensores, etc.)
 * desde el código TypeScript, manteniendo la compatibilidad multiplataforma.
 *
 * Ejemplo de uso:
 *   await CapacitorBridge.vibrate(200);
 *   await CapacitorBridge.saveData('key', value);
 *
 * Métodos esperados:
 *   - vibrate(ms: number): Promise<void>
 *   - saveData(key: string, value: any): Promise<void>
 *   - loadData(key: string): Promise<any>
 */
export class CapacitorBridge {
  /**
   * Vibra el dispositivo por la cantidad de milisegundos indicada.
   * En entorno no nativo, simula con un log.
   */
  static async vibrate(ms: number): Promise<void> {
    if (typeof (window as any).Capacitor !== "undefined") {
      // Aquí iría la llamada real a Capacitor.Plugins.Haptics.vibrate
      // await (window as any).Capacitor.Plugins.Haptics.vibrate({ duration: ms });
    } else {
      console.log(`[BRIDGE] Vibración simulada: ${ms}ms`);
    }
  }

  /**
   * Guarda un valor en almacenamiento persistente.
   * En entorno no nativo, simula con localStorage.
   */
  static async saveData(key: string, value: any): Promise<void> {
    if (typeof (window as any).Capacitor !== "undefined") {
      // await (window as any).Capacitor.Plugins.Storage.set({ key, value: JSON.stringify(value) });
    } else if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
      console.log(`[BRIDGE] Guardado simulado: ${key}`);
    }
  }

  /**
   * Carga un valor desde almacenamiento persistente.
   * En entorno no nativo, simula con localStorage.
   */
  static async loadData(key: string): Promise<any> {
    if (typeof (window as any).Capacitor !== "undefined") {
      // const result = await (window as any).Capacitor.Plugins.Storage.get({ key });
      // return JSON.parse(result.value);
    } else if (typeof window !== "undefined" && window.localStorage) {
      const val = window.localStorage.getItem(key);
      console.log(`[BRIDGE] Carga simulada: ${key}`);
      return val ? JSON.parse(val) : null;
    }
    return null;
  }
}
