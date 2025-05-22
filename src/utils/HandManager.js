// src/utils/HandManager.js


import { getKeysForChar, getFingerForKey, fingerMap } from './keyMappings.js';
import { DEPTH } from './depthLevels.js';

export default class HandManager {
  constructor(scene, keyPositions, group, keyHeight = 33) {
    this.scene = scene;
    this.keyPositions = keyPositions;
    this.group = group;
    this.keyHeight = keyHeight;

    this.handsSprite = null;
    this.arrow = null;
    this.dot = null;

    this.showHands = true;
    this.showFingerDot = true;
  }

drawHands(y = this.scene.scale.height - 50) {
  this.handsSprite = this.scene.add
    .image(this.scene.scale.width / 2 - 28, y, 'hands')
    .setOrigin(0.5, 1)
    .setDepth(DEPTH.MANOS)
    .setVisible(this.showHands);
}

highlightFinger(char) {
  const keys = getKeysForChar(char);
  if (!keys || keys.length === 0) return;

  const mainKey = keys[0];
  const finger = getFingerForKey(mainKey);
  if (!finger) return;

  const homeKey = fingerMap[finger];
  if (!homeKey) return;

  const from = this.keyPositions[homeKey];
  const to = this.keyPositions[mainKey];
  if (!from || !to || mainKey === homeKey || !this.showFingerDot) return;

  this.clearFinger();

  this.dot = this.scene.add.graphics();
  this.dot.fillStyle(0xff3333, 1);
  this.dot.fillCircle(from.x, from.y + this.keyHeight / 2, 12);
  this.dot.setDepth(DEPTH.RESALTADO);
  this.group.add(this.dot);

  this.arrow = this.scene.add.graphics();
  this.arrow.lineStyle(6, 0xff3333);
  this.arrow.beginPath();
  this.arrow.moveTo(from.x, from.y + 18);
  this.arrow.lineTo(to.x, to.y + (to.y <= from.y ? this.keyHeight : 0));
  this.arrow.strokePath();
  this.arrow.setDepth(DEPTH.RESALTADO);
  this.group.add(this.arrow);
}


  clearFinger() {
    if (this.dot) {
      this.dot.destroy();
      this.dot = null;
    }
    if (this.arrow) {
      this.arrow.destroy();
      this.arrow = null;
    }
  }

  setHandsVisible(state = true) {
    this.showHands = state;
    if (this.handsSprite) this.handsSprite.setVisible(state);
  }

  setFingerVisible(state = true) {
    this.showFingerDot = state;
    if (!state) this.clearFinger();
  }
}
