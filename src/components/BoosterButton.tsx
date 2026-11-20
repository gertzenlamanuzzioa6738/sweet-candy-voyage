import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import {PrimaryButton} from './PrimaryButton';
import {DropIcon} from './icons';

type Props = {
  charge: number;
  max: number;
  onPress: () => void;
  /** bumped when a blocked press happens, so the charge line can flash */
  flashTick: number;
};

/**
 * Syrup Splash. Charged it clears a 3x3 syrup block; uncharged it still answers the tap
 * with a flash and a reason — never a dead button.
 */
function BoosterButtonBase({charge, max, onPress, flashTick}: Props) {
  const charged = charge >= max;
  const flash = useRef(new Animated.Value(0)).current;
  const prev = useRef(flashTick);

  useEffect(() => {
    if (flashTick === prev.current) {
      return;
    }
    prev.current = flashTick;
    const anim = Animated.sequence([
      Animated.timing(flash, {toValue: 1, duration: 120, useNativeDriver: true}),
      Animated.timing(flash, {toValue: 0, duration: 260, useNativeDriver: true}),
    ]);
    anim.start();
    return () => anim.stop();
  }, [flashTick, flash]);

  const ratio = Math.max(0, Math.min(1, charge / max));

  return (
    <View style={styles.root}>
      <PrimaryButton
        label={charged ? 'TAP TO SPLASH' : `SPLASH ${charge}/${max}`}
        onPress={onPress}
        Icon={DropIcon}
        tone="mint"
        disabled={!charged}
        height={56}
      />
      {charged ? null : (
        <View pointerEvents="none" style={styles.track}>
          <View style={[styles.fill, {width: `${ratio * 100}%`}]} />
          <Animated.View pointerEvents="none" style={[styles.flash, {opacity: flash}]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {width: '100%'},
  track: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderDeep,
    overflow: 'hidden',
  },
  fill: {height: 3, borderRadius: 2, backgroundColor: colors.success},
  flash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
});

export const BoosterButton = memo(BoosterButtonBase);
export default BoosterButton;
