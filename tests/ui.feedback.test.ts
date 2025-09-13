import { Feedback } from "../src/ui/Feedback";

describe("Feedback (retroalimentación visual/sonora)", () => {
  it("debe loguear un efecto de sonido", () => {
    const spy = jest.spyOn(console, "log");
    Feedback.playSound("speed");
    expect(spy).toHaveBeenCalledWith("[SOUND] Efecto de sonido: speed");
    spy.mockRestore();
  });

  it("debe loguear un efecto visual", () => {
    const spy = jest.spyOn(console, "log");
    Feedback.showVisualEffect("danger");
    expect(spy).toHaveBeenCalledWith("[VISUAL] Efecto visual: danger");
    spy.mockRestore();
  });
});
