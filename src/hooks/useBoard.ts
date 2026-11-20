import {useCallback, useEffect, useMemo, useReducer, useRef} from 'react';
import {
  BIG_CANDY_COLS,
  BIG_CANDY_ROWS,
  CANDY_TYPES,
  GRID_COLS,
  GRID_ROWS,
  MAX_DRIPS,
  SCORE_PER_CANDY,
  SPLASH_MAX,
  T_CLEAR,
} from '../constants/config';
import {generateBoard, isDeadlocked, reshuffle} from '../game/board';
import {applyStep, grantsRefund, nextStep} from '../game/cascade';
import type {CascadeStep} from '../game/cascade';
import {isAdjacent, isMovable, neighboursOf, swapCreatesMatch, swapped} from '../game/matcher';
import {initialObjectives, objectivesComplete, stageAt} from '../game/levels';
import {makeRng} from '../game/rng';
import {splash} from '../game/syrup';
import type {DailyModifier} from '../game/daily';
import type {Settings} from '../game/progress';
import type {
  Board,
  CandyType,
  GameMode,
  ObjectiveState,
  Outcome,
  Rng,
} from '../game/types';

export type BoardPhase = 'idle' | 'clearing' | 'ended';

export type RoundSetup = {
  mode: GameMode;
  stageIndex: number;
  settings: Settings;
  modifier: DailyModifier | null;
  attempt: number;
};

export type BoardState = {
  board: Board;
  rows: number;
  cols: number;
  selected: number | null;
  legal: number[];
  phase: BoardPhase;
  clearing: number[];
  movesLeft: number;
  movesTotal: number;
  score: number;
  drips: number;
  maxDrips: number;
  splash: number;
  chain: number;
  bestChain: number;
  syrupCleared: number;
  objectives: ObjectiveState[];
  refunds: number;
  masteryHits: number;
  outcome: Outcome | null;
  spoiledTick: number;
  bannerLink: number;
  bannerTick: number;
  toast: string | null;
  toastTick: number;
  pending: CascadeStep | null;
  seed: number;
  keyCandy: CandyType;
  mode: GameMode;
  stageIndex: number;
  doubleCandy: CandyType | null;
  splashPerLink: number;
};

type Action =
  | {type: 'replace'; state: BoardState}
  | {type: 'tap'; index: number; rng: Rng}
  | {type: 'settle'; rng: Rng}
  | {type: 'splash'; rng: Rng}
  | {type: 'toast'; text: string}
  | {type: 'clearToast'}
  | {type: 'timeUp'};

function geometry(settings: Settings) {
  return settings.bigCandy
    ? {rows: BIG_CANDY_ROWS, cols: BIG_CANDY_COLS}
    : {rows: GRID_ROWS, cols: GRID_COLS};
}

export function buildState(setup: RoundSetup): BoardState {
  const stage = stageAt(setup.stageIndex);
  const {rows, cols} = geometry(setup.settings);
  const syrupMultiplier = setup.modifier ? setup.modifier.syrupMultiplier : 1;
  const maxSyrup = Math.floor(rows * cols * 0.3);
  const spec = {
    rows,
    cols,
    types: CANDY_TYPES,
    syrupTiles: Math.min(maxSyrup, stage.syrupTiles * syrupMultiplier),
    thickSyrup: stage.thickSyrup,
  };
  const generated = generateBoard(spec, setup.stageIndex, setup.attempt);
  const scale = setup.settings.bigCandy ? 0.8 : 1;
  const daily = setup.mode === 'daily';
  return {
    board: generated.board,
    rows,
    cols,
    selected: null,
    legal: [],
    phase: 'idle',
    clearing: [],
    movesLeft: daily ? 0 : stage.moves,
    movesTotal: daily ? 0 : stage.moves,
    score: 0,
    drips: 0,
    maxDrips: setup.modifier ? setup.modifier.maxDrips : MAX_DRIPS,
    splash: 0,
    chain: 0,
    bestChain: 0,
    syrupCleared: 0,
    objectives: initialObjectives(stage, scale),
    refunds: 0,
    masteryHits: 0,
    outcome: null,
    spoiledTick: 0,
    bannerLink: 0,
    bannerTick: 0,
    toast: null,
    toastTick: 0,
    pending: null,
    seed: generated.seed,
    keyCandy: stage.keyCandy,
    mode: setup.mode,
    stageIndex: setup.stageIndex,
    doubleCandy: setup.modifier ? setup.modifier.doubleCandy : null,
    splashPerLink: setup.modifier ? setup.modifier.splashPerLink : 1,
  };
}

function applyCollected(
  objectives: ObjectiveState[],
  collected: Record<number, number>,
  syrupWashed: number,
): ObjectiveState[] {
  return objectives.map(o => {
    const gain =
      o.objective.kind === 'syrup' ? syrupWashed : collected[o.objective.candy] || 0;
    if (gain <= 0) {
      return o;
    }
    return {...o, done: Math.min(o.objective.total, o.done + gain)};
  });
}

/** Win first, then the pot, then the move budget. The round never dead-ends. */
function finalize(state: BoardState): BoardState {
  if (objectivesComplete(state.objectives)) {
    return {...state, phase: 'ended', outcome: 'win', selected: null, legal: []};
  }
  if (state.drips >= state.maxDrips) {
    return {...state, phase: 'ended', outcome: 'spill', selected: null, legal: []};
  }
  if (state.mode === 'stage' && state.movesLeft <= 0) {
    return {...state, phase: 'ended', outcome: 'moves', selected: null, legal: []};
  }
  return state;
}

/** Books one cascade link: counters move immediately so the HUD reacts on the same frame. */
function startStep(state: BoardState, step: CascadeStep, link: number): BoardState {
  let bonus = 0;
  if (state.doubleCandy !== null) {
    const extra = step.collected[state.doubleCandy] || 0;
    bonus = Math.round(extra * SCORE_PER_CANDY * step.multiplier);
  }
  const refundNow = state.mode === 'stage' && grantsRefund(link, state.refunds);

  return {
    ...state,
    phase: 'clearing',
    clearing: step.matched,
    pending: step,
    chain: link,
    bestChain: Math.max(state.bestChain, link),
    score: state.score + step.score + bonus,
    syrupCleared: state.syrupCleared + step.syrupCleared,
    objectives: applyCollected(state.objectives, step.collected, step.syrupCleared),
    splash: Math.min(SPLASH_MAX, state.splash + state.splashPerLink + (step.mastery ? 1 : 0)),
    masteryHits: state.masteryHits + (step.mastery ? 1 : 0),
    refunds: state.refunds + (refundNow ? 1 : 0),
    movesLeft: state.movesLeft + (refundNow ? 1 : 0),
    bannerLink: link >= 2 ? link : 0,
    bannerTick: link >= 2 ? state.bannerTick + 1 : state.bannerTick,
    selected: null,
    legal: [],
  };
}

/** No legal swap left: swirl the free candies back into a playable layout, free of charge. */
function unstick(state: BoardState, rng: Rng): BoardState {
  if (!isDeadlocked(state.board, state.rows, state.cols)) {
    return state;
  }
  return {
    ...state,
    board: reshuffle(state.board, state.rows, state.cols, rng),
    toast: 'NO SWAPS LEFT · BOARD RESHUFFLED',
    toastTick: state.toastTick + 1,
  };
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'replace':
      return action.state;

    case 'toast':
      return {...state, toast: action.text, toastTick: state.toastTick + 1};

    case 'clearToast':
      return {...state, toast: null};

    case 'timeUp':
      if (state.phase === 'ended') {
        return state;
      }
      return {...state, phase: 'ended', outcome: 'time', selected: null, legal: []};

    case 'tap': {
      if (state.phase !== 'idle') {
        return state;
      }
      const i = action.index;
      const tile = state.board[i];
      if (!tile) {
        return state;
      }

      if (state.selected === null) {
        if (tile.syrup > 0) {
          return {
            ...state,
            toast: 'SYRUP IS STUCK · MATCH ON IT TO WASH IT OFF',
            toastTick: state.toastTick + 1,
          };
        }
        return {
          ...state,
          selected: i,
          legal: neighboursOf(i, state.rows, state.cols).filter(n =>
            isMovable(state.board, n),
          ),
        };
      }

      if (state.selected === i) {
        return {...state, selected: null, legal: []};
      }

      const from = state.selected;
      const spendsMove = state.mode === 'stage' ? 1 : 0;

      if (
        isAdjacent(from, i, state.cols) &&
        swapCreatesMatch(state.board, from, i, state.rows, state.cols)
      ) {
        const board = swapped(state.board, from, i);
        const moved: BoardState = {
          ...state,
          board,
          selected: null,
          legal: [],
          movesLeft: state.movesLeft - spendsMove,
          drips: 0,
        };
        const step = nextStep(board, state.rows, state.cols, 1, state.keyCandy);
        if (!step) {
          return finalize({...moved, phase: 'idle', chain: 0});
        }
        return startStep(moved, step, 1);
      }

      // spoiled swap: the candies snap back and the pot takes a drip
      return finalize({
        ...state,
        selected: null,
        legal: [],
        movesLeft: state.movesLeft - spendsMove,
        drips: state.drips + 1,
        chain: 0,
        spoiledTick: state.spoiledTick + 1,
      });
    }

    case 'settle': {
      if (state.phase !== 'clearing' || !state.pending) {
        return state;
      }
      const board = applyStep(
        state.board,
        state.pending,
        state.rows,
        state.cols,
        action.rng,
        CANDY_TYPES,
      );
      const link = state.chain + 1;
      const step = nextStep(board, state.rows, state.cols, link, state.keyCandy);
      if (step) {
        return startStep({...state, board, clearing: []}, step, link);
      }
      const settled: BoardState = {
        ...state,
        board,
        clearing: [],
        pending: null,
        phase: 'idle',
      };
      const ended = finalize(settled);
      if (ended.phase === 'ended') {
        return ended;
      }
      return unstick(ended, action.rng);
    }

    case 'splash': {
      if (state.phase !== 'idle') {
        return state;
      }
      if (state.splash < SPLASH_MAX) {
        return {
          ...state,
          toast: 'MAKE A CHAIN TO CHARGE',
          toastTick: state.toastTick + 1,
        };
      }
      const result = splash(state.board, state.rows, state.cols);
      if (result.cleared === 0) {
        return {
          ...state,
          toast: 'NO SYRUP LEFT TO SPLASH',
          toastTick: state.toastTick + 1,
        };
      }
      const washed: BoardState = {
        ...state,
        board: result.board,
        splash: 0,
        selected: null,
        legal: [],
        syrupCleared: state.syrupCleared + result.cleared,
        objectives: applyCollected(state.objectives, {}, result.cleared),
        toast: `SPLASH! ${result.cleared} SYRUP WASHED`,
        toastTick: state.toastTick + 1,
      };
      const step = nextStep(result.board, state.rows, state.cols, 1, state.keyCandy);
      if (step) {
        return startStep(washed, step, 1);
      }
      const ended = finalize(washed);
      if (ended.phase === 'ended') {
        return ended;
      }
      return unstick(ended, action.rng);
    }

    default:
      return state;
  }
}

export type BoardApi = {
  state: BoardState;
  tap: (index: number) => void;
  useSplash: () => void;
  timeUp: () => void;
  dismissToast: () => void;
  restart: (setup: RoundSetup) => void;
};

export function useBoard(setup: RoundSetup, onEnd: (state: BoardState) => void): BoardApi {
  const [state, dispatch] = useReducer(reduce, setup, buildState);

  // one refill stream per round, seeded from the same number as the layout
  const rngRef = useRef<Rng>(makeRng(state.seed));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endedRef = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calm = setup.settings.motion === 'CALM';
  const clearMs = calm ? Math.round(T_CLEAR * 0.4) : T_CLEAR;

  // drives the cascade: one link per tick, always cancelled on unmount
  useEffect(() => {
    if (state.phase !== 'clearing') {
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      dispatch({type: 'settle', rng: rngRef.current});
    }, clearMs);
    return clearTimer;
  }, [state.phase, state.chain, clearMs, clearTimer]);

  useEffect(() => {
    if (state.phase === 'ended' && state.outcome && !endedRef.current) {
      endedRef.current = true;
      onEndRef.current(state);
    }
  }, [state]);

  useEffect(() => clearTimer, [clearTimer]);

  const tap = useCallback((index: number) => {
    dispatch({type: 'tap', index, rng: rngRef.current});
  }, []);

  const useSplashNow = useCallback(() => {
    dispatch({type: 'splash', rng: rngRef.current});
  }, []);

  const timeUp = useCallback(() => {
    dispatch({type: 'timeUp'});
  }, []);

  const dismissToast = useCallback(() => {
    dispatch({type: 'clearToast'});
  }, []);

  const restart = useCallback(
    (nextSetup: RoundSetup) => {
      clearTimer();
      endedRef.current = false;
      const fresh = buildState(nextSetup);
      rngRef.current = makeRng(fresh.seed);
      dispatch({type: 'replace', state: fresh});
    },
    [clearTimer],
  );

  return useMemo(
    () => ({state, tap, useSplash: useSplashNow, timeUp, dismissToast, restart}),
    [state, tap, useSplashNow, timeUp, dismissToast, restart],
  );
}
