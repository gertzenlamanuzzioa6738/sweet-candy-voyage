import {CANDY_TYPES, MAX_GENERATION_ATTEMPTS} from '../constants/config';
import {findLegalSwap, hasMatch, idx} from './matcher';
import {makeRng, randInt, stageSeed} from './rng';
import type {Board, CandyType, Rng, Tile} from './types';

let nextId = 1;
export function newTile(type: CandyType, syrup: number = 0): Tile {
  return {id: nextId++, type, syrup};
}
/** test helper — keeps ids deterministic between suites */
export function resetTileIds(): void {
  nextId = 1;
}

export type BoardSpec = {
  rows: number;
  cols: number;
  types?: number;
  syrupTiles: number;
  thickSyrup: boolean;
};

function randomType(rng: Rng, types: number): CandyType {
  return randInt(rng, types) as CandyType;
}

/** Fill avoiding an immediate 3-in-a-line so most generations pass on the first try. */
function fillBoard(rng: Rng, rows: number, cols: number, types: number): Board {
  const b: Board = new Array(rows * cols).fill(null);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const banned = new Set<number>();
      if (c >= 2) {
        const a = b[idx(r, c - 1, cols)];
        const d = b[idx(r, c - 2, cols)];
        if (a && d && a.type === d.type) {
          banned.add(a.type);
        }
      }
      if (r >= 2) {
        const a = b[idx(r - 1, c, cols)];
        const d = b[idx(r - 2, c, cols)];
        if (a && d && a.type === d.type) {
          banned.add(a.type);
        }
      }
      let t = randomType(rng, types);
      let guard = 0;
      while (banned.has(t) && guard < 12) {
        t = randomType(rng, types);
        guard++;
      }
      b[idx(r, c, cols)] = newTile(t);
    }
  }
  return b;
}

function placeSyrup(b: Board, rng: Rng, count: number, thick: boolean): void {
  const free: number[] = [];
  for (let i = 0; i < b.length; i++) {
    if (b[i]) {
      free.push(i);
    }
  }
  for (let k = 0; k < count && free.length > 0; k++) {
    const pickAt = randInt(rng, free.length);
    const target = free.splice(pickAt, 1)[0];
    const tile = b[target];
    if (tile) {
      tile.syrup = thick && k % 2 === 1 ? 2 : 1;
    }
  }
}

/**
 * Deterministic fallback layout. Built from t(r,c) = (2r + c + variant) % 5, which can never
 * contain a pre-existing line, then three cells are forced so at least one legal swap exists.
 */
export function fallbackBoard(spec: BoardSpec, variant: number): Board {
  const {rows, cols} = spec;
  const types = spec.types ?? CANDY_TYPES;
  const v = ((variant % types) + types) % types;
  const b: Board = new Array(rows * cols).fill(null);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      b[idx(r, c, cols)] = newTile(((2 * r + c + v) % types) as CandyType);
    }
  }
  const seeded = ((1 + v) % types) as CandyType;
  const forced = [idx(3, 0, cols), idx(3, 2, cols), idx(2, 1, cols)];
  for (const i of forced) {
    const t = b[i];
    if (t) {
      t.type = seeded;
    }
  }
  // syrup must never cover the guaranteed swap
  const keepFree = new Set([...forced, idx(3, 1, cols)]);
  let placed = 0;
  for (let i = b.length - 1; i >= 0 && placed < spec.syrupTiles; i -= 3) {
    if (keepFree.has(i)) {
      continue;
    }
    const t = b[i];
    if (t) {
      t.syrup = spec.thickSyrup && placed % 2 === 1 ? 2 : 1;
      placed++;
    }
  }
  return b;
}

export type GeneratedBoard = {board: Board; seed: number; attempts: number; fallback: boolean};

/**
 * Seeded generation with a solvability check: no pre-existing match AND at least one legal
 * swap. Up to 20 regenerations, then the fallback layout — the fallback is a guarantee,
 * not the game.
 */
export function generateBoard(
  spec: BoardSpec,
  stageIndex: number,
  attempt: number,
): GeneratedBoard {
  const types = spec.types ?? CANDY_TYPES;
  const baseSeed = stageSeed(stageIndex, attempt);
  for (let k = 0; k < MAX_GENERATION_ATTEMPTS; k++) {
    const seed = (baseSeed + k * 2654435761) >>> 0;
    const rng = makeRng(seed);
    const b = fillBoard(rng, spec.rows, spec.cols, types);
    placeSyrup(b, rng, spec.syrupTiles, spec.thickSyrup);
    if (!hasMatch(b, spec.rows, spec.cols) && findLegalSwap(b, spec.rows, spec.cols)) {
      return {board: b, seed, attempts: k + 1, fallback: false};
    }
  }
  return {
    board: fallbackBoard(spec, stageIndex + attempt),
    seed: baseSeed,
    attempts: MAX_GENERATION_ATTEMPTS,
    fallback: true,
  };
}

/** Column split by locked syrup tiles: candies only move inside their own segment. */
export function columnSegments(
  board: Board,
  rows: number,
  cols: number,
  c: number,
): number[][] {
  const segs: number[][] = [];
  let cur: number[] = [];
  for (let r = 0; r < rows; r++) {
    const i = idx(r, c, cols);
    const t = board[i];
    if (t && t.syrup > 0) {
      if (cur.length) {
        segs.push(cur);
      }
      cur = [];
    } else {
      cur.push(i);
    }
  }
  if (cur.length) {
    segs.push(cur);
  }
  return segs;
}

/**
 * Gravity + refill in one pass. Existing candies fall to the bottom of their segment,
 * fresh candies drop in at the top of the segment. With `rng` omitted the holes stay
 * empty (used by the gravity unit test).
 */
export function settle(
  board: Board,
  rows: number,
  cols: number,
  rng?: Rng,
  types: number = CANDY_TYPES,
): Board {
  const b = board.slice();
  for (let c = 0; c < cols; c++) {
    for (const seg of columnSegments(b, rows, cols, c)) {
      const kept: Tile[] = [];
      for (const i of seg) {
        const t = b[i];
        if (t) {
          kept.push(t);
        }
      }
      const need = seg.length - kept.length;
      const column: (Tile | null)[] = [];
      for (let k = 0; k < need; k++) {
        column.push(rng ? newTile(randomType(rng, types)) : null);
      }
      for (const t of kept) {
        column.push(t);
      }
      seg.forEach((i, k) => {
        b[i] = column[k];
      });
    }
  }
  return b;
}

/** No legal swap left: shuffle the free candies until there is one again. */
export function reshuffle(board: Board, rows: number, cols: number, rng: Rng): Board {
  const movable: number[] = [];
  for (let i = 0; i < board.length; i++) {
    const t = board[i];
    if (t && t.syrup === 0) {
      movable.push(i);
    }
  }
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const b = board.slice();
    for (let k = movable.length - 1; k > 0; k--) {
      const j = randInt(rng, k + 1);
      const a = movable[k];
      const c = movable[j];
      const tmp = b[a];
      b[a] = b[c];
      b[c] = tmp;
    }
    if (!hasMatch(b, rows, cols) && findLegalSwap(b, rows, cols)) {
      return b;
    }
  }
  return board;
}

export function isDeadlocked(board: Board, rows: number, cols: number): boolean {
  return findLegalSwap(board, rows, cols) === null;
}
