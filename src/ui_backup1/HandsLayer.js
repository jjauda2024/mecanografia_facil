// ui/HandsLayer.js
// Capa visual que posiciona la imagen 'hands.png' sobre el teclado

export default class HandsLayer {
  constructor(scene, keyboardDisplay) {
    this.scene = scene;
    this.keyboardDisplay = keyboardDisplay;
    this.visible = true;

    // Ajustes personalizables
    this.posX = 28;
    this.posY = 45;

    // Imagen de manos y exposición como "container"
    this.image = scene.add.image(0, 0, 'hands')
      .setOrigin(0)
      .setDepth(12);
    this.container = this.image;

    // Posicionar inicialmente
    this._updatePosition();
  }

  /** Reposiciona la imagen según bounds del teclado */
  _updatePosition() {
    const bounds = this.keyboardDisplay.getContainer().getBounds();
    this.image.setPosition(bounds.x + this.posX, bounds.y + this.posY);
  }

  /** Dibuja (actualiza posición) si está visible */
  draw() {
    if (!this.visible) return;
    this._updatePosition();
  }

  /** Controla visibilidad de la capa */
  setVisible(flag) {
    this.visible = flag;
    this.image.setVisible(flag);
  }

  /** Limpia la capa (oculta) */
  clear() {
    this.image.setVisible(false);
  }
}
