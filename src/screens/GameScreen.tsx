import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import {assets} from '../assets';
import {DAILY_DURATION_MS, SPLASH_MAX} from '../constants/config';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {CandyBoard} from '../components/CandyBoard';
import {ObjectiveChips} from '../components/ObjectiveChips';
import {MovesPill, TimerPill} from '../components/MovesPill';
import {DripMeter} from '../components/DripMeter';
import {BoosterButton} from '../components/BoosterButton';
import {ComboBanner} from '../components/ComboBanner';
import {ConfirmPopup} from '../components/ConfirmPopup';
import {Toast} from '../components/Toast';
import {HelpIcon, House, PlayIcon} from '../components/icons';
import {useBoard} from '../hooks/useBoard';
import {useCountdown} from '../hooks/useCountdown';
import {usePressScale} from '../hooks/usePressScale';
import {stageAt} from '../game/levels';
import {formatScore} from '../game/format';
import type {BoardState, RoundSetup} from '../hooks/useBoard';
import type {RoundResult} from '../game/progress';
import type {DailyModifier} from '../game/daily';
import type {Settings} from '../game/progress';
import type {GameMode} from '../game/types';

type Props = {
  mode: GameMode;
  stageIndex: number;
  attempt: number;
  settings: Settings;
  modifier: DailyModifier | null;
  onStageEnd: (result: RoundResult) => void;
  onLeave: () => void;
  onMenu: () => void;
  onTutorial: () => void;
};

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

function RoundIconButton({
  source,
  label,
  onPress,
}: {
  source: ImageSourcePropType;
  label: string;
  onPress: () => void;
}) {
  const press = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.disc}>
      <Animated.View pointerEvents="box-none" style={[styles.discInner, press.style]}>
        <Image source={assets.buttonRound} style={styles.discPlate} resizeMode="contain" />
        <Image source={source} style={styles.discGlyph} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}

/** G1 Classic Stack: header, objective strip, board, controls. */
export function GameScreen({
  mode,
  stageIndex,
  attempt,
  settings,
  modifier,
  onStageEnd,
  onLeave,
  onMenu,
  onTutorial,
}: Props) {
  const setupRef = useRef<RoundSetup>({mode, stageIndex, settings, modifier, attempt});
  const stage = stageAt(stageIndex);

  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ending, setEnding] = useState<BoardState | null>(null);
  const [flashTick, setFlashTick] = useState(0);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wash = useRef(new Animated.Value(0)).current;

  const handleEnd = useCallback(
    (state: BoardState) => {
      setEnding(state);
      Animated.timing(wash, {
        toValue: 1,
        duration: settings.motion === 'CALM' ? 220 : 480,
        useNativeDriver: true,
      }).start();
      endTimer.current = setTimeout(() => {
        endTimer.current = null;
        onStageEnd({
          outcome: state.outcome || 'moves',
          mode: state.mode,
          stageIndex: state.stageIndex,
          score: state.score,
          bestChain: state.bestChain,
          syrupCleared: state.syrupCleared,
          movesLeft: Math.max(0, state.movesLeft),
          movesTotal: state.movesTotal,
          masteryHits: state.masteryHits,
          modifier: modifier ? modifier.name : null,
        });
      }, 700);
    },
    [onStageEnd, modifier, settings.motion, wash],
  );

  const api = useBoard(setupRef.current, handleEnd);
  const {state} = api;

  useEffect(
    () => () => {
      if (endTimer.current !== null) {
        clearTimeout(endTimer.current);
        endTimer.current = null;
      }
    },
    [],
  );

  const timerRunning = mode === 'daily' && !paused && !leaving && state.phase !== 'ended';
  const msLeft = useCountdown(DAILY_DURATION_MS, timerRunning, api.timeUp);

  const onTile = useCallback(
    (index: number) => {
      if (paused || ending) {
        return;
      }
      api.tap(index);
    },
    [api, paused, ending],
  );

  const onSplash = useCallback(() => {
    if (paused || ending) {
      return;
    }
    if (state.splash < SPLASH_MAX) {
      setFlashTick(t => t + 1);
    }
    api.useSplash();
  }, [api, paused, ending, state.splash]);

  const askLeave = useCallback(() => setLeaving(true), []);
  const stay = useCallback(() => setLeaving(false), []);
  const resume = useCallback(() => setPaused(false), []);
  const openPause = useCallback(() => setPaused(true), []);
  const goTutorial = useCallback(() => {
    setPaused(false);
    onTutorial();
  }, [onTutorial]);
  const goMenu = useCallback(() => {
    setPaused(false);
    setLeaving(false);
    onMenu();
  }, [onMenu]);
  const goBack = useCallback(() => {
    setLeaving(false);
    onLeave();
  }, [onLeave]);

  const won = ending ? ending.outcome === 'win' : false;
  const washOpacity = wash.interpolate({inputRange: [0, 1], outputRange: [0, 1]});

  return (
    <GardenBackdrop variant="board" animate={settings.motion === 'FULL'}>
      <ScreenHeader
        surface
        left="home"
        onLeft={askLeave}
        title={mode === 'daily' ? 'DAILY CHALLENGE' : stage.recipe}
        subtitle={
          mode === 'daily'
            ? modifier
              ? modifier.name
              : 'CANDY CURRENT'
            : `STAGE ${stageIndex + 1} · ${stage.location}`
        }
        right={
          <RoundIconButton source={assets.iconPause} label="Pause" onPress={openPause} />
        }
      />

      <View style={styles.strip}>
        <View style={styles.stripChips}>
          <ObjectiveChips objectives={state.objectives} />
        </View>
        {mode === 'daily' ? <TimerPill ms={msLeft} /> : <MovesPill value={state.movesLeft} />}
      </View>

      <View style={styles.area}>
        <View style={styles.boardWrap}>
          <CandyBoard
            state={state}
            onTileTap={onTile}
            highContrast={settings.highContrast}
            swapGuide={settings.swapGuide}
            calm={settings.motion === 'CALM'}
          />
          {ending ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.wash,
                won ? styles.washWin : styles.washLose,
                {opacity: washOpacity},
              ]}
            />
          ) : null}
        </View>
        <ComboBanner link={state.bannerLink} tick={state.bannerTick} />
      </View>

      <View style={styles.controls}>
        <View pointerEvents="none" style={styles.controlsLight} />
        <DripMeter filled={state.drips} max={state.maxDrips} tick={state.spoiledTick} />
        <Text style={styles.hint}>
          TAP TWO CANDIES SIDE BY SIDE · A SPOILED SWAP DRIPS SYRUP
        </Text>
        <BoosterButton
          charge={state.splash}
          max={SPLASH_MAX}
          onPress={onSplash}
          flashTick={flashTick}
        />
        <Text style={styles.score}>SCORE {formatScore(state.score)}</Text>
      </View>

      <Toast text={state.toast} tick={state.toastTick} onHide={api.dismissToast} bottom={210} />

      <ConfirmPopup
        visible={paused}
        title="PAUSED"
        caption="The candy current is holding still."
        actions={[
          {label: 'RESUME', onPress: resume, Icon: PlayIcon},
          {label: 'HOW TO PLAY', onPress: goTutorial, Icon: HelpIcon, tone: 'grape'},
        ]}
        cancelLabel="MENU"
        onCancel={goMenu}
      />

      <ConfirmPopup
        visible={leaving}
        title="LEAVE STAGE?"
        caption="This attempt will not be scored."
        actions={[
          {label: 'STAY', onPress: stay, Icon: PlayIcon},
          {label: 'BACK TO LEVELS', onPress: goBack, Icon: House, tone: 'grape'},
        ]}
        cancelLabel="MENU"
        onCancel={goMenu}
      />
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  disc: {width: 48, height: 48},
  discInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  discPlate: {position: 'absolute', width: 48, height: 48, opacity: 0.5},
  discGlyph: {width: 28, height: 28},
  strip: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stripChips: {flex: 1, overflow: 'hidden'},
  area: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  boardWrap: {borderRadius: radius.xl, overflow: 'hidden'},
  wash: {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius.xl},
  washWin: {backgroundColor: 'rgba(255,240,245,0.6)'},
  washLose: {backgroundColor: 'rgba(201,123,60,0.4)'},
  controls: {
    height: 186,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopWidth: 2,
    borderTopColor: colors.border,
    justifyContent: 'space-between',
  },
  controlsLight: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  hint: {
    height: 22,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: 4,
  },
  score: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: colors.text,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});

export default GameScreen;
