// ui/ExplosionLineLayer.js
// Capa para dibujar la línea de explosión debajo de las letras que caen

import COLORS from "../config/colors.js"; // Importar colores centralizados

export default class ExplosionLineLayer {
  constructor(scene, keyboardDisplay, options = {}) {

    // Validación crítica
    if (typeof keyboardDisplay.getKeyPosition !== 'function') {
        throw new Error('Se requiere una instancia válida de KeyboardDisplay');
    }
    
    this.scene = scene;
    this.keyboardDisplay = keyboardDisplay;
    
    this.graphics = scene.add.graphics();
    this.container = this.graphics;
    this.graphics.setDepth(15);

    this.visible = true;
    
    this.effect = null;

    this.config = {
      color: 0xFF4444, // Usar color centralizado
      thickness: 4,
      offsetY: -20, // Distancia vertical sobre el teclado
      dashLength: 0,
      glow: false,
      glowColor: 0xFFFFFF, // Usar color centralizado
      glowStrength: 1,
      ...options
    };

    if (this.config.glow) {
      this.setupGlowEffect();
    }

  }

  init(data){
    this.lineaExplosionY = 0;
  }

  setupGlowEffect() {
    // Asegúrate de que rexGlowFilterPipeline está cargado en tu juego config (en juego.html)
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

    // Obtener las bounds del teclado principal para saber su ancho y posición X global
    const keyboardBounds = this.keyboardDisplay.getContainer().getBounds();
    
    // Si el teclado aún no tiene un ancho válido, usamos un ancho de pantalla por defecto
    // Esto es un fallback para asegurar que la línea siempre tenga un tamaño al inicio
    const lineWidth = keyboardBounds.width > 0 ? keyboardBounds.width : this.scene.scale.width * 0.8;
    const lineX = keyboardBounds.x > 0 ? keyboardBounds.x : (this.scene.scale.width - lineWidth) / 2;

    // DEBUG: Verificar la posición y ancho calculados de la línea
    console.log('ExplosionLineLayer.draw() - keyboardBounds:', keyboardBounds);
    console.log('ExplosionLineLayer.draw() - Calculated lineX (final):', lineX, 'lineWidth (final):', lineWidth);

    const lineY = keyboardBounds.y + this.config.offsetY;
    this.lineaExplosionY = lineY;

    // Mueve el objeto graphics (el contenedor de esta capa) a la posición global correcta
    // this.graphics.setPosition(lineX, lineY);

    // Dibuja la línea DENTRO del objeto graphics, desde su origen (0,0)
    if (this.config.dashLength > 0) {
      this.drawDashedLine(0, this.config.offsetY, lineWidth); // x, y son relativos a this.graphics
    } else {
      this.drawSolidLine(0, this.config.offsetY, lineWidth); // x, y son relativos a this.graphics
    }

    if (this.effect) {
      this.effect.setPosition(this.graphics.x, this.graphics.y);
    }

    // Dentro de draw(), después de calcular lineY
    console.log(`LINEA Y: ${lineY}, Grosor: ${this.config.thickness}`);
    console.log(`CAMARA Y: ${this.scene.cameras.main.worldView.y}, CAMARA AltoVisible: ${this.scene.cameras.main.displayHeight}`);
    console.log(`ESCENA Alto: ${this.scene.scale.height}`);

    if (lineY + this.config.thickness < this.scene.cameras.main.worldView.y || lineY > this.scene.cameras.main.worldView.y + this.scene.cameras.main.displayHeight) {
        console.warn("¡ALERTA! ¡La línea de explosión está VERTICALMENTE FUERA de la vista de la cámara!");
    }
  }

  drawSolidLine(x, y, width) {
    this.graphics.lineStyle(this.config.thickness, this.config.color); // Verde brillante neón
    this.graphics.beginPath();
    this.graphics.moveTo(x, y);
    this.graphics.lineTo(x + width, y);
    this.graphics.strokePath();
    console.log('Graphics visibility:', this.graphics.visible, 'Graphics alpha:', this.graphics.alpha);
    console.log('Dibuja una línea desde:', x, ' sobre y = ', y, ' con una distancia de: ', width, ' de este color:', this.config.color, ' con este ancho:', this.config.thickness);
  }

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

  /** Devuelve la posición Y global de la línea de explosión */
  getExplosionLineY() {
    // La posición Y global es la Y del graphics container
    // return this.graphics.y;
    console.log('lineaExplosionY:', this.lineaExplosionY);
    return this.lineaExplosionY;

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