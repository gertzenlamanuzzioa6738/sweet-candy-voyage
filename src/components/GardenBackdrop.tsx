import React, {memo, useEffect, useRef} from 'react';
import {Animated, Dimensions, Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle} from 'react-native-svg';
import type {ReactNode} from 'react';
import {assets} from '../assets';
import {colors, gradients} from '../constants/theme';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');

export type BackdropVariant =
  | 'loader'
  | 'menu'
  | 'board'
  | 'sheet'
  | 'map'
  | 'result-win'
  | 'result-lose';

type Blob = {cx: number; cy: number; r: number; fill: string; opacity: number};

type VariantSpec = {
  bgOpacity: number;
  colours: string[];
  gradientOpacity: number;
  blobs: Blob[];
};

const W = SCREEN_W;
const H = SCREEN_H;

const SPECS: Record<BackdropVariant, VariantSpec> = {
  // deliberately the darkest screen in the app so Loader never reads like Menu
  loader: {
    bgOpacity: 0.3,
    colours: gradients.loader as unknown as string[],
    gradientOpacity: 0.9,
    blobs: [
      {cx: W * 0.18, cy: H * 0.16, r: 110, fill: colors.lemon, opacity: 0.16},
      {cx: W * 0.86, cy: H * 0.3, r: 92, fill: colors.mint, opacity: 0.14},
      {cx: W * 0.26, cy: H * 0.82, r: 124, fill: colors.berry, opacity: 0.15},
      {cx: W * 0.78, cy: H * 0.68, r: 76, fill: colors.primaryLight, opacity: 0.18},
    ],
  },
  menu: {
    bgOpacity: 1,
    colours: gradients.menu as unknown as string[],
    gradientOpacity: 1,
    blobs: [
      {cx: W * 0.92, cy: H * 0.12, r: 120, fill: colors.surfaceDeep, opacity: 0.75},
      {cx: W * 0.08, cy: H * 0.78, r: 130, fill: colors.successSoft, opacity: 0.7},
      {cx: W * 0.7, cy: H * 0.56, r: 70, fill: colors.primaryLight, opacity: 0.16},
    ],
  },
  board: {
    bgOpacity: 1,
    colours: gradients.board as unknown as string[],
    gradientOpacity: 1,
    blobs: [
      {cx: W * 0.1, cy: H * 0.2, r: 110, fill: colors.surfaceDeep, opacity: 0.6},
      {cx: W * 0.95, cy: H * 0.62, r: 96, fill: colors.successSoft, opacity: 0.55},
    ],
  },
  sheet: {
    bgOpacity: 1,
    colours: gradients.sheet as unknown as string[],
    gradientOpacity: 1,
    blobs: [
      {cx: W * 0.88, cy: H * 0.2, r: 118, fill: colors.surfaceDeep, opacity: 0.7},
      {cx: W * 0.12, cy: H * 0.72, r: 104, fill: colors.successSoft, opacity: 0.6},
    ],
  },
  map: {
    bgOpacity: 1,
    colours: gradients.map as unknown as string[],
    gradientOpacity: 1,
    blobs: [
      {cx: W * 0.14, cy: H * 0.24, r: 118, fill: colors.successSoft, opacity: 0.7},
      {cx: W * 0.9, cy: H * 0.7, r: 108, fill: colors.surfaceDeep, opacity: 0.7},
    ],
  },
  'result-win': {
    bgOpacity: 0.12,
    colours: gradients.resultWin as unknown as string[],
    gradientOpacity: 0.96,
    blobs: [
      {cx: W * 0.2, cy: H * 0.22, r: 120, fill: colors.lemon, opacity: 0.22},
      {cx: W * 0.84, cy: H * 0.64, r: 104, fill: colors.surface, opacity: 0.18},
    ],
  },
  'result-lose': {
    bgOpacity: 0.12,
    colours: gradients.resultLose as unknown as string[],
    gradientOpacity: 0.96,
    blobs: [
      {cx: W * 0.78, cy: H * 0.2, r: 112, fill: colors.syrup, opacity: 0.3},
      {cx: W * 0.18, cy: H * 0.7, r: 120, fill: colors.syrupPale, opacity: 0.22},
    ],
  },
};

type Props = {
  variant: BackdropVariant;
  animate?: boolean;
  children?: ReactNode;
};

/**
 * The one place every screen builds its depth: bg_game -> gradient -> soft blobs -> content.
 * bg_game is the only background image in the app; the gradient is what tells screens apart.
 */
function GardenBackdropBase({variant, animate = true, children}: Props) {
  const spec = SPECS[variant];
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {toValue: 1, duration: 4200, useNativeDriver: true}),
        Animated.timing(drift, {toValue: 0, duration: 4200, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, drift]);

  const translateY = drift.interpolate({inputRange: [0, 1], outputRange: [-10, 10]});

  return (
    <View style={styles.root}>
      <Image
        source={assets.bg}
        style={[styles.bg, {opacity: spec.bgOpacity}]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={spec.colours}
        start={{x: 0.1, y: 0}}
        end={{x: 0.9, y: 1}}
        style={[styles.bg, {opacity: spec.gradientOpacity}]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.bg, {transform: [{translateY}]}]}>
        <Svg width={W} height={H}>
          {spec.blobs.map((b, i) => (
            <Circle
              key={`blob-${i}`}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill={b.fill}
              opacity={b.opacity}
            />
          ))}
        </Svg>
      </Animated.View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg},
  bg: {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0},
  content: {flex: 1},
});

export const GardenBackdrop = memo(GardenBackdropBase);
export default GardenBackdrop;
