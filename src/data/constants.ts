export const TILE_SIZE = 32;         // pixels per tile
export const MAP_WIDTH = 25;          // tiles wide
export const MAP_HEIGHT = 19;         // tiles tall
export const TIME_UNITS_PER_DAY = 8;
export const INVENTORY_MAX_SIZE = 12; // starting basket size

export const TILE = {
  GROUND: 0,
  TREE: 1,
  CLEARING: 2,
  EXIT: 3,
} as const;

export const COLORS = {
  GROUND: 0x4a7c4e,
  TREE: 0x2d5a27,
  CLEARING: 0x7ab648,
  EXIT: 0xf0c040,
  PLAYER: 0xe8d5a3,
  HUD_BG: 0x1a1a2e,
  HUD_TEXT: 0xffffff,
  RARITY_COMMON: 0xaaaaaa,
  RARITY_UNCOMMON: 0x4fc3f7,
  RARITY_RARE: 0xce93d8,
  RARITY_LEGENDARY: 0xffb300,
} as const;

export const RARITY_COLORS: Record<string, number> = {
  common: COLORS.RARITY_COMMON,
  uncommon: COLORS.RARITY_UNCOMMON,
  rare: COLORS.RARITY_RARE,
  legendary: COLORS.RARITY_LEGENDARY,
};
