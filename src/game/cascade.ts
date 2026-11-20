import {
  MAX_MULTIPLIER,
  MAX_REFUNDS,
  MULTIPLIER_STEP,
  REFUND_EVERY_LINK,
  SCORE_PER_CANDY,
} from '../constants/config';
import {settle} from './board';
import {findMatches, isShapeMatch} from './matcher';
import type {Board, CandyType, Rng} from './types';

export function multiplierForLink(link: number): number {
  return Math.min(1 + MULTIPLIER_STEP * (link - 1), MAX_MULTIPLIER);
}

/** Sugar Rush: every third link of one chain buys a move back, capped per stage. */
export function grantsRefund(link: number, refundsSoFar: number): boolean {
  return link % REFUND_EVERY_LINK === 0 && refundsSoFar < MAX_REFUNDS;
}

export type CascadeStep = {
  /** every tile in a matched group */
  matched: number[];
  /** matched tiles that leave the board */
  remove: number[];
  /** matched tiles that sit on syrup — one layer is washed instead */
  wash: number[];
  score: number;
  /** candies cleared, by type */
  collected: Record<number, number>;
  syrupCleared: number;
  /** a 5-in-a-line or an L/T made of the recipe key candy */
  mastery: boolean;
  multiplier: number;
};

/** One cascade link. Returns null when the board is at rest. */
export function nextStep(
  board: Board,
  rows: number,
  cols: number,
  link: number,
  keyCandy: CandyType | null,
): CascadeStep | null {
  const groups = findMatches(board, rows, cols);
  if (groups.length === 0) {
    return null;
  }
  const multiplier = multiplierForLink(link);
  const matched: number[] = [];
  const remove: number[] = [];
  const wash: number[] = [];
  const collected: Record<number, number> = {};
  let syrupCleared = 0;
  let mastery = false;

  for (const group of groups) {
    if (keyCandy !== null && (group.length >= 5 || isShapeMatch(group, cols))) {
      const allKey = group.every(i => {
        const t = board[i];
        return !!t && t.type === keyCandy;
      });
      if (allKey) {
        mastery = true;
      }
    }
    for (const i of group) {
      const tile = board[i];
      if (!tile || matched.indexOf(i) >= 0) {
        continue;
      }
      matched.push(i);
      if (tile.syrup > 0) {
        wash.push(i);
        syrupCleared += 1;
      } else {
        remove.push(i);
        collected[tile.type] = (collected[tile.type] || 0) + 1;
      }
    }
  }

  return {
    matched,
    remove,
    wash,
    score: Math.round(remove.length * SCORE_PER_CANDY * multiplier),
    collected,
    syrupCleared,
    mastery,
    multiplier,
  };
}

/** Applies one step to the board: washes syrup, removes candies, settles and refills. */
export function applyStep(
  board: Board,
  step: CascadeStep,
  rows: number,
  cols: number,
  rng: Rng,
  types?: number,
): Board {
  const b = board.map(t => (t ? {...t} : null));
  for (const i of step.wash) {
    const t = b[i];
    if (t) {
      t.syrup = Math.max(0, t.syrup - 1);
    }
  }
  for (const i of step.remove) {
    b[i] = null;
  }
  return settle(b, rows, cols, rng, types);
}

export type CascadeTotals = {
  board: Board;
  links: number;
  score: number;
  collected: Record<number, number>;
  syrupCleared: number;
  mastery: boolean;
  splashGained: number;
};

/** Full chain resolution — used by the logic tests and the Splash booster follow-up. */
export function resolveAll(
  board: Board,
  rows: number,
  cols: number,
  rng: Rng,
  keyCandy: CandyType | null,
  types?: number,
): CascadeTotals {
  let current = board;
  let links = 0;
  let score = 0;
  let syrupCleared = 0;
  let mastery = false;
  const collected: Record<number, number> = {};

  for (let guard = 0; guard < 64; guard++) {
    const step = nextStep(current, rows, cols, links + 1, keyCandy);
    if (!step) {
      break;
    }
    links += 1;
    score += step.score;
    syrupCleared += step.syrupCleared;
    mastery = mastery || step.mastery;
    for (const key of Object.keys(step.collected)) {
      const k = Number(key);
      collected[k] = (collected[k] || 0) + step.collected[k];
    }
    current = applyStep(current, step, rows, cols, rng, types);
  }

  return {board: current, links, score, collected, syrupCleared, mastery, splashGained: links};
}
