// ui/GuidesLayer.js
// Capa visual que dibuja flechas desde la posición base del dedo hacia la tecla objetivo

import { getFingerForKey } from "./utils/keyMappings";

export default class GuidesLayer {
  constructor(scene, keyboardDisplay) {

    // Validación crítica
    if (typeof keyboardDisplay.getKeyPosition !== 'function') {
        throw new Error('Se requiere una instancia válida de KeyboardDisplay');
    }
    
    this.scene = scene;
    this.keyboardDisplay = keyboardDisplay;

    // Gráfico principal y exposición como "container"
    this.graphics = scene.add.graphics();
    this.container = this.graphics;
    this.graphics.setDepth(10); // aseguramos que esté encima del teclado

    // Estado de visibilidad
    this.visible = true;

    // Mapeo de teclas home para cada dedo
    this.homeKeys = {
      "meñique-izq":  "A",
      "anular-izq":   "S",
      "medio-izq":    "D",
      "indice-izq":   "F",
      pulgar:         "Espacio",
      "indice-der":  "J",
      "medio-der":   "K",
      "anular-der":  "L",
      "meñique-der": "Ñ",
    };
  }

  /** Dibuja flechas para cada tecla objetivo */
  draw(keys = []) {
    this.graphics.clear();
    if (!this.visible) return;

    const keyHeight = this.keyboardDisplay.keyHeight || 33;

    keys.forEach(key => {
      const finger  = getFingerForKey(key);
      const homeKey = this.homeKeys[finger];
      const from    = this.keyboardDisplay.getKeyPosition(homeKey);
      const to      = this.keyboardDisplay.getKeyPosition(key);
      if (!from || !to || homeKey === key) return;

      const fromY = from.y + keyHeight/2;
      const toY   = to.y   + keyHeight/2;

      // Círculo en la posición base
      this.graphics.fillStyle(0xff3333, 1);
      this.graphics.fillCircle(from.x, fromY, 12);

      // Línea/flecha hacia la tecla
      this.graphics.lineStyle(12, 0xff3333);
      this.graphics.beginPath();
      this.graphics.moveTo(from.x, fromY);
      this.graphics.lineTo(to.x, toY);
      this.graphics.strokePath();

      // Cabeza de flecha
      // const angle = Phaser.Math.Angle.Between(from.x, fromY, to.x, toY);
      // const arrowLength = 10;
      // const ax = to.x - Math.cos(angle) * arrowLength;
      // const ay = to.y - Math.sin(angle) * arrowLength;
      // this.graphics.fillStyle(0xff3333, 1);
      // this.graphics.beginPath();
      // this.graphics.moveTo(to.x, to.y);
      // this.graphics.lineTo(ax + Math.sin(angle)*5, ay - Math.cos(angle)*5);
      // this.graphics.lineTo(ax - Math.sin(angle)*5, ay + Math.cos(angle)*5);
      // this.graphics.closePath();
      // this.graphics.fillPath();
    });
  }

  /** Control de visibilidad */
  setVisible(flag) {
    this.visible = flag;
    if (!flag) this.clear();
  }

  /** Limpia completamente la capa */
  clear() {
    this.graphics.clear();
  }

  getContainer() {
      return this.container; // Añade este método si no existe
  }

}
