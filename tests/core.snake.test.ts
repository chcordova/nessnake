// Tests unitarios para la lógica de movimiento de Snake
import { Snake, Direction } from "../src/core/Snake";

describe("Snake movement logic", () => {
  it("debe moverse a la derecha por defecto", () => {
    const snake = new Snake(5, 5);
    snake.move();
    expect(snake.position).toEqual({ x: 6, y: 5 });
  });

  it("debe moverse hacia arriba", () => {
    const snake = new Snake(2, 2, "up");
    snake.move();
    expect(snake.position).toEqual({ x: 2, y: 1 });
  });

  it("debe moverse hacia abajo", () => {
    const snake = new Snake(2, 2, "down");
    snake.move();
    expect(snake.position).toEqual({ x: 2, y: 3 });
  });

  it("debe moverse hacia la izquierda", () => {
    const snake = new Snake(2, 2, "left");
    snake.move();
    expect(snake.position).toEqual({ x: 1, y: 2 });
  });

  it("puede cambiar de dirección", () => {
    const snake = new Snake(0, 0);
    snake.setDirection("down");
    snake.move();
    expect(snake.position).toEqual({ x: 0, y: 1 });
  });
});
