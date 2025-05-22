export default class ExplosionLineLayer {
  constructor(scene, keyboardDisplay, options = {}) {
    this.scene = scene;
    this.keyboardDisplay = keyboardDisplay;
    
    // Configuración con valores por defecto
    this.config = {
      color: 0xff4444,       // Color base de la línea
      thickness: 6,          // Grosor de la línea
      offsetY: -20,          // Distancia vertical sobre el teclado
      dashLength: 0,         // Para línea punteada (0 = sólida)
      glow: false,           // Efecto de brillo
      glowColor: 0xff0000,   // Color del brillo
      glowStrength: 1,       // Intensidad del brillo
      ...options             // Sobrescribe con opciones personalizadas
    };

    this.visible = true;
    this.graphics = scene.add.graphics();
    this.container = this.graphics;
    this.effect = null; // Para efectos adicionales

    // Inicializar con posible efecto de brillo
    if (this.config.glow) {
      this.setupGlowEffect();
    }
  }

  /** Configura efecto de brillo usando post-procesado */
  setupGlowEffect() {
    this.effect = this.scene.plugins.get('rexGlowFilterPipeline').add(this.graphics, {
      distance: 10,
      outerStrength: this.config.glowStrength,
      innerStrength: 0,
      color: this.config.glowColor,
      quality: 0.5
    });
  }

  /** Dibuja la línea con el estilo configurado */
  draw() {
    this.graphics.clear();
    if (!this.visible) return;

    const bounds = this.keyboardDisplay.getContainer().getBounds();
    const y = bounds.y + this.config.offsetY;
    
    // Estilo de línea (sólida o punteada)
    if (this.config.dashLength > 0) {
      this.drawDashedLine(0, -20, bounds.width);
    } else {
      this.drawSolidLine(0, -20, bounds.width);
    }

    // Actualizar efecto si existe
    if (this.effect) {
      this.effect.setPosition(this.graphics.x, this.graphics.y);
    }
  }

  /** Dibuja línea sólida */
  drawSolidLine(x, y, width) {
    this.graphics.lineStyle(this.config.thickness, this.config.color);
    this.graphics.beginPath();
    this.graphics.moveTo(x, y);
    this.graphics.lineTo(x + width, y);
    this.graphics.strokePath();
  }

  /** Dibuja línea punteada */
  drawDashedLine(x, y, width) {
    const dash = this.config.dashLength;
    const gap = dash * 0.5;
    this.graphics.lineStyle(this.config.thickness, this.config.color);
    
    let currentX = x;
    while (currentX < x + width) {
      this.graphics.beginPath();
      this.graphics.moveTo(currentX, y);
      this.graphics.lineTo(Math.min(currentX + dash, x + width), y);
      this.graphics.strokePath();
      currentX += dash + gap;
    }
  }

  /** Actualiza configuración dinámica */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.glow !== undefined) {
      if (newConfig.glow && !this.effect) {
        this.setupGlowEffect();
      } else if (!newConfig.glow && this.effect) {
        this.effect.destroy();
        this.effect = null;
      }
    }
    this.draw();
  }

  /** Devuelve posición Y con offset aplicado */
  getExplosionLineY() {
    const bounds = this.keyboardDisplay.getContainer().getBounds();
    return bounds.y + this.config.offsetY;
  }

setVisible(flag) {
    this.visible = flag;
    if (flag) {
        this.draw(); // Redibuja cuando se activa
    } else {
        this.clear(); // Limpia cuando se desactiva
    }
    return this;
}

  clear() {
    this.graphics.clear();
    if (this.effect) {
      this.effect.setVisible(false);
    }
  }

  destroy() {
    this.graphics.destroy();
    if (this.effect) {
      this.effect.destroy();
    }
  }
}