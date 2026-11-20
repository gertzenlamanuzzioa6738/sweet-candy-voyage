import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import {ShapeGlyph} from './Glyphs';
import type {Ingredient} from '../game/recipes';

type Props = {
  ingredient: Ingredient;
  count: number;
};

/** Found slots show the glyph, the name and the count; missing ones show a dashed LOCKED tile. */
function IngredientSlotBase({ingredient, count}: Props) {
  const found = count > 0;
  return (
    <View style={[styles.slot, found ? null : styles.slotLocked]}>
      {found ? (
        <>
          <View style={[styles.disc, {backgroundColor: `${ingredient.tint}22`}]}>
            <ShapeGlyph shape={ingredient.shape} size={28} color={ingredient.tint} />
          </View>
          <Text numberOfLines={2} style={styles.name}>
            {ingredient.name}
          </Text>
          <Text style={[styles.count, {color: ingredient.tint}]}>x{count}</Text>
        </>
      ) : (
        <>
          <View style={styles.discLocked}>
            <Text style={styles.question}>?</Text>
          </View>
          <Text style={styles.locked}>LOCKED</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  slotLocked: {
    backgroundColor: colors.surfaceMute,
    borderColor: colors.borderDeep,
    borderStyle: 'dashed',
    shadowOpacity: 0,
    elevation: 0,
  },
  disc: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  discLocked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  question: {fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#D8C9D4'},
  name: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.text,
    textAlign: 'center',
  },
  count: {fontSize: 12, lineHeight: 16, fontWeight: '900'},
  locked: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.textMute,
  },
});

export const IngredientSlot = memo(IngredientSlotBase);
export default IngredientSlot;
