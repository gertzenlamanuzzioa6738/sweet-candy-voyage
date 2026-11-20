import React, {memo, useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {CANDY_SPRITES} from '../assets';
import {CANDY_TINTS, colors, radius} from '../constants/theme';
import {ShapeGlyph} from './Glyphs';
import {CheckIcon} from './icons';
import type {ObjectiveState} from '../game/types';

function Chip({state}: {state: ObjectiveState}) {
  const {objective, done} = state;
  const complete = done >= objective.total;
  const tint = objective.kind === 'syrup' ? colors.syrup : CANDY_TINTS[objective.candy];
  const pop = useRef(new Animated.Value(1)).current;
  const prev = useRef(done);

  useEffect(() => {
    if (done === prev.current) {
      return;
    }
    prev.current = done;
    const anim = Animated.sequence([
      Animated.timing(pop, {toValue: 1.18, duration: 120, useNativeDriver: true}),
      Animated.timing(pop, {toValue: 1, duration: 120, useNativeDriver: true}),
    ]);
    anim.start();
    return () => anim.stop();
  }, [done, pop]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chip,
        {borderColor: tint, transform: [{scale: pop}]},
        complete ? styles.chipDone : null,
      ]}>
      <View style={styles.art}>
        {objective.kind === 'syrup' ? (
          <ShapeGlyph shape="drop" size={22} color={colors.syrup} />
        ) : (
          <Image
            source={CANDY_SPRITES[objective.candy]}
            style={styles.sprite}
            resizeMode="contain"
          />
        )}
      </View>
      {complete ? (
        <View style={styles.check}>
          <CheckIcon size={18} color={colors.success} />
        </View>
      ) : (
        <Text style={styles.count}>
          {done}/{objective.total}
        </Text>
      )}
    </Animated.View>
  );
}

/** The recipe strip: what this stage asks for, and how far it is. */
function ObjectiveChipsBase({objectives}: {objectives: ObjectiveState[]}) {
  if (objectives.length === 0) {
    return null;
  }
  return (
    <View style={styles.row}>
      {objectives.slice(0, 3).map((state, i) => (
        <Chip key={`obj-${i}`} state={state} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  chip: {
    height: 40,
    minWidth: 76,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chipDone: {backgroundColor: colors.successSoft, borderColor: colors.success},
  art: {width: 22, height: 22, alignItems: 'center', justifyContent: 'center'},
  sprite: {width: 22, height: 22},
  check: {width: 22, height: 22, alignItems: 'center', justifyContent: 'center'},
  count: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});

export const ObjectiveChips = memo(ObjectiveChipsBase);
export default ObjectiveChips;
