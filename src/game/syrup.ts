import {SPLASH_RADIUS} from '../constants/config';
import {colOf, idx, rowOf} from './matcher';
import type {Board} from './types';

export function syrupCount(board: Board): number {
  let total = 0;
  for (const t of board) {
    if (t) {
      total += t.syrup;
    }
  }
  return total;
}

/** Centre of the densest 3x3 syrup cluster, or null when the board is clean. */
export function densestSyrupCentre(
  board: Board,
  rows: number,
  cols: number,
): number | null {
  let best = -1;
  let bestScore = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let score = 0;
      for (let dr = -SPLASH_RADIUS; dr <= SPLASH_RADIUS; dr++) {
        for (let dc = -SPLASH_RADIUS; dc <= SPLASH_RADIUS; dc++) {
          const rr = r + dr;
          const cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) {
            continue;
          }
          const t = board[idx(rr, cc, cols)];
          if (t) {
            score += t.syrup;
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = idx(r, c, cols);
      }
    }
  }
  return bestScore > 0 ? best : null;
}

export type SplashResult = {board: Board; cleared: number; cells: number[]};

/** Syrup Splash booster: wipes every syrup layer in a 3x3 block around the worst cluster. */
export function splash(board: Board, rows: number, cols: number): SplashResult {
  const centre = densestSyrupCentre(board, rows, cols);
  if (centre === null) {
    return {board, cleared: 0, cells: []};
  }
  const b = board.map(t => (t ? {...t} : null));
  const r0 = rowOf(centre, cols);
  const c0 = colOf(centre, cols);
  const cells: number[] = [];
  let cleared = 0;
  for (let dr = -SPLASH_RADIUS; dr <= SPLASH_RADIUS; dr++) {
    for (let dc = -SPLASH_RADIUS; dc <= SPLASH_RADIUS; dc++) {
      const rr = r0 + dr;
      const cc = c0 + dc;
      if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) {
        continue;
      }
      const i = idx(rr, cc, cols);
      const t = b[i];
      if (t && t.syrup > 0) {
        cleared += t.syrup;
        t.syrup = 0;
        cells.push(i);
      }
    }
  }
  return {board: b, cleared, cells};
}
