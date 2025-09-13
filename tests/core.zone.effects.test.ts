import { Zone } from "../src/core/Zone";
import { Snake } from "../src/core/Snake";
import { Player } from "../src/core/Player";

describe("Zone (Zonas dinámicas y power-ups)", () => {
  it("aplica efecto de zona de velocidad a la Snake", () => {
    // TDD: Suponemos que Snake tendrá un atributo speed y Zone un método applyEffect
    const snake = new Snake();
    (snake as any).speed = 1; // Simular atributo speed
    const speedZone = new Zone("speed");
    speedZone.applyEffect(snake);
    expect((snake as any).speed).toBeGreaterThan(1);
  });

  it("aplica efecto de zona de peligro a la Snake", () => {
    const snake = new Snake();
    (snake as any).isAlive = true; // Simular atributo isAlive
    const dangerZone = new Zone("danger");
    dangerZone.applyEffect(snake);
    expect((snake as any).isAlive).toBe(false);
  });

  it("aplica power-up de invulnerabilidad al Player", () => {
    const player = new Player();
    (player as any).isInvulnerable = false; // Simular atributo
    const invulZone = new Zone("invulnerability");
    invulZone.applyEffect(player);
    expect((player as any).isInvulnerable).toBe(true);
  });
});
