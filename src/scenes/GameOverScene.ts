// Escena de game over
export class GameOverScene {
  goToMenu: () => void;
  constructor(goToMenu: () => void) {
    this.goToMenu = goToMenu;
  }
  returnToMenu() {
    this.goToMenu();
  }
}
