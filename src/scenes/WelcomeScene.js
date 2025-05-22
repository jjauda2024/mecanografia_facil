// ui/WelcomeScene.js
// Escena de bienvenida que muestra título, demo de teclado y selección de nivel

import niveles from '../utils/nivelesData.js';
import KeyboardDisplay from '../ui/KeyboardDisplay.js';

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }

  preload() {
    // Carga imágenes para las manos y el punto del dedo
    this.load.image('hands', './assets/hands.png');
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
          this.scene.start('InterlevelScene', {
            nextMode:  'falling',
            nextLevel: Number(nivel)
          });
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

  setupKeyboardDisplay() {
    try {
        this.keyboard = new KeyboardDisplay(this, {
            x: this.cameras.main.centerX,
            y: 300,
            keyboardOptions: {
                keyColor: 0x333333,
                highlightColor: 0x00AAFF
            }
        });

        this.keyboard.draw();

        // Centrar el teclado horizontalmente
        const bounds = this.keyboard.getContainer().getBounds();
        this.keyboard.container.setX(this.cameras.main.centerX - bounds.width / 2);
        this.add.existing(this.keyboard.container);

    } catch (error) {
        console.error('Error al inicializar keyboard:', error);
        this.debugText.setText('Error: Verifica la consola');
    }
  }
  
}
