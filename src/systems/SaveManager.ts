import type { MushroomDef } from '../data/mushrooms';

export interface InventoryItem {
  mushroom: MushroomDef;
  quantity: number;
}

export interface GameState {
  day: number;
  gold: number;
  inventory: InventoryItem[];
  journal: string[];       // mushroom IDs the player has seen
  inventoryMaxSize: number;
}

const SAVE_KEY = 'mushroom_hunter_save';

export function defaultState(): GameState {
  return {
    day: 1,
    gold: 0,
    inventory: [],
    journal: [],
    inventoryMaxSize: 12,
  };
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Could not save game — localStorage unavailable.');
  }
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as GameState;
  } catch {
    console.warn('Save data corrupted, starting fresh.');
  }
  return defaultState();
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/** Add a mushroom to inventory. Returns false if inventory is full. */
export function addToInventory(state: GameState, mushroom: MushroomDef): boolean {
  const total = state.inventory.reduce((sum, i) => sum + i.quantity, 0);
  if (total >= state.inventoryMaxSize) return false;

  const existing = state.inventory.find((i) => i.mushroom.id === mushroom.id);
  if (existing) {
    existing.quantity++;
  } else {
    state.inventory.push({ mushroom, quantity: 1 });
  }

  if (!state.journal.includes(mushroom.id)) {
    state.journal.push(mushroom.id);
  }

  return true;
}

/** Sell all mushrooms in inventory, return gold earned. */
export function sellAll(state: GameState): number {
  const earned = state.inventory.reduce(
    (sum, item) => sum + item.mushroom.value * item.quantity,
    0
  );
  state.gold += earned;
  state.inventory = [];
  return earned;
}

/** Sell a specific mushroom by id (one unit). Returns gold earned or 0 if not found. */
export function sellOne(state: GameState, mushroomId: string): number {
  const item = state.inventory.find((i) => i.mushroom.id === mushroomId);
  if (!item) return 0;
  const earned = item.mushroom.value;
  state.gold += earned;
  item.quantity--;
  if (item.quantity <= 0) {
    state.inventory = state.inventory.filter((i) => i.mushroom.id !== mushroomId);
  }
  return earned;
}
