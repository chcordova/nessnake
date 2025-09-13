// Entidad Zone para zonas dinámicas
import { Feedback } from "../ui/Feedback";
export class Zone {
  type: string;
  constructor(type = "default") {
    this.type = type;
  }

  applyEffect(entity: any) {
    switch (this.type) {
      case "speed":
        if (entity && typeof entity.speed === "number") {
          entity.speed += 1;
          Feedback.playSound("speed");
          Feedback.showVisualEffect("speed");
        }
        break;
      case "danger":
        if (entity && typeof entity.isAlive === "boolean") {
          entity.isAlive = false;
          Feedback.playSound("danger");
          Feedback.showVisualEffect("danger");
        }
        break;
      case "invulnerability":
        if (entity && typeof entity.isInvulnerable === "boolean") {
          entity.isInvulnerable = true;
          Feedback.playSound("invulnerability");
          Feedback.showVisualEffect("invulnerability");
        }
        break;
      default:
        // Sin efecto
        break;
    }
  }
}
