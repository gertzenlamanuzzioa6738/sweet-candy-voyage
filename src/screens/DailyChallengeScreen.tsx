import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {PrimaryButton} from '../components/PrimaryButton';
import {SecondaryButton} from '../components/SecondaryButton';
import {StarRow} from '../components/StarRow';
import {ClockIcon, EyeIcon, PlayIcon, StreakIcon} from '../components/icons';
import {dateKey, modifierForDate, playedToday, prettyDate} from '../game/daily';
import {formatScore} from '../game/format';
import type {DailyState} from '../game/progress';

type Props = {
  daily: DailyState;
  onStart: () => void;
  onViewResult: () => void;
  onMenu: () => void;
};

/** One timed attempt a day, with a modifier picked by the date seed. */
export function DailyChallengeScreen({daily, onStart, onViewResult, onMenu}: Props) {
  const today = useMemo(() => dateKey(), []);
  const modifier = useMemo(() => modifierForDate(today), [today]);
  const done = playedToday(daily.lastPlayedKey, today);
  const hasRecord = daily.bestScore > 0;

  return (
    <GardenBackdrop variant="sheet">
      <ScreenHeader
        title="DAILY CHALLENGE"
        subtitle="ONE TRY PER DAY"
        left="menu"
        onLeft={onMenu}
        right={
          <View style={styles.streak}>
            <StreakIcon size={16} color={colors.lemon} />
            <Text style={styles.streakText}>STREAK {daily.streak}</Text>
          </View>
        }
      />

      <View style={styles.body}>
        <View style={styles.card}>
          <View pointerEvents="none" style={styles.topLight} />
          <Text style={styles.date}>{prettyDate()}</Text>
          <Text style={styles.modifier}>{modifier.name}</Text>
          <Text style={styles.description}>{modifier.description}</Text>

          <View style={styles.ruleRow}>
            <ClockIcon size={18} color={colors.secondary} />
            <Text style={styles.ruleText}>90 SECONDS · NO MOVE LIMIT · ONE TRY PER DAY</Text>
          </View>

          <View style={styles.recordRow}>
            <View style={styles.recordText}>
              <Text style={styles.recordLabel}>BEST RUN</Text>
              <Text style={styles.recordValue}>
                {hasRecord ? formatScore(daily.bestScore) : 'NOT PLAYED YET'}
              </Text>
            </View>
            {hasRecord ? <StarRow earned={daily.bestStars} total={3} size={18} /> : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Text style={styles.hint}>
            {done
              ? 'TODAY IS DONE · THE NEXT MODIFIER ARRIVES TOMORROW'
              : 'THE DRIP POT STILL APPLIES · CHAINS SCORE THE MOST'}
          </Text>
          {done ? (
            <>
              <View style={styles.closedPanel}>
                <Text style={styles.closedText}>COME BACK TOMORROW</Text>
              </View>
              {daily.lastSummary ? (
                <SecondaryButton
                  label="VIEW TODAY RESULT"
                  Icon={EyeIcon}
                  onPress={onViewResult}
                  height={52}
                />
              ) : null}
            </>
          ) : (
            <PrimaryButton
              label="START CHALLENGE"
              Icon={PlayIcon}
              onPress={onStart}
              height={60}
            />
          )}
        </View>
      </View>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  streak: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  streakText: {fontSize: 11, lineHeight: 15, fontWeight: '900', letterSpacing: 0.8, color: colors.text},
  body: {flex: 1, paddingHorizontal: 20, paddingBottom: 22, justifyContent: 'space-between'},
  card: {
    marginTop: 6,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 20,
    gap: 8,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  topLight: {
    position: 'absolute',
    left: 26,
    right: 26,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  date: {fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 2, color: colors.textSoft},
  modifier: {fontSize: 24, lineHeight: 30, fontWeight: '900', letterSpacing: 0.6, color: colors.text},
  description: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.textSoft},
  ruleRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  ruleText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.text,
  },
  recordRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  recordText: {gap: 2},
  recordLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textSoft,
  },
  recordValue: {fontSize: 18, lineHeight: 24, fontWeight: '900', color: colors.primary},
  actions: {gap: 10},
  hint: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: 2,
  },
  closedPanel: {
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.textMute,
  },
});

export default DailyChallengeScreen;
