// js/interlevelScene.js

import KeyboardDisplay from "../ui/KeyboardDisplay.js";
import ContenidoNivel from '../core/contenidoNivel.js'; // Asegúrate de que este archivo exista y sea accesible
import COLORS from "../config/colors.js";

export default class InterLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InterlevelScene' });
        this.nextLevel = 1;
        this.canContinue = false;
        this.isInitial = true;
        this.nextMode = null;
        this.finishedMode = null;
        this.finishedLevel = null;
        this.stage = 'details'; // 'congrats' o 'details'
        this.motivationalGraphic = null; // Para el elemento gráfico de motivación
        this.hideMotivationalTween = null; // Para guardar la referencia al tween de ocultar
    }

    init(data) {
        console.log('🟡 InterlevelScene recibió:', data);
        if (data.nextMode && data.nextLevel !== undefined) {
            this.isInitial = true;
            this.nextMode = data.nextMode;
            this.nextLevel = Number(data.nextLevel);
            this.finishedMode = null;
            this.finishedLevel = null;
        } else {
            this.isInitial = false;
            this.finishedMode = data.mode;
            this.finishedLevel = data.level;
            if (this.finishedMode === 'falling') {
                this.nextMode = 'text';
                this.nextLevel = this.finishedLevel;
            } else {
                this.nextMode = 'falling';
                this.nextLevel = this.finishedLevel + 1;
            }
        }
        this.stage = this.isInitial ? 'details' : 'congrats';
        this.registry.set('currentLevel', this.nextLevel);
    }

    preload() {
      this.load.image('hands', './assets/hands.png');
      // Puedes cargar más imágenes para motivación aquí si las tienes
      // this.load.image('star_burst', './assets/star_burst.png');
      // this.load.image('trophy_icon', './assets/trophy_icon.png');
    }

    create() {
        console.log('Creando InterlevelScene');
        console.log('Dimensiones:', this.cameras.main.width, this.cameras.main.height);

        // 1. Fondo oscuro semitransparente
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        // 2. Temporizador para inicializar elementos y UI
        this.time.delayedCall(300, () => {
            this.setupKeyboard();
            this.setupUI(); // Crea los objetos de texto (titleText, instructionText)
            this.setupEvents();
            
            // 3. LLAMAR A drawStage() AQUÍ para que se muestre el contenido inicial
            this.drawStage();

            // Habilitar continuar después de 1.5 segundos
            this.time.delayedCall(1500, () => {
                this.canContinue = true;
                this.showContinuePrompt();
            });
        });
    }

    setupKeyboard() {
        try {
            const centerY = this.cameras.main.centerY + (this.cameras.main.height < 600 ? 30 : 100); 
            
            this.keyboardDisplay = new KeyboardDisplay(this, { 
                x: 0, 
                y: centerY, 
                scale: this.getScale(), 
                initialSettings: {
                    guides: true,
                    explosionLine: true,
                    hands: this.registry.get('showHands') !== false
                }
            });

            this.keyboardDisplay.draw([]); 

            const keyboardGlobalBounds = this.keyboardDisplay.container.getBounds(); 
            const finalX = this.cameras.main.centerX - keyboardGlobalBounds.width / 2;
            
            this.keyboardDisplay.setPosition(finalX, centerY); 
            
        } catch (error) {
            console.error('Error al crear teclado en InterlevelScene:', error); 
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
        const style = {
            font: `bold ${this.getFontSize()}px Arial`,
            fill: '#FFFFFF',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true
            },
            align: 'center'
        };

        this.titleText = this.add.text(
            this.cameras.main.centerX,
            80,
            '',
            style
        ).setOrigin(0.5);

        this.instructionText = this.add.text(
            this.cameras.main.centerX,
            130,
            '',
            { ...style, font: `${this.getFontSize() - 4}px Arial`, fill: '#ffffff' }
        ).setOrigin(0.5);

        this.motivationalGraphic = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            '',
            { fontSize: '28px', fill: '#00FF00', fontStyle: 'italic', align: 'center' }
        ).setOrigin(0.5).setAlpha(0);
    }

    getFontSize() {
        return Math.max(16, Math.min(28, this.cameras.main.width / 25));
    }

    showContinuePrompt() {
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

        this.tweens.add({
            targets: this.continueText,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    setupEvents() {
        this.input.keyboard?.removeAllListeners();

        this.continueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.continueKey.on('down', () => {
            if (this.canContinue) {
                if (this.stage === 'congrats') {
                    this.stage = 'details';
                    this.drawStage();
                    this.hideMotivationalElement(); // Ocultar el gráfico de felicitación
                } else {
                    this.startGameScene();
                }
            }
        });

        this.input.keyboard.on('keydown-H', () => {
            if (this.keyboardDisplay && this.keyboardDisplay.hands) {
                const newState = !this.keyboardDisplay.hands.visible;
                this.keyboardDisplay.hands.setVisible(newState);
                this.registry.set('showHands', newState);
            }
        });
    }

    startGameScene() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.nextMode === 'falling') {
                this.scene.start('TypingFallingScene', {
                    level: this.nextLevel,
                    letters: ContenidoNivel.getLetrasParaFalling(this.nextLevel, 100),
                    speed: 1
                });
            } else {
                this.scene.start('TypingTextScene', {
                    level: this.nextLevel,
                    text: ContenidoNivel.getTextoParaText(this.nextLevel) // Usar getTextoParaText
                });
            }
        });
    }

    createFallbackMessage() {
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Preparando teclado...',
            {
                font: '24px Arial',
                fill: '#FFFFFF'
            }
        ).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.canContinue = true;
            this.startGameScene();
        });
    }

    drawStage() {
        const nm = this.nextMode;
        const nl = this.nextLevel;

        if (this.stage === 'congrats') {
            this.titleText.setText(`¡Felicidades! Completaste el nivel ${this.finishedLevel}!`);
            this.instructionText.setText('Presiona ESPACIO para continuar.');
            this.keyboardDisplay?.clear();
            this.hideLegend();
            this.showMotivationalElement('¡Increíble!', '¡Sigue así, lo vas a dominar!');
        } else { // stage === 'details'
            this.hideMotivationalElement(); // Ocultar motivación si venía de congrats

            const title = nm === 'falling'
                ? `Nivel ${nl} – Modo Caída de letras`
                : `Nivel ${nl} – Modo Texto`;
            const instr = nm === 'falling'
                ? 'Ahora aprenderemos estas letras:'
                : 'Prepara tus dedos, iniciamos el modo texto';

            this.titleText.setText(title);
            this.instructionText.setText(instr);

            if (nm === 'falling') {
                // CORRECCIÓN: Usar los nuevos métodos de ContenidoNivel para obtener las letras
                const nuevas = ContenidoNivel.getLetrasDelNivel(nl);
                // Las letras aprendidas son las acumuladas hasta el nivel ANTERIOR
                const anteriores = ContenidoNivel.getLetrasAcumuladasHastaNivel(nl - 1);
                
                // Filtramos las letras anteriores para que no incluyan las "nuevas" de este nivel
                // Esto asegura que una letra no sea "nueva" y "aprendida" al mismo tiempo en la visualización
                const letrasAprendidasFiltradas = anteriores.filter(l => !nuevas.includes(l));

                console.log('🪵 Letras nuevas (Nivel ' + nl + '): ', nuevas, ' 🪵 Letras aprendidas (hasta Nivel ' + (nl-1) + '): ', letrasAprendidasFiltradas);

                if (this.keyboardDisplay) {
                    // Pasamos las letras nuevas y las aprendidas (filtradas)
                    this.keyboardDisplay.draw([nuevas, letrasAprendidasFiltradas]);
                } else {
                    console.warn("KeyboardDisplay no está instanciado al intentar dibujar el teclado en drawStage.");
                }
                this.showLegend();
                this.showMotivationalElement('Consejo: Mantén la vista en la pantalla!', 'Practica la posición correcta de los dedos.');
            } else { // nm === 'text'
                // CORRECCIÓN: Usar getTextoParaText para el modo texto
                const textoCompleto = ContenidoNivel.getTextoParaText(nl);
                // Para la demo del teclado, podemos tomar un subconjunto de letras del texto
                const letrasDemo = textoCompleto.replace(/\s/g, '').split('').slice(0, 12);

                if (this.keyboardDisplay) {
                    this.keyboardDisplay.draw(letrasDemo); // Dibujar las letras de la demo
                } else {
                    console.warn("KeyboardDisplay no está instanciado al intentar dibujar el teclado en drawStage (modo texto).");
                }
                this.hideLegend();
                this.showMotivationalElement('Consejo: Enfócate en la precisión!', 'La fluidez viene con la práctica constante.');
            }
        }
    }

    // ------------------ MÉTODOS PARA MOTIVACIÓN Y LEYENDA (AJUSTES DE TIEMPOS) ------------------
    showMotivationalElement(mainText, subText = '') {
        if (this.motivationalGraphic) {
            // Detener cualquier tween de ocultamiento previo
            if (this.hideMotivationalTween && this.hideMotivationalTween.isPlaying()) {
                this.hideMotivationalTween.stop();
            }

            this.motivationalGraphic.setText(`${mainText}\n${subText}`);
            this.tweens.add({
                targets: this.motivationalGraphic,
                alpha: { from: 0, to: 1 },
                scale: { from: 0.8, to: 1 },
                duration: 500, // Duración de la aparición
                ease: 'Power2',
                yoyo: false, // No hace yoyo en la aparición
                repeat: 0,
                onComplete: () => {
                    // Después de aparecer, iniciar el tween para ocultar después de 5 segundos
                    this.hideMotivationalTween = this.tweens.add({
                        targets: this.motivationalGraphic,
                        alpha: 0,
                        delay: 5000, // Espera 5 segundos antes de empezar a ocultar
                        duration: 500, // Duración de la desaparición
                        onComplete: () => {
                            this.motivationalGraphic.setText(''); // Limpiar el texto al final
                        }
                    });
                }
            });
        }
    }

    hideMotivationalElement() {
        if (this.motivationalGraphic) {
            // Si hay un tween de ocultamiento activo, detenerlo y ocultar inmediatamente
            if (this.hideMotivationalTween && this.hideMotivationalTween.isPlaying()) {
                this.hideMotivationalTween.stop();
            }
            this.motivationalGraphic.setAlpha(0);
            this.motivationalGraphic.setText(''); // Limpiar el texto
        }
    }

    createLegendElements() {
        this.legendRectNew = this.add.rectangle(0, 0, 20, 20, 0xFF9900).setOrigin(0, 0.5);
        this.legendTextNew = this.add.text(0, 0, 'Nuevas', { fontSize: '16px', fill: '#fff' }).setOrigin(0, 0.5);
        this.legendRectLearned = this.add.rectangle(0, 0, 20, 20, 0x00AAFF).setOrigin(0, 0.5);
        this.legendTextLearned = this.add.text(0, 0, 'Aprendidas', { fontSize: '16px', fill: '#fff' }).setOrigin(0, 0.5);
        
        this.legendGroup = this.add.container(0, 0, [
            this.legendRectNew, this.legendTextNew,
            this.legendRectLearned, this.legendTextLearned
        ]);
        this.legendGroup.setVisible(false);
    }

    showLegend() {
        if (!this.legendGroup) {
            this.createLegendElements();
        }
        // CORRECCIÓN: Llamar a getExplosionLineY() como función
        const leyendaY = (this.keyboardDisplay?.getExplosionLineY() || 150) - 30; // Ajustar posición
        const lineaExplosion = this.keyboardDisplay.getExplosionLineY();
        console.log('Línea de explosión y: ', lineaExplosion);

        const leyendaX = this.cameras.main.centerX;

        this.legendRectNew.setPosition(leyendaX - 80, leyendaY);
        this.legendTextNew.setPosition(leyendaX - 50, leyendaY);
        this.legendRectLearned.setPosition(leyendaX + 40, leyendaY);
        this.legendTextLearned.setPosition(leyendaX + 70, leyendaY);
        
        this.legendGroup.setVisible(true);
    }

    hideLegend() {
        if (this.legendGroup) {
            this.legendGroup.setVisible(false);
        }
    }
}
