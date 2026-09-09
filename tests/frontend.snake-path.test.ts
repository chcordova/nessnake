import {
  advanceSnakePath,
  classifySnakePath,
  createSnakePath,
} from "../src/frontend/SnakePath";
import { getCurveType } from "../src/frontend/main";

function initialSegmentsFor(direction: "up" | "down" | "left" | "right") {
  switch (direction) {
    case "up":
      return [
        { x: 36, y: 0 },
        { x: 36, y: 18 },
        { x: 36, y: 36 },
      ];
    case "down":
      return [
        { x: 36, y: 36 },
        { x: 36, y: 18 },
        { x: 36, y: 0 },
      ];
    case "left":
      return [
        { x: 0, y: 18 },
        { x: 18, y: 18 },
        { x: 36, y: 18 },
      ];
    case "right":
      return [
        { x: 36, y: 18 },
        { x: 18, y: 18 },
        { x: 0, y: 18 },
      ];
  }
}

describe("SnakePath", () => {
  it("conserva el recorrido y limita su longitud", () => {
    const initial = createSnakePath(
      [
        { x: 36, y: 0 },
        { x: 18, y: 0 },
        { x: 0, y: 0 },
      ],
      "right"
    );

    const advanced = advanceSnakePath(initial, "right", 18, 5);

    expect(advanced.segments).toEqual([
      { x: 54, y: 0 },
      { x: 36, y: 0 },
      { x: 18, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  it.each([
    ["right", "down"],
    ["down", "left"],
    ["left", "up"],
    ["up", "right"],
    ["right", "up"],
    ["up", "left"],
    ["left", "down"],
    ["down", "right"],
  ] as const)("clasifica el giro %s -> %s", (first, second) => {
    const initial = createSnakePath(initialSegmentsFor(first), first);
    const advanced = advanceSnakePath(initial, second, 18, 5);
    const classified = classifySnakePath(advanced);

    expect(
      classified.filter((segment) => segment.type === "corner")
    ).toHaveLength(1);
    expect(classified).toHaveLength(4);
  });

  it("rechaza invertir la dirección mientras hay cuerpo", () => {
    const initial = createSnakePath(
      [
        { x: 36, y: 0 },
        { x: 18, y: 0 },
      ],
      "right"
    );

    const advanced = advanceSnakePath(initial, "left", 18, 5);

    expect(advanced.direction).toBe("right");
    expect(advanced.segments[0]).toEqual({ x: 54, y: 0 });
  });

  it.each([
    ["up", "right", "curva_u_normal_izq"],
    ["right", "up", "curva_u_normal_der"],
    ["right", "down", "curva_u_invertida_der"],
    ["down", "right", "curva_u_invertida_der"],
    ["down", "left", "curva_u_normal_der"],
    ["left", "down", "curva_u_normal_der"],
    ["left", "up", "curva_u_invertida_izq"],
    ["up", "left", "curva_u_invertida_der"],
  ] as const)("resuelve la curva %s -> %s", (first, second, expected) => {
    expect(getCurveType(first, second)).toBe(expected);
  });
});
