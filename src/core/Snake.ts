// Entidad Snake para NesSnake
export type Direction = "up" | "down" | "left" | "right";

export class Snake {
  position: { x: number; y: number };
  direction: Direction;
  body: { x: number; y: number }[];

  constructor(x = 0, y = 0, direction: Direction = "right") {
    this.position = { x, y };
    this.direction = direction;
    this.body = [{ x, y }];
  }

  move() {
    // Añadir la nueva cabeza
    let newPos = { ...this.position };
    switch (this.direction) {
      case "up":
        newPos.y -= 1;
        break;
      case "down":
        newPos.y += 1;
        break;
      case "left":
        newPos.x -= 1;
        break;
      case "right":
        newPos.x += 1;
        break;
    }
    this.position = newPos;
    this.body.unshift({ ...newPos });
    this.body.pop(); // Por ahora, no crece
  }

  setDirection(dir: Direction) {
    this.direction = dir;
  }

  collidesWithSelf(): boolean {
    // ¿La cabeza colisiona con el cuerpo?
    return this.body
      .slice(1)
      .some(
        (segment) =>
          segment.x === this.position.x && segment.y === this.position.y
      );
  }

  collidesWithBounds(width: number, height: number): boolean {
    return (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x >= width ||
      this.position.y >= height
    );
  }
}
