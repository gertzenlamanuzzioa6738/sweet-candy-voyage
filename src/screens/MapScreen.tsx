import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {colors, radius} from '../constants/theme';
import {TOTAL_STARS} from '../constants/config';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {PrimaryButton} from '../components/PrimaryButton';
import {StageNode} from '../components/StageNode';
import {Toast} from '../components/Toast';
import {PlayIcon, StarIcon} from '../components/icons';
import {LOCATIONS, STAGES, gateCost, isStageUnlocked} from '../game/levels';
import type {NodeState} from '../components/StageNode';
import type {StageRecord} from '../game/progress';

type Props = {
  stars: number;
  records: Record<number, StageRecord>;
  currentStage: number;
  onStart: (stageIndex: number) => void;
  onMenu: () => void;
};

const ROWS = 4;
const PER_ROW = 3;
const SIDE_PAD = 48;

/** Puzzle Map: 12 stage nodes on a winding sugar path, 4 locations of 3 stages. */
export function MapScreen({stars, records, currentStage, onStart, onMenu}: Props) {
  const [area, setArea] = useState({w: 0, h: 0});
  const [selected, setSelected] = useState(currentStage);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTick, setToastTick] = useState(0);

  const onLayout = useCallback(
    (e: {nativeEvent: {layout: {width: number; height: number}}}) => {
      const {width, height} = e.nativeEvent.layout;
      setArea({w: width, h: height});
    },
    [],
  );

  const points = useMemo(() => {
    if (area.w === 0) {
      return [] as Array<{x: number; y: number}>;
    }
    const rowH = area.h / ROWS;
    const step = (area.w - SIDE_PAD * 2) / (PER_ROW - 1);
    const out: Array<{x: number; y: number}> = [];
    for (let i = 0; i < STAGES.length; i++) {
      const row = Math.floor(i / PER_ROW);
      const col = i % PER_ROW;
      const mirrored = row % 2 === 1 ? PER_ROW - 1 - col : col;
      out.push({x: SIDE_PAD + mirrored * step, y: rowH * row + rowH * 0.56});
    }
    return out;
  }, [area]);

  const pathD = useMemo(() => {
    if (points.length === 0) {
      return '';
    }
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  }, [points]);

  const handleNode = useCallback(
    (index: number) => {
      if (isStageUnlocked(index, stars)) {
        setSelected(index);
        return;
      }
      setToast(`NEEDS ★ ${gateCost(index)} · KEEP PLAYING`);
      setToastTick(t => t + 1);
    },
    [stars],
  );

  const hideToast = useCallback(() => setToast(null), []);
  const start = useCallback(() => onStart(selected), [onStart, selected]);

  const stateFor = (index: number): NodeState => {
    if (records[index]) {
      return 'done';
    }
    return isStageUnlocked(index, stars) ? 'current' : 'locked';
  };

  return (
    <GardenBackdrop variant="map">
      <ScreenHeader
        title="LEVELS"
        subtitle="PUZZLE MAP"
        left="menu"
        onLeft={onMenu}
        right={
          <View style={styles.starBadge}>
            <StarIcon size={16} color={colors.lemon} fill={colors.lemon} />
            <Text style={styles.starText}>
              {stars}/{TOTAL_STARS}
            </Text>
          </View>
        }
      />

      <View style={styles.field} onLayout={onLayout}>
        {area.w > 0 ? (
          <Svg
            width={area.w}
            height={area.h}
            style={StyleSheet.absoluteFill}
            pointerEvents="none">
            <Path d={pathD} stroke="#FFD9EC" strokeWidth={10} fill="none" strokeLinecap="round" />
            <Path
              d={pathD}
              stroke="#FFFFFF"
              strokeWidth={4}
              strokeDasharray="10 12"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        ) : null}

        {points.length > 0
          ? LOCATIONS.map((name, row) => (
              <View
                key={name}
                style={[
                  styles.banner,
                  {top: (area.h / ROWS) * row, left: row % 2 === 1 ? undefined : 8, right: row % 2 === 1 ? 8 : undefined},
                ]}>
                <Text style={styles.bannerText}>{name}</Text>
              </View>
            ))
          : null}

        {points.map((p, i) => (
          <View
            key={STAGES[i].recipe}
            style={[styles.nodeSlot, {left: p.x - 36, top: p.y - 28}]}>
            <StageNode
              index={i}
              state={stateFor(i)}
              stars={records[i] ? records[i].stars : 0}
              gateCost={gateCost(i)}
              selected={selected === i}
              onPress={handleNode}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          {STAGES[selected].recipe} · {STAGES[selected].moves} MOVES
        </Text>
        <PrimaryButton
          label={`START STAGE ${selected + 1}`}
          Icon={PlayIcon}
          onPress={start}
          height={60}
        />
      </View>

      <Toast text={toast} tick={toastTick} onHide={hideToast} bottom={130} />
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  starBadge: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  starText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  field: {flex: 1, marginHorizontal: 8},
  banner: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: colors.border,
  },
  bannerText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.text,
  },
  nodeSlot: {position: 'absolute', width: 72, height: 76},
  footer: {paddingHorizontal: 16, paddingBottom: 20, gap: 10},
  footerHint: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.textSoft,
    textAlign: 'center',
  },
});

export default MapScreen;
