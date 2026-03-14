export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface MushroomDef {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  /** Relative spawn weight — higher = more common */
  baseWeight: number;
  /** Gold value when sold */
  value: number;
  /** Phaser texture key */
  icon: string;
  journalEntry: string;
}

export const MUSHROOMS: MushroomDef[] = [
  {
    id: 'chanterelle',
    name: 'Chanterelle',
    description: 'Golden and funnel-shaped.',
    rarity: 'common',
    baseWeight: 40,
    value: 10,
    icon: 'mush_chanterelle',
    journalEntry: 'A classic find. Fruity aroma, prized in kitchens everywhere.',
  },
  {
    id: 'oyster',
    name: 'Oyster Mushroom',
    description: 'Fan-shaped, grows on dead wood.',
    rarity: 'common',
    baseWeight: 35,
    value: 8,
    icon: 'mush_oyster',
    journalEntry: 'Grows in clusters on fallen logs. Easy to spot once you know what to look for.',
  },
  {
    id: 'porcini',
    name: 'Porcini',
    description: 'A thick-stemmed woodland treasure.',
    rarity: 'uncommon',
    baseWeight: 15,
    value: 35,
    icon: 'mush_porcini',
    journalEntry: 'Rich and nutty. Dried porcini are worth a small fortune in the city.',
  },
  {
    id: 'shiitake',
    name: 'Shiitake',
    description: 'Brown cap, white gills, earthy scent.',
    rarity: 'uncommon',
    baseWeight: 10,
    value: 28,
    icon: 'mush_shiitake',
    journalEntry: 'Prefers dead hardwood. Revered in eastern cooking for centuries.',
  },
  {
    id: 'morel',
    name: 'Morel',
    description: 'Honeycomb cap. Highly sought-after.',
    rarity: 'rare',
    baseWeight: 4,
    value: 120,
    icon: 'mush_morel',
    journalEntry: 'The holy grail of spring foraging. Unmistakable honeycomb texture.',
  },
  {
    id: 'matsutake',
    name: 'Matsutake',
    description: 'Spicy-sweet aroma. Extremely valuable.',
    rarity: 'rare',
    baseWeight: 3,
    value: 180,
    icon: 'mush_matsutake',
    journalEntry: 'Rarer every decade. In some cultures, a single specimen makes a fine gift.',
  },
  {
    id: 'ghost_fungus',
    name: 'Ghost Fungus',
    description: 'Pale, almost luminous. Eerie.',
    rarity: 'legendary',
    baseWeight: 0.8,
    value: 500,
    icon: 'mush_ghost',
    journalEntry: 'Glows faintly in the dark. Hunters speak of it in hushed voices.',
  },
  {
    id: 'truffle',
    name: 'Black Truffle',
    description: 'Underground diamond. Worth its weight in gold.',
    rarity: 'legendary',
    baseWeight: 0.2,
    value: 1000,
    icon: 'mush_truffle',
    journalEntry: "The rarest of finds. You'll be telling this story for years.",
  },
];

/** Pick a random mushroom ID using weighted probability, with optional per-id multipliers */
export function weightedMushroomPick(modifiers: Record<string, number> = {}): MushroomDef {
  const pool = MUSHROOMS.map((m) => ({
    def: m,
    weight: m.baseWeight * (modifiers[m.id] ?? 1),
  }));
  const total = pool.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.def;
  }
  return pool[pool.length - 1].def;
}
