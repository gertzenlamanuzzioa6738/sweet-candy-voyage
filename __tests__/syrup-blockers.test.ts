import {applyStep, nextStep} from '../src/game/cascade';
import {makeRng} from '../src/game/rng';
import {makeBoard, zeros} from '../src/game/testing';

const ROWS = 6;
const COLS = 6;

// row 3 is a ready-made line of three; its middle tile sits on syrup
const GRID = [
  [0, 1, 2, 3, 4, 0],
  [2, 3, 4, 0, 1, 2],
  [4, 0, 1, 2, 3, 4],
  [1, 1, 1, 4, 0, 2],
  [3, 4, 0, 1, 2, 3],
  [0, 1, 2, 3, 4, 0],
];

function syrupAt(layers: number) {
  const s = zeros(ROWS, COLS);
  s[3][1] = layers;
  return s;
}

describe('clear syrup blockers', () => {
  test('a match on a syrup tile washes a layer instead of clearing the candy', () => {
    const board = makeBoard(GRID, syrupAt(1));
    const step = nextStep(board, ROWS, COLS, 1, null);
    expect(step).not.toBeNull();
    expect(step!.matched).toHaveLength(3);
    expect(step!.wash).toEqual([3 * COLS + 1]);
    expect(step!.remove).toHaveLength(2);
    expect(step!.syrupCleared).toBe(1);
  });

  test('the washed tile stays on the board, now clean', () => {
    const board = makeBoard(GRID, syrupAt(1));
    const step = nextStep(board, ROWS, COLS, 1, null)!;
    const after = applyStep(board, step, ROWS, COLS, makeRng(5));
    const washed = after[3 * COLS + 1];
    expect(washed).not.toBeNull();
    expect(washed!.syrup).toBe(0);
  });

  test('thick syrup needs two matches', () => {
    const board = makeBoard(GRID, syrupAt(2));
    const step = nextStep(board, ROWS, COLS, 1, null)!;
    const after = applyStep(board, step, ROWS, COLS, makeRng(5));
    expect(after[3 * COLS + 1]!.syrup).toBe(1);
  });

  test('only the matched candies score, the washed one does not', () => {
    const board = makeBoard(GRID, syrupAt(1));
    const step = nextStep(board, ROWS, COLS, 1, null)!;
    const collectedTotal = Object.keys(step.collected).reduce(
      (sum, k) => sum + step.collected[Number(k)],
      0,
    );
    expect(collectedTotal).toBe(2);
  });
});
