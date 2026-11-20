import {CANDY_TYPES, MAX_DRIPS, TIGHT_POT_DRIPS} from '../constants/config';
import type {CandyType} from './types';

export type DailyModifier = {
  id: string;
  name: string;
  description: string;
  /** syrup tiles on the daily board, as a factor of the base amount */
  syrupMultiplier: number;
  /** splash charge gained per cascade link */
  splashPerLink: number;
  maxDrips: number;
  /** this candy type is worth double, or null */
  doubleCandy: CandyType | null;
};

const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

/** Stable calendar key, local time. */
export function dateKey(d: Date = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function prettyDate(d: Date = new Date()): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function dateSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const DAILY_MODIFIERS: DailyModifier[] = [
  {
    id: 'syrup-flood',
    name: 'SYRUP FLOOD',
    description: 'Twice as much caramel on the board. Wash it off before the pot fills.',
    syrupMultiplier: 2,
    splashPerLink: 1,
    maxDrips: MAX_DRIPS,
    doubleCandy: null,
  },
  {
    id: 'sugar-rush',
    name: 'SUGAR RUSH',
    description: 'Every chain link charges the Syrup Splash twice as fast.',
    syrupMultiplier: 1,
    splashPerLink: 2,
    maxDrips: MAX_DRIPS,
    doubleCandy: null,
  },
  {
    id: 'tight-pot',
    name: 'TIGHT POT',
    description: 'The pot holds three drips instead of five. Spoiled swaps are expensive.',
    syrupMultiplier: 1,
    splashPerLink: 1,
    maxDrips: TIGHT_POT_DRIPS,
    doubleCandy: null,
  },
  {
    id: 'berry-hunt',
    name: 'BERRY HUNT',
    description: 'One candy type scores double for the whole run. Hunt it down.',
    syrupMultiplier: 1,
    splashPerLink: 1,
    maxDrips: MAX_DRIPS,
    doubleCandy: 3,
  },
];

export function modifierForDate(key: string): DailyModifier {
  const seed = dateSeed(key);
  const base = DAILY_MODIFIERS[seed % DAILY_MODIFIERS.length];
  if (base.doubleCandy === null) {
    return base;
  }
  return {...base, doubleCandy: ((seed >> 3) % CANDY_TYPES) as CandyType};
}

function toDate(key: string): Date | null {
  const parts = key.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) {
    return null;
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const a = toDate(fromKey);
  const b = toDate(toKey);
  if (!a || !b) {
    return 99;
  }
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** +1 on consecutive days, back to 1 after a missed day, unchanged on a repeat. */
export function nextStreak(
  lastPlayedKey: string | null,
  todayKey: string,
  streak: number,
): number {
  if (!lastPlayedKey) {
    return 1;
  }
  const gap = daysBetween(lastPlayedKey, todayKey);
  if (gap === 0) {
    return Math.max(1, streak);
  }
  if (gap === 1) {
    return streak + 1;
  }
  return 1;
}

export function playedToday(lastPlayedKey: string | null, todayKey: string): boolean {
  return lastPlayedKey === todayKey;
}
