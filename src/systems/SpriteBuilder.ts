import Phaser from 'phaser';

// Each character maps to a 0xRRGGBB color. '.' = transparent (skip pixel).
export const PALETTE: Record<string, number> = {
  // Ground
  'A': 0x3d6b28, 'B': 0x4a7c2f, 'C': 0x5d8a3c, 'D': 0x6aaa42, 'E': 0x7abb52,
  // Tree canopy
  'F': 0x1a3010, 'G': 0x2d5a1b, 'H': 0x3d7a2b, 'I': 0x50a030,
  // Tree trunk / shadow
  'J': 0x6b4423, 'K': 0x8b5e3c, 'L': 0x2a4818,
  // Clearing
  'M': 0x5d9a38, 'N': 0x80cc50, 'O': 0xa8e068,
  // Flowers
  'P': 0xf8f040, 'Q': 0xfafafa, 'R': 0xf090a8,
  // Exit tile
  'S': 0x706030, 'T': 0xa09060, 'U': 0xd0c080, 'V': 0xf8e840,
  // Player skin/face
  'a': 0xf5cba7, 'b': 0xd89870, 'c': 0x201508,
  // Player hair
  'd': 0x6b3008, 'e': 0x905020,
  // Player hat
  'f': 0x4a2808, 'g': 0x7a5812, 'h': 0x9a7818,
  // Player shirt
  'i': 0x8ab8e8, 'j': 0x4878b0, 'k': 0x284878,
  // Player pants / boots / collar
  'l': 0x785030, 'm': 0x503820, 'n': 0x402810, 'o': 0xf8f8f8,
  // Mushroom stem (shared)
  'p': 0xf0e8d0, 'q': 0xc0a870,
  // Chanterelle (golden orange)
  'r': 0xc87010, 's': 0xf0a020, 't': 0xf8c840,
  // Porcini / shiitake (earthy brown)
  'u': 0x5a2808, 'v': 0x7a4820, 'w': 0x9a6838,
  // Morel (tan honeycomb)
  'x': 0x604018, 'y': 0x907038, 'z': 0xb89060,
  // Oyster (grey)
  'W': 0x687080, 'X': 0x9090a0, 'Y': 0xc8c8d0,
  // Ghost fungus (blue-white glow)
  '0': 0x5080a0, '1': 0x80b0d0, '2': 0xb8d8f0, '3': 0xe0f0ff,
  // Truffle (dark earthy)
  '4': 0x2a1a08, '5': 0x5a3018, '6': 0x8a5830, '7': 0xb08050,
  // Soil (truffle base)
  '8': 0x6a4020, '9': 0x9a6040,
};

function buildTexture(scene: Phaser.Scene, key: string, rows: string[]): void {
  const PX = 2;
  const SIZE = 16 * PX;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, SIZE, SIZE)!;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, SIZE, SIZE);
  for (let row = 0; row < 16; row++) {
    const line = rows[row] ?? '';
    for (let col = 0; col < 16; col++) {
      const ch = line[col] ?? '.';
      if (ch === '.') continue;
      const color = PALETTE[ch];
      if (color === undefined) continue;
      ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
      ctx.fillRect(col * PX, row * PX, PX, PX);
    }
  }
  tex?.refresh();
}

// ── Tile sprites ──────────────────────────────────────────────────────────────

const GROUND_0 = [
  'CCCCBCCCCCCBCCCC',
  'CCDCCCCCCCCCCCCC',
  'CCCCCBCCCCDCCCCC',
  'CCCCCCCCBCCCCCCC',
  'BCCCCCCCCCCCBCCC',
  'CCCCDCCCCCCCCCCC',
  'CCCCCCCBCCCBCCCC',
  'CCCCCCCCCCCCCCDC',
  'CCCBCCCCCCCCCCCC',
  'CCCCCCCDCCCBCCCC',
  'DCCCCCCCCCCCCCCC',
  'CCCCCBCCCCCCCCCC',
  'CCCCCCCCCCBCCCCC',
  'CCCBCCCCCDCCCCCC',
  'CCCCCCCCCCCCBCCC',
  'CCCCCCDCCCCCCCCC',
];

const GROUND_1 = [
  'CCCCCCCCCCCBCCCC',
  'CBCCCCCCCCCCCCC D',
  'CCCCCCCBCCCCCCC C',
  'CDCCCCCCCCCCCCCC',
  'CCCCCBCCCCDCCCCC',
  'CCCCCCCCCCCCBCCC',
  'CCCBCCCCCCCCCCCC',
  'CCCCCCCDCCCBCCCC',
  'CCCCCCCCCCCCCCDC',
  'BCCCCCCCCCCBCCCC',
  'CCCCCCDCCCCCCCCC',
  'CCCCCCCCBCCCCCCC',
  'CCCBCCCCCCCBCCCC',
  'CCCCCCCCCCCCCCCC',
  'DCCCCCCBCCCBCCCC',
  'CCCCCCCCCCCCCCCB',
];

const GROUND_2 = [
  'CCCCCCCCCCCCCCCC',
  'CCCBCCCCCCDCCCCC',
  'CCCCCCCCCCCCCCCC',
  'CCCCCCCBCCCBCCCC',
  'CDCCCCCCCCCCCCCC',
  'CCCCCBCCCCCCCCCC',
  'CCCCCCCCCCCBCCCD',
  'BCCCCCCCCCCCCCC C',
  'CCCCCCDCCCCCCCCC',
  'CCCCCCCCBCCCCCCC',
  'CCCBCCCCCCCBCCCC',
  'CCCCCCCCCCCCCCCC',
  'DCCCCCCCCCCCCCCC',
  'CCCCCBCCCCDCCCCC',
  'CCCCCCCCCCCCBCCC',
  'CCCBCCCCDCCCCCCC',
];

const TREE = [
  '................',
  '.......GG.......',
  '......GHGG......',
  '.....GHHHHG.....',
  '....GHHIHHGG....',
  '....GHHHHHHG....',
  '....GHIHHHHG....',
  '....GGGGGGGG....',
  '.......JK.......',
  '.......JK.......',
  '.......JK.......',
  '.......JK.......',
  '......LLLLL.....',
  '......LLLLL.....',
  '................',
  '................',
];

const CLEARING = [
  'MNNMMNNMNNMMNMNN',
  'NNMNMNNMMNNNMNMM',
  'MMNNNMNNNMMNMNNM',
  'NNNMNNPMNNNNNMNN',
  'MNMMNNNMNNMMMNNM',
  'NNNNMNNMMNMNNNNM',
  'ONNMNNNNMNMNNNMN',
  'MNNMMNNMNNMMMMMN',
  'NNNNMNRMMNNNNNMN',
  'MNMNNNNMMNMNNNNM',
  'NNNMNNMQMNMNNMNN',
  'NNMNNNNMMNMMNNNM',
  'MMNNPMNNMNNNNNMN',
  'NNNMNNMNNMNNNNMM',
  'MNMNNMONMNMNNNNM',
  'NNMMNNNMNNNNMNNM',
];

const EXIT_TILE = [
  'SSSSSSSSSSSSSSSS',
  'STTTTTTTTTTTTTTS',
  'STUUUUUUUUUUUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUVVVVVVVVUUTS',
  'STUUUUUUUUUUUUTS',
  'STTTTTTTTTTTTTTS',
  'SSSSSSSSSSSSSSSS',
];

// ── Player sprites ────────────────────────────────────────────────────────────
// 16x16 pixel art, displayed at 32x32 (2px per pixel).
// Left-facing uses right-facing sprites with setFlipX(true).

const PLAYER_DOWN_0 = [
  '................',
  '....fgggggf.....',
  '....ghhhhhg.....',
  '....ddddddd.....',
  '....daaaaaad....',
  '....dacaacad....',
  '......ooo.......',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....ijjjjjji....',
  '.....llllll.....',
  '.....llllll.....',
  '....lnn..nnl....',
  '....nnn..nnn....',
  '................',
];

const PLAYER_DOWN_1 = [
  '................',
  '....fgggggf.....',
  '....ghhhhhg.....',
  '....ddddddd.....',
  '....daaaaaad....',
  '....dacaacad....',
  '......ooo.......',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....ijjjjjji....',
  '.....llllll.....',
  '.....llllll.....',
  '...lnnn...nl....',
  '...nnnn...nn....',
  '................',
];

const PLAYER_UP_0 = [
  '................',
  '....fgggggf.....',
  '....ghhhhhg.....',
  '....ddddddd.....',
  '....ddddddd.....',
  '....ddddddd.....',
  '......ooo.......',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....ijjjjjji....',
  '.....llllll.....',
  '.....llllll.....',
  '....lnn..nnl....',
  '....nnn..nnn....',
  '................',
];

const PLAYER_UP_1 = [
  '................',
  '....fgggggf.....',
  '....ghhhhhg.....',
  '....ddddddd.....',
  '....ddddddd.....',
  '....ddddddd.....',
  '......ooo.......',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....kjjjjjjk....',
  '....ijjjjjji....',
  '.....llllll.....',
  '.....llllll.....',
  '...lnnn...nl....',
  '...nnnn...nn....',
  '................',
];

const PLAYER_RIGHT_0 = [
  '................',
  '....fggggg......',
  '....ghhhhg......',
  '...fgggggggf....',
  '....ddddddd.....',
  '....daaaaaad....',
  '....dacaaad.....',
  '......ooo.......',
  '....kjjjjk......',
  '....kjjjjk......',
  '....kjjjjk......',
  '....ijjjji......',
  '.....llll.......',
  '.....llll.......',
  '....nnnnn.......',
  '................',
];

const PLAYER_RIGHT_1 = [
  '................',
  '....fggggg......',
  '....ghhhhg......',
  '...fgggggggf....',
  '....ddddddd.....',
  '....daaaaaad....',
  '....dacaaad.....',
  '......ooo.......',
  '....kjjjjk......',
  '....kjjjjk......',
  '....kjjjjk......',
  '....ijjjji......',
  '.....llll.......',
  '.....ll.ll......',
  '....nnn.nnn.....',
  '................',
];

// ── Mushroom sprites ──────────────────────────────────────────────────────────

const MUSH_CHANTERELLE = [
  '................',
  '....rssssssr....',
  '...rssttttssr...',
  '..rssttttttssr..',
  '..rssttttttssr..',
  '...rsstttssr....',
  '....rsssssr.....',
  '.....rssr.......',
  '......pp........',
  '......ppqp......',
  '......pppp......',
  '.....qppppq.....',
  '.....qppppq.....',
  '................',
  '................',
  '................',
];

const MUSH_OYSTER = [
  '................',
  '....WXXXXX......',
  '...WXYYYXWW.....',
  '..WXYYYYYXWW....',
  '..WXYYYYYXWW....',
  '...WXYYYXWW.....',
  '....WXXXWW......',
  '.....WWWW.......',
  '......pp........',
  '......ppqp......',
  '......pppp......',
  '.....qppppq.....',
  '.....qppppq.....',
  '................',
  '................',
  '................',
];

const MUSH_PORCINI = [
  '................',
  '.....uvvvvu.....',
  '....uvwwwwvu....',
  '...uvwwwwwwvu...',
  '...uvwwwwwwvu...',
  '...uvvwwwwvvu...',
  '....uuvvvvuu....',
  '.....uuuuuu.....',
  '......pppp......',
  '......pppp......',
  '.....pppqqp.....',
  '......pppp......',
  '.....qppppq.....',
  '....uppppppu....',
  '................',
  '................',
];

const MUSH_SHIITAKE = [
  '................',
  '................',
  '....uvvvvvvu....',
  '...uvwwwwwwvu...',
  '..uvwwwwwwwwvu..',
  '..uvwwwwwwwwvu..',
  '...uvwwwwwwvu...',
  '....uvvvvvvu....',
  '.....uuuuuu.....',
  '.......ppp......',
  '......ppppp.....',
  '......ppppp.....',
  '.....qpppppq....',
  '....uppppppu....',
  '................',
  '................',
];

const MUSH_MOREL = [
  '................',
  '.......xx.......',
  '......xyyx......',
  '.....xyxyyx.....',
  '....xyxyxyyx....',
  '....xyxyxyyx....',
  '...xyxyxyxyyx...',
  '...xxxxxxxxxxx..',
  '......ppp.......',
  '......ppppp.....',
  '......ppppp.....',
  '.....qpppppq....',
  '....xpppppppx...',
  '....xpppppppx...',
  '................',
  '................',
];

const MUSH_MATSUTAKE = [
  '................',
  '.....vvvvvv.....',
  '....vpqqqqpv....',
  '...vpqpppppqpv..',
  '...vpppppppppv..',
  '...vpqpppqpppv..',
  '....vpppppppv...',
  '.....vvvvvv.....',
  '.......ppp......',
  '......ppppp.....',
  '......ppppp.....',
  '.....qpppppq....',
  '....vpppppppv...',
  '................',
  '................',
  '................',
];

const MUSH_GHOST = [
  '................',
  '.......33.......',
  '......2332......',
  '.....213312.....',
  '....21333312....',
  '....21333312....',
  '.....211112.....',
  '......0220......',
  '.......pp.......',
  '......1pp1......',
  '......1pp1......',
  '.....01pp10.....',
  '.....01pp10.....',
  '....001pp100....',
  '................',
  '................',
];

const MUSH_TRUFFLE = [
  '................',
  '................',
  '................',
  '.......55.......',
  '......4565......',
  '.....4566655....',
  '....456777655...',
  '....456777655...',
  '.....4566655....',
  '......4555......',
  '......8888......',
  '.....888998.....',
  '....88899988....',
  '....88888888....',
  '................',
  '................',
];

// ── Registration ──────────────────────────────────────────────────────────────

export function registerAllSprites(scene: Phaser.Scene): void {
  buildTexture(scene, 'tile_ground_0', GROUND_0);
  buildTexture(scene, 'tile_ground_1', GROUND_1);
  buildTexture(scene, 'tile_ground_2', GROUND_2);
  buildTexture(scene, 'tile_tree',     TREE);
  buildTexture(scene, 'tile_clearing', CLEARING);
  buildTexture(scene, 'tile_exit',     EXIT_TILE);

  buildTexture(scene, 'player_down_0',  PLAYER_DOWN_0);
  buildTexture(scene, 'player_down_1',  PLAYER_DOWN_1);
  buildTexture(scene, 'player_up_0',    PLAYER_UP_0);
  buildTexture(scene, 'player_up_1',    PLAYER_UP_1);
  buildTexture(scene, 'player_right_0', PLAYER_RIGHT_0);
  buildTexture(scene, 'player_right_1', PLAYER_RIGHT_1);

  buildTexture(scene, 'mush_chanterelle', MUSH_CHANTERELLE);
  buildTexture(scene, 'mush_oyster',      MUSH_OYSTER);
  buildTexture(scene, 'mush_porcini',     MUSH_PORCINI);
  buildTexture(scene, 'mush_shiitake',    MUSH_SHIITAKE);
  buildTexture(scene, 'mush_morel',       MUSH_MOREL);
  buildTexture(scene, 'mush_matsutake',   MUSH_MATSUTAKE);
  buildTexture(scene, 'mush_ghost',       MUSH_GHOST);
  buildTexture(scene, 'mush_truffle',     MUSH_TRUFFLE);
}
