import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {colors} from '../constants/theme';
import {ShapeGlyph} from './Glyphs';

type Props = {
  filled: number;
  max: number;
  /** bumped on every spoiled swap so the row can shake */
  tick: number;
};

/**
 * The syrup pot. A spoiled swap fills one pip, any successful match empties it, and the
 * last pip ends the stage — so aimless tapping always reaches a result instead of dragging on.
 */
function DripMeterBase({filled, max, tick}: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const prev = useRef(tick);

  useEffect(() => {
    if (tick === prev.current) {
      return;
    }
    prev.current = tick;
    const strong = filled >= max - 1;
    const amount = strong ? 1 : 0.5;
    const anim = Animated.sequence([
      Animated.timing(shake, {toValue: amount, duration: 60, useNativeDriver: true}),
      Animated.timing(shake, {toValue: -amount, duration: 60, useNativeDriver: true}),
      Animated.timing(shake, {toValue: 0, duration: 60, useNativeDriver: true}),
    ]);
    anim.start();
    return () => anim.stop();
  }, [tick, filled, max, shake]);

  const translateX = shake.interpolate({inputRange: [-1, 1], outputRange: [-4, 4]});
  const pips = [];
  for (let i = 0; i < max; i++) {
    const on = i < filled;
    pips.push(
      <View key={`drip-${i}`} style={[styles.pip, on ? styles.pipOn : null]}>
        <ShapeGlyph
          shape="drop"
          size={16}
          color={on ? colors.syrup : colors.borderDeep}
        />
      </View>,
    );
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.row, {transform: [{translateX}]}]}>
      <Text style={styles.label}>SYRUP POT</Text>
      <View style={styles.pips}>{pips}</View>
      <Text style={styles.count}>
        {filled}/{max}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: colors.textSoft,
  },
  pips: {flexDirection: 'row', alignItems: 'center', gap: 6},
  pip: {
    width: 22,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: colors.surfaceMute,
  },
  pipOn: {backgroundColor: '#F3E2D2'},
  count: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: colors.syrup,
    fontVariant: ['tabular-nums'],
  },
});

export const DripMeter = memo(DripMeterBase);
export default DripMeter;
