import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {T_BANNER} from '../constants/config';
import {colors, radius} from '../constants/theme';
import {SparkIcon} from './icons';

type Props = {
  link: number;
  tick: number;
};

/** Floating SWEET CHAIN xN pill — the cascade feedback that makes a combo readable. */
function ComboBannerBase({link, tick}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const prev = useRef(tick);

  useEffect(() => {
    if (tick === prev.current || link < 2) {
      return;
    }
    prev.current = tick;
    anim.setValue(0);
    const seq = Animated.sequence([
      Animated.spring(anim, {toValue: 1, useNativeDriver: true, tension: 140, friction: 12}),
      Animated.delay(T_BANNER),
      Animated.timing(anim, {toValue: 0, duration: 200, useNativeDriver: true}),
    ]);
    seq.start();
    return () => seq.stop();
  }, [tick, link, anim]);

  if (link < 2) {
    return null;
  }

  const translateX = anim.interpolate({inputRange: [0, 1], outputRange: [120, 0]});

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pill, {opacity: anim, transform: [{translateX}]}]}>
      <View style={styles.iconBox}>
        <SparkIcon size={20} color={colors.onDark} />
      </View>
      <Text style={styles.text}>SWEET CHAIN x{link}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    right: 12,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.34,
    shadowRadius: 16,
    elevation: 10,
  },
  iconBox: {width: 20, height: 20, alignItems: 'center', justifyContent: 'center'},
  text: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.onDark,
  },
});

export const ComboBanner = memo(ComboBannerBase);
export default ComboBanner;
