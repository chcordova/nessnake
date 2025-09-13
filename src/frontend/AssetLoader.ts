export class AssetLoader {
  static images: Record<string, HTMLImageElement> = {};
  static audio: Record<string, HTMLAudioElement> = {};

  static async loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        AssetLoader.images[key] = img;
        console.log(
          `[AssetLoader] Image loaded: key='${key}', src='${src}', width=${img.width}, height=${img.height}`
        );
        resolve();
      };
      img.onerror = (e) => {
        console.error(
          `[AssetLoader] Failed to load image: key='${key}', src='${src}'`,
          e
        );
        reject(e);
      };
      img.src = src;
      console.log(
        `[AssetLoader] Started loading image: key='${key}', src='${src}'`
      );
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
    const img = AssetLoader.images[key];
    if (!img) {
      console.warn(`[AssetLoader] getImage: No image found for key='${key}'`);
    } else {
      console.log(
        `[AssetLoader] getImage: Found image for key='${key}', width=${img.width}, height=${img.height}`
      );
    }
    return img;
  }

  static getAudio(key: string): HTMLAudioElement {
    return AssetLoader.audio[key];
  }
}
