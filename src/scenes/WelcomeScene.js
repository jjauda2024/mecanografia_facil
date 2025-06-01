// ui/WelcomeScene.js
// Escena de bienvenida que muestra título, demo de teclado y selección de nivel

import niveles from '../utils/nivelesData.js';
import TypingFallingScene from './TypingFallingScene.js';
import ContenidoNivel from '../core/contenidoNivel.js';

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }

  preload() {
    this.load.image('hands', './assets/hands.png');
    this.load.audio('error', './assets/error.mp3'); // <-- Añade esta línea
  }

  create() {
    // Lanzar encabezado de juego (GameHeaderScene debería existir)
    this.scene.launch('GameHeaderScene');

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

        // Título principal
    this.add.text(centerX, 100, '🎓 Mecanografía Fácil', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(centerX, 140, 'Selecciona un nivel para comenzar:', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Demo del teclado interactivo
    // this.keyboardDisplay = new KeyboardDisplay(this, { x: centerX, y: centerY });
    // this.keyboardDisplay.draw();
    // Centrar demo un poco más arriba de los botones
    // this.keyboardDisplay.centerOn(centerX, centerY);
    // this.setupKeyboardDisplay();

    // Botones de niveles
    const nivelesKeys = Object.keys(niveles);
    const buttonWidth   = 120;
    const buttonSpacing = 20;
    const totalWidth    = nivelesKeys.length * (buttonWidth + buttonSpacing) - buttonSpacing;
    const startX        = centerX - totalWidth / 2 + buttonWidth / 2;
    const buttonY       = centerY;

    nivelesKeys.forEach((nivel, index) => {
      const buttonX = startX + index * (buttonWidth + buttonSpacing);
      const btn = this.add.text(buttonX, buttonY, `Nivel ${nivel}`, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 12, y: 8 },
        align: 'center'
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => btn.setStyle({ backgroundColor: '#cccccc' }))
        .on('pointerout',  () => btn.setStyle({ backgroundColor: '#ffffff' }))
        .on('pointerdown', () => {
          // Asegurar pantalla completa
          if (!this.scale.isFullscreen) this.scale.startFullscreen();
          // Ir a InterlevelScene con modo 'falling'
            // Intentar el siguiente nivel de Falling
            const selectedLevel = Number(nivel);
            const nextFallingLetters = ContenidoNivel.getLetrasParaFalling(selectedLevel);
            if (nextFallingLetters.length > 0) {
                      this.scene.stop('GameHeaderScene');
                      this.scene.stop('WelcomeScene');
                      this.scene.start('InterlevelScene', {
                      nextLevel: selectedLevel, // nivel seleccionado
                      nextMode: 'falling',
                      isInitial: true
                    });
            } else {
                console.warn(`El nivel ${selectedLevel} de Falling no tiene contenido. No se puede iniciar.`);
                // Opcional: mostrar un mensaje al usuario
                this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100,
                  'Este nivel no tiene contenido disponible.',
                  { fontSize: '18px', color: '#ff4444' }).setOrigin(0.5);
            }
            
        });

      // Fondo redondeado detrás del texto
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 1);
      bg.fillRoundedRect(
        btn.x - btn.width  / 2 - 10,
        btn.y - btn.height / 2 - 10,
        btn.width + 20,
        btn.height + 20,
        12
      );
      btn.setDepth(1);
    });
  }

}
