// ui/KeyboardDisplay.js
// Capa intermedia que traduce caracteres o secuencias en teclas a resaltar
// en el teclado visual, e integra guías, línea de explosión y manos

import BasicKeyboard from "./BasicKeyboard.js";
import GuidesLayer from "./GuidesLayer.js";
import ExplosionLineLayer from "./ExplosionLineLayer.js";
import HandsLayer from "./HandsLayer.js";
import { getKeysForChar } from "../utils/keyMappings.js"

export default class KeyboardDisplay {
  constructor(scene, { x = 0, y = 0 } = {}) {
    this.scene = scene;

    // Contenedor maestro para todas las capas
    this.container = scene.add.container(x, y);

    // Teclado base y capas auxiliares
    this.keyboard      = new BasicKeyboard(scene);
    this.guides        = new GuidesLayer(scene, this);
    this.explosionLine = new ExplosionLineLayer(scene, this);
    this.hands         = new HandsLayer(scene, this);

    // Agregar al contenedor principal
    this.container.add([
      this.keyboard.container,
      this.guides.container,
      this.explosionLine.container,
      this.hands.container
    ]);

    // Estados de visibilidad
    this.guidesEnabled    = true;
    this.explosionEnabled = true;
    this.handsEnabled     = true;

    // Botones de control junto al teclado
    const style = {
      fontSize:   "12px",
      fontFamily: "monospace",
      backgroundColor: "#222",
      color:           "#fff",
      padding: { x: 8, y: 4 }
    };

    // Calcular posición junto al teclado
    const kbBounds = this.keyboard.container.getBounds();
    let offsetY   = kbBounds.y;
    const stepY   = 24;
    const xPos    = kbBounds.x + this.keyboard.getMaxRowWidth() + 15;

    // Toggle Guías
    this.btnGuides = scene.add.text(xPos, offsetY, "🔴 Guías ON", style)
      .setInteractive()
      .setScrollFactor(0)
      .on("pointerdown", () => {
        this.guidesEnabled = !this.guidesEnabled;
        this.btnGuides.setText(`🔴 Guías ${this.guidesEnabled ? "ON" : "OFF"}`);
        if (this.guidesEnabled) this.guides.draw(this.lastKeys);
        else this.guides.clear();
      });

    // Toggle Línea de explosión
    offsetY += stepY;
    this.btnExplosion = scene.add.text(xPos, offsetY, "💥 Línea ON", style)
      .setInteractive()
      .setScrollFactor(0)
      .on("pointerdown", () => {
        this.explosionEnabled = !this.explosionEnabled;
        this.btnExplosion.setText(`💥 Línea ${this.explosionEnabled ? "ON" : "OFF"}`);
        this.explosionLine.setVisible(this.explosionEnabled);
        if (this.explosionEnabled) this.explosionLine.draw();
      });

    // Toggle Manos
    offsetY += stepY;
    this.btnHands = scene.add.text(xPos, offsetY, "🖐️ Manos ON", style)
      .setInteractive()
      .setScrollFactor(0)
      .on("pointerdown", () => {
        this.handsEnabled = !this.handsEnabled;
        this.btnHands.setText(`🖐️ Manos ${this.handsEnabled ? "ON" : "OFF"}`);
        this.hands.setVisible(this.handsEnabled);
        if (this.handsEnabled) this.hands.draw(this.lastKeys);
      });
  }

  /** Resuelve la entrada y redibuja todas las capas */
  draw(input) {
    let resolved = [];

    if (typeof input === "string") {
      resolved = getKeysForChar(input);
    } else if (Array.isArray(input) && input.every(k => typeof k === "string")) {
      resolved = input.flatMap(getKeysForChar);
    } else if (
      Array.isArray(input) && input.length === 2 &&
      Array.isArray(input[0]) && Array.isArray(input[1])
    ) {
      const g1 = input[0].flatMap(getKeysForChar);
      const g2 = input[1].flatMap(getKeysForChar);
      resolved = [g1, g2];
    }

    // Dibujar teclado
    if (Array.isArray(resolved[0])) {
      const all = [...resolved[0], ...resolved[1]];
      this.keyboard.draw(all);
      this.lastKeys = all;
    } else {
      this.keyboard.draw(resolved);
      this.lastKeys = resolved;
    }

    // Capas adicionales
    if (this.guidesEnabled)    this.guides.draw(this.lastKeys);
    if (this.explosionEnabled) this.explosionLine.draw();
    if (this.handsEnabled)     this.hands.draw(this.lastKeys);
  }

  /** Limpia todo el display **/
  clear() {
    this.keyboard.clear();
    this.guides.clear();
    this.explosionLine.clear();
    this.hands.clear();
  }

  /** Centra el contenedor principal en (x,y) **/
  centerOn(x, y) {
    const b = this.container.getBounds();
    this.container.setPosition(
      x - b.width  / 2,
      y - b.height / 2
    );
    return this;
  }

  getKeyPosition(key) {
    return this.keyboard.getKeyPosition(key);
  }

  getKeyPositions() {
    return this.keyboard.getKeyPositions();
  }

  getContainer() {
    return this.container;
  }

  getMaxRowWidth() {
    return this.keyboard.getMaxRowWidth();
  }

  getExplosionLineY() {
    return this.explosionLine.getExplosionLineY();
  }
}
