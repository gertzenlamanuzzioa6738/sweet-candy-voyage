import {STAGES, gateCost, isStageUnlocked} from '../src/game/levels';
import {finishRound, initialProgress, totalStars} from '../src/game/progress';

type NodeState = 'done' | 'current' | 'locked';

/** the same rule the map uses to colour a node */
function stateFor(
  index: number,
  records: Record<number, {stars: number}>,
  stars: number,
): NodeState {
  if (records[index]) {
    return 'done';
  }
  return isStageUnlocked(index, stars) ? 'current' : 'locked';
}

describe('puzzle map navigation', () => {
  test('twelve nodes, one per stage', () => {
    expect(STAGES).toHaveLength(12);
  });

  test('a fresh map shows the first location open and the rest locked', () => {
    const start = initialProgress();
    const stars = totalStars(start);
    expect(stateFor(0, start.stageRecords, stars)).toBe('current');
    expect(stateFor(2, start.stageRecords, stars)).toBe('current');
    expect(stateFor(3, start.stageRecords, stars)).toBe('locked');
    expect(stateFor(11, start.stageRecords, stars)).toBe('locked');
  });

  test('a cleared stage turns into a done node', () => {
    const {next} = finishRound(initialProgress(), {
      outcome: 'win',
      mode: 'stage',
      stageIndex: 0,
      score: 1000,
      bestChain: 1,
      syrupCleared: 0,
      movesLeft: 10,
      movesTotal: 18,
      masteryHits: 0,
      modifier: null,
    });
    expect(stateFor(0, next.stageRecords, totalStars(next))).toBe('done');
  });

  test('a locked node names the star cost it is waiting for', () => {
    expect(gateCost(0)).toBe(0);
    expect(gateCost(4)).toBe(6);
    expect(gateCost(7)).toBe(14);
    expect(gateCost(10)).toBe(24);
  });

  test('enough stars open the next location', () => {
    const records = {0: {stars: 3}, 1: {stars: 3}};
    expect(stateFor(3, records, 5)).toBe('locked');
    expect(stateFor(3, records, 6)).toBe('current');
  });
});
