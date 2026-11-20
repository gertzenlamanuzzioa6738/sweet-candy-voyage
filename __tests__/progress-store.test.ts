import {
  DEFAULT_SETTINGS,
  clearedStages,
  finishRound,
  hydrate,
  initialProgress,
  resetProgress,
  serialize,
  totalStars,
  withSettings,
} from '../src/game/progress';
import {clearProgress, loadProgress, saveProgress} from '../src/game/storage';

describe('local-only progression', () => {
  test('a fresh save is empty and offline by construction', () => {
    const state = initialProgress();
    expect(totalStars(state)).toBe(0);
    expect(clearedStages(state)).toBe(0);
    expect(state.recipes).toHaveLength(0);
    expect(state.rewards).toHaveLength(0);
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
  });

  test('a save survives a serialize and hydrate round trip', () => {
    let state = initialProgress();
    state = finishRound(state, {
      outcome: 'win',
      mode: 'stage',
      stageIndex: 0,
      score: 3200,
      bestChain: 4,
      syrupCleared: 6,
      movesLeft: 9,
      movesTotal: 18,
      masteryHits: 1,
      modifier: null,
    }).next;

    const back = hydrate(serialize(state));
    expect(totalStars(back)).toBe(totalStars(state));
    expect(back.recipes).toEqual(state.recipes);
    expect(back.ingredients).toEqual(state.ingredients);
    expect(back.bestChain).toBe(4);
  });

  test('a missing or broken save falls back to a fresh one instead of crashing', () => {
    expect(hydrate(null).currentStage).toBe(0);
    expect(hydrate('{not json').currentStage).toBe(0);
    expect(hydrate('{}').settings).toEqual(DEFAULT_SETTINGS);
  });

  test('the storage adapter is the single write point', () => {
    clearProgress();
    expect(totalStars(loadProgress())).toBe(0);
    const state = withSettings(initialProgress(), {motion: 'CALM'});
    saveProgress(state);
    expect(loadProgress().settings.motion).toBe('CALM');
    clearProgress();
    expect(loadProgress().settings.motion).toBe('FULL');
  });

  test('RESET PROGRESS puts everything back to the start', () => {
    let state = initialProgress();
    state = finishRound(state, {
      outcome: 'win',
      mode: 'stage',
      stageIndex: 1,
      score: 5000,
      bestChain: 6,
      syrupCleared: 8,
      movesLeft: 12,
      movesTotal: 18,
      masteryHits: 2,
      modifier: null,
    }).next;
    expect(totalStars(state)).toBeGreaterThan(0);

    const fresh = resetProgress(state);
    expect(totalStars(fresh)).toBe(0);
    expect(fresh.recipes).toHaveLength(0);
    expect(fresh.ingredients).toEqual({});
    expect(fresh.rewards).toHaveLength(0);
    expect(fresh.daily.streak).toBe(0);
    expect(fresh.currentStage).toBe(0);
  });
});
