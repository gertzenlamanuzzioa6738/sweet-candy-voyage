import {STAGES, stageAt} from '../src/game/levels';
import {makeRng} from '../src/game/rng';
import {DEFAULT_SETTINGS} from '../src/game/progress';
import {buildState, reduce} from '../src/hooks/useBoard';
import {GRID_6, SPOILED_SWAP, makeBoard} from '../src/game/testing';

const setup = {
  mode: 'stage' as const,
  stageIndex: 2,
  attempt: 1,
  settings: DEFAULT_SETTINGS,
  modifier: null,
};

describe('level objectives with limited moves', () => {
  test('the twelve move budgets match the balance table', () => {
    expect(STAGES.map(s => s.moves)).toEqual([18, 18, 20, 18, 16, 20, 18, 16, 22, 18, 16, 20]);
  });

  test('a round starts with the full budget', () => {
    const state = buildState(setup);
    expect(state.movesLeft).toBe(stageAt(2).moves);
    expect(state.movesTotal).toBe(stageAt(2).moves);
  });

  test('the last move running out ends the stage as OUT OF MOVES', () => {
    const rng = makeRng(31);
    const start = {
      ...buildState(setup),
      board: makeBoard(GRID_6),
      rows: 6,
      cols: 6,
      movesLeft: 1,
    };
    const selected = reduce(start, {type: 'tap', index: SPOILED_SWAP[0], rng});
    const spent = reduce(selected, {type: 'tap', index: SPOILED_SWAP[1], rng});
    expect(spent.movesLeft).toBe(0);
    expect(spent.phase).toBe('ended');
    expect(spent.outcome).toBe('moves');
  });

  test('a daily run has no move limit and cannot lose on moves', () => {
    const rng = makeRng(33);
    const daily = {
      ...buildState({...setup, mode: 'daily'}),
      board: makeBoard(GRID_6),
      rows: 6,
      cols: 6,
    };
    const selected = reduce(daily, {type: 'tap', index: SPOILED_SWAP[0], rng});
    const spent = reduce(selected, {type: 'tap', index: SPOILED_SWAP[1], rng});
    expect(spent.movesLeft).toBe(0);
    expect(spent.outcome).toBeNull();
  });

  test('the daily timer expiring ends the round as TIME IS UP', () => {
    const daily = buildState({...setup, mode: 'daily'});
    const over = reduce(daily, {type: 'timeUp'});
    expect(over.phase).toBe('ended');
    expect(over.outcome).toBe('time');
  });
});
