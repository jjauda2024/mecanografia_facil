// ui/ExplosionLineLayer.js
// Dibuja una línea sobre el teclado indicando la "explosión"

export default class ExplosionLineLayer {
  constructor(scene, keyboardDisplay) {
    this.scene = scene;
    this.keyboardDisplay = keyboardDisplay;

    // Gráfico principal y exposición como "container" para integración en KeyboardDisplay
    this.graphics = scene.add.graphics();
    this.container = this.graphics;

    this.visible = true;
  }

  /** Dibuja o limpia la línea según visibilidad */
  draw() {
    this.graphics.clear();
    if (!this.visible) return;

    // Obtener bounds del teclado
    const bounds = this.keyboardDisplay.getContainer().getBounds();
    const y = bounds.y - 20;
    const x = bounds.x;
    const width = bounds.width;

    // Línea de estilo explosión
    this.graphics.lineStyle(2, 0xff4444);
    this.graphics.beginPath();
    this.graphics.moveTo(x, y);
    this.graphics.lineTo(x + width, y);
    this.graphics.strokePath();
  }

  /** Y devuelve la coordenada y de la línea */
  getExplosionLineY() {
    const bounds = this.keyboardDisplay.getContainer().getBounds();
    return bounds.y - 20;
  }

  /** Controla visibilidad y limpia si es necesario */
  setVisible(flag) {
    this.visible = flag;
    if (!flag) this.graphics.clear();
    else this.draw();
  }

  /** Limpia completamente la capa */
  clear() {
    this.graphics.clear();
  }
}
