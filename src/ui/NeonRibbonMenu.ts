// Menú tipo cinta de neón
export class NeonRibbonMenu {
  options: string[];
  selected: number;

  constructor(
    options: string[] = ["Jugar", "Opciones", "Puntuaciones", "Cómo Jugar"]
  ) {
    this.options = options;
    this.selected = 0;
  }

  selectNext() {
    this.selected = (this.selected + 1) % this.options.length;
  }

  selectPrev() {
    this.selected =
      (this.selected - 1 + this.options.length) % this.options.length;
  }

  getSelectedOption() {
    return this.options[this.selected];
  }
}
