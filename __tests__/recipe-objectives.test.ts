import {
  initialObjectives,
  objectiveLabel,
  objectivesComplete,
  STAGES,
  stageAt,
} from '../src/game/levels';
import {makeRng} from '../src/game/rng';
import {DEFAULT_SETTINGS} from '../src/game/progress';
import {buildState, reduce} from '../src/hooks/useBoard';
import {GRID_6, MATCH_SWAP, makeBoard} from '../src/game/testing';

const setup = {
  mode: 'stage' as const,
  stageIndex: 0,
  attempt: 1,
  settings: DEFAULT_SETTINGS,
  modifier: null,
};

describe('complete recipe patterns', () => {
  test('every stage carries a named recipe and at least one objective', () => {
    for (const stage of STAGES) {
      expect(stage.recipe.length).toBeGreaterThan(3);
      expect(stage.objectives.length).toBeGreaterThanOrEqual(1);
      expect(stage.objectives.length).toBeLessThanOrEqual(3);
    }
  });

  test('objectives start at zero', () => {
    const states = initialObjectives(stageAt(0));
    expect(states.every(s => s.done === 0)).toBe(true);
    expect(objectivesComplete(states)).toBe(false);
  });

  test('clearing the recipe candy moves its chip', () => {
    const rng = makeRng(21);
    const start = {...buildState(setup), board: makeBoard(GRID_6), rows: 6, cols: 6};
    expect(start.objectives[0].objective.kind).toBe('candy');

    const selected = reduce(start, {type: 'tap', index: MATCH_SWAP[0], rng});
    const swapped = reduce(selected, {type: 'tap', index: MATCH_SWAP[1], rng});
    expect(swapped.objectives[0].done).toBe(3);
  });

  test('a finished objective list is a win', () => {
    const states = initialObjectives(stageAt(4)).map(s => ({
      ...s,
      done: s.objective.total,
    }));
    expect(objectivesComplete(states)).toBe(true);
  });

  test('objective labels are readable words, never a glyph', () => {
    for (const stage of STAGES) {
      for (const objective of stage.objectives) {
        expect(objectiveLabel(objective)).toMatch(/^[A-Z ]+$/);
      }
    }
  });
});
