import { createNoise2D } from 'simplex-noise';
import type { MapTypeConfig } from '../data/mapTypes';
import { TILE, MAP_WIDTH, MAP_HEIGHT } from '../data/constants';

export interface GeneratedMap {
  tiles: number[][];   // [row][col]
  exits: { row: number; col: number }[];
  seed: number;
}

export function generateMap(config: MapTypeConfig, seed?: number): GeneratedMap {
  const usedSeed = seed ?? Math.floor(Math.random() * 999999);
  // Seed the noise by offsetting sample coordinates with the seed
  const noise2D = createNoise2D(() => seededRandom(usedSeed));

  const tiles: number[][] = [];

  for (let row = 0; row < MAP_HEIGHT; row++) {
    tiles[row] = [];
    for (let col = 0; col < MAP_WIDTH; col++) {
      // Border is always passable (exits will be placed on borders)
      if (row === 0 || row === MAP_HEIGHT - 1 || col === 0 || col === MAP_WIDTH - 1) {
        tiles[row][col] = TILE.GROUND;
        continue;
      }

      const nx = col / MAP_WIDTH;
      const ny = row / MAP_HEIGHT;
      const n = (noise2D(nx * 4, ny * 4) + 1) / 2; // normalize 0–1

      if (n < config.generation.clearingFrequency) {
        tiles[row][col] = TILE.CLEARING;
      } else if (n > 1 - config.generation.obstacleDensity) {
        tiles[row][col] = TILE.TREE;
      } else {
        tiles[row][col] = TILE.GROUND;
      }
    }
  }

  // Place exits on edges
  const exits = placeExits(tiles, config.generation.exitCount, usedSeed);

  return { tiles, exits, seed: usedSeed };
}

function placeExits(
  tiles: number[][],
  count: number,
  seed: number
): { row: number; col: number }[] {
  const rng = makeRng(seed + 1);
  const exits: { row: number; col: number }[] = [];

  // Distribute exits across edges: top, bottom, left, right
  const edges = ['top', 'bottom', 'left', 'right'];
  for (let i = 0; i < count; i++) {
    const edge = edges[i % edges.length];
    let row: number, col: number;

    switch (edge) {
      case 'top':
        row = 0;
        col = 3 + Math.floor(rng() * (MAP_WIDTH - 6));
        break;
      case 'bottom':
        row = MAP_HEIGHT - 1;
        col = 3 + Math.floor(rng() * (MAP_WIDTH - 6));
        break;
      case 'left':
        row = 3 + Math.floor(rng() * (MAP_HEIGHT - 6));
        col = 0;
        break;
      default: // right
        row = 3 + Math.floor(rng() * (MAP_HEIGHT - 6));
        col = MAP_WIDTH - 1;
        break;
    }

    tiles[row][col] = TILE.EXIT;
    exits.push({ row, col });
  }

  return exits;
}

/** Simple seeded pseudo-random number generator (mulberry32) */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRandom(seed: number): number {
  const rng = makeRng(seed);
  return rng();
}

/** Pick mushroom spawn positions on walkable tiles (not tree, not exit) */
export function getSpawnPositions(
  tiles: number[][],
  count: number,
  seed: number
): { row: number; col: number }[] {
  const walkable: { row: number; col: number }[] = [];
  for (let row = 1; row < MAP_HEIGHT - 1; row++) {
    for (let col = 1; col < MAP_WIDTH - 1; col++) {
      if (tiles[row][col] === TILE.GROUND || tiles[row][col] === TILE.CLEARING) {
        walkable.push({ row, col });
      }
    }
  }

  const rng = makeRng(seed + 99);
  const positions: { row: number; col: number }[] = [];
  const used = new Set<string>();

  let attempts = 0;
  while (positions.length < count && attempts < walkable.length * 2) {
    const idx = Math.floor(rng() * walkable.length);
    const pos = walkable[idx];
    const key = `${pos.row},${pos.col}`;
    if (!used.has(key)) {
      used.add(key);
      positions.push(pos);
    }
    attempts++;
  }

  return positions;
}
