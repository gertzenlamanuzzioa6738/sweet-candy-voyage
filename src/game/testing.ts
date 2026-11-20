import {newTile} from './board';
import type {Board, CandyType} from './types';

/**
 * Fixtures for the logic suites. Kept next to the game rules so the tests never have to
 * reach into component code or a native module.
 */

/** A 6x6 layout with no pre-existing match and exactly one obvious legal swap. */
export const GRID_6: number[][] = [
  [0, 1, 2, 3, 4, 0],
  [2, 3, 4, 0, 1, 2],
  [4, 0, 1, 2, 3, 4],
  [0, 2, 0, 4, 0, 1],
  [3, 4, 0, 1, 2, 3],
  [0, 1, 2, 3, 4, 0],
];

/** swapping these two makes a line of three STRAWBERRY DROPS on row 3 */
export const MATCH_SWAP: [number, number] = [2 * 6 + 1, 3 * 6 + 1];
/** adjacent, but the swap matches nothing — a spoiled swap */
export const SPOILED_SWAP: [number, number] = [0, 1];

export function makeBoard(grid: number[][], syrup?: number[][]): Board {
  const out: Board = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      out.push(newTile(grid[r][c] as CandyType, syrup ? syrup[r][c] : 0));
    }
  }
  return out;
}

export function zeros(rows: number, cols: number): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const line: number[] = [];
    for (let c = 0; c < cols; c++) {
      line.push(0);
    }
    out.push(line);
  }
  return out;
}

export function typesOf(board: Board): number[] {
  return board.map(t => (t ? t.type : -1));
}

export function syrupOf(board: Board): number[] {
  return board.map(t => (t ? t.syrup : -1));
}
