
import { getKeysForChar } from '../utils/keyMappings.js';
import { DEPTH } from '../utils/depthLevels.js';

export default class KeyHighlighter {
  constructor(scene, keyPositions, group) {
    this.scene = scene;
    this.keyPositions = keyPositions;
    this.group = group;

    this.highlightColor = 0xffcc00;
    this.previousColor = 0xeeeeac;
    this.keyHeight = 33;
  }

  highlight({ nuevas = [], anteriores = [] }) {
    this.highlightArray(nuevas, this.highlightColor);
    this.highlightArray(anteriores, this.previousColor);
  }

  highlightChar(char, color = this.highlightColor) {
    if (!char || typeof char !== "string") return;

    const teclas = getKeysForChar(char);
    this.#pintar(teclas, color);
  }

  highlightArray(chars = [], color = this.highlightColor) {
    const teclas = chars
      .map(char => getKeysForChar(char))
      .flat()
      .filter(Boolean);
    this.#pintar(teclas, color);
  }

  #pintar(teclas, color) {
    teclas.forEach((tecla) => {
      const pos = this.keyPositions[tecla];
      if (!pos) return;

      const rect = this.scene.add
        .rectangle(pos.x - pos.width / 2, pos.y, pos.width, this.keyHeight, color)
        .setOrigin(0, 0)
        .setDepth(DEPTH.RESALTADO);

      this.group.add(rect);

      const label = tecla === "Espacio" ? "" : tecla;
      const posX = pos.x;
      const posY = pos.y;
      
      const keyText = this.scene.add
        .text(posX, posY + this.keyHeight / 2, label, {
          fontSize: "24px",
          fontStyle: "bold",
          fill: "#000000",
          fontFamily: "monospace"
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.TEXTO_RESALTADO);  // por encima del rectángulo

      this.group.add(keyText);

    });
  }
}
