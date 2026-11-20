import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';

export type StatItem = {
  key: string;
  value: string | number;
  label: string;
  tint: string;
};

function isEmpty(value: string | number): boolean {
  if (typeof value === 'number') {
    return value === 0;
  }
  return value.trim().length === 0 || value === '0';
}

type CardProps = StatItem;

/**
 * One accent dot, one number, one caption — no raster icon, so every card in a row is
 * exactly the same shape. A card with nothing to show renders null instead of an empty box.
 */
function StatCardBase({value, label, tint}: CardProps) {
  if (isEmpty(value)) {
    return null;
  }
  return (
    <View style={styles.card}>
      <View style={[styles.dot, {backgroundColor: tint}]} />
      <Text numberOfLines={1} style={[styles.value, {color: tint}]}>
        {String(value)}
      </Text>
      <Text numberOfLines={2} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

export const StatCard = memo(StatCardBase);

/** A row of stat cards. Fewer than two survivors means the whole row is not rendered. */
function StatRowBase({items}: {items: StatItem[]}) {
  const visible = items.filter(i => !isEmpty(i.value));
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.key} style={styles.slot}>
          <StatCard {...item} />
        </View>
      ))}
    </View>
  );
}

export const StatRow = memo(StatRowBase);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 12},
  // the slot flexes, the card fills it by width — never flex:1 inside flex:1
  slot: {flex: 1},
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  dot: {width: 8, height: 8, borderRadius: 4, marginBottom: 6},
  value: {fontSize: 22, lineHeight: 26, fontWeight: '900'},
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default StatCard;
