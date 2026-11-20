import React, {memo, useCallback, useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, gradients, radius} from '../constants/theme';
import {LockIcon} from './icons';
import {StarRow} from './StarRow';

export type NodeState = 'done' | 'current' | 'locked';

type Props = {
  index: number;
  state: NodeState;
  stars: number;
  gateCost: number;
  selected: boolean;
  onPress: (index: number) => void;
};

const SIZE = 56;
const HIT = {top: 8, bottom: 8, left: 8, right: 8};

function StageNodeBase({index, state, stars, gateCost, selected, onPress}: Props) {
  const ring = useRef(new Animated.Value(1)).current;
  const handlePress = useCallback(() => onPress(index), [onPress, index]);

  useEffect(() => {
    if (state !== 'current') {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, {toValue: 1.12, duration: 700, useNativeDriver: true}),
        Animated.timing(ring, {toValue: 1, duration: 700, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, ring]);

  const locked = state === 'locked';

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={`Stage ${index + 1}, ${state}`}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.inner, {transform: [{scale: state === 'current' ? ring : 1}]}]}>
        {state === 'done' ? (
          <LinearGradient
            colors={gradients.primary as unknown as string[]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.disc}>
            <Text style={styles.numberOnPink}>{index + 1}</Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.disc,
              locked ? styles.discLocked : styles.discCurrent,
              selected && !locked ? styles.discSelected : null,
            ]}>
            {locked ? (
              <LockIcon size={20} color={colors.textMute} />
            ) : (
              <Text style={styles.number}>{index + 1}</Text>
            )}
          </View>
        )}
      </Animated.View>
      {state === 'done' ? (
        <View style={styles.stars}>
          <StarRow earned={stars} total={3} size={10} />
        </View>
      ) : null}
      {locked && gateCost > 0 ? <Text style={styles.gate}>★ {gateCost}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {width: 72, height: 76, alignItems: 'center', justifyContent: 'flex-start'},
  inner: {width: SIZE, height: SIZE},
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.26,
    shadowRadius: 12,
    elevation: 6,
  },
  discCurrent: {
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  discSelected: {borderColor: colors.secondary, borderWidth: 4},
  discLocked: {backgroundColor: colors.borderDeep, shadowOpacity: 0, elevation: 0},
  number: {fontSize: 18, lineHeight: 22, fontWeight: '900', color: colors.text},
  numberOnPink: {fontSize: 18, lineHeight: 22, fontWeight: '900', color: colors.onDark},
  stars: {marginTop: 4},
  gate: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.textMute,
  },
  spacer: {height: radius.sm},
});

export const StageNode = memo(StageNodeBase);
export default StageNode;
