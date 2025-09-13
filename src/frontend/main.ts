import { AssetLoader } from "./AssetLoader";
import { Renderer } from "./Renderer";
import { AudioManager } from "./AudioManager";
import { GameLoop } from "./GameLoop";

async function bootstrap() {
  await AssetLoader.loadImage("snake", "/assets/sprites/snake.png");
  await AssetLoader.loadAudio("eat", "/assets/audio/eat.wav");
  // ...cargar más assets según necesidad

  const canvas = document.getElementById("game") as HTMLCanvasElement;
  const renderer = new Renderer(canvas);

  // Ejemplo de render loop
  const loop = new GameLoop(
    (dt) => {
      // update logic (game state, movement, etc)
    },
    () => {
      renderer.clear();
      const snakeImg = AssetLoader.getImage("snake");
      if (snakeImg) renderer.drawImage(snakeImg, 50, 50, 32, 32);
      renderer.drawText("Score: 100", 10, 20);
    }
  );
  loop.start();

  // Ejemplo de sonido
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") AudioManager.play("eat");
  });
}

bootstrap();
