import {INGREDIENTS, RECIPES, ingredientById, masteryIngredient} from '../src/game/recipes';
import {finishRound, initialProgress} from '../src/game/progress';
import type {RoundResult} from '../src/game/progress';

function mastery(stageIndex: number, hits: number): RoundResult {
  return {
    outcome: 'win',
    mode: 'stage',
    stageIndex,
    score: 2000,
    bestChain: 3,
    syrupCleared: 4,
    movesLeft: 8,
    movesTotal: 18,
    masteryHits: hits,
    modifier: null,
  };
}

describe('collectible ingredients', () => {
  test('eight rare ingredients, each with its own id, tint and shape', () => {
    expect(INGREDIENTS).toHaveLength(8);
    const ids = INGREDIENTS.map(i => i.id);
    const shapes = INGREDIENTS.map(i => i.shape);
    expect(new Set(ids).size).toBe(8);
    expect(new Set(shapes).size).toBe(8);
    expect(ingredientById('mint-leaf')!.name).toBe('MINT LEAF');
    expect(ingredientById('nope')).toBeUndefined();
  });

  test('each stage maps to one mastery ingredient, deterministically', () => {
    expect(masteryIngredient(0).id).toBe(masteryIngredient(0).id);
    expect(masteryIngredient(0).id).toBe(masteryIngredient(8).id);
    expect(masteryIngredient(1).id).not.toBe(masteryIngredient(0).id);
  });

  test('a mastery clear drops the ingredient into the collection', () => {
    const start = initialProgress();
    const {next, summary} = finishRound(start, mastery(2, 1));
    const id = masteryIngredient(2).id;
    expect(next.ingredients[id]).toBe(1);
    expect(summary.newIngredient).toBe(masteryIngredient(2).name);
  });

  test('further drops raise the count but are no longer new', () => {
    let state = initialProgress();
    state = finishRound(state, mastery(2, 1)).next;
    const again = finishRound(state, mastery(2, 2));
    const id = masteryIngredient(2).id;
    expect(again.next.ingredients[id]).toBe(3);
    expect(again.summary.newIngredient).toBeNull();
  });

  test('every recipe lists three ingredient chips', () => {
    for (const recipe of RECIPES) {
      expect(recipe.ingredients).toHaveLength(3);
    }
  });
});
