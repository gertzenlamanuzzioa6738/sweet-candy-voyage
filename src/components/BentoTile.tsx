import React, {memo} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {colors, gradients, radius} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';
import {ICON_GAP} from './PrimaryButton';
import type {IconComponent} from './PrimaryButton';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type Props = {
  label: string;
  onPress: () => void;
  Icon: IconComponent;
  tint?: string;
  /** hero tile only */
  sub?: string;
  sprite?: ImageSourcePropType;
  badge?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The big PLAY tile of the Bento hub. Its caption is real text the UI walk can find. */
function HeroTileBase({label, onPress, Icon, sub, sprite, style}: Props) {
  const press = usePressScale(0.97);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.heroPress, style]}>
      <Animated.View pointerEvents="box-none" style={[styles.fill, press.style]}>
        <LinearGradient
          colors={gradients.primary as unknown as string[]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroFill}>
          <View pointerEvents="none" style={styles.topLight} />
          {sprite ? (
            <Image
              source={sprite}
              style={styles.heroSprite}
              resizeMode="contain"
            />
          ) : null}
          <View style={styles.heroRow}>
            <View style={styles.heroIconBox}>
              <Icon size={28} color={colors.onDark} />
            </View>
            <Text style={styles.heroLabel}>{label}</Text>
          </View>
          {sub ? (
            <Text numberOfLines={1} style={styles.heroSub}>
              {sub}
            </Text>
          ) : null}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export const HeroTile = memo(HeroTileBase);

/** Small white route tile — icon in a tinted disc with the caption under it. */
function RouteTileBase({label, onPress, Icon, tint = colors.primary, badge, style}: Props) {
  const press = usePressScale(0.95);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.routePress, style]}>
      <Animated.View pointerEvents="box-none" style={[styles.routeFill, press.style]}>
        <View style={[styles.routeDisc, {backgroundColor: `${tint}1A`}]}>
          <Icon size={24} color={tint} />
        </View>
        <Text numberOfLines={2} style={styles.routeLabel}>
          {label}
        </Text>
        {badge ? <View style={styles.badge} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export const RouteTile = memo(RouteTileBase);

/** Menu stat tile. Shows nothing at all when there is no value yet. */
function MenuStatTileBase({
  value,
  label,
  tint,
  Icon,
}: {
  value: number | string;
  label: string;
  tint: string;
  Icon: IconComponent;
}) {
  const empty = typeof value === 'number' ? value === 0 : !value;
  if (empty) {
    return null;
  }
  return (
    <View style={styles.statTile}>
      <View style={[styles.statDisc, {backgroundColor: `${tint}1A`}]}>
        <Icon size={20} color={tint} />
      </View>
      <Text style={[styles.statValue, {color: colors.text}]}>{String(value)}</Text>
      <Text numberOfLines={1} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

export const MenuStatTile = memo(MenuStatTileBase);

const styles = StyleSheet.create({
  heroPress: {
    flex: 1,
    height: '100%',
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
    shadowColor: colors.primaryDark,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 10,
  },
  fill: {width: '100%', height: '100%'},
  heroFill: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topLight: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  // positive offsets only — a sprite must never peek out of the rounded corner
  heroSprite: {position: 'absolute', right: 10, bottom: 10, width: 86, height: 86, opacity: 0.95},
  heroRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: ICON_GAP},
  heroIconBox: {width: 28, height: 28, alignItems: 'center', justifyContent: 'center'},
  heroLabel: {
    // lineHeight matches the 28 px icon box exactly (button icon-centering contract)
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.onDark,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.9)',
  },
  routePress: {
    flex: 1,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  routeFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  routeDisc: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  routeLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.text,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  statTile: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.surfaceDeep,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
    gap: 2,
  },
  statDisc: {width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center'},
  statValue: {fontSize: 22, lineHeight: 26, fontWeight: '900'},
  statLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textSoft,
  },
});

export default RouteTile;
