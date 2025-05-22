export default class HandsLayer {
  constructor(scene, keyboardDisplay, options = {}) {
    this.scene = scene;
    this.keyboardDisplay = keyboardDisplay;
    this.visible = true;

    // Configuración con valores por defecto y opciones personalizadas
    this.settings = {
      offsetX: -110,       // Desplazamiento horizontal relativo
      offsetY: 137,       // Desplazamiento vertical relativo
      anchorKey: 'F',    // Tecla de anclaje izquierdo (para posición horizontal)
      depth: 12,         // Profundidad Z
      scale: 1.0,        // Escala de la imagen
      alpha: 0.8,        // Transparencia
      ...options         // Sobrescribe con opciones personalizadas
    };

    // Carga la imagen con manejo de errores
    this.image = this.createHandsImage();
    this.container = this.image; // Mantenemos compatibilidad

    // Posicionamiento inicial
    this.updatePosition();
  }

  createHandsImage() {
    if (!this.scene.textures.exists('hands')) {
      console.warn('Texture "hands" no encontrada, creando placeholder');
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xff0000, 0.5);
      graphics.fillRect(0, 0, 200, 100);
      const texture = graphics.generateTexture('hands-placeholder');
      graphics.destroy();
      return this.scene.add.image(0, 0, 'hands-placeholder');
    }
    return this.scene.add.image(0, 0, 'hands')
      .setOrigin(0)
      .setDepth(this.settings.depth)
      .setAlpha(this.settings.alpha)
      .setScale(this.settings.scale);
  }

  /** Posiciona las manos basado en la tecla de anclaje */
  updatePosition() {
    try {
      // 1. Obtener posición de la tecla de referencia (F para dedo índice izquierdo)
      const keyPos = this.keyboardDisplay.getKeyPosition(this.settings.anchorKey);
      
      if (!keyPos) {
        throw new Error(`Tecla de anclaje ${this.settings.anchorKey} no encontrada`);
      }

      // 2. Calcular posición relativa con ajustes
      const x = keyPos.x - (this.image.displayWidth * 0.2) + this.settings.offsetX;
      const y = keyPos.y - (this.image.displayHeight * 0.5) + this.settings.offsetY;

      // 3. Aplicar posición
      this.image.setPosition(x, y);
      
    } catch (error) {
      console.error('Error posicionando manos:', error);
      // Fallback: posición basada en contenedor
      const bounds = this.keyboardDisplay.getContainer().getBounds();
      this.image.setPosition(
        bounds.x + this.settings.offsetX, 
        bounds.y + this.settings.offsetY
      );
    }
  }

  /** Método para ajuste fino */
  adjustPosition(dx, dy) {
    this.settings.offsetX += dx;
    this.settings.offsetY += dy;
    this.updatePosition();
  }

  draw() {
    if (this.visible) this.updatePosition();
  }

setVisible(flag) {
    this.visible = flag;
    this.image.setVisible(flag);
    // Asegúrate de redibujar la posición si se hace visible
    if (flag) this.updatePosition();
    return this; // Para method chaining
}

  clear() {
    this.image.setVisible(false);
  }

  // Nuevo: Actualiza configuración dinámicamente
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.image
      .setAlpha(this.settings.alpha)
      .setScale(this.settings.scale)
      .setDepth(this.settings.depth);
    this.updatePosition();
  }
}