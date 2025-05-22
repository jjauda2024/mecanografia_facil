// js/demoScene.js

import KeyboardDisplay from '../ui/KeyboardDisplay';

export default class DemoScene extends Phaser.Scene {
  constructor() {
    super('DemoScene');
  }

  preload() {
    this.load.image('fingers', 'assets/fingers.png');
    this.load.image('finger-dot', 'assets/finger-dot.png');
  }

  create() {
    this.add.text(this.scale.width / 2, 40, '🧪 DEMO TECLADO', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.keyboard = new KeyboardDisplay(this, {
      showExplosionLine: true,
      showFingerDot: true,
      showHands: true,
      fingersOnTop: false,
      keyColor: 0x333333,
      highlightColor: 0xff9900
    });

    this.keyboard.draw('a');

    // Escuchar teclas del usuario
    this.input.keyboard.on('keydown', (event) => {
      if (event.key.length === 1) {
        this.keyboard.draw(event.key);
      }
    });

    // Botones para cambiar visibilidad
    this.createToggleButton(80, 100, 'Línea', this.keyboard.showExplosionLine, (state) => {
      this.keyboard.setExplosionLineVisibility(state);
      this.keyboard.redraw();
    });

    this.createToggleButton(80, 140, 'Dot', this.keyboard.showFingerDot, (state) => {
      this.keyboard.setFingerVisibility(state);
      this.keyboard.redraw();
    });

    this.createToggleButton(80, 180, 'Manos', this.keyboard.showHands, (state) => {
      this.keyboard.setHandsVisibility(state);
      this.keyboard.redraw();
    });

    this.createToggleButton(80, 220, 'Encima', this.keyboard.fingersOnTop, (state) => {
      this.keyboard.setFingersOnTop(state);
      this.keyboard.redraw();
    });
  }

  createToggleButton(x, y, label, initialState, callback) {
    const text = this.add.text(x, y, `${label}: ${initialState ? '✔️' : '✖️'}`, {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffffff', backgroundColor: '#444', padding: { x: 8, y: 4 }
    }).setInteractive({ useHandCursor: true });

    text.on('pointerdown', () => {
      const newState = !text.text.includes('✔️');
      text.setText(`${label}: ${newState ? '✔️' : '✖️'}`);
      callback(newState);
    });
  }
}
