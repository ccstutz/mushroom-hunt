export interface MapTypeConfig {
  id: string;
  name: string;
  /** Time units consumed when the player exits this map */
  timeToTraverse: number;
  generation: {
    /** 0–1: chance any given tile becomes a blocking obstacle */
    obstacleDensity: number;
    /** 0–1: chance of open clearing patches */
    clearingFrequency: number;
    /** Number of exit doors placed on map edges */
    exitCount: number;
  };
  /** Multiply base mushroom weights by these values (missing = 1.0) */
  spawnModifiers: Record<string, number>;
  /** Phaser color tint applied to the whole scene (0xRRGGBB). Optional. */
  ambientTint?: number;
  /** Descriptive flavor shown to player when entering */
  flavorText: string;
}

export const MAP_TYPES: MapTypeConfig[] = [
  {
    id: 'forest',
    name: 'Deep Forest',
    timeToTraverse: 1,
    generation: {
      obstacleDensity: 0.35,
      clearingFrequency: 0.15,
      exitCount: 2,
    },
    spawnModifiers: {
      chanterelle: 1.5,
      porcini: 1.2,
      truffle: 0.3,
    },
    flavorText: 'Tall pines block most of the light. Your boots sink into soft moss.',
  },
  // Future map types slot in here — no other code needs to change.
  // {
  //   id: 'field',
  //   name: 'Open Meadow',
  //   timeToTraverse: 1,
  //   generation: { obstacleDensity: 0.1, clearingFrequency: 0.6, exitCount: 3 },
  //   spawnModifiers: { oyster: 0.2, morel: 2.0 },
  //   flavorText: 'Tall grass sways in the breeze. Plenty of open ground to search.',
  // },
  // {
  //   id: 'cave',
  //   name: 'Mossy Cave',
  //   timeToTraverse: 2,
  //   generation: { obstacleDensity: 0.5, clearingFrequency: 0.05, exitCount: 1 },
  //   spawnModifiers: { ghost_fungus: 5.0, chanterelle: 0.1, truffle: 2.0 },
  //   ambientTint: 0x334466,
  //   flavorText: 'Dripping water echoes. Strange fungi cling to the damp walls.',
  // },
];

export function getMapType(id: string): MapTypeConfig {
  const found = MAP_TYPES.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown map type: ${id}`);
  return found;
}
