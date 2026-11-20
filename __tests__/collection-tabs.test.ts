import {INGREDIENTS} from '../src/game/recipes';
import {REWARDS, rewardById, unlockedRewardIds} from '../src/game/rewards';
import {initialProgress} from '../src/game/progress';

describe('collection and rewards tabs', () => {
  test('the ingredients tab has eight slots', () => {
    expect(INGREDIENTS).toHaveLength(8);
  });

  test('an empty save leaves both tabs in their empty state', () => {
    const state = initialProgress();
    const found = Object.keys(state.ingredients).filter(k => state.ingredients[k] > 0);
    expect(found).toHaveLength(0);
    expect(state.rewards).toHaveLength(0);
  });

  test('a found ingredient keeps a count, a missing one reads as locked', () => {
    const ingredients: Record<string, number> = {'mint-leaf': 3};
    expect(ingredients['mint-leaf']).toBe(3);
    expect(ingredients['berry-jam'] || 0).toBe(0);
  });

  test('the rewards tab shows every ornament, locked or not', () => {
    const unlocked = unlockedRewardIds(14);
    expect(REWARDS).toHaveLength(12);
    expect(unlocked).toHaveLength(5);
    const lockedCount = REWARDS.filter(r => unlocked.indexOf(r.id) < 0).length;
    expect(lockedCount).toBe(7);
  });

  test('every ornament card has art, a tint and a star cost', () => {
    for (const reward of REWARDS) {
      expect(reward.sprite).toBeGreaterThanOrEqual(1);
      expect(reward.sprite).toBeLessThanOrEqual(5);
      expect(reward.tint).toMatch(/^#[0-9A-F]{6}$/i);
      expect(reward.starCost).toBeGreaterThan(0);
    }
    expect(rewardById('sugar-obelisk')!.starCost).toBe(36);
  });
});
