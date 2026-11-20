import React, {memo} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {House} from './icons';
import type {ReactNode} from 'react';
import {assets} from '../assets';
import {colors, radius} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';

export const HEADER_TOP = 44;
export const HEADER_BAR = 72;
export const HEADER_HEIGHT = HEADER_TOP + HEADER_BAR;

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

type LeftKind = 'menu' | 'home' | 'none';

type Props = {
  title: string;
  subtitle?: string;
  left?: LeftKind;
  onLeft?: () => void;
  /** replaces the left button entirely (the Menu puts its emblem there) */
  leftNode?: ReactNode;
  right?: ReactNode;
  /** the Game screen sits on a translucent bar, sheets sit on nothing */
  surface?: boolean;
};

function LeftButton({kind, onPress}: {kind: LeftKind; onPress: () => void}) {
  const press = usePressScale(0.94);
  if (kind === 'none') {
    return <View style={styles.side} />;
  }
  const isHome = kind === 'home';
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={isHome ? 'Back to the puzzle map' : 'Back to the menu'}
      style={[styles.side, isHome ? styles.disc : styles.pill]}>
      <Animated.View pointerEvents="box-none" style={[styles.sideInner, press.style]}>
        {isHome ? (
          <>
            <Image source={assets.buttonRound} style={styles.plateRound} resizeMode="contain" />
            <Image source={assets.iconHome} style={styles.glyph} resizeMode="contain" />
          </>
        ) : (
          <>
            <View style={styles.iconBox}>
              <House size={18} color={colors.text} />
            </View>
            <Text style={styles.pillLabel}>MENU</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

/**
 * The single header every screen reuses. Different leftSlot/title/rightSlot per screen,
 * never a second inline header markup that drifts in styling.
 */
function ScreenHeaderBase({
  title,
  subtitle,
  left = 'menu',
  onLeft,
  leftNode,
  right,
  surface = false,
}: Props) {
  const handleLeft = onLeft || (() => {});
  return (
    <View style={[styles.root, surface ? styles.rootSurface : null]}>
      {leftNode ? (
        <View style={styles.side}>{leftNode}</View>
      ) : (
        <LeftButton kind={left} onPress={handleLeft} />
      )}
      <View style={styles.centre}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.sideRight}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: HEADER_TOP,
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rootSurface: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: {width: 104, height: 48, justifyContent: 'center'},
  sideRight: {width: 104, height: 48, alignItems: 'flex-end', justifyContent: 'center'},
  sideInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    width: 104,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  disc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  plateRound: {position: 'absolute', width: 48, height: 48, opacity: 0.5},
  glyph: {width: 28, height: 28},
  iconBox: {width: 18, height: 18, alignItems: 'center', justifyContent: 'center'},
  pillLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.text,
  },
  centre: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4},
  subtitle: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: colors.textSoft,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: colors.text,
    textAlign: 'center',
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
export default ScreenHeader;
