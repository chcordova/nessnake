import { AssetLoader } from "./AssetLoader";

export class AudioManager {
  static play(key: string) {
    const audio = AssetLoader.getAudio(key);
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }
}
