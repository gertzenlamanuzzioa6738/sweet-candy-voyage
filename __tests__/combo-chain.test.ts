import {MAX_MULTIPLIER} from '../src/constants/config';
import {multiplierForLink, resolveAll} from '../src/game/cascade';
import {generateBoard} from '../src/game/board';
import {findMatches} from '../src/game/matcher';
import {makeRng} from '../src/game/rng';
import {makeBoard} from '../src/game/testing';

const ROWS = 6;
const COLS = 6;

// a ready-made line of three that refills from above
const GRID = [
  [0, 1, 2, 3, 4, 0],
  [2, 3, 4, 0, 1, 2],
  [4, 0, 1, 2, 3, 4],
  [1, 1, 1, 4, 0, 2],
  [3, 4, 0, 1, 2, 3],
  [0, 1, 2, 3, 4, 0],
];

describe('combo chains', () => {
  test('the multiplier rises half a step per link and caps at four', () => {
    expect(multiplierForLink(1)).toBe(1);
    expect(multiplierForLink(2)).toBe(1.5);
    expect(multiplierForLink(3)).toBe(2);
    expect(multiplierForLink(20)).toBe(MAX_MULTIPLIER);
  });

  test('resolving a board runs at least one link and scores', () => {
    const board = makeBoard(GRID);
    const totals = resolveAll(board, ROWS, COLS, makeRng(99), null);
    expect(totals.links).toBeGreaterThanOrEqual(1);
    expect(totals.score).toBeGreaterThan(0);
    expect(totals.splashGained).toBe(totals.links);
  });

  test('the board is at rest once the chain is resolved', () => {
    const board = makeBoard(GRID);
    const totals = resolveAll(board, ROWS, COLS, makeRng(99), null);
    expect(findMatches(totals.board, ROWS, COLS)).toHaveLength(0);
  });

  test('a freshly generated board has nothing to resolve', () => {
    const generated = generateBoard(
      {rows: ROWS, cols: COLS, syrupTiles: 4, thickSyrup: false},
      0,
      1,
    );
    const totals = resolveAll(generated.board, ROWS, COLS, makeRng(1), null);
    expect(totals.links).toBe(0);
    expect(totals.score).toBe(0);
  });
});
