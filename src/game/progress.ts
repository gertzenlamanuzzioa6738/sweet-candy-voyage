import {STAGE_COUNT, starsFor, starsForScore, stageAt} from './levels';
import {masteryIngredient} from './recipes';
import {newlyUnlocked, unlockedRewardIds} from './rewards';
import {dateKey, nextStreak} from './daily';
import type {GameMode, Outcome, RoundSummary} from './types';

export type MotionMode = 'FULL' | 'CALM';

export type Settings = {
  bigCandy: boolean;
  highContrast: boolean;
  swapGuide: boolean;
  motion: MotionMode;
};

export type StageRecord = {stars: number; score: number};

export type DailyState = {
  lastPlayedKey: string | null;
  streak: number;
  bestScore: number;
  bestStars: number;
  lastSummary: RoundSummary | null;
};

export type ProgressState = {
  stageRecords: Record<number, StageRecord>;
  recipes: number[];
  ingredients: Record<string, number>;
  rewards: string[];
  daily: DailyState;
  settings: Settings;
  tutorialSeen: boolean;
  bestChain: number;
  /** the stage the PLAY tile starts */
  currentStage: number;
};

export const DEFAULT_SETTINGS: Settings = {
  bigCandy: false,
  highContrast: false,
  swapGuide: true,
  motion: 'FULL',
};

export function initialProgress(): ProgressState {
  return {
    stageRecords: {},
    recipes: [],
    ingredients: {},
    rewards: [],
    daily: {lastPlayedKey: null, streak: 0, bestScore: 0, bestStars: 0, lastSummary: null},
    settings: {...DEFAULT_SETTINGS},
    tutorialSeen: false,
    bestChain: 0,
    currentStage: 0,
  };
}

export function totalStars(state: ProgressState): number {
  return Object.keys(state.stageRecords).reduce(
    (sum, key) => sum + state.stageRecords[Number(key)].stars,
    0,
  );
}

export function clearedStages(state: ProgressState): number {
  return Object.keys(state.stageRecords).length;
}

/** Raw numbers the game screen hands over when a round ends. */
export type RoundResult = {
  outcome: Outcome;
  mode: GameMode;
  stageIndex: number;
  score: number;
  bestChain: number;
  syrupCleared: number;
  movesLeft: number;
  movesTotal: number;
  masteryHits: number;
  modifier: string | null;
};

export type FinishedRound = {next: ProgressState; summary: RoundSummary};

/**
 * The single place a round changes the save: stars, records, recipes, ingredients,
 * ornaments, streak and the next stage all move here and nowhere else.
 */
export function finishRound(state: ProgressState, result: RoundResult): FinishedRound {
  const stage = stageAt(result.stageIndex);
  const won = result.outcome === 'win';
  const starsBefore = totalStars(state);

  const next: ProgressState = {
    ...state,
    stageRecords: {...state.stageRecords},
    recipes: state.recipes.slice(),
    ingredients: {...state.ingredients},
    rewards: state.rewards.slice(),
    daily: {...state.daily},
  };

  let stars = 0;
  if (result.mode === 'daily') {
    stars = starsForScore(result.score);
    const todayKey = dateKey();
    next.daily.streak = nextStreak(state.daily.lastPlayedKey, todayKey, state.daily.streak);
    next.daily.lastPlayedKey = todayKey;
    next.daily.bestScore = Math.max(state.daily.bestScore, result.score);
    next.daily.bestStars = Math.max(state.daily.bestStars, stars);
  } else if (won) {
    stars = starsFor(result.movesLeft, result.movesTotal);
    const previous = state.stageRecords[result.stageIndex];
    next.stageRecords[result.stageIndex] = {
      stars: Math.max(stars, previous ? previous.stars : 0),
      score: Math.max(result.score, previous ? previous.score : 0),
    };
    if (next.recipes.indexOf(result.stageIndex) < 0) {
      next.recipes.push(result.stageIndex);
    }
    next.currentStage = Math.min(STAGE_COUNT - 1, Math.max(state.currentStage, result.stageIndex + 1));
  }

  let newIngredient: string | null = null;
  if (result.masteryHits > 0) {
    const ing = masteryIngredient(result.stageIndex);
    const had = next.ingredients[ing.id] || 0;
    next.ingredients[ing.id] = had + result.masteryHits;
    if (had === 0) {
      newIngredient = ing.name;
    }
  }

  next.bestChain = Math.max(state.bestChain, result.bestChain);

  const starsAfter = totalStars(next);
  const unlocked = newlyUnlocked(starsBefore, starsAfter);
  next.rewards = unlockedRewardIds(starsAfter);

  const summary: RoundSummary = {
    outcome: result.outcome,
    mode: result.mode,
    stageIndex: result.stageIndex,
    recipe: result.mode === 'daily' ? 'DAILY CHALLENGE' : stage.recipe,
    location: result.mode === 'daily' ? 'CANDY CURRENT' : stage.location,
    score: result.score,
    stars,
    bestChain: result.bestChain,
    syrupCleared: result.syrupCleared,
    movesLeft: result.movesLeft,
    movesTotal: result.movesTotal,
    newIngredient,
    newRewards: unlocked.map(r => r.name),
    modifier: result.modifier,
  };

  if (result.mode === 'daily') {
    next.daily.lastSummary = summary;
  }

  return {next, summary};
}

export function withSettings(state: ProgressState, patch: Partial<Settings>): ProgressState {
  return {...state, settings: {...state.settings, ...patch}};
}

export function resetProgress(state: ProgressState): ProgressState {
  const fresh = initialProgress();
  // settings and the tutorial flag are preferences, not progress
  fresh.settings = {...state.settings};
  fresh.tutorialSeen = state.tutorialSeen;
  return fresh;
}

export function serialize(state: ProgressState): string {
  return JSON.stringify(state);
}

export function hydrate(raw: string | null): ProgressState {
  if (!raw) {
    return initialProgress();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const base = initialProgress();
    return {
      ...base,
      ...parsed,
      settings: {...base.settings, ...(parsed.settings || {})},
      daily: {...base.daily, ...(parsed.daily || {})},
      stageRecords: parsed.stageRecords || {},
      ingredients: parsed.ingredients || {},
      recipes: parsed.recipes || [],
      rewards: parsed.rewards || [],
    };
  } catch (e) {
    return initialProgress();
  }
}
