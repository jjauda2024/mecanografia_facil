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
    this.scene = scene; // ¡Importante: 'scene' es la escena de Phaser!
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

    this.setupKeyboard();

    // Las siguientes líneas también necesitan usar 'this.scene'
    this.scoreManager = new ScoreManager(this.scene); // Pasa la escena al ScoreManager
    const baseY = this.keyboardDisplay.getExplosionLineY(); // Usar this.keyboardDisplay
    // this.scene.scene.launch('OpcionesScene', { baseY: baseY + 40 });

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

  setupKeyboard() {
      try {
          // 3. Teclado centrado con posición responsive
          // Usar this.scene.cameras.main
          const centerY = this.scene.cameras.main.centerY + (this.scene.cameras.main.height < 600 ? 30 : 100); 
          
          // Instanciar el teclado.
          // El primer argumento debe ser la escena.
          this.keyboardDisplay = new KeyboardDisplay(this.scene, { 
              x: 0, 
              y: centerY, 
              scale: this.getScale(), 
              // *** Agrega la propiedad initialSettings aquí ***
              initialSettings: {
                  guides: true, // Guías encendidas
                  explosionLine: true, // Línea de explosión encendida
                  // hands: this.scene.registry.get('showHands') !== false // Manos según el registro
                  hands: true,
              },
          });

          this.keyboardDisplay.hands.visible = true;
          this.keyboardDisplay.explosionLine.visible = true;
          this.keyboardDisplay.guides.visible = true;

          // 4. Forzar redibujado inicial
          this.keyboardDisplay.draw([]); 

          // *** Añadir estas líneas para centrar el teclado horizontalmente ***
          // Asegúrate de que el KeyboardDisplay.js ya tiene el fix para getContainer().getBounds()
          // const keyboardBounds = this.keyboardDisplay.getContainer().getBounds();
          const keyboardBounds = this.keyboardDisplay.container.getBounds();
          this.keyboardDisplay.container.setX(this.scene.cameras.main.centerX - keyboardBounds.width / 2); // Usar this.scene.cameras.main
          // *******************************************************************
          
      } catch (error) {
          console.error('Error al crear teclado en GameManager:', error); // Mensaje más específico
          // this.createFallbackMessage(); // Este método no existe en GameManager, está en la escena
          // Podrías lanzar un evento o loguear el error para que la escena lo maneje
      }
  }

  // Este método getScale() debe pertenecer al GameManager si lo usas aquí.
  // Si está en la escena, deberías llamarlo como this.scene.getScale()
  getScale() {
    const width = this.scene.cameras.main.width; // Usar this.scene.cameras.main
    if (width < 500) return 0.6;
    if (width < 800) return 0.8;
    return 1.0;
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
      this.keyboardDisplay.getKeyPositions(), // Usar this.keyboardDisplay
      this.keyboardDisplay.getExplosionLineY() // Usar this.keyboardDisplay
    );

    console.log("keyboardPositions de letra: ", this.keyboardDisplay.getKeyPositions(letter));

    // this.keyboardDisplay.clear(); // Usar this.keyboardDisplay
    this.keyboardDisplay.draw(letter); // Usar this.keyboardDisplay
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
    if (isSoundEnabled && this.scene.sound?.get("error")) { // Usar this.scene.sound
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
    console.log(`🚀 Velocidad actual: ${this.speed.toFixed(2)}`); // Usar template literals
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