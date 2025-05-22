
export default class ExplosionLine {
  constructor(scene, y = 0, color = 0xff0000) {
    this.scene = scene;
    this.y = y;
    this.color = color;
    this.visible = true;

    this.line = this.scene.add
      .line(
        0,
        0,
        0,
        y,
        this.scene.scale.width,
        y,
        color
      )
      .setOrigin(0, 0)
      .setLineWidth(3)
      .setDepth(15);

    this.line.setVisible(this.visible);
  }

  setVisible(state = true) {
    this.visible = state;
    if (this.line) {
      this.line.setVisible(state);
    }
  }

  setY(y) {
    this.y = y;
    this.line.setTo(0, y, this.scene.scale.width, y);
  }

  destroy() {
    if (this.line) {
      this.line.destroy();
    }
  }
}
