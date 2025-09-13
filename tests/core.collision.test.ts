// Tests unitarios para colisiones de Snake
import { Snake } from "../src/core/Snake";

describe("Snake collision logic", () => {
  it("detecta colisión con los bordes", () => {
    const snake = new Snake(0, 0, "left");
    snake.move();
    expect(snake.collidesWithBounds(10, 10)).toBe(true);
  });

  it("no colisiona con los bordes si está dentro", () => {
    const snake = new Snake(5, 5, "right");
    snake.move();
    expect(snake.collidesWithBounds(10, 10)).toBe(false);
  });

  it("detecta colisión consigo mismo", () => {
    const snake = new Snake(2, 2, "right");
    // Simular cuerpo en círculo
    snake.body = [
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 2 }, // La cabeza vuelve a un segmento del cuerpo
    ];
    snake.position = { x: 4, y: 2 };
    expect(snake.collidesWithSelf()).toBe(true);
  });

  it("no detecta colisión consigo mismo si no hay superposición", () => {
    const snake = new Snake(1, 1, "right");
    snake.body = [
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
    ];
    snake.position = { x: 1, y: 1 };
    expect(snake.collidesWithSelf()).toBe(false);
  });
});
