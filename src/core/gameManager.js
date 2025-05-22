import KeyboardDisplay from '../ui/KeyboardDisplay.js';
import FallingLetter from './fallingLetter.js';
import ScoreManager from './scoreManager.js';
import ContenidoNivel from './contenidoNivel.js';

export default class GameManager {
  constructor(
    scene,
    letters,
    speedStart = 1,
    speedMax = 4,
    level = 1,
    mode = "falling"
  ) {
    console.log("🧠 GameManager constructor:", letters, speedStart, speedMax);
    this.scene = scene;
    this.letters = letters;
    this.level = level;
    this.mode = mode;
    this.speed = speedStart;
    this.speedMax = speedMax;
    this.speedIncrement = 0.1;
    this.misses = 0;
    this.maxMisses = 5;
    this.letterIndex = 0;

    this.fallingLetter = null;

    this.keyboard = new KeyboardDisplay(scene, {
      keyColor: 0x222222,
      highlightColor: 0xffcc00,
    });

    this.keyboard.draw(); // Sin resaltado al inicio
    const showLine = JSON.parse(localStorage.getItem('linea') ?? 'true');
      this.keyboard.explosionEnabled = showLine;

    this.scoreManager = new ScoreManager(scene);
    const baseY = this.keyboard.getExplosionLineY();
    this.scene.scene.launch('OpcionesScene', { baseY: baseY + 40 });

    this.scene.input.keyboard.on("keydown", (event) => this.handleKey(event));

    this.spawnLetter(); // iniciar con la primera letra
  }

  update() {
    if (this.fallingLetter) {
      this.fallingLetter.moveDown(this.speed);

      if (this.fallingLetter.isOutOfBounds()) {
        this.handleMiss();
      }
    }
  }

  spawnLetter() {
    if (this.letterIndex >= this.letters.length) {
      this.letterIndex = 0; // reiniciar si se desea ciclo continuo
    }

    const letter = this.letters[this.letterIndex];
    this.letterIndex++;

    console.log("🔤 Generando letra:", letter);

    this.fallingLetter = new FallingLetter(
      this.scene,
      letter,
      this.keyboard.getKeyPositions(),
      this.keyboard.getExplosionLineY()
    );

    this.keyboard.clear();
    this.keyboard.draw(letter);
  }

  handleKey(event) {
    if (!this.fallingLetter) return;

    // Ignorar teclas muertas (como ´)
    if (event.key === "Dead") return;

    const keyPressed = event.key;

    if (this.fallingLetter.matchesKey(keyPressed)) {
      this.scoreManager.addSuccess();
      this.fallingLetter.destroy();

      this.increaseSpeedIfNeeded();

      if (this.speed >= this.speedMax) {
        console.log("🏁 Nivel completado con éxito");
        this.advanceToNext();
      } else {
        this.spawnLetter();
      }
    } else {
      this.handleMiss();
    }
  }

handleMiss() {
  // Verifica si el sonido de error está activado
  const isSoundEnabled = JSON.parse(localStorage.getItem("soundEnabled") ?? "true");
  if (isSoundEnabled && this.scene.sound?.get("error")) {
    this.scene.sound.play("error");
  }

  this.scoreManager.addMiss();
  this.misses++;

  if (this.misses >= this.maxMisses) {
    console.log("💀 Juego terminado: demasiados errores");
    this.scene.scene.start("RetryScene", { level: this.level });
  } else {
    this.fallingLetter.destroy();
    this.letterIndex--; // retrocedemos el índice
    this.spawnLetter(); // → vuelve a lanzar la misma letra
  }
}


  increaseSpeedIfNeeded() {
    this.speed += this.speedIncrement;
    if (this.speed > this.speedMax) this.speed = this.speedMax;
    console.log("🚀 Velocidad actual: ${this.speed.toFixed(2)}");
  }

  advanceToNext() {
    // Al terminar la caída del nivel actual (this.level),
    // arrancamos InterlevelScene pasándole el modo y el nivel ya completado.
    if (ContenidoNivel.getLetrasParaFalling(this.level + 1).length > 0) {
      this.scene.scene.start("InterlevelScene", {
        mode: "falling", // acabamos de finalizar “falling”
        level: this.level, // nivel completado
      });
    } else {
      this.scene.scene.start("EndScene");
    }
  }

  restartLevel() {
    if (this.mode === "falling") {
      const letters = ContenidoNivel.getLetrasParaFalling(this.level, 100);
      this.scene.scene.start("TypingFallingScene", {
        level: this.level,
        letters: letters,
        speed: 1,
      });
    } else {
      const text = ContenidoNivel.getPalabrasParaText(this.level, 50);
      this.scene.scene.start("TypingTextScene", {
        level: this.level,
        text: text,
      });
    }
  }
}