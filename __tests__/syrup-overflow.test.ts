import {MAX_DRIPS} from '../src/constants/config';
import {DEFAULT_SETTINGS} from '../src/game/progress';
import {makeRng} from '../src/game/rng';
import {buildState, reduce} from '../src/hooks/useBoard';
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

function spoil(state: ReturnType<typeof fixture>, rng: () => number) {
  const selected = reduce(state, {type: 'tap', index: SPOILED_SWAP[0], rng});
  return reduce(selected, {type: 'tap', index: SPOILED_SWAP[1], rng});
}

describe('syrup drip pot', () => {
  test('the pot holds five drips by default', () => {
    expect(fixture().maxDrips).toBe(MAX_DRIPS);
  });

  test('aimless tapping spills the pot in ten taps and ends the stage', () => {
    const rng = makeRng(77);
    let state = fixture();
    for (let i = 0; i < MAX_DRIPS - 1; i++) {
      state = spoil(state, rng);
      expect(state.outcome).toBeNull();
      expect(state.drips).toBe(i + 1);
    }
    state = spoil(state, rng);
    expect(state.drips).toBe(MAX_DRIPS);
    expect(state.phase).toBe('ended');
    expect(state.outcome).toBe('spill');
  });

  test('the pot cannot be filled further once the stage has ended', () => {
    const rng = makeRng(78);
    let state = fixture();
    for (let i = 0; i < MAX_DRIPS; i++) {
      state = spoil(state, rng);
    }
    const after = spoil(state, rng);
    expect(after.drips).toBe(MAX_DRIPS);
    expect(after.outcome).toBe('spill');
  });

  test('a successful match empties a nearly full pot', () => {
    const rng = makeRng(79);
    const nearly = {...fixture(), drips: MAX_DRIPS - 1};
    const selected = reduce(nearly, {type: 'tap', index: MATCH_SWAP[0], rng});
    const matched = reduce(selected, {type: 'tap', index: MATCH_SWAP[1], rng});
    expect(matched.drips).toBe(0);
    expect(matched.outcome).toBeNull();
  });

  test('the TIGHT POT modifier shrinks the pot to three', () => {
    const tight = buildState({
      ...setup,
      modifier: {
        id: 'tight-pot',
        name: 'TIGHT POT',
        description: 'x',
        syrupMultiplier: 1,
        splashPerLink: 1,
        maxDrips: 3,
        doubleCandy: null,
      },
    });
    expect(tight.maxDrips).toBe(3);
  });
});
