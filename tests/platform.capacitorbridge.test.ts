import { CapacitorBridge } from "../src/platform/mobile/CapacitorBridge";

/**
 * @jest-environment jsdom
 */
describe("CapacitorBridge (bridge nativo simulado)", () => {
  it("simula vibración", async () => {
    const spy = jest.spyOn(console, "log");
    await CapacitorBridge.vibrate(150);
    expect(spy).toHaveBeenCalledWith("[BRIDGE] Vibración simulada: 150ms");
    spy.mockRestore();
  });

  it("guarda y carga datos usando localStorage", async () => {
    const key = "test-key";
    const value = { foo: "bar" };
    await CapacitorBridge.saveData(key, value);
    const loaded = await CapacitorBridge.loadData(key);
    expect(loaded).toEqual(value);
  });
});
