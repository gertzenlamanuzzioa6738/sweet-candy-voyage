import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import type {ListRenderItemInfo} from 'react-native';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {TabBar} from '../components/TabBar';
import {IngredientSlot} from '../components/IngredientSlot';
import {RewardCard} from '../components/RewardCard';
import {EmptyState} from '../components/EmptyState';
import {CollectionIcon, GiftIcon} from '../components/icons';
import {INGREDIENTS} from '../game/recipes';
import {REWARDS} from '../game/rewards';
import type {Reward} from '../game/rewards';

type Props = {
  ingredients: Record<string, number>;
  rewards: string[];
  onMenu: () => void;
};

const TABS = ['INGREDIENTS', 'REWARDS'];

export function CollectionScreen({ingredients, rewards, onMenu}: Props) {
  const [tab, setTab] = useState(TABS[0]);
  const foundCount = Object.keys(ingredients).filter(k => ingredients[k] > 0).length;

  const renderReward = useCallback(
    ({item}: ListRenderItemInfo<Reward>) => (
      <View style={styles.rewardSlot}>
        <RewardCard reward={item} unlocked={rewards.indexOf(item.id) >= 0} />
      </View>
    ),
    [rewards],
  );

  const keyExtractor = useCallback((item: Reward) => item.id, []);

  return (
    <GardenBackdrop variant="sheet">
      <ScreenHeader
        title="COLLECTION"
        subtitle="GARDEN SHELF"
        left="menu"
        onLeft={onMenu}
      />

      <View style={styles.tabWrap}>
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </View>

      {tab === TABS[0] ? (
        foundCount === 0 ? (
          <EmptyState
            Icon={CollectionIcon}
            title="NOTHING COLLECTED YET"
            caption="Clear a five-in-a-line or an L shape made of the recipe candy to drop a rare ingredient here."
          />
        ) : (
          <View style={styles.grid}>
            {INGREDIENTS.map(ingredient => (
              <View key={ingredient.id} style={styles.gridSlot}>
                <IngredientSlot
                  ingredient={ingredient}
                  count={ingredients[ingredient.id] || 0}
                />
              </View>
            ))}
          </View>
        )
      ) : rewards.length === 0 ? (
        <EmptyState
          Icon={GiftIcon}
          title="NOTHING UNLOCKED YET"
          caption="Finish a recipe to earn stars. Every star milestone adds one decoration to the garden."
        />
      ) : (
        <FlatList
          data={REWARDS}
          renderItem={renderReward}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          initialNumToRender={6}
          windowSize={5}
          removeClippedSubviews
        />
      )}

      <Text style={styles.footer}>
        VIRTUAL DECORATIONS ONLY · NOTHING HERE COSTS MONEY
      </Text>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  tabWrap: {paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10},
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    alignContent: 'flex-start',
  },
  gridSlot: {width: '22.5%'},
  list: {paddingHorizontal: 16, paddingBottom: 16, gap: 12},
  column: {gap: 12},
  rewardSlot: {flex: 1},
  footer: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.textMute,
    textAlign: 'center',
    paddingBottom: 16,
    paddingTop: 4,
  },
  spacer: {height: radius.sm},
});

export default CollectionScreen;
