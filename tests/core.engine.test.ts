// Tests unitarios para GameEngine
import { GameEngine } from "../src/core/GameEngine";
import { Snake } from "../src/core/Snake";
import { Player } from "../src/core/Player";
import { Zone } from "../src/core/Zone";

describe("GameEngine", () => {
  it("puede agregar snakes, players y zones", () => {
    const engine = new GameEngine();
    const snake = new Snake();
    const player = new Player();
    const zone = new Zone("aceleracion");
    engine.addSnake(snake);
    engine.addPlayer(player);
    engine.addZone(zone);
    expect(engine.snakes).toContain(snake);
    expect(engine.players).toContain(player);
    expect(engine.zones).toContain(zone);
  });

  it("puede iniciar y detener el juego", () => {
    const engine = new GameEngine();
    expect(engine.running).toBe(false);
    engine.start();
    expect(engine.running).toBe(true);
    engine.stop();
    expect(engine.running).toBe(false);
  });

  it("getState retorna el estado actual", () => {
    const engine = new GameEngine();
    const snake = new Snake();
    engine.addSnake(snake);
    engine.start();
    const state = engine.getState();
    expect(state.snakes).toContain(snake);
    expect(state.running).toBe(true);
  });
});
