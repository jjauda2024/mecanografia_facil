// js/KeyboardDisplay.js

import { getKeysForChar, getFingerForKey } from "../utils/keyMappings.js";

export default class KeyboardDisplay {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = scene.add.group();
    this.keyPositions = {};
    this.keyWidth = 44;
    this.keyHeight = 33;
    this.keySpacing = 6;
    this.rowSpacing = 6;
    this.offsetY = options.offsetY ?? 50;

    this.showExplosionLine = JSON.parse(
      localStorage.getItem("showExplosionLine") ?? "true"
    );
    this.showFingerDot = JSON.parse(
      localStorage.getItem("showFingerDot") ?? "true"
    );
    this.fingersOnTop = options.fingersOnTop ?? true;
    this.showHands = JSON.parse(localStorage.getItem("showHands") ?? "true");
    this.soundEnabled = JSON.parse(
      localStorage.getItem("soundEnabled") ?? "true"
    );
    this.keyColor = options.keyColor ?? 0x333333;
    this.highlightColor = options.highlightColor ?? 0xff9900;

    this.layout = [
      [
        "º",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "0",
        "´ ",
        "¿",
        "Backspace",
      ],
      [
        "Tab",
        "Q",
        "W",
        "E",
        "R",
        "T",
        "Y",
        "U",
        "I",
        "O",
        "P",
        "´",
        "+",
        "Enter",
      ],
      [
        "Bloq Mayús",
        "A",
        "S",
        "D",
        "F",
        "G",
        "H",
        "J",
        "K",
        "L",
        "Ñ",
        "{",
        "}",
        "Ent",
      ],
      [
        "Shift",
        "<",
        "Z",
        "X",
        "C",
        "V",
        "B",
        "N",
        "M",
        ",",
        ".",
        "-",
        "Shift ",
      ],
      ["Ctrl", "Fn", "Win", "Alt", "Espacio", "AltGr", "Ctrl ", "←", "↑↓", "→"],
    ];

    this.fingerText = null;
    this.handSprite = null;
    this.lastKeys = [];
    this.dotSprite = null;
    this.btnExplosion = null;

    if (this.scene.cache.audio.exists("error")) {
      this.errorSound = this.scene.sound.add("error");
      this.errorSound.setMute(!this.soundEnabled);
    }

    this.homeKeys = {
      "meñique-izq": "A",
      "anular-izq": "S",
      "medio-izq": "D",
      "indice-izq": "F",
      pulgar: "Espacio",
      "indice-der": "J",
      "medio-der": "K",
      "anular-der": "L",
      "meñique-der": "Ñ",
    };

    this.addToggleButtons();
  }

  setFingerVisibility(state = true) {
    this.showFingerDot = state;
  }

  setExplosionLineVisibility(state = true) {
    this.showExplosionLine = state;
  }

  setHandsVisibility(state = true) {
    this.showHands = state;
  }

  setFingersOnTop(state = true) {
    this.fingersOnTop = state;
  }

  setSoundEnabled(state = true) {
    this.soundEnabled = state;
  }

  playErrorSound() {
    if (!this.soundEnabled) return;
    if (this.errorSound) {
      if (this.errorSound.isPlaying) {
        this.errorSound.stop();
      }
      this.errorSound.play();
    }
  }

  redraw() {
    this.draw(this.lastKeys);
  }

  draw(keys = []) {
    this.lastKeys = keys;

    if (Array.isArray(keys)) {
      this.drawArray(keys);
    } else if (typeof keys === "string") {
      this.drawCharacter(keys);
    }
  }

  drawArray(characters = []) {
    const resolvedKeys = characters
      .map((c) => {
        const all = getKeysForChar(c);
        const result = all ? all[0] : null;
        console.log(`[drawArray] ${c} →`, result);
        return result; // 👈 esto es lo que faltaba
      })
      .filter(Boolean);

    console.log("[drawArray] resolvedKeys:", resolvedKeys);
    this.drawInternal(resolvedKeys);
  }

  drawCharacter(char) {
    const resolvedKeys = getKeysForChar(char) || [];
    this.drawInternal(resolvedKeys);
  }

  drawInternal(resolvedKeys) {
    const filteredKeys = resolvedKeys;
    const mainKey = filteredKeys[0];
    const fingerName = mainKey ? getFingerForKey(mainKey) : null;

    this.group.clear(true, true);
    if (this.fingerText) {
      this.fingerText.destroy();
      this.fingerText = null;
    }
    if (this.handSprite) {
      this.handSprite.destroy();
      this.handSprite = null;
    }
    if (this.dotSprite) {
      this.dotSprite.destroy();
      this.dotSprite = null;
    }

    const totalHeight = this.layout.length * (this.keyHeight + this.rowSpacing);
    const baseY = this.scene.scale.height - totalHeight - 50;
    let maxRowWidth = 0;

    this.layout.forEach((row, rowIndex) => {
      let x = (this.scene.scale.width - this.getRowWidth(row)) / 2;
      let y = baseY + rowIndex * (this.keyHeight + this.rowSpacing);

      const rowWidth = row.length * (this.keyWidth + this.keySpacing);
      if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;

      row.forEach((key) => {
        const width = this.getKeyWidth(key);
        const centerX = x + width / 2;

        this.keyPositions[key] = { x: centerX, y: y, width };

        const isHighlighted = filteredKeys.includes(key);
        const fillColor = isHighlighted ? this.highlightColor : this.keyColor;

        const rect = this.scene.add
          .rectangle(x, y, width, this.keyHeight, fillColor)
          .setStrokeStyle(2, 0xffffff)
          .setOrigin(0, 0);
        this.group.add(rect);

        const label = key === "Espacio" ? "" : key;
        const keyText = this.scene.add
          .text(x + width / 2, y + this.keyHeight / 2, label, {
            fontSize: isHighlighted ? "24px" : "12px",
            color: isHighlighted ? "#000000" : "#ffffff",
            fontFamily: "monospace",
          })
          .setOrigin(0.5);

        this.group.add(keyText);

        x += width + this.keySpacing;
      });
    });

    this.explosionLineY = baseY - this.keyHeight - 10;

    if (this.explosionLineGraphic) {
      this.explosionLineGraphic.destroy();
      this.explosionLineGraphic = null;
    }

    if (this.showExplosionLine) {
      this.explosionLineGraphic = this.scene.add.graphics();
      const gfx = this.explosionLineGraphic;
      gfx.lineStyle(8, 0xff0000, 1);
      gfx.beginPath();
      const centerX = this.scene.cameras.main.centerX;
      const halfWidth = maxRowWidth / 2;
      const lineStartX = centerX - halfWidth;
      const lineEndX = centerX + halfWidth;
      const lineY = this.explosionLineY + this.keyHeight;
      gfx.moveTo(lineStartX, lineY);
      gfx.lineTo(lineEndX, lineY);
      gfx.strokePath();
    }

    if (this.showHands) {
      this.handSprite = this.scene.add
        .image(this.scene.scale.width / 2 - 28, baseY + 385, "fingers")
        .setOrigin(0.5, 1);
    }

    if (this.fingersOnTop && this.handSprite) {
      this.scene.children.bringToTop(this.handSprite);
    } else if (this.handSprite) {
      this.scene.children.sendToBack(this.handSprite);
    } else {
      this.scene.children.sendToBack(this.handSprite);
    }

    const homeKey = this.homeKeys[fingerName];

    if (
      this.showFingerDot &&
      mainKey !== homeKey &&
      this.keyPositions[homeKey] &&
      this.keyPositions[mainKey]
    ) {
      const from = this.keyPositions[homeKey];
      const to = this.keyPositions[mainKey];

      const dot = this.scene.add.graphics();
      dot.fillStyle(0xff3333, 1);
      dot.fillCircle(from.x, from.y + this.keyHeight / 2, 12);
      this.group.add(dot);

      const arrow = this.scene.add.graphics();
      arrow.lineStyle(6, 0xff3333);
      arrow.beginPath();
      arrow.moveTo(from.x, from.y + 18);
      arrow.lineTo(to.x, to.y + (to.y <= from.y ? this.keyHeight : 0));
      arrow.strokePath();
      this.group.add(arrow);
    }

    this.addToggleButtons();
  }

  addToggleButtons() {
    const style = {
      fontSize: "14px",
      fontFamily: "monospace",
      backgroundColor: "#222",
      color: "#fff",
      padding: { x: 8, y: 4 },
    };

    const margin = 20;
    const btnHeight = 24;
    const baseY =
      this.scene.scale.height -
      this.layout.length * (this.keyHeight + this.rowSpacing) -
      this.offsetY;
    const keyboardBottom =
      baseY + this.layout.length * (this.keyHeight + this.rowSpacing);

    const redrawAndUpdate = () => {
      this.group.clear(true, true);
      this.draw(this.lastKeys);
    };

    this.btnDot = this.scene.add
      .text(margin, keyboardBottom - btnHeight * 4 - 8, "", style)
      .setInteractive()
      .on("pointerdown", () => {
        this.showFingerDot = !this.showFingerDot;
        this.btnDot.setText(`🔴 Guía ${this.showFingerDot ? "ON" : "OFF"}`);
        localStorage.setItem(
          "showFingerDot",
          JSON.stringify(this.showFingerDot)
        );
        redrawAndUpdate();
      });

    this.btnHands = this.scene.add
      .text(margin, keyboardBottom - btnHeight * 3 - 6, "", style)
      .setInteractive()
      .on("pointerdown", () => {
        this.showHands = !this.showHands;
        this.btnHands.setText(`🙌 Manos ${this.showHands ? "ON" : "OFF"}`);
        localStorage.setItem("showHands", JSON.stringify(this.showHands));
        redrawAndUpdate();
      });

    this.btnSound = this.scene.add
      .text(margin, keyboardBottom - btnHeight * 2 - 4, "", style)
      .setInteractive()
      .on("pointerdown", () => {
        this.soundEnabled = !this.soundEnabled;
        this.btnSound.setText(`🔊 Sonido ${this.soundEnabled ? "ON" : "OFF"}`);
        localStorage.setItem("soundEnabled", JSON.stringify(this.soundEnabled));
        redrawAndUpdate();
      });

    this.btnExplosion = this.scene.add
      .text(margin, keyboardBottom - btnHeight, "", style)
      .setInteractive()
      .on("pointerdown", () => {
        this.showExplosionLine = !this.showExplosionLine;
        this.btnExplosion.setText(
          `💥 Línea ${this.showExplosionLine ? "ON" : "OFF"}`
        );
        localStorage.setItem(
          "showExplosionLine",
          JSON.stringify(this.showExplosionLine)
        );
        redrawAndUpdate();
      });

    // Texto inicial
    this.btnDot.setText(`🔴 Guía ${this.showFingerDot ? "ON" : "OFF"}`);
    this.btnHands.setText(`🙌 Manos ${this.showHands ? "ON" : "OFF"}`);
    this.btnSound.setText(`🔊 Sonido ${this.soundEnabled ? "ON" : "OFF"}`);
    this.btnExplosion.setText(
      `💥 Línea ${this.showExplosionLine ? "ON" : "OFF"}`
    );

    this.group.add(this.btnDot);
    this.group.add(this.btnHands);
    this.group.add(this.btnSound);
    this.group.add(this.btnExplosion);
  }

  getKeyWidth(key) {
    if (key === "º") return this.keyWidth * 0.8;
    if (key === "Backspace") return this.keyWidth * 2;
    if (key === "Tab") return this.keyWidth * 1.6;
    if (key === "Bloq Mayús") return this.keyWidth * 1.9;
    if (key === "Enter") return this.keyWidth * 1.3;
    if (key === "Ent") return this.keyWidth * 1;
    if (key === "Shift") return this.keyWidth * 1.6;
    if (key === "Shift ") return this.keyWidth * 2.5;
    if (key === "Ctrl ") return this.keyWidth * 1.6;
    if (["Ctrl", "Alt", "AltGr", "Fn", "Win", "↑↓"].includes(key))
      return this.keyWidth * 1;
    if (key === "Espacio") return this.keyWidth * 5.5;
    if (["←", "→"].includes(key)) return this.keyWidth * 1.2;
    return this.keyWidth;
  }

  getRowWidth(row) {
    return row.reduce(
      (total, key) => total + this.getKeyWidth(key) + this.keySpacing,
      -this.keySpacing
    );
  }

  getKeyPositions() {
    return this.keyPositions;
  }

  getExplosionLineY() {
    return this.explosionLineY;
  }
}
