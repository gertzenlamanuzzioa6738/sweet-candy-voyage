import React, {memo} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {StyleProp, ViewStyle} from 'react-native';
import type {LucideIcon} from 'lucide-react-native';
import {colors, gradients, radius} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';

export const ICON_SIZE = 24;
export const ICON_GAP = 10;

/** One icon library in the whole app, so every icon box behaves the same. */
export type IconComponent = LucideIcon;

type Tone = 'pink' | 'mint' | 'grape';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  tone?: Tone;
  disabled?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const TONES: Record<Tone, {colours: string[]; shadow: string}> = {
  pink: {colours: gradients.primary as unknown as string[], shadow: colors.primaryDark},
  mint: {colours: gradients.mint as unknown as string[], shadow: colors.success},
  grape: {colours: gradients.grape as unknown as string[], shadow: colors.secondary},
};

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

/**
 * Claymorph CTA. Pressable is the PARENT, the Animated.View is its child and only ever
 * animates transform — the pattern that keeps onPress alive on Android release builds.
 */
function PrimaryButtonBase({
  label,
  onPress,
  Icon,
  tone = 'pink',
  disabled = false,
  height = 56,
  style,
  accessibilityLabel,
}: Props) {
  const press = usePressScale(0.96);
  const spec = TONES[tone];
  const textColour = disabled ? colors.textMute : colors.onDark;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={[
        styles.press,
        {height, shadowColor: spec.shadow},
        disabled ? styles.pressDisabled : null,
        style,
      ]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, press.style]}>
        <LinearGradient
          colors={disabled ? [colors.disabled, colors.disabled] : spec.colours}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.fill}>
          <View pointerEvents="none" style={styles.topLight} />
          <View style={styles.row}>
            {Icon ? (
              <View style={styles.iconBox}>
                <Icon size={ICON_SIZE} color={textColour} />
              </View>
            ) : null}
            <Text numberOfLines={1} style={[styles.label, {color: textColour}]}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
    shadowOffset: {width: 0, height: 9},
    shadowOpacity: 0.34,
    shadowRadius: 20,
    elevation: 9,
  },
  pressDisabled: {
    backgroundColor: colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  topLight: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ICON_GAP,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    lineHeight: ICON_SIZE,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
export default PrimaryButton;
