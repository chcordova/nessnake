export type GameState = "menu" | "playing" | "game-over";

export class ScreenManager {
  private currentState: GameState = "menu";
  private screens: { [key in GameState]: HTMLElement };

  constructor() {
    this.screens = {
      menu: document.getElementById("menu-screen")!,
      playing: document.getElementById("game-screen")!,
      "game-over": document.getElementById("game-over-screen")!,
    };
  }

  switchTo(state: GameState) {
    // Ocultar pantalla actual
    this.screens[this.currentState].classList.remove("active");

    // Mostrar nueva pantalla
    this.currentState = state;
    this.screens[this.currentState].classList.add("active");
  }

  getCurrentState(): GameState {
    return this.currentState;
  }
}

export class UIManager {
  private screenManager: ScreenManager;
  private score: number = 0;
  private highScore: number = 0;
  private level: number = 1;

  constructor() {
    this.screenManager = new ScreenManager();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Botón Jugar
    document.getElementById("play-btn")?.addEventListener("click", () => {
      this.startGame();
    });

    // Botón Volver al menú
    document.getElementById("menu-btn")?.addEventListener("click", () => {
      this.goToMenu();
    });

    // Botón Jugar de nuevo
    document.getElementById("restart-btn")?.addEventListener("click", () => {
      this.startGame();
    });
  }

  startGame() {
    this.score = 0;
    this.level = 1;
    this.updateHUD();
    this.screenManager.switchTo("playing");
  }

  gameOver() {
    // Actualizar high score si es necesario
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    // Mostrar score final
    const finalScoreElement = document.getElementById("final-score");
    if (finalScoreElement) {
      finalScoreElement.textContent = this.score.toString();
    }

    this.screenManager.switchTo("game-over");
  }

  goToMenu() {
    this.screenManager.switchTo("menu");
  }

  updateScore(newScore: number) {
    this.score = newScore;
    this.updateHUD();
  }

  updateLevel(newLevel: number) {
    this.level = newLevel;
    this.updateHUD();
  }

  private updateHUD() {
    const scoreElement = document.getElementById("score");
    const highScoreElement = document.getElementById("high-score");
    const levelElement = document.getElementById("level");

    if (scoreElement) scoreElement.textContent = this.score.toString();
    if (highScoreElement)
      highScoreElement.textContent = this.highScore.toString();
    if (levelElement) levelElement.textContent = this.level.toString();
  }

  getCurrentState(): GameState {
    return this.screenManager.getCurrentState();
  }
}
