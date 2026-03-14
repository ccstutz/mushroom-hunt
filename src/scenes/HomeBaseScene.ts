import Phaser from 'phaser';
import { RARITY_COLORS } from '../data/constants';
import { saveGame, sellAll, sellOne, loadGame } from '../systems/SaveManager';
import type { GameState } from '../systems/SaveManager';
import { createTimeState } from '../systems/TimeManager';
import type { TimeState } from '../systems/TimeManager';
import { MUSHROOMS } from '../data/mushrooms';

export class HomeBaseScene extends Phaser.Scene {
  private gameState!: GameState;
  private timeState!: TimeState;
  private isEndOfDay = false;

  private inventoryContainer!: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HomeBaseScene' });
  }

  init(data: { gameState?: GameState; timeState?: TimeState; endOfDay?: boolean }) {
    this.gameState = data.gameState ?? loadGame();
    this.isEndOfDay = data.endOfDay ?? false;

    if (this.isEndOfDay) {
      this.gameState.day++;
    }

    this.timeState = createTimeState(this.gameState.day);
    saveGame(this.gameState);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x2c1a0e);

    // Title
    this.add.text(W / 2, 24, 'HOME BASE', {
      fontSize: '20px',
      color: '#f0c040',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Day / gold info
    this.goldText = this.add.text(W / 2, 52, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.updateGoldText();

    // Separator
    this.add.rectangle(W / 2, 68, W - 40, 1, 0x7a5a2e);

    // Inventory label
    this.add.text(20, 78, 'INVENTORY', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });

    // Inventory list container
    this.inventoryContainer = this.add.container(0, 0);
    this.refreshInventory();

    // Sell all button
    this.createButton(W / 2 - 70, H - 90, 'Sell All', 0x4a7c20, () => {
      const earned = sellAll(this.gameState);
      saveGame(this.gameState);
      this.updateGoldText();
      this.refreshInventory();
      this.showMessage(`Sold everything for ${earned} gold!`);
    });

    // Go hunting button
    this.createButton(W / 2 + 70, H - 90, 'Go Hunting', 0x1a5a8a, () => {
      this.scene.start('ForestScene', {
        gameState: this.gameState,
        timeState: this.timeState,
        mapTypeId: 'forest',
      });
    });

    // Message area
    this.messageText = this.add.text(W / 2, H - 40, '', {
      fontSize: '13px',
      color: '#ffee88',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // End of day message
    if (this.isEndOfDay) {
      this.showMessage(`Day ${this.gameState.day - 1} complete! Starting day ${this.gameState.day}.`);
    }

    // Journal button (bottom right)
    this.createButton(W - 60, H - 90, 'Journal', 0x5a3a80, () => {
      this.showJournal();
    });
  }

  // ── Inventory display ─────────────────────────────────────────────────────────

  private refreshInventory() {
    this.inventoryContainer.removeAll(true);

    const W = this.scale.width;
    const inv = this.gameState.inventory;

    if (inv.length === 0) {
      const empty = this.add.text(W / 2, 110, 'Your basket is empty.', {
        fontSize: '13px',
        color: '#666666',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.inventoryContainer.add(empty);
      return;
    }

    inv.forEach((item, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = 40 + col * (W / 3 - 10);
      const y = 100 + row * 56;

      const rarityColor = RARITY_COLORS[item.mushroom.rarity] ?? 0xffffff;

      // Card background
      const bg = this.add.rectangle(x + 80, y + 20, 160, 48, 0x3a2a1a).setOrigin(0.5);

      // Icon
      const icon = this.add.image(x + 16, y + 20, item.mushroom.icon).setScale(0.9).setOrigin(0.5);

      // Name
      const nameText = this.add.text(x + 28, y + 8, item.mushroom.name, {
        fontSize: '11px',
        color: `#${rarityColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
      });

      // Qty + value
      const detailText = this.add.text(x + 28, y + 24, `x${item.quantity}  |  ${item.mushroom.value}g ea`, {
        fontSize: '10px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      });

      // Sell one button
      const sellBtn = this.add.text(x + 140, y + 10, '[sell]', {
        fontSize: '10px',
        color: '#88cc44',
        fontFamily: 'monospace',
      }).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          const earned = sellOne(this.gameState, item.mushroom.id);
          saveGame(this.gameState);
          this.updateGoldText();
          this.refreshInventory();
          this.showMessage(`Sold ${item.mushroom.name} for ${earned} gold.`);
        })
        .on('pointerover', () => sellBtn.setColor('#ccff66'))
        .on('pointerout', () => sellBtn.setColor('#88cc44'));

      this.inventoryContainer.add([bg, icon, nameText, detailText, sellBtn]);
    });

    // Total value
    const total = this.gameState.inventory.reduce(
      (sum, i) => sum + i.mushroom.value * i.quantity,
      0
    );
    const inv2 = this.gameState.inventory.reduce((s, i) => s + i.quantity, 0);
    const totalText = this.add.text(W / 2, 98 + Math.ceil(inv.length / 3) * 56 + 10,
      `Total: ${inv2} mushrooms worth ${total}g  |  Basket: ${inv2}/${this.gameState.inventoryMaxSize}`,
      { fontSize: '12px', color: '#888888', fontFamily: 'monospace' }
    ).setOrigin(0.5);
    this.inventoryContainer.add(totalText);
  }

  // ── Journal overlay ───────────────────────────────────────────────────────────

  private showJournal() {
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(50).setInteractive();
    const panel = this.add.rectangle(W / 2, H / 2, W - 40, H - 60, 0x1a0e0a).setDepth(51);

    this.add.text(W / 2, H / 2 - H / 2 + 70, 'FIELD JOURNAL', {
      fontSize: '16px', color: '#f0c040', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    MUSHROOMS.forEach((m, i) => {
      const found = this.gameState.journal.includes(m.id);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 40 + col * (W / 2 - 10);
      const y = H / 2 - H / 2 + 100 + row * 44;
      const color = found ? `#${(RARITY_COLORS[m.rarity] ?? 0xffffff).toString(16).padStart(6, '0')}` : '#333333';
      const name = found ? m.name : '???';
      const detail = found ? m.journalEntry : 'Not yet discovered.';

      this.add.text(x, y, name, { fontSize: '12px', color, fontFamily: 'monospace', fontStyle: 'bold' }).setDepth(52);
      this.add.text(x, y + 16, detail, { fontSize: '10px', color: found ? '#aaaaaa' : '#333333', fontFamily: 'monospace', wordWrap: { width: W / 2 - 20 } }).setDepth(52);
    });

    const closeBtn = this.add.text(W / 2, H - 50, '[ Close ]', {
      fontSize: '14px', color: '#f0c040', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      [overlay, panel, closeBtn].forEach(o => o.destroy());
      this.children.list
        .filter(c => (c as any).depth >= 52)
        .forEach(c => (c as Phaser.GameObjects.GameObject).destroy());
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private updateGoldText() {
    this.goldText.setText(`Day ${this.gameState.day}  |  Gold: ${this.gameState.gold}`);
  }

  private showMessage(text: string) {
    this.messageText.setText(text);
    this.time.delayedCall(3000, () => this.messageText.setText(''));
  }

  private createButton(x: number, y: number, label: string, color: number, callback: () => void) {
    const btn = this.add.rectangle(x, y, 120, 32, color).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '13px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(Phaser.Display.Color.IntegerToColor(color).brighten(20).color));
    btn.on('pointerout', () => btn.setFillStyle(color));
    btn.on('pointerdown', callback);

    return { btn, txt };
  }
}
