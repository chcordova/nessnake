// Tests de lógica básica para módulos core
import { Snake } from "../src/core/Snake";
import { Player } from "../src/core/Player";
import { Zone } from "../src/core/Zone";

describe("Lógica de entidades core", () => {
  it("Un Snake debe tener una posición inicial válida", () => {
    const snake = new Snake();
    expect(snake.position).toBeDefined();
  });

  it("Un Player debe poder asociarse a un Snake", () => {
    const player = new Player();
    const snake = new Snake();
    player.snake = snake;
    expect(player.snake).toBe(snake);
  });

  it("Zone debe aceptar un tipo de zona", () => {
    const zone = new Zone("aceleracion");
    expect(zone.type).toBe("aceleracion");
  });
});

// NOTA: Estos tests asumen que las clases tendrán los atributos mencionados.
// Si no existen, deben implementarse o ajustarse los tests en la siguiente iteración.
