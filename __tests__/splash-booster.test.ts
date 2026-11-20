import {SPLASH_MAX} from '../src/constants/config';
import {densestSyrupCentre, splash, syrupCount} from '../src/game/syrup';
import {DEFAULT_SETTINGS} from '../src/game/progress';
import {makeRng} from '../src/game/rng';
import {buildState, reduce} from '../src/hooks/useBoard';
import {GRID_6, makeBoard, zeros} from '../src/game/testing';

const ROWS = 6;
const COLS = 6;

function clustered() {
  const s = zeros(ROWS, COLS);
  s[1][1] = 1;
  s[1][2] = 1;
  s[2][1] = 2;
  s[2][2] = 1;
  s[5][5] = 1;
  return makeBoard(GRID_6, s);
}

const setup = {
  mode: 'stage' as const,
  stageIndex: 2,
  attempt: 1,
  settings: DEFAULT_SETTINGS,
  modifier: null,
};

describe('syrup splash booster', () => {
  test('it aims at the densest syrup cluster', () => {
    const board = clustered();
    expect(syrupCount(board)).toBe(6);
    const centre = densestSyrupCentre(board, ROWS, COLS);
    expect(centre).not.toBeNull();
    const row = Math.floor(centre! / COLS);
    const col = centre! % COLS;
    expect(row).toBeGreaterThanOrEqual(1);
    expect(row).toBeLessThanOrEqual(2);
    expect(col).toBeGreaterThanOrEqual(1);
    expect(col).toBeLessThanOrEqual(2);
  });

  test('it wipes every layer in its three by three block', () => {
    const board = clustered();
    const result = splash(board, ROWS, COLS);
    expect(result.cleared).toBe(5);
    expect(syrupCount(result.board)).toBe(1);
    expect(result.cells.length).toBeGreaterThan(0);
  });

  test('a clean board has nothing to splash', () => {
    const clean = makeBoard(GRID_6);
    const result = splash(clean, ROWS, COLS);
    expect(result.cleared).toBe(0);
    expect(densestSyrupCentre(clean, ROWS, COLS)).toBeNull();
  });

  test('an uncharged press is answered, never silently ignored', () => {
    const rng = makeRng(41);
    const state = {...buildState(setup), board: clustered(), rows: ROWS, cols: COLS, splash: 3};
    const blocked = reduce(state, {type: 'splash', rng});
    expect(blocked.toast).toBe('MAKE A CHAIN TO CHARGE');
    expect(blocked.toastTick).toBe(state.toastTick + 1);
    expect(blocked.splash).toBe(3);
  });

  test('a charged press washes syrup, credits the objective and resets the charge', () => {
    const rng = makeRng(43);
    const state = {
      ...buildState(setup),
      board: clustered(),
      rows: ROWS,
      cols: COLS,
      splash: SPLASH_MAX,
    };
    const syrupObjective = state.objectives.findIndex(o => o.objective.kind === 'syrup');
    expect(syrupObjective).toBeGreaterThanOrEqual(0);

    const used = reduce(state, {type: 'splash', rng});
    expect(used.splash).toBe(0);
    expect(used.syrupCleared).toBe(5);
    const cap = used.objectives[syrupObjective].objective.total;
    expect(used.objectives[syrupObjective].done).toBe(Math.min(5, cap));
  });
});
