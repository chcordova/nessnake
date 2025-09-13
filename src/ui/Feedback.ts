// Retroalimentación visual y sonora básica
export class Feedback {
  static playSound(type: string) {
    // Placeholder: en un entorno real, aquí se reproduciría un sonido
    // Por ahora, solo loguea el evento
    console.log(`[SOUND] Efecto de sonido: ${type}`);
  }

  static showVisualEffect(type: string) {
    // Placeholder: en un entorno real, aquí se activaría una animación o cambio de color
    // Por ahora, solo loguea el evento
    console.log(`[VISUAL] Efecto visual: ${type}`);
  }
}
