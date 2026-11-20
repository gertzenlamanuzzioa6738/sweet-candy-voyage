import {LOCATION_GATES} from '../src/constants/config';
import {
  LOCATIONS,
  STAGE_COUNT,
  gateCost,
  isStageUnlocked,
  locationIndex,
} from '../src/game/levels';
import {finishRound, initialProgress, totalStars} from '../src/game/progress';
import type {RoundResult} from '../src/game/progress';

function win(stageIndex: number, movesLeft: number, movesTotal: number): RoundResult {
  return {
    outcome: 'win',
    mode: 'stage',
    stageIndex,
    score: 1000,
    bestChain: 2,
    syrupCleared: 3,
    movesLeft,
    movesTotal,
    masteryHits: 0,
    modifier: null,
  };
}

describe('unlock new garden locations', () => {
  test('there are four locations of three stages each', () => {
    expect(LOCATIONS).toHaveLength(4);
    expect(STAGE_COUNT).toBe(12);
    expect(locationIndex(0)).toBe(0);
    expect(locationIndex(5)).toBe(1);
    expect(locationIndex(11)).toBe(3);
  });

  test('the first location is open from the start', () => {
    expect(isStageUnlocked(0, 0)).toBe(true);
    expect(isStageUnlocked(2, 0)).toBe(true);
  });

  test('later locations stay shut until their star gate is paid', () => {
    expect(isStageUnlocked(3, 5)).toBe(false);
    expect(isStageUnlocked(3, 6)).toBe(true);
    expect(isStageUnlocked(6, 13)).toBe(false);
    expect(isStageUnlocked(6, 14)).toBe(true);
    expect(isStageUnlocked(9, 23)).toBe(false);
    expect(isStageUnlocked(9, 24)).toBe(true);
    expect(gateCost(9)).toBe(LOCATION_GATES[3]);
  });

  test('winning a stage records it and points the player at the next one', () => {
    const start = initialProgress();
    const {next} = finishRound(start, win(0, 10, 18));
    expect(next.stageRecords[0].stars).toBe(3);
    expect(next.currentStage).toBe(1);
    expect(totalStars(next)).toBe(3);
  });

  test('a replay keeps the best star count', () => {
    let state = initialProgress();
    state = finishRound(state, win(0, 10, 18)).next;
    state = finishRound(state, win(0, 1, 18)).next;
    expect(state.stageRecords[0].stars).toBe(3);
  });

  test('losing a stage records nothing and does not advance', () => {
    const start = initialProgress();
    const {next, summary} = finishRound(start, {...win(0, 0, 18), outcome: 'moves'});
    expect(next.stageRecords[0]).toBeUndefined();
    expect(next.currentStage).toBe(0);
    expect(summary.stars).toBe(0);
  });
});
