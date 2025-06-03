// scenes/DebugContentScene.js

import ContenidoNivel from '../core/contenidoNivel.js'; // Importar ContenidoNivel
import { niveles } from '../utils/nivelesData.js'; // <-- Importar 'niveles' con nombre AQUI
import KeyboardDisplay from '../ui/KeyboardDisplay.js'; // Opcional: para ver el teclado

export default class DebugContentScene extends Phaser.Scene {
    constructor() {
        super('DebugContentScene');
        this.debugTextObject = null; // Para mostrar el texto en pantalla
        this.level = 1; // Nivel inicial para probar
        this.mode = 'text'; // Modo inicial para probar (aunque ContenidoNivel no usa el modo directamente en getTextoParaText)
    }

    preload() {
        // Cargar cualquier asset necesario si quieres dibujar el teclado o manos, etc.
        this.load.image('hands', './assets/hands.png');
        this.load.audio('error', './assets/error.mp3'); // Para que KeyboardDisplay no falle si lo usas
    }

    create() {
        this.add.text(this.cameras.main.centerX, 50, 'DEBUG: Contenido de Nivel', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // --- Mostrar el texto en la consola ---
        console.log('--- DEBUG DE CONTENIDO DE NIVEL ---');
        for (let i = 1; i <= 5; i++) { // Probar varios niveles
            const textContent = ContenidoNivel.getTextoParaText(i);
            console.log(`Nivel ${i} (Modo Texto):`);
            console.log(`"${textContent}"`); // Usa comillas para ver espacios al inicio/final
            console.log('---');
        }
        console.log('--- FIN DEBUG ---');

        // --- Mostrar el texto en la pantalla (para ver saltos de línea y espacios) ---
        this.debugTextObject = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            '', // Texto inicial vacío
            {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: '#00ffff', // Cian para distinguirlo
                align: 'left',
                wordWrap: { width: this.cameras.main.width * 0.8 }
            }
        ).setOrigin(0.5, 0); // Origen en el centro horizontal, arriba vertical

        this._updateDebugDisplay(this.level); // Muestra el texto del nivel 1 inicialmente

        // --- Botones para cambiar de nivel ---
        const buttonStyle = { fontSize: '20px', backgroundColor: '#333', padding: { x: 10, y: 5 } };
        this.add.text(this.cameras.main.centerX - 100, this.cameras.main.height - 50, 'Nivel Anterior', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this._changeLevel(-1));

        this.add.text(this.cameras.main.centerX + 100, this.cameras.main.height - 50, 'Nivel Siguiente', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this._changeLevel(1));

        // Opcional: Instanciar el KeyboardDisplay para ver si aparece
        // this.keyboardDisplay = new KeyboardDisplay(this, {
        //     x: this.cameras.main.centerX,
        //     y: this.cameras.main.height - 200, // Posicionarlo más arriba para no solapar botones
        //     initialSettings: { guides: true, explosionLine: true, hands: true }
        // });
        // this.keyboardDisplay.container.setX(this.cameras.main.centerX - this.keyboardDisplay.container.getBounds().width / 2);
        // this.keyboardDisplay.draw([]); // Dibujar el teclado base
    }

    _updateDebugDisplay(level) {
        // Asegurarse de que el nivel sea válido
        if (level < 1) level = 1;
        const maxLevel = Object.keys(niveles).length; // Asumiendo que niveles se exporta
        if (level > maxLevel) level = maxLevel;

        this.level = level;
        const textContent = ContenidoNivel.getTextoParaText(this.level);

        this.debugTextObject.setText(`Nivel Actual: ${this.level}\n\n${textContent}`);
        console.log(`Mostrando Nivel ${this.level}: "${textContent}"`);
    }

    _changeLevel(delta) {
        this._updateDebugDisplay(this.level + delta);
    }
}