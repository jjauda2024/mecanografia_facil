// FingerIndicator.js
// Clase que, dado un carácter, muestra la posición del dedo sobre la tecla correspondiente

export default class FingerIndicator {
    /**
     * @param {Phaser.Scene} scene      La escena Phaser donde se añadirá el indicador
     * @param {object}        config     Configuración de mapeo teclado↔dedo
     * @param {string}        config.assetKey  Nombre de la textura del dedo en el atlas o sprite
     * @param {object}        config.offset    { x, y } Desplazamiento relativo sobre la tecla
     * @param {function}      keyboard.getKeySprite  Función que devuelve el sprite de la tecla dado un carácter
     */
    constructor(scene, { assetKey, offset = { x: 0, y: 0 }, keyboard }) {
      this.scene    = scene;
      this.assetKey = assetKey;
      this.offset   = offset;
      this.keyboard = keyboard;
      this.indicator = null;
    }
  
    /**
     * Muestra el dedo sobre la tecla que corresponde a `char`
     * @param {string} char  Carácter (por ejemplo 'a', 'ñ', ',', etc.)
     */
    show(char) {
      // limpiar indicador previo
      this.clear();
  
      // obtener sprite de tecla del keyboard
      const keySprite = this.keyboard.getKeySprite(char);
      if (!keySprite) return;
  
      // calcular posición final
      const x = keySprite.x + this.offset.x;
      const y = keySprite.y + this.offset.y;
  
      // crear indicador de dedo
      this.indicator = this.scene.add.image(x, y, this.assetKey)
        .setOrigin(0.5, 1)
        .setDepth(keySprite.depth + 1);
    }
  
    /**
     * Oculta / destruye el indicador activo
     */
    clear() {
      if (this.indicator) {
        this.indicator.destroy();
        this.indicator = null;
      }
    }
  }

  