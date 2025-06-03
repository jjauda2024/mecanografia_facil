// js/TypingTextScene solo con letterObjects y sin caja de texto

import ScoreManager from '../core/scoreManager.js';
import TitleManager from '../core/titleManager.js';
import KeyboardDisplay from '../ui/KeyboardDisplay.js';
import ContenidoNivel from '../core/contenidoNivel.js';
import RepetitiveTextPractice from '../core/RepetitiveTextPractice.js'; // Importar la nueva clase

export default class TypingTextScene extends Phaser.Scene {
  constructor() {
    super("TypingTextScene");
    this.nivel = 2; // O se obtiene de data
    this.textContent = ""; // Almacenará el texto obtenido de ContenidoNivel
    this.repetitiveTextPractice = null; // La instancia de la nueva clase
  }

  preload() {
    this.load.audio("error", "assets/error.mp3");
    this.load.image("hands", "assets/hands.png");
  }

  init(data) {
    this.level = data.level || 1;
    this.maxMisses = data.maxMisses || 5;
    console.log(`📝 TypingTextScene Nivel ${this.level} - Texto`);
  }

  create() {
    this.textContent = ContenidoNivel.getTextoParaText(this.level); // Obtener el texto completo
    if (!this.textContent) {
        console.error(`No se pudo cargar el texto para el nivel ${this.level}. Volviendo a WelcomeScene.`);
        this.scene.start('WelcomeScene');
        return;
    }

    this.scene.launch("GameHeaderScene");
    this.scene.bringToTop("GameHeaderScene");
    this.title = new TitleManager(this, {
      text: `Nivel ${this.level} – Texto`,
    });

    this.scoreManager = new ScoreManager(this); // ScoreManager sigue aquí

    // Configurar y crear el teclado visual
    this._setupKeyboardDisplay(); // Renombrado para claridad

    // Instanciar la nueva clase de práctica
    this.repetitiveTextPractice = new RepetitiveTextPractice(
        this, // La escena
        this.textContent, // El texto a practicar
        this.keyboardDisplay, // La instancia del teclado visual
        this.scoreManager, // El gestor de puntuación
        this.maxMisses, // Máximo de errores
        this._onPracticeComplete.bind(this) // Callback cuando la práctica termina
    );
    
    // NOTA: Los listeners de teclado y la lógica de manejo de teclas
    // ahora están dentro de RepetitiveTextPractice.
    // this.input.keyboard.on("keydown", this.handleKey, this); // ESTO SE ELIMINA
  }

  _setupKeyboardDisplay() { // Renombrado de setupKeyboard a _setupKeyboardDisplay
      try {
          const centerY = this.cameras.main.centerY + (this.cameras.main.height < 600 ? 30 : 100);

          this.keyboardDisplay = new KeyboardDisplay(this, {
              x: 0,
              y: centerY,
              initialSettings: {
                  guides: true,
                  explosionLine: true,
                  hands: true,
              },
          });

          this.keyboardDisplay.hands.visible = true;
          this.keyboardDisplay.explosionLine.visible = true;
          this.keyboardDisplay.guides.visible = true;

          // Dibuja el teclado vacío inicialmente; RepetitiveTextPractice lo resaltará.
          this.keyboardDisplay.draw([]);

          const keyboardBounds = this.keyboardDisplay.container.getBounds();
          this.keyboardDisplay.container.setX(this.cameras.main.centerX - keyboardBounds.width / 2);

      } catch (error) {
          console.error('Error al crear teclado en TypingTextScene:', error);
      }
  }

  /**
   * Callback llamado por RepetitiveTextPractice cuando la práctica ha terminado.
   * @param {boolean} success True si la práctica fue exitosa, false si hubo fallo.
   */
  _onPracticeComplete(success) {
      this.repetitiveTextPractice.destroy(); // Asegurar limpieza total
      if (success) {
          this.advanceToNext(); // Continuar al siguiente nivel/modo
      } else {
          this.scene.start('RetryScene', { level: this.level }); // Ir a la pantalla de reintento
      }
  }

  // Los métodos handleKey, advanceToNext y restartLevel se mantienen,
  // pero handleKey ya no tiene la lógica de procesamiento del texto.
  // La lógica de advanceToNext y restartLevel se mantienen como transiciones de escena.

  // handleKey() { // ESTE MÉTODO SE ELIMINA/QUEDA VACÍO, LA LÓGICA ESTÁ EN RepetitiveTextPractice
  //    // Ya no se usa aquí. La lógica de input se mueve a RepetitiveTextPractice.
  // }

  advanceToNext() {
    this.scene.start("InterlevelScene", {
      mode: "text",
      level: this.level,
      isStartingNewGame: false // Indica que viene de completar un nivel
    });
  }

  restartLevel() {
    this.scene.start("TypingTextScene", {
      level: this.level,
      // No necesitas pasar 'text' aquí, TypingTextScene lo cargará de ContenidoNivel
    });
  }
}