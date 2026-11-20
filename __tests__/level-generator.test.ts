import {MAX_GENERATION_ATTEMPTS} from '../src/constants/config';
import {
  columnSegments,
  fallbackBoard,
  generateBoard,
  isDeadlocked,
  reshuffle,
  settle,
} from '../src/game/board';
import {findLegalSwap, hasMatch} from '../src/game/matcher';
import {makeRng, stageSeed} from '../src/game/rng';
import {STAGES} from '../src/game/levels';
import {makeBoard, zeros} from '../src/game/testing';

const ROWS = 6;
const COLS = 6;

function specFor(stageIndex: number) {
  const stage = STAGES[stageIndex];
  return {
    rows: ROWS,
    cols: COLS,
    syrupTiles: stage.syrupTiles,
    thickSyrup: stage.thickSyrup,
  };
}

describe('seeded, solvability-checked board generation', () => {
  test('every stage generates a board with no pre-existing match and a legal swap', () => {
    for (let i = 0; i < STAGES.length; i++) {
      const {board, attempts} = generateBoard(specFor(i), i, 1);
      expect(board).toHaveLength(ROWS * COLS);
      expect(hasMatch(board, ROWS, COLS)).toBe(false);
      expect(findLegalSwap(board, ROWS, COLS)).not.toBeNull();
      expect(attempts).toBeLessThanOrEqual(MAX_GENERATION_ATTEMPTS);
    }
  });

  test('the same stage and attempt always rebuild the same layout', () => {
    const a = generateBoard(specFor(3), 3, 2);
    const b = generateBoard(specFor(3), 3, 2);
    expect(a.seed).toBe(b.seed);
    expect(a.board.map(t => t!.type)).toEqual(b.board.map(t => t!.type));
    expect(a.board.map(t => t!.syrup)).toEqual(b.board.map(t => t!.syrup));
  });

  test('a different attempt looks visibly different', () => {
    const first = generateBoard(specFor(3), 3, 1);
    const second = generateBoard(specFor(3), 3, 2);
    expect(first.seed).not.toBe(second.seed);
    expect(first.board.map(t => t!.type)).not.toEqual(second.board.map(t => t!.type));
  });

  test('the seed formula is the documented one', () => {
    expect(stageSeed(3, 2)).toBe(((3 * 7919) ^ (2 * 104729)) >>> 0);
  });

  test('the fallback layout is playable, not a dead board', () => {
    for (let variant = 0; variant < 4; variant++) {
      const board = fallbackBoard({rows: ROWS, cols: COLS, syrupTiles: 4, thickSyrup: false}, variant);
      expect(hasMatch(board, ROWS, COLS)).toBe(false);
      expect(findLegalSwap(board, ROWS, COLS)).not.toBeNull();
    }
  });

  test('the generator carries the requested amount of syrup', () => {
    const {board} = generateBoard(specFor(0), 0, 1);
    const syrupTiles = board.filter(t => t && t.syrup > 0).length;
    expect(syrupTiles).toBe(STAGES[0].syrupTiles);
  });

  test('syrup splits a column into segments that candies cannot fall through', () => {
    const syrup = zeros(ROWS, COLS);
    syrup[3][0] = 1;
    const board = makeBoard(
      [
        [0, 1, 2, 3, 4, 0],
        [2, 3, 4, 0, 1, 2],
        [4, 0, 1, 2, 3, 4],
        [1, 2, 3, 4, 0, 1],
        [3, 4, 0, 1, 2, 3],
        [0, 1, 2, 3, 4, 0],
      ],
      syrup,
    );
    const segments = columnSegments(board, ROWS, COLS, 0);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveLength(3);
    expect(segments[1]).toHaveLength(2);
  });

  test('settling fills every hole it makes', () => {
    const board = makeBoard([
      [0, 1, 2, 3, 4, 0],
      [2, 3, 4, 0, 1, 2],
      [4, 0, 1, 2, 3, 4],
      [1, 2, 3, 4, 0, 1],
      [3, 4, 0, 1, 2, 3],
      [0, 1, 2, 3, 4, 0],
    ]);
    board[0] = null;
    board[6] = null;
    const settled = settle(board, ROWS, COLS, makeRng(5));
    expect(settled.every(t => t !== null)).toBe(true);
  });

  test('a deadlocked board is swirled back into a playable one', () => {
    const flat: number[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const line: number[] = [];
      for (let c = 0; c < COLS; c++) {
        line.push((2 * r + c) % 5);
      }
      flat.push(line);
    }
    const board = makeBoard(flat);
    if (isDeadlocked(board, ROWS, COLS)) {
      const fixed = reshuffle(board, ROWS, COLS, makeRng(17));
      expect(isDeadlocked(fixed, ROWS, COLS)).toBe(false);
      expect(hasMatch(fixed, ROWS, COLS)).toBe(false);
    } else {
      expect(findLegalSwap(board, ROWS, COLS)).not.toBeNull();
    }
  });
});
