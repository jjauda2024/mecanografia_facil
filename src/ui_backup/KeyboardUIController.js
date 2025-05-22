
export default class KeyboardUIController {
  constructor(keyboardDisplay) {
    this.keyboard = keyboardDisplay;
  }

  // Visibilidad de manos
  setHandsVisible(state = true) {
    this.keyboard.setHandsVisible?.(state);
  }

  // Visibilidad de flecha + punto guía
  setFingerVisible(state = true) {
    this.keyboard.setFingerVisible?.(state);
  }

  // Visibilidad de línea de explosión
  setExplosionLineVisible(state = true) {
    this.keyboard.setExplosionLineVisible?.(state);
  }

  // Refrescar todos los estados desde localStorage
  applyFromLocalStorage() {
    const showHands = JSON.parse(localStorage.getItem("manos") ?? "true");
    const showGuide = JSON.parse(localStorage.getItem("guia") ?? "true");
    const showLine  = JSON.parse(localStorage.getItem("linea") ?? "true");

    this.setHandsVisible(showHands);
    this.setFingerVisible(showGuide);
    this.setExplosionLineVisible(showLine);
  }
}
