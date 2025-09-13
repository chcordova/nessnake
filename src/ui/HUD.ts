// HUD del juego
export class HUD {
  score: number;
  message: string;

  constructor() {
    this.score = 0;
    this.message = "";
  }

  setScore(score: number) {
    this.score = score;
  }

  setMessage(msg: string) {
    this.message = msg;
  }
}
