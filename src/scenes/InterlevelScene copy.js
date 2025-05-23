
import KeyboardDisplay from "../ui/KeyboardDisplay";



export default class InterLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InterLevelScene' });
        this.nextLevel = 1;
        this.canContinue = false;
    }

    init(data) {
        console.log('Creando InterLevelScene');
        console.log('Dimensiones:', this.cameras.main.width, this.cameras.main.height);

        this.nextLevel = data.level || 1;
        this.registry.set('currentLevel', this.nextLevel);
    }

    // preload() {
    //     // Precarga solo si no está cargada
    //     if (!this.textures.exists('hands')) {
    //         this.load.on('complete', () => {
    //             console.log('Assets precargados:', this.textures.getTextureKeys());
    //             this.createScene();
    //         });
            
    //         this.load.image('hands', 'assets/ui/hands.png');
    //         this.load.start(); // Importante para cargas dinámicas
    //     } else {
    //         this.createScene();
    //     }
    // }

    preload() {
      // Carga imágenes para las manos y el punto del dedo
      this.load.image('hands', './assets/hands.png');
    }

    createScene() {
        console.log('Creando InterLevelScene');
        console.log('Dimensiones:', this.cameras.main.width, this.cameras.main.height);

        // 1. Fondo oscuro semitransparente
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        // 2. Temporizador de seguridad
        this.time.delayedCall(300, () => {
            this.setupKeyboard();
            this.setupUI();
            this.setupEvents();
            
            // Habilitar continuar después de 1.5 segundos
            this.time.delayedCall(1500, () => {
                this.canContinue = true;
                this.showContinuePrompt();
            });
        });
    }

    setupKeyboard() {
        try {
            // 3. Teclado centrado con posición responsive
            const centerY = this.cameras.main.centerY + (this.cameras.main.height < 600 ? 30 : 100); // 
            
            // Instanciar el teclado. Puedes darle una 'x' inicial que luego ajustarás.
            // O directamente pasas 0 y luego lo centras.
            this.keyboardDisplay = new KeyboardDisplay(this, { // 
                x: 0, // Inicia en 0 o cualquier valor temporal, ya que lo centraremos después 
                y: centerY, 
                scale: this.getScale(), 
                handsOptions: { 
                    visible: this.registry.get('showHands') !== false 
                }
            });

            // 4. Forzar redibujado inicial (esto es importante para que el teclado tenga un ancho) 
            this.keyboardDisplay.draw([]); 

            // *** Añadir estas líneas para centrar el teclado horizontalmente ***
            const keyboardBounds = this.keyboardDisplay.getContainer().getBounds();
            this.keyboardDisplay.container.setX(this.cameras.main.centerX - keyboardBounds.width / 2);
            // *******************************************************************
            
        } catch (error) {
            console.error('Error al crear teclado:', error); 
            this.createFallbackMessage(); 
        }
    }

    getScale() {
        const width = this.cameras.main.width;
        if (width < 500) return 0.6;
        if (width < 800) return 0.8;
        return 1.0;
    }

    setupUI() {
        // 5. Texto de nivel con estilo adaptable
        const levelText = `Nivel ${this.nextLevel + 1}`;
        const style = {
            font: `bold ${this.getFontSize()}px Arial`,
            fill: '#FFD700',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true
            },
            align: 'center'
        };

        this.levelText = this.add.text(
            this.cameras.main.centerX,
            80,
            levelText,
            style
        ).setOrigin(0.5);

        // 6. Instrucciones animadas
        this.instructionText = this.add.text(
            this.cameras.main.centerX,
            130,
            'Prepara tus dedos en la posición inicial',
            { ...style, font: `${this.getFontSize() - 4}px Arial`, fill: '#FFFFFF' }
        ).setOrigin(0.5);

        // Animación de pulsación
        this.tweens.add({
            targets: this.instructionText,
            alpha: { from: 0.5, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    getFontSize() {
        return Math.max(16, Math.min(28, this.cameras.main.width / 25));
    }

    showContinuePrompt() {
        // 7. Mensaje para continuar (se muestra solo cuando canContinue=true)
        if (this.continueText) return;
        
        this.continueText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 60,
            'Presiona ESPACIO para continuar',
            {
                font: `${this.getFontSize() - 2}px Arial`,
                fill: '#00FF00',
                backgroundColor: '#333333',
                padding: 10
            }
        ).setOrigin(0.5);

        // Animación de parpadeo
        this.tweens.add({
            targets: this.continueText,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    setupEvents() {
        // 8. Limpiar eventos previos
        this.input.keyboard?.removeAllListeners();

        // Continuar al presionar espacio
        this.continueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.continueKey.on('down', () => {
            if (this.canContinue) {
                this.startGameScene();
            }
        });

        // Toggle manos con H
        this.input.keyboard.on('keydown-H', () => {
            const newState = !this.keyboardDisplay.hands.visible;
            this.keyboardDisplay.hands.setVisible(newState);
            this.registry.set('showHands', newState);
        });
    }

    startGameScene() {
        // 9. Transición con fade out
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TypingFallingScene', {
            level: this.nextLevel,
            letters: ContenidoNivel.getLetrasParaFalling(this.nextLevel, 100),
            speed: 1
          });
        });
    }

    createFallbackMessage() {
        // 10. Fallback visual si hay errores
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Preparando teclado...',
            {
                font: '24px Arial',
                fill: '#FFFFFF'
            }
        ).setOrigin(0.5);

        // Forzar continuación después de 3 segundos
        this.time.delayedCall(3000, () => {
            this.canContinue = true;
            this.startGameScene();
        });
    }
}