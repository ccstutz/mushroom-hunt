import { TIME_UNITS_PER_DAY } from '../data/constants';

export interface TimeState {
  day: number;
  unitsRemaining: number;
  unitsPerDay: number;
}

export function createTimeState(day: number): TimeState {
  return {
    day,
    unitsRemaining: TIME_UNITS_PER_DAY,
    unitsPerDay: TIME_UNITS_PER_DAY,
  };
}

export function spendTime(state: TimeState, units: number): boolean {
  if (state.unitsRemaining <= 0) return false;
  state.unitsRemaining = Math.max(0, state.unitsRemaining - units);
  return true;
}

export function isDayOver(state: TimeState): boolean {
  return state.unitsRemaining <= 0;
}

export function timeLabel(state: TimeState): string {
  return `Day ${state.day}  |  Time: ${state.unitsRemaining}/${state.unitsPerDay}`;
}
