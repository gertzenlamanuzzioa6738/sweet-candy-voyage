import {findMatches, idx, isAdjacent, swapCreatesMatch} from '../src/game/matcher';
import {makeRng} from '../src/game/rng';
import {buildState, reduce} from '../src/hooks/useBoard';
import {DEFAULT_SETTINGS} from '../src/game/progress';
import {GRID_6, MATCH_SWAP, SPOILED_SWAP, makeBoard} from '../src/game/testing';

const setup = {
  mode: 'stage' as const,
  stageIndex: 0,
  attempt: 1,
  settings: DEFAULT_SETTINGS,
  modifier: null,
};

function fixture() {
  return {...buildState(setup), board: makeBoard(GRID_6), rows: 6, cols: 6};
}

describe('swap and combine candy pieces', () => {
  test('the fixture board starts with no match', () => {
    expect(findMatches(makeBoard(GRID_6), 6, 6)).toHaveLength(0);
  });

  test('a swap that lines up three is legal', () => {
    const board = makeBoard(GRID_6);
    const [a, b] = MATCH_SWAP;
    expect(isAdjacent(a, b, 6)).toBe(true);
    expect(swapCreatesMatch(board, a, b, 6, 6)).toBe(true);
  });

  test('a swap that lines up nothing is not legal', () => {
    const board = makeBoard(GRID_6);
    const [a, b] = SPOILED_SWAP;
    expect(swapCreatesMatch(board, a, b, 6, 6)).toBe(false);
  });

  test('a legal swap clears tiles, scores and spends one move', () => {
    const rng = makeRng(7);
    const start = fixture();
    const selected = reduce(start, {type: 'tap', index: MATCH_SWAP[0], rng});
    expect(selected.selected).toBe(MATCH_SWAP[0]);
    expect(selected.legal.length).toBeGreaterThan(0);

    const swapped = reduce(selected, {type: 'tap', index: MATCH_SWAP[1], rng});
    expect(swapped.phase).toBe('clearing');
    expect(swapped.clearing.length).toBeGreaterThanOrEqual(3);
    expect(swapped.score).toBeGreaterThan(0);
    expect(swapped.movesLeft).toBe(start.movesLeft - 1);
    expect(swapped.selected).toBeNull();
  });

  test('tapping the same candy twice only deselects, free of charge', () => {
    const rng = makeRng(3);
    const start = fixture();
    const selected = reduce(start, {type: 'tap', index: MATCH_SWAP[0], rng});
    const cleared = reduce(selected, {type: 'tap', index: MATCH_SWAP[0], rng});
    expect(cleared.selected).toBeNull();
    expect(cleared.movesLeft).toBe(start.movesLeft);
    expect(cleared.drips).toBe(0);
  });

  test('a spoiled swap spends a move and drips syrup', () => {
    const rng = makeRng(11);
    const start = fixture();
    const selected = reduce(start, {type: 'tap', index: SPOILED_SWAP[0], rng});
    const spoiled = reduce(selected, {type: 'tap', index: SPOILED_SWAP[1], rng});
    expect(spoiled.phase).toBe('idle');
    expect(spoiled.drips).toBe(1);
    expect(spoiled.movesLeft).toBe(start.movesLeft - 1);
    expect(spoiled.spoiledTick).toBe(start.spoiledTick + 1);
  });

  test('a successful match empties the syrup pot', () => {
    const rng = makeRng(13);
    const dripping = {...fixture(), drips: 3};
    const selected = reduce(dripping, {type: 'tap', index: MATCH_SWAP[0], rng});
    const swapped = reduce(selected, {type: 'tap', index: MATCH_SWAP[1], rng});
    expect(swapped.drips).toBe(0);
  });

  test('idx maps row and column to the flat board index', () => {
    expect(idx(3, 1, 6)).toBe(19);
  });
});
