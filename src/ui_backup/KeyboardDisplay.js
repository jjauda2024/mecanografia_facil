
import TecladoBase from './TecladoBase.js';
import KeyHighlighter from './KeyHighlighter.js';
import HandManager from '../utils/HandManager.js';
import ExplosionLine from './ExplosionLine.js';

export default class KeyboardDisplay {
  constructor(scene, options = {}) {
    this.scene = scene;

    // Dibujar teclado físico
    this.teclado = new TecladoBase(scene, options);
    this.teclado.drawBase();

    this.explosionLine = new ExplosionLine(scene, this.getExplosionLineY());

    // Grupo y posiciones para pintar encima
    this.group = this.teclado.group;
    this.keyPositions = this.teclado.keyPositions;

    // Inicializar el resaltador de teclas
    this.highlighter = new KeyHighlighter(scene, this.keyPositions, this.group);

    // Inicializar manos (HandManager)
    this.hands = new HandManager(scene);
    const baseY = this.scene.scale.height - 
    (this.teclado.layout.length * (this.teclado.keyHeight + this.teclado.rowSpacing)) - 50;
    this.hands.drawHands(baseY + 385);

    // Mostrar por defecto
    this.showHands = true;
    this.showFingerDot = true;
  }

  /**
   * Resalta letras o teclas según el tipo de input recibido.
   */
  draw(input) {
    if (typeof input === 'string') {
      this.highlighter.highlightChar(input);
      if (this.showFingerDot) {
        this.hands.highlightFinger(input);
      }
    } else if (Array.isArray(input)) {
      this.highlighter.highlightArray(input);
    } else if (typeof input === 'object' && input !== null) {
      this.highlighter.highlight(input);
    }
  }

  clear() {
    this.group.clear(true, true);
    this.teclado.drawBase();
    this.hands.clearFinger();
  }

  setHandsVisible(state = true) {
    this.showHands = state;
    this.hands.setHandsVisible(state);
  }

  setFingerVisible(state = true) {
    this.showFingerDot = state;
    if (!state) this.hands.clearFinger();
  }

  getKeyPositions() {
    return this.keyPositions;
  }

  getExplosionLineY() {
    // Línea imaginaria en el borde inferior del teclado
    const totalHeight = this.teclado.layout.length * (this.teclado.keyHeight + this.teclado.rowSpacing);
    return this.scene.scale.height - totalHeight - 50 + 10;
  }

  setExplosionLineVisible(state = true) {
    if (this.explosionLine) {
      this.explosionLine.setVisible(state);
    }
  }
}





