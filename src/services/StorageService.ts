import { CapacitorBridge } from "../platform/mobile/CapacitorBridge";

export class StorageService {
  /** Guarda datos localmente */
  static async saveLocal(key: string, value: any): Promise<void> {
    await CapacitorBridge.saveData(key, value);
  }

  /** Recupera datos locales */
  static async loadLocal(key: string): Promise<any> {
    return await CapacitorBridge.loadData(key);
  }

  /** Guarda datos remotamente (mock) */
  static async saveRemote(key: string, value: any): Promise<void> {
    // Simula una llamada a API remota
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[REMOTE] Guardado simulado: ${key}`);
        resolve();
      }, 100);
    });
  }

  /** Recupera datos remotos (mock) */
  static async loadRemote(key: string): Promise<any> {
    // Simula una llamada a API remota
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[REMOTE] Carga simulada: ${key}`);
        resolve({ key, value: "mocked" });
      }, 100);
    });
  }
}
