// ui/BasicKeyboard.js
// Clase base para renderizar un teclado visual resaltando teclas específicas

export default class BasicKeyboard {
  constructor(scene, options = {}) {
    this.scene = scene;

    // configuración de tamaños y colores
    this.keyWidth       = options.keyWidth      ?? 44;
    this.keyHeight      = options.keyHeight     ?? 33;
    this.keySpacing     = options.keySpacing    ?? 6;
    this.rowSpacing     = options.rowSpacing    ?? 6;
    this.highlightColor = options.highlightColor ?? 0xff9900;
    this.keyColor       = options.keyColor      ?? 0x333333;

    // el contenedor “privado” donde iremos añadiendo rectángulos y textos
    this._container    = scene.add.container(options.x ?? 0, options.y ?? 0);
    this.keyPositions  = {};

    // tu layout original
    this.layout = [
      ["º","1","2","3","4","5","6","7","8","9","0","´","¿","Backspace"],
      ["Tab","Q","W","E","R","T","Y","U","I","O","P","´","+","Enter"],
      ["Bloq Mayús","A","S","D","F","G","H","J","K","L","Ñ","{","}","Ent"],
      ["Shift","<","Z","X","C","V","B","N","M",",",".","-","Shift "],
      ["Ctrl","Fn","Win","Alt","Espacio","AltGr","Ctrl ","←","↑↓","→"]
    ];
  }

  /** Devuelve el container para que otras clases puedan medirlo/reposicionarlo */
  getContainer() {
    return this._container;
  }

  /** Elimina todo lo dibujado y resetea las posiciones */
  clear() {
    this._container.removeAll(true);
    this.keyPositions = {};
  }

  /**
   * Dibuja el teclado resaltando las teclas que estén en `keys`.
   * @param {string[]} keys – Array de etiquetas de teclas a resaltar
   */
  draw(keys = []) {
    // limpia dibujo previo
    this._container.removeAll(true);
    this.keyPositions = {};

    let y = 0;
    for (const row of this.layout) {
      // centrar cada fila
      const rowWidth = this.getRowWidth(row);
      let x = (this.getMaxRowWidth() - rowWidth) / 2;

      for (const key of row) {
        const width    = this.getKeyWidth(key);
        const centerX  = x + width / 2;
        const isHl     = keys.includes(key);
        const fillCol  = isHl ? this.highlightColor : this.keyColor;

        // rectángulo de la tecla
        const rect = this.scene.add
          .rectangle(x, y, width, this.keyHeight, fillCol)
          .setOrigin(0)
          .setStrokeStyle(2, 0xffffff);

        // texto de la tecla (espacio sin etiqueta)
        const label    = key === "Espacio" ? "" : key;
        const fontSize = this.getFontSizeForKey(key, width);
        const txt = this.scene.add
          .text(x + width/2, y + this.keyHeight/2, label, {
            fontSize: `${fontSize}px`,
            color: isHl ? "#000000" : "#ffffff",
            fontFamily: "monospace"
          })
          .setOrigin(0.5);

        // lo metemos en el container
        this._container.add([ rect, txt ]);

        // guardamos posición absoluta de centro
        this.keyPositions[key] = {
          x: centerX,
          y,
          width
        };

        x += width + this.keySpacing;
      }

      y += this.keyHeight + this.rowSpacing;
    }

    return this;
  }

  /** Para que capas externas (Guides, Hands…) sepan dónde está cada tecla */
  getKeyPosition(key) {
    const pos = this.keyPositions[key];
    if (!pos) return null;
    return {
      x: pos.x + this._container.x,
      y: pos.y + this._container.y,
      width: pos.width
    };
  }

  /* ---------------- métodos de cálculo de anchos/fuentes -------------- */

  getKeyWidth(key) {
    const kw = this.keyWidth;
    if (key === "º")           return kw * 0.8;
    if (key === "Backspace")   return kw * 2;
    if (key === "Tab")         return kw * 1.6;
    if (key === "Bloq Mayús")  return kw * 1.9;
    if (key === "Enter")       return kw * 1.3;
    if (key === "Ent")         return kw * 1;
    if (key === "Shift")       return kw * 1.6;
    if (key === "Shift ")      return kw * 2.5;
    if (key === "Ctrl ")       return kw * 1.6;
    if (["Ctrl","Alt","AltGr","Fn","Win","↑↓"].includes(key)) return kw * 1;
    if (key === "Espacio")     return kw * 5.5;
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
    // suma de anchos + espacios, restando el último gap
    return row.reduce((tot, k) => tot + this.getKeyWidth(k) + this.keySpacing, 0)
           - this.keySpacing;
  }

  getMaxRowWidth() {
    return Math.max(...this.layout.map(r => this.getRowWidth(r)));
  }

  /** Para debugging o quien necesite saber todas las posiciones */
  getKeyPositions() {
      return Object.keys(this.keyPositions).reduce((acc, key) => {
          acc[key] = this.getKeyPosition(key);
          return acc;
      }, {});
  }

}
