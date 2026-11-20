import React, {memo} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {assets} from '../assets';
import {colors, radius} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';
import {ICON_GAP, ICON_SIZE} from './PrimaryButton';
import type {IconComponent} from './PrimaryButton';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  tint?: string;
  height?: number;
  /** draws the generated button_rect plate behind the label, at its own 250x80 aspect */
  plate?: boolean;
  style?: StyleProp<ViewStyle>;
};

const HIT = {top: 8, bottom: 8, left: 8, right: 8};
/** button_rect is 250x80 — this size keeps its aspect exactly, so nothing is stretched */
const PLATE_W = 200;
const PLATE_H = 64;

function SecondaryButtonBase({
  label,
  onPress,
  Icon,
  tint = colors.text,
  height = 48,
  plate = false,
  style,
}: Props) {
  const press = usePressScale(0.96);
  const h = plate ? PLATE_H : height;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.press, {height: h}, plate ? styles.pressPlate : null, style]}>
      <Animated.View pointerEvents="box-none" style={[styles.fill, press.style]}>
        {plate ? (
          <Image
            source={assets.buttonRect}
            style={styles.plate}
            resizeMode="contain"
          />
        ) : null}
        <View style={styles.row}>
          {Icon ? (
            <View style={styles.iconBox}>
              <Icon size={ICON_SIZE} color={tint} />
            </View>
          ) : null}
          <Text numberOfLines={1} style={[styles.label, {color: tint}]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  pressPlate: {
    width: PLATE_W,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PLATE_W,
    height: PLATE_H,
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ICON_GAP,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    lineHeight: ICON_SIZE,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});

export const SecondaryButton = memo(SecondaryButtonBase);
export default SecondaryButton;
