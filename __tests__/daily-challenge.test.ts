import {
  DAILY_MODIFIERS,
  dateKey,
  dateSeed,
  daysBetween,
  modifierForDate,
  nextStreak,
  playedToday,
  prettyDate,
} from '../src/game/daily';
import {finishRound, initialProgress} from '../src/game/progress';
import type {RoundResult} from '../src/game/progress';

const dailyRun: RoundResult = {
  outcome: 'time',
  mode: 'daily',
  stageIndex: 3,
  score: 6140,
  bestChain: 3,
  syrupCleared: 5,
  movesLeft: 0,
  movesTotal: 0,
  masteryHits: 0,
  modifier: 'SYRUP FLOOD',
};

describe('optional time challenge', () => {
  test('four modifiers, each with its own rule', () => {
    expect(DAILY_MODIFIERS).toHaveLength(4);
    expect(new Set(DAILY_MODIFIERS.map(m => m.id)).size).toBe(4);
    expect(DAILY_MODIFIERS.find(m => m.id === 'tight-pot')!.maxDrips).toBe(3);
    expect(DAILY_MODIFIERS.find(m => m.id === 'sugar-rush')!.splashPerLink).toBe(2);
    expect(DAILY_MODIFIERS.find(m => m.id === 'syrup-flood')!.syrupMultiplier).toBe(2);
  });

  test('the modifier of a day is picked by the date seed and never drifts', () => {
    const key = '2026-11-20';
    expect(modifierForDate(key).id).toBe(modifierForDate(key).id);
    expect(dateSeed(key)).toBe(dateSeed(key));
    expect(dateSeed('2026-11-21')).not.toBe(dateSeed(key));
  });

  test('the date key and the printed date come from the same day', () => {
    const d = new Date(2026, 10, 20);
    expect(dateKey(d)).toBe('2026-11-20');
    expect(prettyDate(d)).toBe('20 NOVEMBER');
  });

  test('the streak grows on consecutive days and resets after a gap', () => {
    expect(daysBetween('2026-11-20', '2026-11-21')).toBe(1);
    expect(nextStreak(null, '2026-11-20', 0)).toBe(1);
    expect(nextStreak('2026-11-19', '2026-11-20', 4)).toBe(5);
    expect(nextStreak('2026-11-17', '2026-11-20', 4)).toBe(1);
    expect(nextStreak('2026-11-20', '2026-11-20', 4)).toBe(4);
  });

  test('one attempt per calendar day', () => {
    expect(playedToday(null, '2026-11-20')).toBe(false);
    expect(playedToday('2026-11-20', '2026-11-20')).toBe(true);
    expect(playedToday('2026-11-19', '2026-11-20')).toBe(false);
  });

  test('a daily run stores its score and streak without touching stage records', () => {
    const start = initialProgress();
    const {next, summary} = finishRound(start, dailyRun);
    expect(next.daily.bestScore).toBe(6140);
    expect(next.daily.streak).toBe(1);
    expect(next.daily.lastPlayedKey).toBe(dateKey());
    expect(next.daily.lastSummary).not.toBeNull();
    expect(Object.keys(next.stageRecords)).toHaveLength(0);
    expect(summary.recipe).toBe('DAILY CHALLENGE');
    expect(summary.modifier).toBe('SYRUP FLOOD');
  });
});
