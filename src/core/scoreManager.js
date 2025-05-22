// js/scoreManager

export default class ScoreManager {
  constructor(scene, { x = 30, y = 80, spacing = 30 } = {}) {
    this.scene = scene;

    // Posición base para los textos
    this.baseX = x;
    this.baseY = y;
    this.spacing = spacing;

    // Aciertos y errores
    this.score = 0;
    this.misses = 0;

    // Conteo de palabras y pulsaciones correctas
    this.wordCount = 0;
    this.keystrokes = 0;
    this.startTime = null;

    const style = { fontSize: '20px', fill: '#fff' };

    // Textos en pantalla con posición dinámica
    this.cpmText     = scene.add.text(this.baseX, this.baseY + this.spacing * 0, 'CPM: 0', style);
    this.wpmText     = scene.add.text(this.baseX, this.baseY + this.spacing * 1, 'WPM: 0', style);
    this.scoreText   = scene.add.text(this.baseX, this.baseY + this.spacing * 2, 'Aciertos: 0', style);
    this.missesText  = scene.add.text(this.baseX, this.baseY + this.spacing * 3, 'Errores: 0', style);
  }

  addSuccess() {
    if (this.keystrokes === 0 && !this.startTime) {
      this.startTime = Date.now();
    }

    this.score++;
    this.keystrokes++;
    this.scoreText.setText('Aciertos: ' + this.score);
    this.updateCPM();
    this.updateWPM();
  }

  addMiss() {
    this.misses++;
    this.missesText.setText('Errores: ' + this.misses);
  }

  addWord() {
    this.wordCount++;
    this.updateWPM();
  }

  updateCPM() {
    if (!this.startTime) return;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const cpm = elapsedMinutes > 0
      ? Math.round(this.keystrokes / elapsedMinutes)
      : 0;
    this.cpmText.setText('CPM: ' + cpm);
  }

  updateWPM() {
    if (!this.startTime) return;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const wpm = elapsedMinutes > 0
      ? Math.round(this.wordCount / elapsedMinutes)
      : 0;
    this.wpmText.setText('WPM: ' + wpm);
  }

  getScore()   { return this.score; }
  getMisses()  { return this.misses; }
  getCPM()     {
    if (!this.startTime) return 0;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    return elapsedMinutes > 0
      ? Math.round(this.keystrokes / elapsedMinutes)
      : 0;
  }
  getWPM()     {
    if (!this.startTime) return 0;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    return elapsedMinutes > 0
      ? Math.round(this.wordCount / elapsedMinutes)
      : 0;
  }

  destroy() {
    this.cpmText?.destroy();
    this.wpmText?.destroy();
    this.scoreText?.destroy();
    this.missesText?.destroy();
  }
}
