// js/keyboard.js

import {
    getKeysForChar,
    getFingerForKey
} from '../utils/keyMappings.js';

export default class Keyboard {
    constructor(scene) {
        this.scene = scene;
        this.group = scene.add.group();
        this.keyPositions = {};
        this.keyWidth = 44;
        this.keyHeight = 33;
        this.keySpacing = 6;
        this.rowSpacing = 6;

        this.layout = [
            ['º','1','2','3','4','5','6','7','8','9','0','´ ','¿','Backspace'],
            ['Tab','Q','W','E','R','T','Y','U','I','O','P','´','+','Enter'],
            ['Bloq Mayús','A','S','D','F','G','H','J','K','L','Ñ','{','}','Ent'],
            ['Shift','<','Z','X','C','V','B','N','M',',','.','-','Shift '],
            ['Ctrl','Fn','Win','Alt','Espacio','AltGr','Ctrl ','←','↑↓','→']
        ];

        this.fingerText = null;
        this.handSprite = null;
        this.dotSprite = null;

        // Teclas de referencia (home) para cada dedo (nombres sincronizados con keyMappings.js)
        this.homeKeys = {
            'meñique-izq': 'A',
            'anular-izq':   'S',
            'medio-izq':    'D',
            'indice-izq':   'F',
            'pulgar':       'Espacio',
            'indice-der':   'J',
            'medio-der':    'K',
            'anular-der':   'L',
            'meñique-der':  'Ñ'
        };
    }

    draw(letter = null) {
        const resolvedKeys = (typeof letter === 'string' && letter.length > 0)
            ? getKeysForChar(letter) || []
            : [];
        const mainKey = resolvedKeys[0];
        const fingerName = mainKey ? getFingerForKey(mainKey) : null;

        // Limpiar estado previo
        this.group.clear(true, true);
        if (this.fingerText) { this.fingerText.destroy(); this.fingerText = null; }
        if (this.handSprite) { this.handSprite.destroy(); this.handSprite = null; }
        if (this.dotSprite)  { this.dotSprite.destroy();  this.dotSprite = null; }

        // Calcular posición base del teclado
        const totalHeight = this.layout.length * (this.keyHeight + this.rowSpacing);
        const baseY = this.scene.scale.height - totalHeight - 50;
        let maxRowWidth = 0;

        // Dibujar teclado de fondo
        this.layout.forEach((row, rowIndex) => {
            let x = (this.scene.scale.width - this.getRowWidth(row)) / 2;
            let y = baseY + rowIndex * (this.keyHeight + this.rowSpacing);

            // Calculamos la fila más larga
            const rowWidth = row.length * (this.keyWidth + this.keySpacing);
            if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;

            row.forEach(key => {
                const width = this.getKeyWidth(key);
                const centerX = x + width / 2;

                // Guardar posición de cada tecla
                this.keyPositions[key] = { x: centerX, y: y, width };

                const isHighlighted = resolvedKeys.includes(key);
                const fillColor = isHighlighted ? 0xff9900 : 0x333333;

                const rect = this.scene.add.rectangle(x, y, width, this.keyHeight, fillColor)
                    .setStrokeStyle(2, 0xffffff)
                    .setOrigin(0, 0);
                this.group.add(rect);

                const label = key === 'Espacio' ? '' : key;
                const keyText = this.scene.add.text(x + width / 2, y + this.keyHeight / 2, label, {
                    fontSize: '12px', color: '#ffffff'
                }).setOrigin(0.5);
                this.group.add(keyText);

                x += width + this.keySpacing;
            });
        });

        // Línea de explosión centrada bajo el teclado
        this.explosionLineY = baseY - this.keyHeight - 10;
        const gfx = this.scene.add.graphics();
        gfx.lineStyle(2, 0xff0000, 1);
        gfx.beginPath();
        const centerX = this.scene.cameras.main.centerX;
        const halfWidth = maxRowWidth / 2;
        const lineStartX = centerX - halfWidth;
        const lineEndX = centerX + halfWidth;
        const lineY = this.explosionLineY + this.keyHeight;
        gfx.moveTo(lineStartX, lineY);
        gfx.lineTo(lineEndX, lineY);
        gfx.strokePath();

        // Dibujar imagen de las manos sobre el teclado con posición corregida
        this.handSprite = this.scene.add.image(
            this.scene.scale.width / 2 - 0.7 * this.keyWidth,
            baseY + 344 + 1.6 * (this.keyHeight + this.keySpacing)
        )
        .setOrigin(0.5, 1)
        .setTexture('fingers');

        // Colocar punto indicador sobre la tecla home del dedo
        if (fingerName && this.homeKeys[fingerName]) {
            const homeKey = this.homeKeys[fingerName];
            const pos = this.keyPositions[homeKey];
            if (pos) {
                this.dotSprite = this.scene.add.image(
                    pos.x,
                    pos.y + 0.4 * this.keyHeight + this.rowSpacing,
                    'finger-dot'
                ).setOrigin(0.5, 0.5);
            }
        }

        // // Texto de sugerencia de dedo en pantalla
        // if (fingerName) {
        //     this.fingerText = this.scene.add.text(
        //         this.scene.scale.width / 2,
        //         this.explosionLineY - 20,
        //         `👉 Usa dedo: ${fingerName}`,
        //         { fontSize: '18px', fontStyle: 'italic', color: '#ffaa00' }
        //     ).setOrigin(0.5);
        // }
    }

    getKeyWidth(key) {
        if (key === 'º') return this.keyWidth * 0.8;
        if (key === 'Backspace') return this.keyWidth * 2;
        if (key === 'Tab') return this.keyWidth * 1.6;
        if (key === 'Bloq Mayús') return this.keyWidth * 1.9;
        if (key === 'Enter') return this.keyWidth * 1.3;
        if (key === 'Ent') return this.keyWidth * 1;
        if (key === 'Shift') return this.keyWidth * 1.6;
        if (key === 'Shift ') return this.keyWidth * 2.5;
        if (key === 'Ctrl ') return this.keyWidth * 1.6;
        if (['Ctrl', 'Alt', 'AltGr', 'Fn', 'Win', '↑↓'].includes(key)) return this.keyWidth * 1;
        if (key === 'Espacio') return this.keyWidth * 5.5;
        if (['←', '→'].includes(key)) return this.keyWidth * 1.2;
        return this.keyWidth;
    }

    getRowWidth(row) {
        return row.reduce((total, key) => total + this.getKeyWidth(key) + this.keySpacing, -this.keySpacing);
    }

    getKeyPositions() {
        return this.keyPositions;
    }

    getExplosionLineY() {
        return this.explosionLineY;
    }
}
