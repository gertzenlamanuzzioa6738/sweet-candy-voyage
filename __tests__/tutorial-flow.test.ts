import {initialProgress, resetProgress} from '../src/game/progress';

describe('tutorial', () => {
  test('a fresh save has not seen the tutorial yet', () => {
    expect(initialProgress().tutorialSeen).toBe(false);
  });

  test('the flag flips once and stays flipped', () => {
    const seen = {...initialProgress(), tutorialSeen: true};
    expect(seen.tutorialSeen).toBe(true);
    expect(resetProgress(seen).tutorialSeen).toBe(true);
  });

  test('erasing progress keeps preferences but clears the garden', () => {
    const played = {
      ...initialProgress(),
      tutorialSeen: true,
      stageRecords: {0: {stars: 3, score: 100}},
      bestChain: 5,
      settings: {bigCandy: true, highContrast: true, swapGuide: false, motion: 'CALM' as const},
    };
    const fresh = resetProgress(played);
    expect(fresh.stageRecords).toEqual({});
    expect(fresh.bestChain).toBe(0);
    expect(fresh.settings.bigCandy).toBe(true);
    expect(fresh.settings.motion).toBe('CALM');
  });
});
