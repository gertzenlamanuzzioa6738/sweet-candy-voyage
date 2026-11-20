import React, {memo, useCallback, useEffect, useRef} from 'react';
import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import {SPRING_DEFAULT} from '../constants/config';
import {CANDY_SPRITES} from '../assets';
import {CANDY_TINTS, colors, radius} from '../constants/theme';
import {CANDY_SHAPES, ShapeGlyph} from './Glyphs';
import {SyrupOverlay} from './SyrupOverlay';
import type {CandyType} from '../game/types';

type Props = {
  index: number;
  type: CandyType;
  syrup: number;
  size: number;
  selected: boolean;
  legal: boolean;
  clearing: boolean;
  highContrast: boolean;
  calm: boolean;
  onPress: (index: number) => void;
};

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

/**
 * One board cell. The sprite is a plain <Image resizeMode="contain"> so the generated art
 * keeps its own aspect and nothing is clipped by a rounded wrapper.
 */
function CandyTileBase({
  index,
  type,
  syrup,
  size,
  selected,
  legal,
  clearing,
  highContrast,
  calm,
  onPress,
}: Props) {
  const pop = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;
  // a refilled cell is a NEW tile id, so it mounts and drops into place
  const enter = useRef(new Animated.Value(0)).current;
  const factor = calm ? 0.4 : 1;

  useEffect(() => {
    const drop = Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_DEFAULT,
    });
    drop.start();
    return () => drop.stop();
  }, [enter]);

  useEffect(() => {
    Animated.spring(pop, {
      toValue: selected ? 1.12 : 1,
      useNativeDriver: true,
      ...SPRING_DEFAULT,
    }).start();
  }, [selected, pop]);

  useEffect(() => {
    if (!clearing) {
      pop.setValue(selected ? 1.12 : 1);
      fade.setValue(1);
      return;
    }
    const anim = Animated.parallel([
      Animated.sequence([
        Animated.timing(pop, {
          toValue: 1.25,
          duration: Math.round(110 * factor),
          useNativeDriver: true,
        }),
        Animated.timing(pop, {
          toValue: 0.2,
          duration: Math.round(110 * factor),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fade, {
        toValue: 0.15,
        duration: Math.round(220 * factor),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [clearing, factor, pop, fade, selected]);

  const handlePress = useCallback(() => onPress(index), [onPress, index]);
  const dropY = enter.interpolate({inputRange: [0, 1], outputRange: [-size, 0]});
  const tint = CANDY_TINTS[type];
  const inner = size - 10;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={`Candy ${type + 1}${syrup > 0 ? ', covered in syrup' : ''}`}
      style={[styles.cell, {width: size, height: size}]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.inner,
          {
            width: size,
            height: size,
            opacity: fade,
            transform: [{translateY: dropY}, {scale: pop}],
          },
        ]}>
        <View
          style={[
            styles.pad,
            {width: size - 4, height: size - 4},
            legal ? {borderColor: 'rgba(255,105,180,0.55)', borderWidth: 2} : null,
            selected ? {borderColor: colors.primary, borderWidth: 3} : null,
          ]}
        />
        <Image
          source={CANDY_SPRITES[type]}
          style={{width: inner, height: inner}}
          resizeMode="contain"
        />
        {highContrast ? (
          <View style={styles.mark}>
            <ShapeGlyph
              shape={CANDY_SHAPES[type]}
              size={Math.max(12, Math.round(size * 0.26))}
              color={colors.onDark}
              opacity={0.95}
            />
          </View>
        ) : null}
        <SyrupOverlay layers={syrup} size={size} />
        {syrup > 1 ? <View style={[styles.thick, {borderColor: tint}]} /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {alignItems: 'center', justifyContent: 'center'},
  inner: {alignItems: 'center', justifyContent: 'center'},
  pad: {
    position: 'absolute',
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  mark: {position: 'absolute', right: 4, top: 4},
  thick: {
    position: 'absolute',
    left: 6,
    top: 6,
    right: 6,
    bottom: 6,
    borderRadius: radius.sm,
    borderWidth: 2,
  },
});

export const CandyTile = memo(CandyTileBase);
export default CandyTile;
