export class AssetLoader {
  static images: Record<string, HTMLImageElement> = {};
  static audio: Record<string, HTMLAudioElement> = {};

  static async loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        AssetLoader.images[key] = img;
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static async loadAudio(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new window.Audio(src);
      audio.oncanplaythrough = () => {
        AssetLoader.audio[key] = audio;
        resolve();
      };
      audio.onerror = reject;
    });
  }

  static getImage(key: string): HTMLImageElement {
    return AssetLoader.images[key];
  }

  static getAudio(key: string): HTMLAudioElement {
    return AssetLoader.audio[key];
  }
}
