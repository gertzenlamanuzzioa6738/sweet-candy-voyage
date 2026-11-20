import type {Board} from './types';

export const idx = (r: number, c: number, cols: number): number => r * cols + c;
export const rowOf = (i: number, cols: number): number => Math.floor(i / cols);
export const colOf = (i: number, cols: number): number => i % cols;

function scanLine(board: Board, line: number[], out: number[][]): void {
  let start = 0;
  for (let k = 1; k <= line.length; k++) {
    const prev = board[line[k - 1]];
    const cur = k < line.length ? board[line[k]] : null;
    const same = !!prev && !!cur && prev.type === cur.type;
    if (!same) {
      if (k - start >= 3 && board[line[start]]) {
        out.push(line.slice(start, k));
      }
      start = k;
    }
  }
}

/**
 * All matched groups. Overlapping horizontal/vertical runs are merged into a single
 * group so an L or T shape counts as ONE match of every tile involved.
 */
export function findMatches(board: Board, rows: number, cols: number): number[][] {
  const runs: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const line: number[] = [];
    for (let c = 0; c < cols; c++) {
      line.push(idx(r, c, cols));
    }
    scanLine(board, line, runs);
  }
  for (let c = 0; c < cols; c++) {
    const line: number[] = [];
    for (let r = 0; r < rows; r++) {
      line.push(idx(r, c, cols));
    }
    scanLine(board, line, runs);
  }

  const groups: number[][] = [];
  for (const run of runs) {
    const touching = groups.filter(g => run.some(i => g.indexOf(i) >= 0));
    if (touching.length === 0) {
      groups.push(run.slice());
      continue;
    }
    const merged: number[] = run.slice();
    for (const g of touching) {
      for (const i of g) {
        if (merged.indexOf(i) < 0) {
          merged.push(i);
        }
      }
      groups.splice(groups.indexOf(g), 1);
    }
    groups.push(merged);
  }
  return groups;
}

export function hasMatch(board: Board, rows: number, cols: number): boolean {
  return findMatches(board, rows, cols).length > 0;
}

/** An L/T shape spans both axes — used for the recipe mastery bonus. */
export function isShapeMatch(group: number[], cols: number): boolean {
  const rs = new Set(group.map(i => rowOf(i, cols)));
  const cs = new Set(group.map(i => colOf(i, cols)));
  return rs.size > 1 && cs.size > 1;
}

export function isAdjacent(a: number, b: number, cols: number): boolean {
  const dr = Math.abs(rowOf(a, cols) - rowOf(b, cols));
  const dc = Math.abs(colOf(a, cols) - colOf(b, cols));
  return dr + dc === 1;
}

/** A syrup-covered tile is locked: it can be matched in place but never moved. */
export function isMovable(board: Board, i: number): boolean {
  const t = board[i];
  return !!t && t.syrup === 0;
}

export function swapped(board: Board, a: number, b: number): Board {
  const next = board.slice();
  const tmp = next[a];
  next[a] = next[b];
  next[b] = tmp;
  return next;
}

export function swapCreatesMatch(
  board: Board,
  a: number,
  b: number,
  rows: number,
  cols: number,
): boolean {
  if (!isAdjacent(a, b, cols)) {
    return false;
  }
  if (!isMovable(board, a) || !isMovable(board, b)) {
    return false;
  }
  return hasMatch(swapped(board, a, b), rows, cols);
}

/** First legal swap on the board, or null when the board is deadlocked. */
export function findLegalSwap(
  board: Board,
  rows: number,
  cols: number,
): [number, number] | null {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = idx(r, c, cols);
      if (c + 1 < cols) {
        const right = idx(r, c + 1, cols);
        if (swapCreatesMatch(board, i, right, rows, cols)) {
          return [i, right];
        }
      }
      if (r + 1 < rows) {
        const down = idx(r + 1, c, cols);
        if (swapCreatesMatch(board, i, down, rows, cols)) {
          return [i, down];
        }
      }
    }
  }
  return null;
}

/** The four orthogonal neighbours a selected tile may legally be swapped with. */
export function neighboursOf(i: number, rows: number, cols: number): number[] {
  const r = rowOf(i, cols);
  const c = colOf(i, cols);
  const out: number[] = [];
  if (r > 0) {
    out.push(idx(r - 1, c, cols));
  }
  if (r < rows - 1) {
    out.push(idx(r + 1, c, cols));
  }
  if (c > 0) {
    out.push(idx(r, c - 1, cols));
  }
  if (c < cols - 1) {
    out.push(idx(r, c + 1, cols));
  }
  return out;
}
