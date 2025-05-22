
import KeyboardDisplay from "../ui/KeyboardDisplay.js";
import ScoreManager from "./scoreManager.js";

export default class GameManager {
  constructor(scene, mode, level, letters, text) {
    this.scene = scene;
    this.mode = mode;
    this.level = level;
    this.letters = letters;
    this.text = text;

    this.speed = 1;
    this.letterIndex = 0;
    this.score = 0;
    this.misses = 0;
    this.maxMisses = 3;

    // Crear teclado visual
    this.keyboard = new KeyboardDisplay(scene);

    // Crear línea de texto o lanzar primera letra
    if (this.mode === "falling") {
      this.spawnLetter();
    }

    // Crear gestor de puntaje
    this.scoreManager = new ScoreManager(scene);
  }

  update() {
  if (this.fallingLetter) {
    this.fallingLetter.moveDown(this.speed);
    if (this.fallingLetter.isOutOfBounds()) {
      this.handleMiss();
    }
  }
}

}
