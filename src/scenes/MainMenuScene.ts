// Escena de menú principal
export class MainMenuScene {
  goToGame: () => void;
  constructor(goToGame: () => void) {
    this.goToGame = goToGame;
  }
  startGame() {
    this.goToGame();
  }
}
