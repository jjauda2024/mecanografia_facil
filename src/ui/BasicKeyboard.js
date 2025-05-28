// ui/BasicKeyboard.js
// Clase base para renderizar un teclado visual resaltando teclas específicas

// CAMBIO: Eliminada la importación de COLORS.js
// import COLORS from "../config/colors.js";

export default class BasicKeyboard {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.keyWidth = options.keyWidth ?? 44;
    this.keyHeight = options.keyHeight ?? 33;
    this.keySpacing = options.keySpacing ?? 6;
    this.rowSpacing = options.rowSpacing ?? 6;

    // ORDEN: Colores por defecto definidos como NÚMEROS para consistencia con el uso en rectángulos.
    // Si se pasan `options.highlightColor` o `options.keyColor`, también deberían ser números.
    this.highlightColor = options.highlightColor ?? 0xff9900; // Naranja como número
    this.keyColor = options.keyColor ?? 0x333333; // Gris oscuro como número

    this._container = scene.add.container(options.x ?? 0, options.y ?? 0);
    this.keyPositions = {};

    this.layout = [
      ["º","1","2","3","4","5","6","7","8","9","0","´","¿","Backspace"],
      ["Tab","Q","W","E","R","T","Y","U","I","O","P","´","+","Enter"],
      ["Bloq Mayús","A","S","D","F","G","H","J","K","L","Ñ","{","}","Ent"],
      ["Shift","<","Z","X","C","V","B","N","M",",",".","-","Shift "],
      ["Ctrl","Fn","Win","Alt","Espacio","AltGr","Ctrl ","←","↑↓","→"]
    ];
  }

  getContainer() {
    return this._container;
  }

  clear() {
    this._container.removeAll(true);
    this.keyPositions = {};
  }

  /**
   * Dibuja el teclado resaltando teclas específicas.
   * Puede recibir:
   * - Un array simple de strings (teclas a resaltar con `this.highlightColor`).
   * - Un array de objetos { keys: string[], color: number, blink?: boolean } para múltiples grupos con colores.
   * @param {Array<string>|Array<{keys: string[], color: number, blink?: boolean}>} highlightGroups
   */
  draw(highlightGroups = []) {
    this._container.removeAll(true);
    this.keyPositions = {};

    let groupsToDraw = [];
    // ORDEN: Si highlightGroups es un array de strings, usa this.highlightColor (que ahora es un número)
    // lo cual es consistente con el JSDoc `color: number` para los grupos.
    if (highlightGroups.length > 0 && typeof highlightGroups[0] === 'string') {
        groupsToDraw.push({ keys: highlightGroups, color: this.highlightColor, blink: false });
    } else {
        groupsToDraw = highlightGroups.map(group => ({
            keys: group.keys,
            color: group.color, // Asumimos que group.color es un NÚMERO según JSDoc
            blink: group.blink || false
        }));
    }

    let y = 0;
    for (const row of this.layout) {
        const rowWidth = this.getRowWidth(row);
        let x = (this.getMaxRowWidth() - rowWidth) / 2;

        for (const key of row) {
            const width = this.getKeyWidth(key);
            const centerX = x + width / 2;

            // ORDEN: currentFillColor se inicializa con this.keyColor (NÚMERO).
            let currentFillColor = this.keyColor;
            let isBlinking = false;
            let isHighlighted = false; // Para saber si se aplicó un color de resaltado

            for (const group of groupsToDraw) {
                if (group.keys.includes(key)) {
                    currentFillColor = group.color; // group.color se espera que sea NÚMERO
                    isBlinking = group.blink;
                    isHighlighted = true;
                    break;
                }
            }

            // ORDEN: El color de relleno del rectángulo (currentFillColor) es un NÚMERO.
            const rect = this.scene.add
                .rectangle(x, y, width, this.keyHeight, currentFillColor)
                .setOrigin(0)
                // ORDEN: El color del borde es un NÚMERO.
                .setStrokeStyle(2, 0xffffff);

            // --- Lógica para el color del texto ---
            let textColor; // Será un STRING para Phaser Text
            // ORDEN: Definimos los colores brillantes como NÚMEROS para la comparación.
            const BRIGHT_ORANGE_NUM = 0xff9900;
            const BRIGHT_BLUE_NUM = 0x00aaff;
            const BRIGHT_YELLOW_NUM = 0xffcc00;
            // (Puedes añadir más colores brillantes aquí si los usas para resaltar)

            if (isHighlighted) {
                // Si la tecla está resaltada, decidimos el color del texto basado en el fondo.
                // currentFillColor es un NÚMERO aquí.
                if (currentFillColor === BRIGHT_ORANGE_NUM || 
                    currentFillColor === BRIGHT_BLUE_NUM || 
                    currentFillColor === BRIGHT_YELLOW_NUM) {
                    textColor = '#000000'; // Texto negro (STRING) para fondos brillantes
                } else {
                    textColor = '#FFFFFF'; // Texto blanco (STRING) para otros fondos resaltados
                }
            } else {
                // Para teclas no resaltadas (usan this.keyColor como fondo, que es 0x333333 por defecto)
                textColor = '#BBBBBB'; // Texto gris claro (STRING) por defecto
            }
            // --- Fin lógica color del texto ---

            const label = key === "Espacio" ? "" : key;
            const fontSize = this.getFontSizeForKey(key, width);
            // ORDEN: El color del texto (textColor) es un STRING.
            const txt = this.scene.add
                .text(x + width/2, y + this.keyHeight/2, label, {
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    fontFamily: "monospace"
                })
                .setOrigin(0.5);

            this._container.add([ rect, txt ]);

            this.keyPositions[key] = {
                x: centerX,
                y,
                width
            };

            if (isBlinking) {
                // Lógica de parpadeo (tweens) sin cambios relevantes de color aquí.
                this.scene.tweens.add({
                    targets: rect,
                    alpha: { from: 1, to: 0.5 },
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
                this.scene.tweens.add({
                    targets: txt,
                    alpha: { from: 1, to: 0.5 },
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
            }

            x += width + this.keySpacing;
        }
        y += this.keyHeight + this.rowSpacing;
    }
    console.log('containerX: ', this._container.x, ' containerY: ', this._container.y);
    return this;
  }

  getKeyWidth(key) {
    const kw = this.keyWidth;
    if (key === "º")          return kw * 0.8;
    if (key === "Backspace")  return kw * 2;
    if (key === "Tab")        return kw * 1.6;
    if (key === "Bloq Mayús") return kw * 1.9;
    if (key === "Enter")      return kw * 1.3;
    if (key === "Ent")        return kw * 1;
    if (key === "Shift")      return kw * 1.6;
    if (key === "Shift ")     return kw * 2.5;
    if (key === "Ctrl ")      return kw * 1.6;
    if (["Ctrl","Alt","AltGr","Fn","Win","↑↓"].includes(key)) return kw * 1;
    if (key === "Espacio")    return kw * 5.5;
    if (["←","→"].includes(key)) return kw * 1.2;
    return kw;
  }

  getFontSizeForKey(key, width) {
    const longLabels = [
      "Backspace","Bloq Mayús","Shift","Espacio",
      "Enter","Ctrl ","AltGr","Alt","Tab"
    ];
    if (key === "Espacio") return 18;
    if (longLabels.includes(key)) return 14;
    if (key.length === 1) return 20;
    if (key.length <= 3) return 16;
    return 12;
  }

  getRowWidth(row) {
    return row.reduce((tot, k) => tot + this.getKeyWidth(k) + this.keySpacing, 0)
           - this.keySpacing;
  }

  getMaxRowWidth() {
    return Math.max(...this.layout.map(r => this.getRowWidth(r)));
  }

  getKeyPosition(key) {
    const pos = this.keyPositions[key];
        if (!pos) return null;
    return {
          x: pos.x,
          y: pos.y,
          width: pos.width
    };
  }

  getKeyPositions() {
      return Object.keys(this.keyPositions).reduce((acc, key) => {
          acc[key] = this.getKeyPosition(key);
          return acc;
      }, {});
  }
  
}