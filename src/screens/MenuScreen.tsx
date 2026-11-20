import React, {useCallback, useMemo} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {assets} from '../assets';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {HeroTile, MenuStatTile, RouteTile} from '../components/BentoTile';
import {Stagger} from '../components/Stagger';
import {
  ChainIcon,
  CollectionIcon,
  DailyIcon,
  HelpIcon,
  MapIcon,
  PlayIcon,
  RecipeIcon,
  SettingsIcon,
  StarIcon,
} from '../components/icons';
import {STAGE_COUNT, stageAt} from '../game/levels';
import {TOTAL_STARS} from '../constants/config';
import type {ScreenName} from '../navigation';

type Props = {
  stars: number;
  bestChain: number;
  currentStage: number;
  dailyUnplayed: boolean;
  onPlay: () => void;
  onRoute: (screen: ScreenName) => void;
};

/** M3 Bento-Hub. Every secondary screen is one tap away behind a text-labelled tile. */
export function MenuScreen({
  stars,
  bestChain,
  currentStage,
  dailyUnplayed,
  onPlay,
  onRoute,
}: Props) {
  const stage = stageAt(currentStage);
  const stageLine = `STAGE ${Math.min(currentStage + 1, STAGE_COUNT)} · ${stage.location}`;

  const goMap = useCallback(() => onRoute('map'), [onRoute]);
  const goDaily = useCallback(() => onRoute('daily'), [onRoute]);
  const goRecipes = useCallback(() => onRoute('recipes'), [onRoute]);
  const goCollection = useCallback(() => onRoute('collection'), [onRoute]);
  const goTutorial = useCallback(() => onRoute('tutorial'), [onRoute]);
  const goSettings = useCallback(() => onRoute('settings'), [onRoute]);

  // a stat tile with nothing to show is not rendered, and a lone tile is not a row
  const statCount = useMemo(
    () => (stars > 0 ? 1 : 0) + (bestChain > 0 ? 1 : 0),
    [stars, bestChain],
  );
  const showStats = statCount >= 2;

  return (
    <GardenBackdrop variant="menu">
      <ScreenHeader
        left="none"
        title="SWEET CANDY VOYAGE"
        subtitle="CANDY CURRENT"
        leftNode={<Image source={assets.logo} style={styles.mark} resizeMode="contain" />}
        right={
          <View style={styles.starBadge}>
            <StarIcon size={18} color={colors.lemon} fill={colors.lemon} />
            <Text style={styles.starText}>
              {stars}/{TOTAL_STARS}
            </Text>
          </View>
        }
      />

      <View style={styles.body}>
        <Text style={styles.hint}>
          SWAP TWO CANDIES SIDE BY SIDE · FINISH THE RECIPE BEFORE THE MOVES RUN OUT
        </Text>

        <Stagger index={0} style={styles.rowA}>
          <HeroTile
            label="PLAY"
            sub={stageLine}
            Icon={PlayIcon}
            sprite={assets.sprite1}
            onPress={onPlay}
          />
          {showStats ? (
            <View style={styles.statColumn}>
              <MenuStatTile value={stars} label="STARS" tint={colors.lemon} Icon={StarIcon} />
              <MenuStatTile
                value={`x${bestChain}`}
                label="BEST CHAIN"
                tint={colors.secondary}
                Icon={ChainIcon}
              />
            </View>
          ) : null}
        </Stagger>

        <Stagger index={1} style={styles.row}>
          <RouteTile label="LEVELS" Icon={MapIcon} tint={colors.primary} onPress={goMap} />
          <RouteTile
            label="DAILY CHALLENGE"
            Icon={DailyIcon}
            tint={colors.mint}
            badge={dailyUnplayed}
            onPress={goDaily}
          />
          <RouteTile
            label="RECIPE BOOK"
            Icon={RecipeIcon}
            tint={colors.lemon}
            onPress={goRecipes}
          />
        </Stagger>

        <Stagger index={2} style={styles.row}>
          <RouteTile
            label="COLLECTION"
            Icon={CollectionIcon}
            tint={colors.secondary}
            onPress={goCollection}
          />
          <RouteTile
            label="HOW TO PLAY"
            Icon={HelpIcon}
            tint={colors.berry}
            onPress={goTutorial}
          />
          <RouteTile
            label="SETTINGS"
            Icon={SettingsIcon}
            tint={colors.textSoft}
            onPress={goSettings}
          />
        </Stagger>
      </View>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  mark: {width: 44, height: 44},
  starBadge: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  body: {flex: 1, paddingHorizontal: 16, paddingTop: 4, gap: 12},
  hint: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: 2,
  },
  rowA: {height: 190, flexDirection: 'row', gap: 12},
  statColumn: {width: 128, justifyContent: 'space-between'},
  row: {height: 96, flexDirection: 'row', gap: 12},
  spacer: {height: radius.sm},
});

export default MenuScreen;
