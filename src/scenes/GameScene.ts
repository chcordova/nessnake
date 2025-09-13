// Escena principal de juego
import { GameEngine } from "../core/GameEngine";
import { Snake } from "../core/Snake";
import { Player } from "../core/Player";
import { Zone } from "../core/Zone";

export class GameScene {
  engine: GameEngine;
  goToGameOver: () => void;

  constructor(goToGameOver: () => void) {
    this.engine = new GameEngine();
    this.goToGameOver = goToGameOver;
    // Instanciar entidades de ejemplo
    const snake = new Snake(5, 5, "right");
    const player = new Player();
    player.snake = snake;
    const zone = new Zone("aceleracion");
    this.engine.addSnake(snake);
    this.engine.addPlayer(player);
    this.engine.addZone(zone);
    this.engine.start();
  }

  getState() {
    return this.engine.getState();
  }

  endGame() {
    this.goToGameOver();
  }
}
