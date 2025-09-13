// Tests de integración para navegación entre escenas y renderizado de UI
import { MainMenuScene } from "../src/scenes/MainMenuScene";
import { GameScene } from "../src/scenes/GameScene";
import { GameOverScene } from "../src/scenes/GameOverScene";
import { HUD } from "../src/ui/HUD";
import { NeonRibbonMenu } from "../src/ui/NeonRibbonMenu";

describe("Integración: flujo de escenas y UI", () => {
  it("flujo completo: menú → juego → game over → menú", () => {
    let currentScene: any = null;
    // Navegación simulada
    const goToGame = () => {
      currentScene = new GameScene(goToGameOver);
    };
    const goToMenu = () => {
      currentScene = new MainMenuScene(goToGame);
    };
    const goToGameOver = () => {
      currentScene = new GameOverScene(goToMenu);
    };
    // Inicia en menú
    currentScene = new MainMenuScene(goToGame);
    expect(currentScene).toBeInstanceOf(MainMenuScene);
    // Ir a juego
    currentScene.startGame();
    expect(currentScene).toBeInstanceOf(GameScene);
    // Ir a game over
    currentScene.endGame();
    expect(currentScene).toBeInstanceOf(GameOverScene);
    // Volver a menú
    currentScene.returnToMenu();
    expect(currentScene).toBeInstanceOf(MainMenuScene);
  });

  it("HUD muestra y actualiza puntaje y mensaje", () => {
    const hud = new HUD();
    hud.setScore(42);
    hud.setMessage("¡Victoria!");
    expect(hud.score).toBe(42);
    expect(hud.message).toBe("¡Victoria!");
  });

  it("NeonRibbonMenu permite navegar y seleccionar opciones", () => {
    const menu = new NeonRibbonMenu(["Jugar", "Opciones", "Salir"]);
    expect(menu.getSelectedOption()).toBe("Jugar");
    menu.selectNext();
    expect(menu.getSelectedOption()).toBe("Opciones");
    menu.selectNext();
    expect(menu.getSelectedOption()).toBe("Salir");
    menu.selectNext();
    expect(menu.getSelectedOption()).toBe("Jugar");
    menu.selectPrev();
    expect(menu.getSelectedOption()).toBe("Salir");
  });
});
