import {nextStep} from '../src/game/cascade';
import {isShapeMatch} from '../src/game/matcher';
import {makeBoard} from '../src/game/testing';
import type {CandyType} from '../src/game/types';

const ROWS = 6;
const COLS = 6;

// a five-in-a-line of candy 1 on row 3
const FIVE = [
  [0, 1, 2, 3, 4, 0],
  [2, 3, 4, 0, 1, 2],
  [4, 0, 2, 2, 3, 4],
  [1, 1, 1, 1, 1, 2],
  [3, 4, 0, 1, 2, 3],
  [0, 1, 2, 3, 4, 0],
];

// an L shape of candy 1: row 3 columns 0..2 plus column 0 rows 4..5
const SHAPE = [
  [0, 1, 2, 3, 4, 0],
  [2, 3, 4, 0, 1, 2],
  [4, 0, 2, 2, 3, 4],
  [1, 1, 1, 4, 0, 2],
  [1, 4, 0, 1, 2, 3],
  [1, 0, 2, 3, 4, 0],
];

describe('recipe mastery bonus', () => {
  test('a five in a line of the recipe candy is a mastery clear', () => {
    const step = nextStep(makeBoard(FIVE), ROWS, COLS, 1, 1 as CandyType);
    expect(step).not.toBeNull();
    expect(step!.matched.length).toBeGreaterThanOrEqual(5);
    expect(step!.mastery).toBe(true);
  });

  test('the same clear of another candy is not a mastery', () => {
    const step = nextStep(makeBoard(FIVE), ROWS, COLS, 1, 3 as CandyType);
    expect(step!.mastery).toBe(false);
  });

  test('an L shape of the recipe candy also counts', () => {
    const step = nextStep(makeBoard(SHAPE), ROWS, COLS, 1, 1 as CandyType);
    expect(step).not.toBeNull();
    expect(isShapeMatch(step!.matched, COLS)).toBe(true);
    expect(step!.mastery).toBe(true);
  });

  test('a plain three in a row is never a mastery', () => {
    const plain = [
      [0, 1, 2, 3, 4, 0],
      [2, 3, 4, 0, 1, 2],
      [4, 0, 2, 2, 3, 4],
      [1, 1, 1, 4, 0, 2],
      [3, 4, 0, 1, 2, 3],
      [0, 1, 2, 3, 4, 0],
    ];
    const step = nextStep(makeBoard(plain), ROWS, COLS, 1, 1 as CandyType);
    expect(step!.matched).toHaveLength(3);
    expect(step!.mastery).toBe(false);
  });

  test('a mastery clear is worth more than a plain one on the same link', () => {
    const five = nextStep(makeBoard(FIVE), ROWS, COLS, 1, 1 as CandyType)!;
    expect(five.score).toBeGreaterThan(0);
    expect(five.remove.length).toBeGreaterThanOrEqual(5);
  });
});
