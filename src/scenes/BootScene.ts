import Phaser from 'phaser';
import { registerAllSprites } from '../systems/SpriteBuilder';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {}

  create() {
    registerAllSprites(this);
    this.scene.start('HomeBaseScene');
  }
}
