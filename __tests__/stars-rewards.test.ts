import {TOTAL_STARS} from '../src/constants/config';
import {starsFor, starsForScore} from '../src/game/levels';
import {REWARDS, newlyUnlocked, unlockedRewardIds} from '../src/game/rewards';
import {finishRound, initialProgress} from '../src/game/progress';

describe('virtual stars and decorative rewards', () => {
  test('stars come from the moves left over', () => {
    expect(starsFor(18, 18)).toBe(3);
    expect(starsFor(7, 20)).toBe(3);
    expect(starsFor(4, 20)).toBe(2);
    expect(starsFor(1, 20)).toBe(1);
    expect(starsFor(0, 20)).toBe(1);
  });

  test('a daily run is scored instead', () => {
    expect(starsForScore(0)).toBe(0);
    expect(starsForScore(1200)).toBe(1);
    expect(starsForScore(5000)).toBe(2);
    expect(starsForScore(12000)).toBe(3);
  });

  test('twelve ornaments climb to the full star total', () => {
    expect(REWARDS).toHaveLength(12);
    expect(REWARDS[REWARDS.length - 1].starCost).toBe(TOTAL_STARS);
    for (let i = 1; i < REWARDS.length; i++) {
      expect(REWARDS[i].starCost).toBeGreaterThan(REWARDS[i - 1].starCost);
    }
  });

  test('ornaments unlock only at their milestone, and nothing costs money', () => {
    expect(unlockedRewardIds(0)).toHaveLength(0);
    expect(unlockedRewardIds(2)).toEqual(['sugar-lantern']);
    expect(unlockedRewardIds(14)).toHaveLength(5);
    expect(newlyUnlocked(4, 8).map(r => r.id)).toEqual(['candy-arch', 'mint-fountain']);
  });

  test('a winning round reports the ornaments it just opened', () => {
    const start = initialProgress();
    const {next, summary} = finishRound(start, {
      outcome: 'win',
      mode: 'stage',
      stageIndex: 0,
      score: 4820,
      bestChain: 4,
      syrupCleared: 9,
      movesLeft: 10,
      movesTotal: 18,
      masteryHits: 0,
      modifier: null,
    });
    expect(summary.stars).toBe(3);
    expect(summary.newRewards).toContain('SUGAR LANTERN');
    expect(next.rewards).toContain('sugar-lantern');
  });
});
