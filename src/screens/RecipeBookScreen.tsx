import React, {useCallback} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import type {ListRenderItemInfo} from 'react-native';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {RecipeCard} from '../components/RecipeCard';
import {EmptyState} from '../components/EmptyState';
import {RecipeIcon} from '../components/icons';
import {RECIPES} from '../game/recipes';
import type {Recipe} from '../game/recipes';
import type {StageRecord} from '../game/progress';

type Props = {
  discovered: number[];
  records: Record<number, StageRecord>;
  onMenu: () => void;
};

const CARD_H = 104;
const GAP = 12;

export function RecipeBookScreen({discovered, records, onMenu}: Props) {
  const found = discovered.length;

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Recipe>) => (
      <RecipeCard
        recipe={item}
        discovered={discovered.indexOf(item.stageIndex) >= 0}
        stars={records[item.stageIndex] ? records[item.stageIndex].stars : 0}
      />
    ),
    [discovered, records],
  );

  const keyExtractor = useCallback((item: Recipe) => item.name, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Recipe> | null | undefined, index: number) => ({
      length: CARD_H + GAP,
      offset: (CARD_H + GAP) * index,
      index,
    }),
    [],
  );

  return (
    <GardenBackdrop variant="sheet">
      <ScreenHeader
        title="RECIPE BOOK"
        subtitle="CANDY CURRENT KITCHEN"
        left="menu"
        onLeft={onMenu}
        right={
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {found}/{RECIPES.length}
            </Text>
          </View>
        }
      />
      {found === 0 ? (
        <EmptyState
          Icon={RecipeIcon}
          title="NO RECIPES YET"
          caption="Finish a stage and its recipe is written into the book, with the ingredients it needs."
        />
      ) : (
        <FlatList
          data={RECIPES}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </GardenBackdrop>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  counter: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  list: {paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24},
  separator: {height: GAP},
  spacer: {height: radius.sm},
});

export default RecipeBookScreen;
