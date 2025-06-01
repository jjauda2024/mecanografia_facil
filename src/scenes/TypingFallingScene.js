// js/typingFallingScene.js

import GameManager from '../core/gameManager.js';
import TitleManager from '../core/titleManager.js';
import ContenidoNivel from '../core/contenidoNivel.js';


/**
 * Escena TypingFallingScene
 * Muestra letras que caen desde la parte superior y el jugador debe presionarlas antes de que lleguen al fondo.
 */
export default class TypingFallingScene extends Phaser.Scene {
    constructor() {
        super('TypingFallingScene');
    }

    preload() {
        // sprites de manos y dedo y sonido error
        this.load.audio('error', 'assets/error.mp3');
        this.load.image('hands', 'assets/hands.png');
    }

    /**
     * Método llamado cuando se inicia la escena con parámetros externos.
     * @param {Object} data - Datos pasados desde la escena anterior o desde el index.
     */
    init(data) {
        this.level = data.level || 1;
        this.letters = ContenidoNivel.getLetrasParaFalling(this.level, 100) || ['a'];
        this.speed = data.speed || 1;

        console.log(
            `🎮 Iniciando TypingFallingScene - Nivel ${this.level}, Velocidad inicial: ${this.speed}`
          );
        }

    /**
     * Configura los objetos y el estado inicial de la escena.
     */
    create() {
        this.scene.launch('GameHeaderScene');
        this.scene.bringToTop('GameHeaderScene');
        console.log('🟢 TypingFallingScene: create iniciado');

        this.title = new TitleManager(this, {
            text: `Nivel ${this.level} – Caída de letras`
        });
          
        this.manager = new GameManager(
            this,
            this.letters,
            this.speed,
            2, // velocidad máxima para pasar de nivel
            this.level,
            'falling'
        );

        // *** NUEVO: Crear el botón de control de sonido en la escena ***
        this.createSoundToggleButton();

    }

    /**
     * Llamado en cada frame para actualizar la escena.
     */
    update() {
        if (this.manager) {
            this.manager.update();
        }
    }

    // * Crea y posiciona el botón de encendido/apagado del sonido.
    
    createSoundToggleButton() {
        const isSoundEnabled = JSON.parse(localStorage.getItem("soundEnabled") ?? "true");

        const buttonStyle = {
            fontSize: "12px",
            fontFamily: "Arial",
            padding: { x: 8, y: 4 },
            backgroundColor: isSoundEnabled ? '#333333' : '#555555',
            color: '#BBBBBB'
        };

        const icon = "🔊"; // Ícono de volumen

        // Posicionar el botón (ejemplo: arriba a la derecha, ajústalo según tu diseño)
        const xPos = 120; // this.cameras.main.width - 20; // Cerca del borde derecho
        const yPos = 45; // Cerca del borde superior

        this.soundToggleButton = this.add.text(xPos, yPos, `${icon} Sound ${isSoundEnabled ? "ON" : "OFF"}`, buttonStyle)
            .setInteractive()
            .setOrigin(1, 0) // Origen en la esquina superior derecha para posicionar desde ahí
            .setDepth(100) // Asegurarse de que esté por encima de otros elementos
            .on("pointerdown", () => this.toggleSound());

        // También podrías añadirlo al contenedor del KeyboardDisplay si quieres que se mueva con él,
        // pero mantenerlo directamente en la escena es más simple si es una opción global.
    }

    /**
     * Alterna el estado del sonido, actualiza localStorage y el botón.
     */
    toggleSound() {
        let isSoundEnabled = JSON.parse(localStorage.getItem("soundEnabled") ?? "true");
        isSoundEnabled = !isSoundEnabled; // Invertir el estado

        localStorage.setItem("soundEnabled", JSON.stringify(isSoundEnabled)); // Guardar en localStorage

        // Aplicar el mute global a todos los sonidos de la escena de Phaser
        this.sound.mute = !isSoundEnabled;

        // Actualizar el texto y color del botón
        const icon = "🔊";
        this.soundToggleButton.setText(`${icon} Sound ${isSoundEnabled ? "ON" : "OFF"}`);
        this.soundToggleButton.setBackgroundColor(isSoundEnabled ? '#333333' : '#555555');

        console.log(`🔊 Sonido ahora: ${isSoundEnabled ? "ON" : "OFF"}`);
    }
}
