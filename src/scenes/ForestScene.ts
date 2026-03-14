import Phaser from 'phaser';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TILE } from '../data/constants';
import { getMapType } from '../data/mapTypes';
import type { MapTypeConfig } from '../data/mapTypes';
import { generateMap, getSpawnPositions } from '../systems/MapGenerator';
import type { GeneratedMap } from '../systems/MapGenerator';
import { weightedMushroomPick } from '../data/mushrooms';
import type { MushroomDef } from '../data/mushrooms';
import { addToInventory, saveGame } from '../systems/SaveManager';
import type { GameState } from '../systems/SaveManager';
import { spendTime, isDayOver, timeLabel } from '../systems/TimeManager';
import type { TimeState } from '../systems/TimeManager';

const MUSHROOMS_PER_MAP = 6;
const MOVE_COOLDOWN = 150;

type Direction = 'down' | 'up' | 'left' | 'right';

interface MushroomSprite {
  sprite: Phaser.GameObjects.Image;
  def: MushroomDef;
  row: number;
  col: number;
}

export class ForestScene extends Phaser.Scene {
  private mapConfig!: MapTypeConfig;
  private map!: GeneratedMap;
  private tileSprites: Phaser.GameObjects.Image[][] = [];
  private mushroomSprites: MushroomSprite[] = [];

  private player!: Phaser.GameObjects.Image;
  private playerRow = 0;
  private playerCol = 0;
  private playerDir: Direction = 'down';
  private walkFrame = 0;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private lastMove = 0;

  private hudText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageClearTimer = 0;

  private gameState!: GameState;
  private timeState!: TimeState;

  constructor() {
    super({ key: 'ForestScene' });
  }

  init(data: { gameState: GameState; timeState: TimeState; mapTypeId?: string }) {
    this.gameState = data.gameState;
    this.timeState = data.timeState;
    this.mapConfig = getMapType(data.mapTypeId ?? 'forest');
  }

  create() {
    this.map = generateMap(this.mapConfig);
    this.buildTiles();
    this.spawnMushrooms();
    this.placePlayer();
    this.buildHUD();
    this.setupInput();

    this.cameras.main.setBackgroundColor(
      this.mapConfig.ambientTint !== undefined ? this.mapConfig.ambientTint : 0x1a3320
    );

    this.showMessage(this.mapConfig.flavorText, 3000);
  }

  update(time: number) {
    this.handleMovement(time);
    if (time > this.messageClearTimer && this.messageClearTimer > 0) {
      this.messageText.setText('');
      this.messageClearTimer = 0;
    }
  }

  // ── Map building ──────────────────────────────────────────────────────────────

  private buildTiles() {
    const offsetX = (this.scale.width - MAP_WIDTH * TILE_SIZE) / 2;
    const offsetY = 40;

    for (let row = 0; row < MAP_HEIGHT; row++) {
      this.tileSprites[row] = [];
      for (let col = 0; col < MAP_WIDTH; col++) {
        const tile = this.map.tiles[row][col];
        const key = this.tileKey(tile, row, col);
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + row * TILE_SIZE + TILE_SIZE / 2;
        // Trees rendered at higher depth to overlap mushrooms behind them
        const depth = tile === TILE.TREE ? 5 : 0;
        const img = this.add.image(x, y, key).setDepth(depth);
        this.tileSprites[row][col] = img;
      }
    }
  }

  private tileKey(tile: number, row: number, col: number): string {
    switch (tile) {
      case TILE.TREE:     return 'tile_tree';
      case TILE.CLEARING: return 'tile_clearing';
      case TILE.EXIT:     return 'tile_exit';
      default:
        // Deterministic variation: same position always gets the same variant
        return 'tile_ground_' + ((row * 7 + col * 3) % 3);
    }
  }

  private spawnMushrooms() {
    const positions = getSpawnPositions(this.map.tiles, MUSHROOMS_PER_MAP, this.map.seed);
    const offsetX = (this.scale.width - MAP_WIDTH * TILE_SIZE) / 2;
    const offsetY = 40;

    for (const pos of positions) {
      const def = weightedMushroomPick(this.mapConfig.spawnModifiers);
      const x = offsetX + pos.col * TILE_SIZE + TILE_SIZE / 2;
      const y = offsetY + pos.row * TILE_SIZE + TILE_SIZE / 2;
      const sprite = this.add.image(x, y, def.icon).setDepth(3);

      // Gentle bob tween
      this.tweens.add({
        targets: sprite,
        y: y - 3,
        duration: 900 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.mushroomSprites.push({ sprite, def, row: pos.row, col: pos.col });
    }
  }

  private placePlayer() {
    const start = this.map.exits[0] ?? {
      row: Math.floor(MAP_HEIGHT / 2),
      col: Math.floor(MAP_WIDTH / 2),
    };
    this.playerRow = Phaser.Math.Clamp(
      start.row + (start.row === 0 ? 1 : start.row === MAP_HEIGHT - 1 ? -1 : 0),
      1, MAP_HEIGHT - 2
    );
    this.playerCol = Phaser.Math.Clamp(
      start.col + (start.col === 0 ? 1 : start.col === MAP_WIDTH - 1 ? -1 : 0),
      1, MAP_WIDTH - 2
    );

    const offsetX = (this.scale.width - MAP_WIDTH * TILE_SIZE) / 2;
    const offsetY = 40;
    const x = offsetX + this.playerCol * TILE_SIZE + TILE_SIZE / 2;
    const y = offsetY + this.playerRow * TILE_SIZE + TILE_SIZE / 2;
    this.player = this.add.image(x, y, 'player_down_0').setDepth(10);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────────

  private buildHUD() {
    this.add.rectangle(this.scale.width / 2, 18, this.scale.width, 36, 0x1a1a2e).setDepth(20);

    this.hudText = this.add.text(10, 6, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setDepth(21);

    this.messageText = this.add.text(this.scale.width / 2, this.scale.height - 40, '', {
      fontSize: '13px',
      color: '#ffee88',
      fontFamily: 'monospace',
      backgroundColor: '#00000099',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(21);

    this.updateHUD();
  }

  private updateHUD() {
    const inv = this.gameState.inventory.reduce((s, i) => s + i.quantity, 0);
    const max = this.gameState.inventoryMaxSize;
    this.hudText.setText(
      `${timeLabel(this.timeState)}  |  Gold: ${this.gameState.gold}  |  Basket: ${inv}/${max}`
    );
  }

  private showMessage(text: string, duration = 2000) {
    this.messageText.setText(text);
    this.messageClearTimer = this.time.now + duration;
  }

  // ── Input & movement ──────────────────────────────────────────────────────────

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private handleMovement(time: number) {
    if (time - this.lastMove < MOVE_COOLDOWN) return;

    let dRow = 0;
    let dCol = 0;

    if      (Phaser.Input.Keyboard.JustDown(this.cursors.up!)    || Phaser.Input.Keyboard.JustDown(this.wasd.up))    dRow = -1;
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)  || Phaser.Input.Keyboard.JustDown(this.wasd.down))  dRow = 1;
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)  || Phaser.Input.Keyboard.JustDown(this.wasd.left))  dCol = -1;
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.wasd.right)) dCol = 1;

    if (dRow === 0 && dCol === 0) return;

    // Update direction regardless of whether move succeeds
    if      (dRow === -1) this.playerDir = 'up';
    else if (dRow === 1)  this.playerDir = 'down';
    else if (dCol === -1) this.playerDir = 'left';
    else                  this.playerDir = 'right';

    const newRow = this.playerRow + dRow;
    const newCol = this.playerCol + dCol;

    if (newRow < 0 || newRow >= MAP_HEIGHT || newCol < 0 || newCol >= MAP_WIDTH) return;

    const tile = this.map.tiles[newRow][newCol];

    if (tile === TILE.TREE) {
      this.updatePlayerTexture(false); // turn to face the tree, don't advance frame
      this.showMessage("You can't go through the trees.");
      this.lastMove = time;
      return;
    }

    if (tile === TILE.EXIT) {
      this.handleExit();
      return;
    }

    this.playerRow = newRow;
    this.playerCol = newCol;
    this.updatePlayerTexture(true);
    this.movePlayerPosition();
    this.checkMushroomPickup();
    this.lastMove = time;
  }

  private updatePlayerTexture(advanceFrame: boolean) {
    if (advanceFrame) {
      this.walkFrame = this.walkFrame === 0 ? 1 : 0;
    }
    if (this.playerDir === 'left') {
      this.player.setFlipX(true);
      this.player.setTexture(`player_right_${this.walkFrame}`);
    } else {
      this.player.setFlipX(false);
      this.player.setTexture(`player_${this.playerDir}_${this.walkFrame}`);
    }
  }

  private movePlayerPosition() {
    const offsetX = (this.scale.width - MAP_WIDTH * TILE_SIZE) / 2;
    const offsetY = 40;
    this.player.setPosition(
      offsetX + this.playerCol * TILE_SIZE + TILE_SIZE / 2,
      offsetY + this.playerRow * TILE_SIZE + TILE_SIZE / 2
    );
  }

  private checkMushroomPickup() {
    const idx = this.mushroomSprites.findIndex(
      (m) => m.row === this.playerRow && m.col === this.playerCol
    );
    if (idx === -1) return;

    const found = this.mushroomSprites[idx];
    const added = addToInventory(this.gameState, found.def);

    if (added) {
      const isNew = !this.gameState.journal.includes(found.def.id);
      const newTag = isNew ? ' [NEW!]' : '';
      this.showMessage(`Found: ${found.def.name}${newTag}\n${found.def.description}`, 2500);

      // Flash and disappear
      this.tweens.add({
        targets: found.sprite,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 250,
        onComplete: () => found.sprite.destroy(),
      });
      this.mushroomSprites.splice(idx, 1);
    } else {
      this.showMessage('Basket is full! Head home to sell first.', 2000);
    }

    saveGame(this.gameState);
    this.updateHUD();
  }

  private handleExit() {
    spendTime(this.timeState, this.mapConfig.timeToTraverse);
    saveGame(this.gameState);

    if (isDayOver(this.timeState)) {
      this.showMessage('The light is fading — time to head home.', 1500);
      this.time.delayedCall(1600, () => {
        this.scene.start('HomeBaseScene', {
          gameState: this.gameState,
          timeState: this.timeState,
          endOfDay: true,
        });
      });
    } else {
      this.showMessage('You move deeper into the forest...', 800);
      this.time.delayedCall(900, () => {
        this.scene.restart({
          gameState: this.gameState,
          timeState: this.timeState,
          mapTypeId: this.mapConfig.id,
        });
      });
    }
  }
}
