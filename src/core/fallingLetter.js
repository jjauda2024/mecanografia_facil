// js/fallingLetter.js

import { getKeysForChar } from '../utils/keyMappings.js';

export default class FallingLetter {
    constructor(scene, char, keyPositions, explosionLineY) {
        this.scene = scene;
        this.originalChar = char;

        // // Representar el espacio como la palabra 'Espacio'
        // this.char = char === ' ' ? 'espacio' : char;

        // Determinar la tecla física principal (la última del combo)
        // Para espacios forzamos 'Espacio'
        const keyName = char === ' ' 
            ? 'Espacio' 
            : (getKeysForChar(char) || []).slice(-1)[0];

        const mainKey = keyName.toUpperCase();
        const position = keyPositions[mainKey] || { x: scene.scale.width / 2, width: 40 };
        this.x = position.x;
        this.y = 160;
        this.explosionLineY = explosionLineY;

        // Crear el texto en pantalla (mostrando 'Espacio' para espacios)
        this.text = scene.add.text(this.x, this.y, this.char, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
    }

    moveDown(speed) {
        this.y += speed;
        this.text.setY(this.y);
    }

    isOutOfBounds() {
        return this.y > this.explosionLineY + 20;
    }

    matchesKey(keyPressed) {
        // El usuario debe presionar ' ' para espacios
        if (this.originalChar === ' ') {
            return keyPressed === ' ';
        }
        return keyPressed === this.originalChar;
    }

    destroy() {
        this.text.destroy();
    }
}
