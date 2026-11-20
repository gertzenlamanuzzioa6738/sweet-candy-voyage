import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {ReactNode} from 'react';
import {
  finishRound,
  initialProgress,
  resetProgress,
  totalStars,
  withSettings,
} from '../game/progress';
import type {ProgressState, RoundResult, Settings} from '../game/progress';
import {clearProgress, loadProgress, saveProgress} from '../game/storage';
import type {RoundSummary} from '../game/types';

type ProgressApi = {
  progress: ProgressState;
  stars: number;
  completeRound: (result: RoundResult) => RoundSummary;
  updateSettings: (patch: Partial<Settings>) => void;
  markTutorialSeen: () => void;
  setCurrentStage: (index: number) => void;
  eraseEverything: () => void;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({children}: {children: ReactNode}) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  // callbacks read the live value from a ref, never a stale closure
  const ref = useRef(progress);
  ref.current = progress;

  const commit = useCallback((next: ProgressState) => {
    ref.current = next;
    saveProgress(next);
    setProgress(next);
  }, []);

  const completeRound = useCallback(
    (result: RoundResult) => {
      const {next, summary} = finishRound(ref.current, result);
      commit(next);
      return summary;
    },
    [commit],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      commit(withSettings(ref.current, patch));
    },
    [commit],
  );

  const markTutorialSeen = useCallback(() => {
    if (ref.current.tutorialSeen) {
      return;
    }
    commit({...ref.current, tutorialSeen: true});
  }, [commit]);

  const setCurrentStage = useCallback(
    (index: number) => {
      commit({...ref.current, currentStage: index});
    },
    [commit],
  );

  const eraseEverything = useCallback(() => {
    clearProgress();
    const fresh = resetProgress(ref.current);
    commit(fresh);
  }, [commit]);

  const value = useMemo<ProgressApi>(
    () => ({
      progress,
      stars: totalStars(progress),
      completeRound,
      updateSettings,
      markTutorialSeen,
      setCurrentStage,
      eraseEverything,
    }),
    [
      progress,
      completeRound,
      updateSettings,
      markTutorialSeen,
      setCurrentStage,
      eraseEverything,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside <ProgressProvider>');
  }
  return ctx;
}

/** Pull one slice instead of the whole store when a screen only needs a number. */
export function useStars(): number {
  return useProgress().stars;
}

export function useSettings(): Settings {
  return useProgress().progress.settings;
}

export const EMPTY_PROGRESS = initialProgress();
