// Test para el mock de GameScene
import { GameScene } from "../src/scenes/GameScene";

describe("GameScene mock", () => {
  it("instancia GameEngine y entidades correctamente", () => {
    const scene = new GameScene();
    const state = scene.getState();
    expect(state.snakes.length).toBe(1);
    expect(state.players.length).toBe(1);
    expect(state.zones.length).toBe(1);
    expect(state.running).toBe(true);
    // Validar tipos
    expect(state.snakes[0].position).toBeDefined();
    expect(state.players[0].snake).toBeDefined();
    expect(state.zones[0].type).toBe("aceleracion");
  });
});
