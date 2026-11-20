import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import {StarRow} from '../components/StarRow';
import {StatRow} from '../components/StatCard';
import {GiftIcon, House, PlayIcon, RetryIcon} from '../components/icons';
import {ShapeGlyph} from '../components/Glyphs';
import {formatScore} from '../game/format';
import {STAGE_COUNT} from '../game/levels';
import type {RoundSummary} from '../game/types';

const {width: SCREEN_W} = Dimensions.get('window');

type Props = {
  summary: RoundSummary;
  onAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
};

const HEADLINES: Record<string, string> = {
  win: 'RECIPE COMPLETE!',
  moves: 'OUT OF MOVES',
  spill: 'SYRUP SPILLED!',
  time: 'TIME IS UP',
};

/** Sugar specks stay in the side margins so nothing ever crosses the headline letters. */
function Specks({active}: {active: boolean}) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      return;
    }
    const loop = Animated.loop(
      Animated.timing(fall, {toValue: 1, duration: 1800, useNativeDriver: true}),
    );
    loop.start();
    return () => loop.stop();
  }, [active, fall]);

  if (!active) {
    return null;
  }

  const translateY = fall.interpolate({inputRange: [0, 1], outputRange: [-40, 260]});
  const opacity = fall.interpolate({inputRange: [0, 0.2, 0.85, 1], outputRange: [0, 1, 1, 0]});
  const left = SCREEN_W * 0.08;
  const right = SCREEN_W * 0.84;
  const dots = [
    {x: left, y: 0, r: 4},
    {x: left + 24, y: 40, r: 3},
    {x: left + 8, y: 90, r: 5},
    {x: left + 30, y: 140, r: 3},
    {x: left + 4, y: 190, r: 4},
    {x: left + 26, y: 240, r: 3},
    {x: right, y: 10, r: 4},
    {x: right + 22, y: 60, r: 3},
    {x: right + 6, y: 110, r: 5},
    {x: right + 28, y: 160, r: 3},
    {x: right + 2, y: 210, r: 4},
    {x: right + 24, y: 250, r: 3},
  ];

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.specks, {opacity, transform: [{translateY}]}]}>
      <Svg width={SCREEN_W} height={300}>
        {dots.map((d, i) => (
          <Circle key={`speck-${i}`} cx={d.x} cy={d.y} r={d.r} fill="#FFFFFF" opacity={0.8} />
        ))}
      </Svg>
    </Animated.View>
  );
}

export function ResultScreen({summary, onAgain, onNext, onMenu}: Props) {
  const won = summary.outcome === 'win';
  const isLastStage = summary.stageIndex >= STAGE_COUNT - 1;
  const showNext = won && summary.mode === 'stage' && !isLastStage;
  const reward = summary.newIngredient || (summary.newRewards.length > 0 ? summary.newRewards[0] : null);
  const rewardKind = summary.newIngredient ? 'NEW INGREDIENT' : 'NEW DECORATION';

  return (
    <GardenBackdrop variant={won ? 'result-win' : 'result-lose'}>
      <ScreenHeader
        left="menu"
        onLeft={onMenu}
        title={summary.mode === 'daily' ? 'DAILY RESULT' : 'STAGE RESULT'}
        subtitle={summary.location}
      />
      <Specks active={won} />

      <View style={styles.body}>
        <View style={styles.headBlock}>
          <Text style={styles.headline}>{HEADLINES[summary.outcome]}</Text>
          <Text style={styles.subline}>
            {summary.recipe}
            {summary.mode === 'stage' ? ` · STAGE ${summary.stageIndex + 1}` : ''}
          </Text>
          {summary.modifier ? (
            <Text style={styles.modifier}>MODIFIER · {summary.modifier}</Text>
          ) : null}
        </View>

        <View style={styles.starBlock}>
          <StarRow earned={summary.stars} total={3} size={44} animate dim />
        </View>

        <StatRow
          items={[
            {key: 'score', value: formatScore(summary.score), label: 'SCORE', tint: colors.primary},
            {key: 'chain', value: summary.bestChain > 0 ? `x${summary.bestChain}` : 0, label: 'BEST CHAIN', tint: colors.secondary},
            {key: 'syrup', value: summary.syrupCleared, label: 'SYRUP CLEARED', tint: colors.syrup},
          ]}
        />

        {reward ? (
          <View style={styles.rewardStrip}>
            <View style={styles.rewardArt}>
              <ShapeGlyph shape="star" size={26} color={colors.lemon} />
            </View>
            <View style={styles.rewardText}>
              <Text style={styles.rewardKind}>{rewardKind}</Text>
              <Text numberOfLines={1} style={styles.rewardName}>
                {reward}
              </Text>
            </View>
            <GiftIcon size={22} color={colors.primary} />
          </View>
        ) : null}

        <View style={styles.actions}>
          <Text style={styles.actionHint}>
            {won ? 'MOVES LEFT BECAME STARS · STARS OPEN NEW GARDENS' : 'EVERY TRY RESEEDS THE BOARD'}
          </Text>
          <PrimaryButton label="PLAY AGAIN" Icon={RetryIcon} onPress={onAgain} height={60} />
          {showNext ? (
            <PrimaryButton
              label="NEXT STAGE"
              Icon={PlayIcon}
              tone="grape"
              onPress={onNext}
              height={52}
            />
          ) : null}
          <SecondaryButton label="MENU" Icon={House} onPress={onMenu} plate />
        </View>
      </View>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  specks: {position: 'absolute', left: 0, top: 120},
  body: {flex: 1, paddingHorizontal: 20, paddingBottom: 22, justifyContent: 'space-between'},
  headBlock: {alignItems: 'center', paddingTop: 10, gap: 6},
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.onDark,
    textAlign: 'center',
    textShadowColor: 'rgba(74,32,64,0.45)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 10,
  },
  subline: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.onDark,
    opacity: 0.92,
    textAlign: 'center',
  },
  modifier: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.onDark,
    opacity: 0.8,
  },
  starBlock: {alignItems: 'center', paddingVertical: 6},
  rewardStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  rewardArt: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {flex: 1, gap: 2},
  rewardKind: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textSoft,
  },
  rewardName: {fontSize: 14, lineHeight: 19, fontWeight: '900', color: colors.text},
  actions: {gap: 10},
  actionHint: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.onDark,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default ResultScreen;
