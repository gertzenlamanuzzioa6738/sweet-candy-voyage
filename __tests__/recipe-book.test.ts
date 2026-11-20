import {RECIPES} from '../src/game/recipes';
import {LOCATIONS, STAGE_COUNT} from '../src/game/levels';
import {finishRound, initialProgress} from '../src/game/progress';

describe('recipe book', () => {
  test('one recipe per stage, with unique names', () => {
    expect(RECIPES).toHaveLength(STAGE_COUNT);
    expect(new Set(RECIPES.map(r => r.name)).size).toBe(STAGE_COUNT);
  });

  test('every recipe belongs to a real garden location', () => {
    for (const recipe of RECIPES) {
      expect(LOCATIONS).toContain(recipe.location as (typeof LOCATIONS)[number]);
    }
  });

  test('no recipe is discovered before it is cooked', () => {
    expect(initialProgress().recipes).toHaveLength(0);
  });

  test('winning a stage writes its recipe into the book exactly once', () => {
    let state = initialProgress();
    state = finishRound(state, {
      outcome: 'win',
      mode: 'stage',
      stageIndex: 0,
      score: 1000,
      bestChain: 1,
      syrupCleared: 0,
      movesLeft: 9,
      movesTotal: 18,
      masteryHits: 0,
      modifier: null,
    }).next;
    state = finishRound(state, {
      outcome: 'win',
      mode: 'stage',
      stageIndex: 0,
      score: 1200,
      bestChain: 1,
      syrupCleared: 0,
      movesLeft: 9,
      movesTotal: 18,
      masteryHits: 0,
      modifier: null,
    }).next;
    expect(state.recipes).toEqual([0]);
  });

  test('losing discovers nothing', () => {
    const {next} = finishRound(initialProgress(), {
      outcome: 'spill',
      mode: 'stage',
      stageIndex: 3,
      score: 400,
      bestChain: 1,
      syrupCleared: 1,
      movesLeft: 6,
      movesTotal: 18,
      masteryHits: 0,
      modifier: null,
    });
    expect(next.recipes).toHaveLength(0);
  });
});
