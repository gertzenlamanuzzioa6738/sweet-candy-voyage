import {useCallback, useMemo, useRef} from 'react';
import {Animated} from 'react-native';
import {SPRING_PRESS} from '../constants/config';

/**
 * Press feedback for this stack: the <Pressable> is the PARENT and drives an
 * <Animated.View> CHILD on transform only (native driver safe). Never the other way
 * round — an Animated wrapper around a Pressable eats the tap on Android release.
 */
export function usePressScale(to: number = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      ...SPRING_PRESS,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_PRESS,
    }).start();
  }, [scale]);

  return useMemo(
    () => ({scale, onPressIn, onPressOut, style: {transform: [{scale}]}}),
    [scale, onPressIn, onPressOut],
  );
}

export default usePressScale;
