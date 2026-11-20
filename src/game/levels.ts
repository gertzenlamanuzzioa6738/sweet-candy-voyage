import {LOCATION_GATES, STAR2_RATIO, STAR3_RATIO} from '../constants/config';
import type {CandyType, Objective, ObjectiveState, StageDef} from './types';

export const CANDY_NAMES = [
  'STRAWBERRY DROP',
  'LEMON SLICE',
  'MINT SWIRL',
  'BERRY HEART',
  'GRAPE GEM',
] as const;

export const LOCATIONS = [
  'SUGAR MEADOW',
  'SYRUP GROVE',
  'BERRY HOLLOW',
  'FROSTING PEAK',
] as const;

const MOVE_BUDGETS = [18, 18, 20, 18, 16, 20, 18, 16, 22, 18, 16, 20];

const RECIPE_NAMES = [
  'STRAWBERRY DRIZZLE',
  'LEMON SUNBURST',
  'MINT RIBBON ROLL',
  'BERRY SWIRL TART',
  'GRAPE GLAZE CUP',
  'CARAMEL TANGLE',
  'SUGARED BLOSSOM',
  'TWIN SYRUP LOAF',
  'HOLLOW BERRY PIE',
  'FROSTED LANTERN',
  'PEAK SUGAR CROWN',
  'CANDY CURRENT CAKE',
];

const KEY_CANDIES: CandyType[] = [0, 1, 2, 3, 4, 2, 0, 3, 3, 1, 4, 0];

const CANDY_TARGETS: Array<Array<[CandyType, number]>> = [
  [[0, 10]],
  [[1, 12], [2, 8]],
  [[2, 14]],
  [[3, 14], [0, 10]],
  [[4, 12], [0, 10]],
  [[2, 16], [1, 12]],
  [[0, 18], [4, 12]],
  [[3, 18], [2, 12]],
  [[3, 20], [1, 14]],
  [[1, 20], [4, 16]],
  [[4, 22], [0, 16]],
  [[0, 24], [3, 18]],
];

const SYRUP_TARGETS = [0, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];

export const STAGES: StageDef[] = MOVE_BUDGETS.map((moves, i) => {
  const objectives: Objective[] = CANDY_TARGETS[i].map(([candy, total]) => ({
    kind: 'candy',
    candy,
    total,
  }));
  if (SYRUP_TARGETS[i] > 0) {
    objectives.push({kind: 'syrup', total: SYRUP_TARGETS[i]});
  }
  return {
    index: i,
    location: LOCATIONS[Math.floor(i / 3)],
    recipe: RECIPE_NAMES[i],
    moves,
    objectives,
    syrupTiles: 4 + i,
    thickSyrup: i >= 5,
    keyCandy: KEY_CANDIES[i],
  };
});

export const STAGE_COUNT = STAGES.length;

export function stageAt(index: number): StageDef {
  const clamped = Math.max(0, Math.min(STAGE_COUNT - 1, index));
  return STAGES[clamped];
}

export function locationIndex(stageIndex: number): number {
  return Math.floor(stageIndex / 3);
}

/** A stage is open once the star gate of its location is paid. */
export function isStageUnlocked(stageIndex: number, stars: number): boolean {
  return stars >= LOCATION_GATES[locationIndex(stageIndex)];
}

export function gateCost(stageIndex: number): number {
  return LOCATION_GATES[locationIndex(stageIndex)];
}

export function objectiveLabel(objective: Objective): string {
  if (objective.kind === 'syrup') {
    return 'WASH SYRUP';
  }
  return CANDY_NAMES[objective.candy];
}

export function initialObjectives(stage: StageDef, scale: number = 1): ObjectiveState[] {
  return stage.objectives.map(objective => ({
    objective:
      scale === 1
        ? objective
        : {...objective, total: Math.max(3, Math.round(objective.total * scale))},
    done: 0,
  }));
}

export function objectivesComplete(states: ObjectiveState[]): boolean {
  return states.every(s => s.done >= s.objective.total);
}

/** Moves left over moves total decides the stars. */
export function starsFor(movesLeft: number, movesTotal: number): number {
  if (movesTotal <= 0) {
    return 1;
  }
  const ratio = movesLeft / movesTotal;
  if (ratio >= STAR3_RATIO) {
    return 3;
  }
  if (ratio >= STAR2_RATIO) {
    return 2;
  }
  return 1;
}

/** Daily runs have no move limit, so their stars come from the score instead. */
export function starsForScore(score: number): number {
  if (score >= 9000) {
    return 3;
  }
  if (score >= 4500) {
    return 2;
  }
  return score > 0 ? 1 : 0;
}
