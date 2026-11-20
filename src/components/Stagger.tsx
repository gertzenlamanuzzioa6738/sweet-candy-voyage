import React, {memo, useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ReactNode} from 'react';
import {SPRING_DEFAULT} from '../constants/config';

type Props = {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Entrance animation for a row of tiles.
 *
 * pointerEvents="box-none" is NOT optional here: an Animated.View that wraps Pressables
 * swallows the taps on Android release builds and every button inside goes dead.
 */
function StaggerBase({index = 0, children, style}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.delay(60 * index),
      Animated.spring(anim, {toValue: 1, useNativeDriver: true, ...SPRING_DEFAULT}),
    ]);
    seq.start();
    return () => seq.stop();
  }, [anim, index]);

  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [18, 0]});

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[style, {opacity: anim, transform: [{translateY}]}]}>
      {children}
    </Animated.View>
  );
}

export const Stagger = memo(StaggerBase);
export default Stagger;
