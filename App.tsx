/**
 * SweetCandyVoyage — Candy Current, a match-3 garden puzzle.
 *
 * The whole navigation model lives here: one Screen union, one owner, a small back stack
 * and a cross-fade. No navigation library, no deep links, no network.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, BackHandler, StatusBar, StyleSheet, View} from 'react-native';

import {LOADER_DURATION_MS} from './src/constants/config';
import {colors} from './src/constants/theme';
import {ProgressProvider, useProgress} from './src/hooks/useProgress';
import {ROOT_SCREEN} from './src/navigation';
import type {ScreenName} from './src/navigation';

import {LoaderScreen} from './src/screens/LoaderScreen';
import {MenuScreen} from './src/screens/MenuScreen';
import {TutorialScreen} from './src/screens/TutorialScreen';
import {MapScreen} from './src/screens/MapScreen';
import {GameScreen} from './src/screens/GameScreen';
import {ResultScreen} from './src/screens/ResultScreen';
import {RecipeBookScreen} from './src/screens/RecipeBookScreen';
import {CollectionScreen} from './src/screens/CollectionScreen';
import {DailyChallengeScreen} from './src/screens/DailyChallengeScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';

import {STAGE_COUNT} from './src/game/levels';
import {dateKey, dateSeed, modifierForDate, playedToday} from './src/game/daily';
import type {DailyModifier} from './src/game/daily';
import type {RoundResult} from './src/game/progress';
import type {GameMode, RoundSummary} from './src/game/types';

type Round = {
  mode: GameMode;
  stageIndex: number;
  attempt: number;
  modifier: DailyModifier | null;
};

const DARK_SCREENS: ScreenName[] = ['loader', 'result'];

function Root() {
  const {
    progress,
    stars,
    completeRound,
    updateSettings,
    markTutorialSeen,
    setCurrentStage,
    eraseEverything,
  } = useProgress();

  const [screen, setScreen] = useState<ScreenName>('loader');
  const [round, setRound] = useState<Round>({
    mode: 'stage',
    stageIndex: 0,
    attempt: 1,
    modifier: null,
  });
  const [summary, setSummary] = useState<RoundSummary | null>(null);

  const stackRef = useRef<ScreenName[]>([]);
  const screenRef = useRef<ScreenName>(screen);
  screenRef.current = screen;
  const navLock = useRef(false);
  const fade = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(0)).current;

  const swapTo = useCallback(
    (next: ScreenName) => {
      if (navLock.current) {
        return;
      }
      navLock.current = true;
      Animated.timing(fade, {toValue: 0, duration: 120, useNativeDriver: true}).start(() => {
        setScreen(next);
        rise.setValue(12);
        Animated.parallel([
          Animated.timing(fade, {toValue: 1, duration: 220, useNativeDriver: true}),
          Animated.spring(rise, {
            toValue: 0,
            useNativeDriver: true,
            tension: 140,
            friction: 14,
          }),
        ]).start(() => {
          navLock.current = false;
        });
      });
    },
    [fade, rise],
  );

  /** push: remember where we came from so system Back can return there */
  const push = useCallback(
    (next: ScreenName) => {
      const current = screenRef.current;
      if (current !== 'loader' && current !== next) {
        stackRef.current = stackRef.current.concat(current);
      }
      swapTo(next);
    },
    [swapTo],
  );

  const replace = useCallback(
    (next: ScreenName, stack: ScreenName[] = []) => {
      stackRef.current = stack;
      swapTo(next);
    },
    [swapTo],
  );

  const goMenu = useCallback(() => replace(ROOT_SCREEN), [replace]);

  const goBack = useCallback(() => {
    const stack = stackRef.current;
    if (stack.length === 0) {
      replace(ROOT_SCREEN);
      return;
    }
    const previous = stack[stack.length - 1];
    stackRef.current = stack.slice(0, -1);
    swapTo(previous);
  }, [replace, swapTo]);

  // the splash is a fixed 8 s hold, driven only by this timer — never by a tap
  useEffect(() => {
    const id = setTimeout(() => replace(ROOT_SCREEN), LOADER_DURATION_MS);
    return () => clearTimeout(id);
  }, [replace]);

  // system Back returns to the previous screen; on the Menu it closes the app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'loader') {
        return true;
      }
      if (screen === ROOT_SCREEN) {
        return false;
      }
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [screen, goBack]);

  const todayKey = useMemo(() => dateKey(), []);
  const dailyUnplayed = !playedToday(progress.daily.lastPlayedKey, todayKey);

  const startStage = useCallback(
    (stageIndex: number, attempt: number = 1) => {
      const clamped = Math.max(0, Math.min(STAGE_COUNT - 1, stageIndex));
      setRound({mode: 'stage', stageIndex: clamped, attempt, modifier: null});
      setCurrentStage(clamped);
      replace('game', [ROOT_SCREEN]);
    },
    [replace, setCurrentStage],
  );

  const startDaily = useCallback(() => {
    const seed = dateSeed(todayKey);
    setRound({
      mode: 'daily',
      stageIndex: seed % STAGE_COUNT,
      attempt: (seed % 7) + 1,
      modifier: modifierForDate(todayKey),
    });
    replace('game', [ROOT_SCREEN, 'daily']);
  }, [replace, todayKey]);

  const handleStageEnd = useCallback(
    (result: RoundResult) => {
      const next = completeRound(result);
      setSummary(next);
      replace('result', [ROOT_SCREEN]);
    },
    [completeRound, replace],
  );

  const playAgain = useCallback(() => {
    if (!summary) {
      goMenu();
      return;
    }
    if (summary.mode === 'daily') {
      // one attempt per day: the replay is the next stage of the garden instead
      startStage(progress.currentStage, 1);
      return;
    }
    startStage(summary.stageIndex, round.attempt + 1);
  }, [summary, round.attempt, progress.currentStage, startStage, goMenu]);

  const nextStage = useCallback(() => {
    if (!summary) {
      goMenu();
      return;
    }
    startStage(summary.stageIndex + 1, 1);
  }, [summary, startStage, goMenu]);

  const openTutorial = useCallback(() => {
    markTutorialSeen();
    push('tutorial');
  }, [markTutorialSeen, push]);

  const route = useCallback(
    (next: ScreenName) => {
      if (next === 'tutorial') {
        openTutorial();
        return;
      }
      push(next);
    },
    [push, openTutorial],
  );

  const viewDailyResult = useCallback(() => {
    if (progress.daily.lastSummary) {
      setSummary(progress.daily.lastSummary);
      push('result');
    }
  }, [progress.daily.lastSummary, push]);

  const leaveStage = useCallback(() => replace('map', [ROOT_SCREEN]), [replace]);

  const playFromMenu = useCallback(
    () => startStage(progress.currentStage, 1),
    [startStage, progress.currentStage],
  );

  let content: React.ReactNode = null;
  switch (screen) {
    case 'loader':
      content = <LoaderScreen />;
      break;
    case 'menu':
      content = (
        <MenuScreen
          stars={stars}
          bestChain={progress.bestChain}
          currentStage={progress.currentStage}
          dailyUnplayed={dailyUnplayed}
          onPlay={playFromMenu}
          onRoute={route}
        />
      );
      break;
    case 'tutorial':
      content = <TutorialScreen onDone={goMenu} onMenu={goMenu} />;
      break;
    case 'map':
      content = (
        <MapScreen
          stars={stars}
          records={progress.stageRecords}
          currentStage={progress.currentStage}
          onStart={startStage}
          onMenu={goMenu}
        />
      );
      break;
    case 'game':
      content = (
        <GameScreen
          key={`${round.mode}-${round.stageIndex}-${round.attempt}`}
          mode={round.mode}
          stageIndex={round.stageIndex}
          attempt={round.attempt}
          settings={progress.settings}
          modifier={round.modifier}
          onStageEnd={handleStageEnd}
          onLeave={leaveStage}
          onMenu={goMenu}
          onTutorial={openTutorial}
        />
      );
      break;
    case 'result':
      content = summary ? (
        <ResultScreen
          summary={summary}
          onAgain={playAgain}
          onNext={nextStage}
          onMenu={goMenu}
        />
      ) : null;
      break;
    case 'recipes':
      content = (
        <RecipeBookScreen
          discovered={progress.recipes}
          records={progress.stageRecords}
          onMenu={goMenu}
        />
      );
      break;
    case 'collection':
      content = (
        <CollectionScreen
          ingredients={progress.ingredients}
          rewards={progress.rewards}
          onMenu={goMenu}
        />
      );
      break;
    case 'daily':
      content = (
        <DailyChallengeScreen
          daily={progress.daily}
          onStart={startDaily}
          onViewResult={viewDailyResult}
          onMenu={goMenu}
        />
      );
      break;
    case 'settings':
      content = (
        <SettingsScreen
          settings={progress.settings}
          onChange={updateSettings}
          onErase={eraseEverything}
          onMenu={goMenu}
        />
      );
      break;
    default:
      content = null;
  }

  const dark = DARK_SCREENS.indexOf(screen) >= 0;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={dark ? 'light-content' : 'dark-content'}
      />
      {/* box-none is mandatory: this Animated wrapper holds every Pressable in the app */}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.root, {opacity: fade, transform: [{translateY: rise}]}]}>
        {content}
      </Animated.View>
    </View>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <Root />
    </ProgressProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg},
});

