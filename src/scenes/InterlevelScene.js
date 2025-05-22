// js/interlevelScene.js
import KeyboardDisplay from "../ui/KeyboardDisplay.js"; // Asegúrate de que la ruta sea correcta
import ContenidoNivel from '../core/contenidoNivel.js'; // Necesitas importar ContenidoNivel

export default class InterLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InterlevelScene' }); // Cambiado a 'InterlevelScene' para consistencia con juego.html [cite: 1]
        this.nextLevel = 1;
        this.canContinue = false;
    }

    init(data) {
        console.log('Creando InterlevelScene');
        console.log('Dimensiones:', this.cameras.main.width, this.cameras.main.height);

        this.nextLevel = data.level || 1;
        this.registry.set('currentLevel', this.nextLevel);
    }

    preload() {
      // Carga imágenes para las manos y el punto del dedo
      this.load.image('hands', './assets/hands.png'); // [cite: 2]
      // Si tienes otros assets que InterlevelScene necesite, cárgalos aquí.
    }

    create() { // <--- Todo lo que estaba en createScene() va aquí
        console.log('Creando InterlevelScene');
        console.log('Dimensiones:', this.cameras.main.width, this.cameras.main.height);

        // 1. Fondo oscuro semitransparente
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8) // [cite: 2]
            .setOrigin(0) // [cite: 2]
            .setInteractive(); // [cite: 2]

        // 2. Temporizador de seguridad (puedes quitarlo si el flujo es más directo)
        // O dejarlo para dar un pequeño retraso antes de mostrar el teclado y la UI
        this.time.delayedCall(300, () => { // [cite: 2]
            this.setupKeyboard(); // [cite: 2]
            this.setupUI(); // [cite: 2]
            this.setupEvents(); // [cite: 2]

            // Habilitar continuar después de 1.5 segundos
            this.time.delayedCall(1500, () => { // [cite: 2]
                this.canContinue = true; // [cite: 2]
                this.showContinuePrompt(); // [cite: 2]
            });
        });
    }

    setupKeyboard() { // [cite: 2]
        try {
            // 3. Teclado centrado con posición responsive
            const centerY = this.cameras.main.centerY + (this.cameras.main.height < 600 ? 30 : 100); // [cite: 2]

            this.keyboardDisplay = new KeyboardDisplay(this, { // [cite: 2]
                x: this.cameras.main.centerX, // [cite: 2]
                y: centerY, // [cite: 2]
                scale: this.getScale(), // [cite: 2]
                handsOptions: { // [cite: 2]
                    visible: this.registry.get('showHands') !== false // [cite: 2]
                }
            });

            // 4. Forzar redibujado inicial
            this.keyboardDisplay.draw([]); // [cite: 2]

        } catch (error) {
            console.error('Error al crear teclado:', error); // [cite: 2]
            this.createFallbackMessage(); // [cite: 2]
        }
    }

    getScale() { // [cite: 2]
        const width = this.cameras.main.width; // [cite: 2]
        if (width < 500) return 0.6; // [cite: 2]
        if (width < 800) return 0.8; // [cite: 2]
        return 1.0; // [cite: 2]
    }

    setupUI() { // [cite: 2]
        // 5. Texto de nivel con estilo adaptable
        const levelText = `Nivel ${this.nextLevel + 1}`; // [cite: 2]
        const style = { // [cite: 2]
            font: `bold ${this.getFontSize()}px Arial`, // [cite: 2]
            fill: '#FFD700', // [cite: 2]
            shadow: { // [cite: 2]
                offsetX: 2, // [cite: 2]
                offsetY: 2, // [cite: 2]
                color: '#000000', // [cite: 2]
                blur: 4, // [cite: 2]
                stroke: true // [cite: 2]
            },
            align: 'center' // [cite: 2]
        };

        this.levelText = this.add.text( // [cite: 2]
            this.cameras.main.centerX, // [cite: 2]
            80, // [cite: 2]
            levelText, // [cite: 2]
            style // [cite: 2]
        ).setOrigin(0.5); // [cite: 2]

        // 6. Instrucciones animadas
        this.instructionText = this.add.text( // [cite: 2]
            this.cameras.main.centerX, // [cite: 2]
            130, // [cite: 2]
            'Prepara tus dedos en la posición inicial', // [cite: 2]
            { ...style, font: `${this.getFontSize() - 4}px Arial`, fill: '#FFFFFF' } // [cite: 2]
        ).setOrigin(0.5); // [cite: 2]

        // Animación de pulsación
        this.tweens.add({ // [cite: 2]
            targets: this.instructionText, // [cite: 2]
            alpha: { from: 0.5, to: 1 }, // [cite: 2]
            duration: 1000, // [cite: 2]
            yoyo: true, // [cite: 2]
            repeat: -1 // [cite: 2]
        });
    }

    getFontSize() { // [cite: 2]
        return Math.max(16, Math.min(28, this.cameras.main.width / 25)); // [cite: 2]
    }

    showContinuePrompt() { // [cite: 2]
        // 7. Mensaje para continuar (se muestra solo cuando canContinue=true)
        if (this.continueText) return; // [cite: 2]

        this.continueText = this.add.text( // [cite: 2]
            this.cameras.main.centerX, // [cite: 2]
            this.cameras.main.height - 60, // [cite: 2]
            'Presiona ESPACIO para continuar', // [cite: 2]
            { // [cite: 2]
                font: `${this.getFontSize() - 2}px Arial`, // [cite: 2]
                fill: '#00FF00', // [cite: 2]
                backgroundColor: '#333333', // [cite: 2]
                padding: 10 // [cite: 2]
            }
        ).setOrigin(0.5); // [cite: 2]

        // Animación de parpadeo
        this.tweens.add({ // [cite: 2]
            targets: this.continueText, // [cite: 2]
            alpha: 0.7, // [cite: 2]
            duration: 800, // [cite: 2]
            yoyo: true, // [cite: 2]
            repeat: -1 // [cite: 2]
        });
    }

    setupEvents() { // [cite: 2]
        // 8. Limpiar eventos previos
        this.input.keyboard?.removeAllListeners(); // [cite: 2]

        // Continuar al presionar espacio
        this.continueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // [cite: 2]
        this.continueKey.on('down', () => { // [cite: 2]
            if (this.canContinue) { // [cite: 2]
                this.startGameScene(); // [cite: 2]
            }
        });

        // Toggle manos con H
        this.input.keyboard.on('keydown-H', () => { // [cite: 2]
            // Aquí necesitas asegurarte de que keyboardDisplay.hands existe y es visible
            if (this.keyboardDisplay && this.keyboardDisplay.hands) {
                const newState = !this.keyboardDisplay.hands.visible; // [cite: 2]
                this.keyboardDisplay.hands.setVisible(newState); // [cite: 2]
                this.registry.set('showHands', newState); // [cite: 2]
            }
        });
    }

    startGameScene() { // [cite: 2]
        // 9. Transición con fade out
        this.cameras.main.fadeOut(400, 0, 0, 0); // [cite: 2]
        this.cameras.main.once('camerafadeoutcomplete', () => { // [cite: 2]
        this.scene.start('TypingFallingScene', { // [cite: 2]
            level: this.nextLevel, // [cite: 2]
            letters: ContenidoNivel.getLetrasParaFalling(this.nextLevel, 100), // [cite: 2]
            speed: 1 // [cite: 2]
          });
        });
    }

    createFallbackMessage() { // [cite: 2]
        // 10. Fallback visual si hay errores
        this.add.text( // [cite: 2]
            this.cameras.main.centerX, // [cite: 2]
            this.cameras.main.centerY, // [cite: 2]
            'Preparando teclado...', // [cite: 2]
            { // [cite: 2]
                font: '24px Arial', // [cite: 2]
                fill: '#FFFFFF' // [cite: 2]
            }
        ).setOrigin(0.5); // [cite: 2]

        // Forzar continuación después de 3 segundos
        this.time.delayedCall(3000, () => { // [cite: 2]
            this.canContinue = true; // [cite: 2]
            this.startGameScene(); // [cite: 2]
        });
    }
}