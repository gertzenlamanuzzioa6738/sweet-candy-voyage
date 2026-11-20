import React, {memo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {CANDY_SPRITES} from '../assets';
import {colors, radius} from '../constants/theme';
import {CheckIcon, LockIcon} from './icons';
import type {Reward} from '../game/rewards';

type Props = {
  reward: Reward;
  unlocked: boolean;
};

/** A decorative garden ornament. Virtual only — there is no price, only a star milestone. */
function RewardCardBase({reward, unlocked}: Props) {
  const sprite = CANDY_SPRITES[Math.max(0, Math.min(4, reward.sprite - 1))];
  return (
    <View style={[styles.card, unlocked ? null : styles.cardLocked]}>
      <View style={[styles.art, {backgroundColor: `${reward.tint}1A`}]}>
        <Image
          source={sprite}
          style={[styles.sprite, unlocked ? null : styles.spriteLocked]}
          resizeMode="contain"
        />
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {reward.name}
      </Text>
      <View style={[styles.statusPill, unlocked ? styles.statusOn : null]}>
        {unlocked ? (
          <CheckIcon size={14} color={colors.success} />
        ) : (
          <LockIcon size={14} color={colors.textMute} />
        )}
        <Text style={[styles.statusText, unlocked ? styles.statusTextOn : null]}>
          {unlocked ? 'UNLOCKED' : `★ ${reward.starCost}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 150,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 4,
  },
  cardLocked: {opacity: 0.55, backgroundColor: colors.surfaceMute},
  art: {width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center'},
  sprite: {width: 48, height: 48},
  spriteLocked: {opacity: 0.45},
  name: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.text,
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  statusOn: {backgroundColor: colors.successSoft},
  statusText: {fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1, color: colors.textMute},
  statusTextOn: {color: colors.success},
});

export const RewardCard = memo(RewardCardBase);
export default RewardCard;
