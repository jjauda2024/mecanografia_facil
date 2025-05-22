// BasicKeyboard.js
// Clase base para renderizar un teclado visual resaltando teclas específicas

export default class BasicKeyboard {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.keyWidth = options.keyWidth ?? 44;
    this.keyHeight = options.keyHeight ?? 33;
    this.keySpacing = 6;
    this.rowSpacing = 6;
    this.highlightColor = options.highlightColor ?? 0xff9900;
    this.keyColor = options.keyColor ?? 0x333333;

    this.container = scene.add.container(options.x ?? 0, options.y ?? 0);
    this.keyPositions = {};

    this.layout = [
      ["º", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "´ ", "¿", "Backspace"],
      ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "´", "+", "Enter"],
      ["Bloq Mayús", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ", "{", "}", "Ent"],
      ["Shift", "<", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "-", "Shift "],
      ["Ctrl", "Fn", "Win", "Alt", "Espacio", "AltGr", "Ctrl ", "←", "↑↓", "→"]
    ];
  }

  draw(keys = []) {
    this.container.removeAll(true);
    const totalHeight = this.layout.length * (this.keyHeight + this.rowSpacing);
    let y = 0;

    this.layout.forEach((row) => {
      let x = (this.getMaxRowWidth() - this.getRowWidth(row)) / 2;

      row.forEach((key) => {
        const width = this.getKeyWidth(key);
        const centerX = x + width / 2;

        const isHighlighted = keys.includes(key);
        const fillColor = isHighlighted ? this.highlightColor : this.keyColor;

        const rect = this.scene.add.rectangle(x, y, width, this.keyHeight, fillColor)
          .setOrigin(0, 0)
          .setStrokeStyle(2, 0xffffff);

        const label = key === "Espacio" ? "" : key;
        const fontSize = this.getFontSizeForKey(key, width);
        const text = this.scene.add.text(x + width / 2, y + this.keyHeight / 2, label, {
          fontSize: `${fontSize}px`,
          color: isHighlighted ? "#000000" : "#ffffff",
          fontFamily: "monospace",
        }).setOrigin(0.5);

        this.container.add(rect);
        this.container.add(text);

        this.keyPositions[key] = { x: centerX, y, width };

        x += width + this.keySpacing;
      });

      y += this.keyHeight + this.rowSpacing;
    });
  }

  getKeyPosition(key) {
    const pos = this.keyPositions[key];
    if (!pos) return null;
    return {
      x: pos.x + this.container.x,
      y: pos.y + this.container.y,
      width: pos.width
    };
  }
  
  getKeyWidth(key) {
    const kw = this.keyWidth;
    if (key === "º") return kw * 0.8;
    if (key === "Backspace") return kw * 2;
    if (key === "Tab") return kw * 1.6;
    if (key === "Bloq Mayús") return kw * 1.9;
    if (key === "Enter") return kw * 1.3;
    if (key === "Ent") return kw * 1;
    if (key === "Shift") return kw * 1.6;
    if (key === "Shift ") return kw * 2.5;
    if (key === "Ctrl ") return kw * 1.6;
    if (["Ctrl", "Alt", "AltGr", "Fn", "Win", "↑↓"].includes(key)) return kw * 1;
    if (key === "Espacio") return kw * 5.5;
    if (["←", "→"].includes(key)) return kw * 1.2;
    return kw;
  }

  getFontSizeForKey(key, width) {
    const longLabels = [
      "Backspace", "Bloq Mayús", "Shift", "Shift ",
      "Espacio", "Enter", "Ctrl ", "AltGr", "Alt", "Tab"
    ];

    if (key === "Espacio") return 18;
    if (longLabels.includes(key)) return 14;
    if (key.length === 1) return 20;
    if (key.length <= 3) return 16;
    return 12;
  }

  getRowWidth(row) {
    return row.reduce(
      (total, key) => total + this.getKeyWidth(key) + this.keySpacing,
      -this.keySpacing
    );
  }

  getMaxRowWidth() {
    return Math.max(...this.layout.map(row => this.getRowWidth(row)));
  }

  getKeyPositions() {
    // Devuelve las posiciones absolutas de todas las teclas
    const result = {};
    for (const key in this.keyPositions) {
      result[key] = this.getKeyPosition(key);
    }
    return result;
  }

  getContainer() {
    return this._container;
  }
  
}
