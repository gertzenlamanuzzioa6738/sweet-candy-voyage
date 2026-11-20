import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import {ClockIcon} from './icons';

function usePulse(active: boolean) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1.1, duration: 420, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1, duration: 420, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);
  return pulse;
}

/** MOVES N. Turns red and pulses at three moves or fewer. */
function MovesPillBase({value}: {value: number}) {
  const danger = value <= 3;
  const pulse = usePulse(danger);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pill, danger ? styles.pillDanger : null, {transform: [{scale: pulse}]}]}>
      <Text style={styles.label}>MOVES</Text>
      <Text style={[styles.value, danger ? styles.valueDanger : null]}>{value}</Text>
    </Animated.View>
  );
}

export const MovesPill = memo(MovesPillBase);

/** Daily runs swap the move budget for a 90 second countdown. */
function TimerPillBase({ms}: {ms: number}) {
  const danger = ms <= 15000;
  const pulse = usePulse(danger);
  const seconds = Math.ceil(ms / 1000);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pill, danger ? styles.pillDanger : null, {transform: [{scale: pulse}]}]}>
      <View style={styles.iconBox}>
        <ClockIcon size={18} color={danger ? colors.danger : colors.text} />
      </View>
      <Text style={[styles.value, danger ? styles.valueDanger : null]}>{seconds}s</Text>
    </Animated.View>
  );
}

export const TimerPill = memo(TimerPillBase);

const styles = StyleSheet.create({
  pill: {
    height: 40,
    minWidth: 92,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pillDanger: {backgroundColor: '#FFE0E6'},
  iconBox: {width: 18, height: 18, alignItems: 'center', justifyContent: 'center'},
  label: {
    fontSize: 10,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.textSoft,
  },
  value: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  valueDanger: {color: colors.danger},
});

export default MovesPill;
