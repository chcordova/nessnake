/**
 * @jest-environment jsdom
 */
import { StorageService } from "../src/services/StorageService";

describe("StorageService (persistencia local y remota)", () => {
  it("guarda y recupera datos localmente", async () => {
    const key = "partida-1";
    const value = { score: 123, level: 2 };
    await StorageService.saveLocal(key, value);
    const loaded = await StorageService.loadLocal(key);
    expect(loaded).toEqual(value);
  });

  it("guarda datos remotamente (mock)", async () => {
    const spy = jest.spyOn(console, "log");
    await StorageService.saveRemote("estadisticas", { victorias: 5 });
    expect(spy).toHaveBeenCalledWith(
      "[REMOTE] Guardado simulado: estadisticas"
    );
    spy.mockRestore();
  });

  it("recupera datos remotos (mock)", async () => {
    const spy = jest.spyOn(console, "log");
    const data = await StorageService.loadRemote("estadisticas");
    expect(data).toHaveProperty("key", "estadisticas");
    expect(data).toHaveProperty("value", "mocked");
    expect(spy).toHaveBeenCalledWith("[REMOTE] Carga simulada: estadisticas");
    spy.mockRestore();
  });
});
