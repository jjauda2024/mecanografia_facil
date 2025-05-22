
import { getKeysForChar } from "../utils/keyMappings.js";

export default class TecladoBase {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = scene.add.group();
    this.keyPositions = {};
    this.keyWidth = 44;
    this.keyHeight = 33;
    this.keySpacing = 6;
    this.rowSpacing = 6;
    this.offsetY = options.offsetY ?? 50;

    this.keyColor = options.keyColor ?? 0x333333;

    this.layout = [
      ["º","1","2","3","4","5","6","7","8","9","0","´ ","¿","Backspace"],
      ["Tab","Q","W","E","R","T","Y","U","I","O","P","´","+","Enter"],
      ["Bloq Mayús","A","S","D","F","G","H","J","K","L","Ñ","{","}","Ent"],
      ["Shift","<","Z","X","C","V","B","N","M",",",".","-","Shift "],
      ["Ctrl", "Fn", "Win", "Alt", "Espacio", "AltGr", "Ctrl ", "←", "↑↓", "→"],
    ];
  }

  drawBase() {
    this.group.clear(true, true);
    const totalHeight = this.layout.length * (this.keyHeight + this.rowSpacing);
    const baseY = this.scene.scale.height - totalHeight - 50;

    this.layout.forEach((row, rowIndex) => {
      let x = (this.scene.scale.width - this.getRowWidth(row)) / 2;
      let y = baseY + rowIndex * (this.keyHeight + this.rowSpacing);

      row.forEach((key) => {
        const width = this.getKeyWidth(key);
        const centerX = x + width / 2;
        this.keyPositions[key] = { x: centerX, y: y, width };

        const rect = this.scene.add
          .rectangle(x, y, width, this.keyHeight, this.keyColor)
          .setStrokeStyle(2, 0xffffff)
          .setOrigin(0, 0);
        this.group.add(rect);

        const label = key === "Espacio" ? "" : key;
        const keyText = this.scene.add
          .text(x + width / 2, y + this.keyHeight / 2, label, {
            fontSize: "12px",
            color: "#ffffff",
            fontFamily: "monospace",
          })
          .setOrigin(0.5);

        this.group.add(keyText);
        x += width + this.keySpacing;
      });
    });
  }

  getKeyWidth(key) {
    if (key === "Backspace") return this.keyWidth * 2;
    if (key === "Tab") return this.keyWidth * 1.6;
    if (key === "Bloq Mayús") return this.keyWidth * 1.9;
    if (key === "Enter") return this.keyWidth * 1.3;
    if (key === "Ent") return this.keyWidth;
    if (key === "Shift") return this.keyWidth * 1.6;
    if (key === "Shift ") return this.keyWidth * 2.5;
    if (key === "Ctrl ") return this.keyWidth * 1.6;
    if (["Ctrl", "Alt", "AltGr", "Fn", "Win", "↑↓"].includes(key)) return this.keyWidth;
    if (key === "Espacio") return this.keyWidth * 5.5;
    if (["←", "→"].includes(key)) return this.keyWidth * 1.2;
    return this.keyWidth;
  }

  getRowWidth(row) {
    return row.reduce((total, key) => total + this.getKeyWidth(key) + this.keySpacing, -this.keySpacing);
  }
}
