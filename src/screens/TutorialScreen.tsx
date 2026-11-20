import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Rect} from 'react-native-svg';
import {CANDY_TINTS, colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import {CheckIcon, PlayIcon} from '../components/icons';

type Props = {
  onDone: () => void;
  onMenu: () => void;
};

type Step = {
  title: string;
  body: string;
  /** which cells of the 3x3 demo board are highlighted, and with what */
  marks: Array<'none' | 'pick' | 'match' | 'syrup' | 'goal'>;
};

const STEPS: Step[] = [
  {
    title: 'SWAP TWO NEIGHBOURS',
    body: 'Tap a candy, then tap one of the four glowing neighbours. Three in a row pop.',
    marks: ['none', 'pick', 'none', 'match', 'match', 'match', 'none', 'none', 'none'],
  },
  {
    title: 'WASH OFF THE SYRUP',
    body: 'A match on a syrup tile washes the caramel away. Syrup tiles stay locked until they are clean.',
    marks: ['syrup', 'none', 'none', 'match', 'syrup', 'match', 'none', 'none', 'syrup'],
  },
  {
    title: 'WATCH THE DRIP POT',
    body: 'A swap that matches nothing drips syrup. Five drips and the pot spills, so the stage is lost. Any match empties the pot.',
    marks: ['none', 'none', 'none', 'none', 'pick', 'none', 'syrup', 'syrup', 'syrup'],
  },
  {
    title: 'FINISH THE RECIPE',
    body: 'Collect what the recipe asks for before the moves run out. Moves left become stars, and stars open new garden locations.',
    marks: ['goal', 'goal', 'goal', 'none', 'match', 'none', 'none', 'none', 'none'],
  },
];

const CELL = 56;

function MiniBoard({marks}: {marks: Step['marks']}) {
  const size = CELL * 3;
  return (
    <Svg width={size} height={size}>
      {marks.map((mark, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const x = c * CELL + 4;
        const y = r * CELL + 4;
        const w = CELL - 8;
        const fill =
          mark === 'syrup'
            ? colors.syrup
            : mark === 'match'
            ? CANDY_TINTS[0]
            : mark === 'goal'
            ? colors.success
            : mark === 'pick'
            ? CANDY_TINTS[2]
            : colors.surfaceAlt;
        return (
          <React.Fragment key={`cell-${i}`}>
            <Rect x={x} y={y} width={w} height={w} rx={14} fill={fill} opacity={0.9} />
            {mark === 'pick' ? (
              <Rect
                x={x - 2}
                y={y - 2}
                width={w + 4}
                height={w + 4}
                rx={16}
                fill="none"
                stroke={colors.primary}
                strokeWidth={3}
              />
            ) : null}
            {mark !== 'none' ? (
              <Circle cx={x + w / 2} cy={y + w / 2} r={7} fill="#FFFFFF" opacity={0.75} />
            ) : null}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

/** Four steps that explain the controls of THIS game, one per card. */
export function TutorialScreen({onDone, onMenu}: Props) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  const next = useCallback(() => {
    setStep(prev => {
      if (prev >= STEPS.length - 1) {
        onDone();
        return prev;
      }
      return prev + 1;
    });
  }, [onDone]);

  return (
    <GardenBackdrop variant="sheet">
      <ScreenHeader title="HOW TO PLAY" left="menu" onLeft={onMenu} />
      <View style={styles.body}>
        <View style={styles.card}>
          <View pointerEvents="none" style={styles.topLight} />
          <View style={styles.boardWrap}>
            <MiniBoard marks={current.marks} />
          </View>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.text}>{current.body}</Text>
        </View>

        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <View
              key={s.title}
              style={[styles.dot, i === step ? styles.dotOn : null]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Text style={styles.cta}>
            {last ? 'THAT IS EVERYTHING - GO MAKE SOMETHING SWEET' : `STEP ${step + 1} OF ${STEPS.length}`}
          </Text>
          <PrimaryButton
            label={last ? 'GOT IT' : 'NEXT'}
            Icon={last ? CheckIcon : PlayIcon}
            onPress={next}
            height={56}
          />
          <SecondaryButton label={last ? 'MENU' : 'SKIP'} onPress={onMenu} height={48} />
        </View>
      </View>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  body: {flex: 1, paddingHorizontal: 20, paddingTop: 8, justifyContent: 'space-between', paddingBottom: 22},
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  topLight: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  boardWrap: {
    padding: 8,
    borderRadius: radius.xl,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.surfaceDeep,
  },
  title: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.textSoft,
    textAlign: 'center',
  },
  dots: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderDeep},
  dotOn: {width: 16, backgroundColor: colors.primary},
  actions: {gap: 10},
  cta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default TutorialScreen;
