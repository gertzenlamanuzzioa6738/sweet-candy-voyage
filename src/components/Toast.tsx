import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {T_TOAST} from '../constants/config';
import {colors, radius} from '../constants/theme';

type Props = {
  text: string | null;
  /** bump this number to replay the toast with the same text */
  tick: number;
  onHide: () => void;
  bottom?: number;
};

/** Short claymorph pill used for every blocked action, so no tap is ever silent. */
function ToastBase({text, tick, onHide, bottom = 120}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const hideRef = useRef(onHide);
  hideRef.current = onHide;

  useEffect(() => {
    if (!text) {
      return;
    }
    anim.setValue(0);
    const seq = Animated.sequence([
      Animated.timing(anim, {toValue: 1, duration: 180, useNativeDriver: true}),
      Animated.delay(T_TOAST),
      Animated.timing(anim, {toValue: 0, duration: 220, useNativeDriver: true}),
    ]);
    seq.start(({finished}) => {
      if (finished) {
        hideRef.current();
      }
    });
    return () => seq.stop();
  }, [text, tick, anim]);

  if (!text) {
    return null;
  }

  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [16, 0]});

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pill, {bottom, opacity: anim, transform: [{translateY}]}]}>
      <Text numberOfLines={2} style={styles.text}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 24,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.onDark,
    textAlign: 'center',
  },
});

export const Toast = memo(ToastBase);
export default Toast;
