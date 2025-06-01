// js/TypingTextScene solo con letterObjects y sin caja de texto

import ScoreManager from '../core/scoreManager.js';
import TitleManager from '../core/titleManager.js';
import KeyboardDisplay from '../ui/KeyboardDisplay.js';
import ContenidoNivel from '../core/contenidoNivel.js';

export default class TypingTextScene extends Phaser.Scene {
  constructor() {
    super("TypingTextScene");
    this.nivel = 2;
    this.texto = "";
    this.cursorIndex = 0;
    this.letterObjects = [];
  }

  preload() {
    this.load.audio("error", "assets/error.mp3");
    this.load.image("hands", "assets/hands.png");
  }

  init(data) {
    this.cursorIndex = 0;
    this.letterObjects = [];
    this.cursor = null;
    this.level = data.level || 1;
    this.speed = data.speed || 1;
    this.maxMisses = data.maxMisses || 5; // ← aquí lo hacemos configurable
    console.log(
      `📝 TypingTextScene Nivel ${this.level} - Texto: "${this.texto}"`
    );
  }

  create() {
    this.texto = ContenidoNivel.getTextoParaText(this.level) || 'hola mundo';
    this.scene.launch("GameHeaderScene");
    this.scene.bringToTop("GameHeaderScene");
    this.title = new TitleManager(this, {
      text: `Nivel ${this.level} – Texto`,
    });

    this.correctColor = "#00ff00";
    this.incorrectColor = "#ff4444";
    this.letterObjects = [];

    const margin = 50;
    const keyboardWidth = 720; // aprox. ancho teclado visual
    const textBoxWidth = keyboardWidth + 60; // poco más ancho que el teclado
    const startX = (this.scale.width - textBoxWidth) / 2;
    const startY = this.scale.height * 0.35;
    const lineSpacing = 40;
    const maxWidth = startX + textBoxWidth;

    const style = {
      fontSize: "24px",
      fontFamily: "monospace",
      color: "#ffffff",
    };

    const palabras = this.texto.split(" ");
    let x = startX;
    let y = startY;

    for (let palabra of palabras) {
      // Medir la palabra completa antes de colocarla
      const palabraTemp = this.add.text(0, 0, palabra + " ", style).setVisible(false);
      const palabraWidth = palabraTemp.width;
      palabraTemp.destroy();

      // Si no cabe, pasar a la siguiente línea
      if (x + palabraWidth > maxWidth) {
        x = startX;
        y += lineSpacing;
      }

      // Añadir letra por letra
      for (let i = 0; i < palabra.length; i++) {
        const letra = palabra[i];
        const letterObj = this.add.text(x, y, letra, style);
        this.letterObjects.push(letterObj);
        x += letterObj.width;
      }

      // Añadir espacio final
      const esp = this.add.text(x, y, " ", style);
      this.letterObjects.push(esp);
      x += esp.width;
    }

    // Cursor visual
    const firstLetter = this.letterObjects[0];
    this.cursor = this.add
      .rectangle(
        firstLetter.x,
        firstLetter.y + 28,
        firstLetter.width,
        2,
        0xffffff
      )
      .setOrigin(0, 0);
    this.tweens.add({
      targets: this.cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.scoreManager = new ScoreManager(this);

    this.setupKeyboard();

    this.input.keyboard.on("keydown", this.handleKey, this);

  }

  setupKeyboard() {
      try {
          // 3. Teclado centrado con posición responsive
          // Usar this.scene.cameras.main
          const centerY = this.cameras.main.centerY + (this.cameras.main.height < 600 ? 30 : 100); 
          
          // Instanciar el teclado.
          // El primer argumento debe ser la escena.
          this.KeyboardDisplay = new KeyboardDisplay(this, { 
              x: 0, 
              y: centerY, 
              // scale: this.getScale(), 
              // *** Agrega la propiedad initialSettings aquí ***
              initialSettings: {
                  guides: true, // Guías encendidas
                  explosionLine: true, // Línea de explosión encendida
                  // hands: this.scene.registry.get('showHands') !== false // Manos según el registro
                  hands: true,
              },
          });

          // 4. Forzar redibujado inicial
          this.KeyboardDisplay.draw([]); 

          // this.KeyboardDisplay.hands.visible = true;
          // this.KeyboardDisplay.explosionLine.visible = true;
          // this.KeyboardDisplay.guides.visible = true;

          // *** Añadir estas líneas para centrar el teclado horizontalmente ***
          // Asegúrate de que el KeyboardDisplay.js ya tiene el fix para getContainer().getBounds()
          // const keyboardBounds = this.KeyboardDisplay.getContainer().getBounds();
          const keyboardBounds = this.KeyboardDisplay.container.getBounds();
          this.KeyboardDisplay.container.setX(this.cameras.main.centerX - keyboardBounds.width / 2); // Usar this.scene.cameras.main
          // *******************************************************************
          
      } catch (error) {
          console.error('Error al crear teclado en TypingTextScene:', error); // Mensaje más específico
          // this.createFallbackMessage(); // Este método no existe en GameManager, está en la escena
          // Podrías lanzar un evento o loguear el error para que la escena lo maneje
      }
  }

  handleKey(event) {
    const key = event.key;
    console.log("[KeyboardDisplay] letra recibida:", key);

    if (["Shift", "Alt", "Dead", "Control"].includes(key)) return;

    const expected = this.texto[this.cursorIndex];

    if (key === expected) {
      this.letterObjects[this.cursorIndex].setColor(this.correctColor);
      this.cursorIndex++;
      this.scoreManager.addSuccess();

      if (this.cursorIndex < this.letterObjects.length) {
        const next = this.letterObjects[this.cursorIndex];
        this.cursor.setPosition(next.x, next.y + 28);
        this.cursor.width = next.width;
        this.KeyboardDisplay.draw(this.texto[this.cursorIndex]);
      } else {
        console.log("✅ Texto completado");
        this.cursor.destroy();
        this.advanceToNext();
      }
    } else if (key.length === 1) {
      const isSoundEnabled = JSON.parse(
        localStorage.getItem("soundEnabled") ?? "true"
      );
      if (isSoundEnabled && this.sound && this.sound.get("error")) {
        this.sound.play("error");
      }
      this.letterObjects[this.cursorIndex].setColor(this.incorrectColor);
      this.scoreManager.addMiss();
      this.KeyboardDisplay.draw(this.texto[this.cursorIndex]);

      if (this.scoreManager.misses >= this.maxMisses) {
        console.log("💀 Juego terminado por errores");
        this.cursor.destroy();
        this.scene.start('RetryScene', { level: this.level });
      }
    }
  }

  advanceToNext() {
    this.scene.start("InterlevelScene", {
      finishedMode: "text",
      finishedLevel: this.level,
    });
  }

  restartLevel() {
    this.scene.start("TypingFallingScene", {
      level: this.level,
      text: this.texto = ContenidoNivel.getLetrasParaFalling(this.level, 50) || 'hola mundo'
    });
  }
}
