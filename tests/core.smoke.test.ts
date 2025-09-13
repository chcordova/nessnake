// Smoke test para módulos core
import { GameEngine } from "../src/core/GameEngine";
import { Snake } from "../src/core/Snake";
import { Player } from "../src/core/Player";
import { Zone } from "../src/core/Zone";

describe("Core modules smoke test", () => {
  it("GameEngine se puede instanciar", () => {
    expect(() => new GameEngine()).not.toThrow();
  });
  it("Snake se puede instanciar", () => {
    expect(() => new Snake()).not.toThrow();
  });
  it("Player se puede instanciar", () => {
    expect(() => new Player()).not.toThrow();
  });
  it("Zone se puede instanciar", () => {
    expect(() => new Zone()).not.toThrow();
  });
});
