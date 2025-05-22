
export default class OpcionesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OpcionesScene' });
  }

  init(data) {
    this.baseY = data?.baseY ?? 100;
  } 

  create() {
    console.log('🟦 OpcionesScene activa');
    const startY = this.baseY;
    const x = 20;
    const spacing = 35;

    this.options = [
      { key: 'guia', label: '🔴 Guía', default: true },
      { key: 'manos', label: '🙌 Manos', default: true },
      { key: 'sonido', label: '🔊 Sonido', default: true },
      { key: 'linea', label: '✴ Línea', default: true }
    ];

    this.textos = [];

    this.options.forEach((opt, index) => {
      const state = JSON.parse(localStorage.getItem(opt.key) ?? JSON.stringify(opt.default));
      const txt = this.add.text(x, startY + index * spacing, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: { x: 8, y: 4 }
      }).setInteractive({ useHandCursor: true });

      txt.on('pointerdown', () => {
        const newState = !JSON.parse(localStorage.getItem(opt.key) ?? JSON.stringify(opt.default));
        localStorage.setItem(opt.key, JSON.stringify(newState));
        this.updateText(txt, opt.label, newState);

        const ui = this.scene.get('TypingFallingScene')?.manager?.keyboardUI;
        if (ui) {
          switch (opt.key) {
            case 'guia': ui.setFingerVisible(newState); break;
            case 'manos': ui.setHandsVisible(newState); break;
            case 'linea': ui.setExplosionLineVisible(newState); break;
          }
        }
      });

      this.updateText(txt, opt.label, state);
      this.textos.push(txt);
    });
  }

  updateText(textObj, label, state) {
    textObj.setText(`${label} ${state ? 'ON' : 'OFF'}`);
    textObj.setBackgroundColor(state ? '#009900' : '#990000');
  }
}
