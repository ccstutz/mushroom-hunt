import Phaser from 'phaser';
import { TILE_SIZE, COLORS, RARITY_COLORS } from '../data/constants';
import { MUSHROOMS } from '../data/mushrooms';

/**
 * BootScene: generates all textures programmatically (no external art assets needed).
 * When you add real sprites, replace the texture generation here.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // All assets are generated — nothing to load from disk yet.
  }

  create() {
    this.generateTileTextures();
    this.generateMushroomTextures();
    this.generatePlayerTexture();
    this.scene.start('HomeBaseScene');
  }

  private generateTileTextures() {
    const make = (key: string, color: number, borderColor?: number) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      if (borderColor !== undefined) {
        g.lineStyle(1, borderColor, 0.4);
        g.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
      }
      g.generateTexture(key, TILE_SIZE, TILE_SIZE);
      g.destroy();
    };

    make('tile_ground', COLORS.GROUND, 0x3a6a3e);
    make('tile_tree', COLORS.TREE);
    make('tile_clearing', COLORS.CLEARING, 0x5a9a38);
    make('tile_exit', COLORS.EXIT, 0xc0a020);
  }

  private generateMushroomTextures() {
    for (const mush of MUSHROOMS) {
      const g = this.make.graphics({ x: 0, y: 0 });
      const color = RARITY_COLORS[mush.rarity] ?? 0xffffff;

      // Cap
      g.fillStyle(color);
      g.fillEllipse(TILE_SIZE / 2, TILE_SIZE * 0.42, TILE_SIZE * 0.7, TILE_SIZE * 0.5);

      // Stem
      g.fillStyle(0xf5f0e8);
      g.fillRect(TILE_SIZE * 0.4, TILE_SIZE * 0.55, TILE_SIZE * 0.2, TILE_SIZE * 0.3);

      g.generateTexture(mush.icon, TILE_SIZE, TILE_SIZE);
      g.destroy();
    }
  }

  private generatePlayerTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Body
    g.fillStyle(COLORS.PLAYER);
    g.fillRect(10, 14, 12, 14);

    // Head
    g.fillStyle(0xf5cba7);
    g.fillCircle(16, 11, 8);

    // Hat
    g.fillStyle(0x5c3d1e);
    g.fillRect(8, 6, 16, 3);
    g.fillRect(11, 2, 10, 5);

    g.generateTexture('player', TILE_SIZE, TILE_SIZE);
    g.destroy();
  }
}
