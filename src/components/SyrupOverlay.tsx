import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {colors, radius} from '../constants/theme';

type Props = {
  layers: number;
  size: number;
};

/**
 * Caramel crust drawn ON TOP of the candy. Thick syrup (2 layers) reads darker, so the
 * player can see how many matches a tile still needs.
 */
function SyrupOverlayBase({layers, size}: Props) {
  if (layers <= 0) {
    return null;
  }
  const fill = layers > 1 ? '#A4602B' : colors.syrup;
  const opacity = layers > 1 ? 0.92 : 0.82;

  return (
    <View pointerEvents="none" style={[styles.root, {width: size, height: size}]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect
          x={3}
          y={3}
          width={94}
          height={94}
          rx={22}
          fill={fill}
          fillOpacity={opacity}
          stroke={colors.syrupRim}
          strokeWidth={4}
        />
        <Path
          d="M18 26c10 8 20 2 30 8s22 2 34 10v-22H18z"
          fill="#E0A465"
          fillOpacity={0.45}
        />
        <Path
          d="M34 72c0 6-4 10-9 10s-9-4-9-10c0-6 9-16 9-16s9 10 9 16z"
          fill={colors.syrupRim}
          fillOpacity={0.5}
        />
        <Path
          d="M82 66c0 5-3 9-7 9s-7-4-7-9 7-13 7-13 7 8 7 13z"
          fill={colors.syrupRim}
          fillOpacity={0.4}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {position: 'absolute', left: 0, top: 0, borderRadius: radius.md},
});

export const SyrupOverlay = memo(SyrupOverlayBase);
export default SyrupOverlay;
