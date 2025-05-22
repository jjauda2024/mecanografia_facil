export default class RetryScene extends Phaser.Scene {
    constructor() {
      super('RetryScene');
    }
  
    init(data) {
      this.level = data.level || 1;
    }
  
    create() {
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
  
      this.add.text(centerX, centerY - 80, '😢 Lo siento', {
        fontSize: '36px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }).setOrigin(0.5);
  
      this.add.text(centerX, centerY - 20, 'Sigue practicando, lo lograrás', {
        fontSize: '22px',
        fontFamily: 'monospace',
        color: '#aaaaaa'
      }).setOrigin(0.5);
  
      this.add.text(centerX, centerY + 60, 'Presiona ENTER o ESPACIO para intentarlo de nuevo', {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }).setOrigin(0.5);
  
      this.input.keyboard.on('keydown-ENTER', () => this.retryFalling());
      this.input.keyboard.on('keydown-SPACE', () => this.retryFalling());
    }
  
    retryFalling() {
      this.scene.start('TypingFallingScene', {
        level: this.level
      });
    }
  }
  