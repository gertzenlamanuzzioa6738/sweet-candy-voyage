import React, {memo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {CANDY_SPRITES} from '../assets';
import {CANDY_TINTS, colors, radius} from '../constants/theme';
import {ShapeGlyph} from './Glyphs';
import {StarRow} from './StarRow';
import {INGREDIENTS} from '../game/recipes';
import type {Recipe} from '../game/recipes';

type Props = {
  recipe: Recipe;
  discovered: boolean;
  stars: number;
};

function glyphFor(name: string) {
  const found = INGREDIENTS.find(i => i.name === name);
  return found || INGREDIENTS[0];
}

function RecipeCardBase({recipe, discovered, stars}: Props) {
  const tint = CANDY_TINTS[recipe.keyCandy];

  return (
    <View style={[styles.card, discovered ? null : styles.cardLocked]}>
      <View style={[styles.art, {backgroundColor: `${tint}1A`}]}>
        <Image
          source={CANDY_SPRITES[recipe.keyCandy]}
          style={[styles.sprite, discovered ? null : styles.spriteLocked]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.name}>
          {discovered ? recipe.name : '? ? ?'}
        </Text>
        <Text style={styles.location}>
          {discovered ? recipe.location : `CLEAR STAGE ${recipe.stageIndex + 1} TO DISCOVER`}
        </Text>
        {discovered ? (
          <View style={styles.chips}>
            {recipe.ingredients.slice(0, 3).map(name => {
              const g = glyphFor(name);
              return (
                <View key={name} style={styles.chip}>
                  <ShapeGlyph shape={g.shape} size={14} color={g.tint} />
                  <Text numberOfLines={1} style={styles.chipText}>
                    {name}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      {discovered && stars > 0 ? (
        <View style={styles.stars}>
          <StarRow earned={stars} total={3} size={12} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
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
  cardLocked: {backgroundColor: colors.surfaceMute, borderColor: colors.borderDeep},
  art: {width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  sprite: {width: 52, height: 52},
  spriteLocked: {opacity: 0.25},
  body: {flex: 1, gap: 3},
  name: {fontSize: 15, lineHeight: 20, fontWeight: '900', letterSpacing: 0.4, color: colors.text},
  location: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: colors.textSoft,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    maxWidth: 108,
  },
  chipText: {fontSize: 9, lineHeight: 12, fontWeight: '800', color: colors.textSoft},
  stars: {width: 52, alignItems: 'flex-end'},
});

export const RecipeCard = memo(RecipeCardBase);
export default RecipeCard;
