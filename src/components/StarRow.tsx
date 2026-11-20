import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {SPRING_POP} from '../constants/config';
import {colors} from '../constants/theme';
import {StarIcon} from './icons';

type Props = {
  earned: number;
  total?: number;
  size?: number;
  /** earned stars pop in one after another */
  animate?: boolean;
  dim?: boolean;
};

function Pip({
  filled,
  size,
  delay,
  animate,
  dim,
}: {
  filled: boolean;
  size: number;
  delay: number;
  animate: boolean;
  dim: boolean;
}) {
  const scale = useRef(new Animated.Value(animate && filled ? 0 : 1)).current;

  useEffect(() => {
    if (!animate || !filled) {
      return;
    }
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scale, {toValue: 1, useNativeDriver: true, ...SPRING_POP}),
    ]);
    anim.start();
    return () => anim.stop();
  }, [animate, filled, delay, scale]);

  const tint = filled ? colors.lemon : dim ? 'rgba(255,255,255,0.35)' : colors.borderDeep;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pip, {width: size, height: size, transform: [{scale}]}]}>
      <StarIcon size={size} color={tint} fill={filled ? tint : 'none'} />
    </Animated.View>
  );
}

function StarRowBase({earned, total = 3, size = 24, animate = false, dim = false}: Props) {
  const pips = [];
  for (let i = 0; i < total; i++) {
    pips.push(
      <Pip
        key={`star-${i}`}
        filled={i < earned}
        size={size}
        delay={180 * i}
        animate={animate}
        dim={dim}
      />,
    );
  }
  return <View style={styles.row}>{pips}</View>;
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6},
  pip: {alignItems: 'center', justifyContent: 'center'},
});

export const StarRow = memo(StarRowBase);
export default StarRow;
