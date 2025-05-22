export default class TitleManager {
  constructor(scene, { x = null, y = 16, text = '', style = {} } = {}) {
    this.scene = scene;

    const posX = x !== null ? x : scene.scale.width / 2;

    const defaultStyle = {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    };

    this.titleText = scene.add.text(
      posX,
      y,
      text,
      Object.assign({}, defaultStyle, style)
    ).setOrigin(0.5);

    this.defaultY = this.titleText.y;

    // Esperar al siguiente frame para asegurar visibilidad y reubicación correcta
    scene.time.delayedCall(0, () => {
      if (scene.scale.isFullscreen) {
        this.titleText.setY(this.defaultY + 40);
      }

      scene.scale.on('enterfullscreen', () => {
        this.titleText.setY(this.defaultY + 40);
      });

      scene.scale.on('leavefullscreen', () => {
        this.titleText.setY(this.defaultY);
      });
    });
  }

  set(newText) {
    this.titleText.setText(newText);
  }

  destroy() {
    if (this.titleText) {
      this.titleText.destroy();
    }
  }
}
