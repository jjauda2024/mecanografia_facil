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
    }

    /**
     * Llamado en cada frame para actualizar la escena.
     */
    update() {
        if (this.manager) {
            this.manager.update();
        }
    }
}
