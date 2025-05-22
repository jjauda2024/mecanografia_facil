// js/GameHeaderScene.js

export default class GameHeaderScene extends Phaser.Scene {
    constructor() {
      super('GameHeaderScene');
    }
  
    create() {
      const btnStyle = {
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: '#222',
        color: '#fff',
        padding: { x: 8, y: 2 }
      };

      // Botón Text1 para ir a modo text nivel 1
      const btnText1 = this.add.text(220, 20, '✍️ Text1', {
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: '#222',
        color: '#fff',
        padding: { x: 8, y: 2 }
      }).setInteractive({ useHandCursor: true });
      
      btnText1.on('pointerdown', () => {
        // Detener escenas visibles activas antes de continuar
        this.scene.stop('GameHeaderScene');
        this.scene.stop('WelcomeScene');
        
        this.scene.start('TypingTextScene', { level: 1 });
      });
      
      
      

      const btnWelcome = this.add.text(120, 20, '↩️ Welcome', btnStyle).setInteractive({ useHandCursor: true });
      const btnIndex = this.add.text(20, 20, '🏠 index.html', btnStyle).setInteractive({ useHandCursor: true });
  
      btnWelcome.on('pointerdown', () => {
        this.scene.manager.getScenes(true).forEach(scene => {
          if (scene.scene.key !== 'GameHeaderScene') {
            scene.scene.stop();
          }
        });
        this.scene.start('WelcomeScene');
      });
  
      btnIndex.on('pointerdown', () => {
        window.location.href = 'index.html';
      });
  
      this.scene.bringToTop();
    }
  }
  