// Lógica principal del motor de juego NesSnake
import { Snake } from "./Snake";
import { Player } from "./Player";
import { Zone } from "./Zone";

export class GameEngine {
  snakes: Snake[] = [];
  players: Player[] = [];
  zones: Zone[] = [];
  running: boolean = false;

  addSnake(snake: Snake) {
    this.snakes.push(snake);
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  addZone(zone: Zone) {
    this.zones.push(zone);
  }

  start() {
    this.running = true;
    // Lógica de inicialización futura
  }

  stop() {
    this.running = false;
  }

  getState() {
    return {
      snakes: this.snakes,
      players: this.players,
      zones: this.zones,
      running: this.running,
    };
  }
}
