import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeBaseScene } from './scenes/HomeBaseScene';
import { ForestScene } from './scenes/ForestScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 648,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [BootScene, HomeBaseScene, ForestScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
