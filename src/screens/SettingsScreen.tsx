import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';
import {ScreenHeader} from '../components/ScreenHeader';
import {SettingRow} from '../components/SettingRow';
import {ConfirmPopup} from '../components/ConfirmPopup';
import {CalmIcon, EraseIcon, EyeIcon, GridIcon, TargetIcon} from '../components/icons';
import type {MotionMode, Settings} from '../game/progress';

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onErase: () => void;
  onMenu: () => void;
};

const MOTION_OPTIONS = ['FULL', 'CALM'];

/** Every option here changes real behaviour. There is no audio in the app, so no audio switch. */
export function SettingsScreen({settings, onChange, onErase, onMenu}: Props) {
  const [confirming, setConfirming] = useState(false);

  const toggleBig = useCallback(
    () => onChange({bigCandy: !settings.bigCandy}),
    [onChange, settings.bigCandy],
  );
  const toggleContrast = useCallback(
    () => onChange({highContrast: !settings.highContrast}),
    [onChange, settings.highContrast],
  );
  const toggleGuide = useCallback(
    () => onChange({swapGuide: !settings.swapGuide}),
    [onChange, settings.swapGuide],
  );
  const selectMotion = useCallback(
    (next: string) => onChange({motion: next as MotionMode}),
    [onChange],
  );
  const ask = useCallback(() => setConfirming(true), []);
  const cancel = useCallback(() => setConfirming(false), []);
  const confirm = useCallback(() => {
    setConfirming(false);
    onErase();
  }, [onErase]);

  return (
    <GardenBackdrop variant="sheet">
      <ScreenHeader title="SETTINGS" subtitle="HOW THE GARDEN PLAYS" left="menu" onLeft={onMenu} />

      <View style={styles.body}>
        <View style={styles.rows}>
          <SettingRow
            label="BIG CANDY MODE"
            caption="LARGER TILES, SMALLER BOARD"
            Icon={GridIcon}
            tint={colors.primary}
            control="toggle"
            value={settings.bigCandy}
            onToggle={toggleBig}
          />
          <SettingRow
            label="HIGH CONTRAST CANDIES"
            caption="SHAPE MARKS ON EVERY CANDY"
            Icon={EyeIcon}
            tint={colors.secondary}
            control="toggle"
            value={settings.highContrast}
            onToggle={toggleContrast}
          />
          <SettingRow
            label="SWAP GUIDE"
            caption="HIGHLIGHT LEGAL NEIGHBOURS"
            Icon={TargetIcon}
            tint={colors.mint}
            control="toggle"
            value={settings.swapGuide}
            onToggle={toggleGuide}
          />
          <SettingRow
            label="MOTION"
            caption="ANIMATION AMOUNT"
            Icon={CalmIcon}
            tint={colors.lemon}
            control="segment"
            options={MOTION_OPTIONS}
            value={settings.motion}
            onSelect={selectMotion}
          />
          <SettingRow
            label="RESET PROGRESS"
            caption="STARS, STAGES, RECIPES AND REWARDS"
            Icon={EraseIcon}
            control="danger"
            actionLabel="ERASE"
            onAction={ask}
          />
        </View>

        <Text style={styles.footer}>18+ · VIRTUAL STARS ONLY · NO REAL MONEY</Text>
      </View>

      <ConfirmPopup
        visible={confirming}
        danger
        title="ERASE EVERYTHING?"
        caption="Stars, stage records, recipes, ingredients, decorations and the daily streak all go back to the start."
        actions={[{label: 'ERASE', onPress: confirm, Icon: EraseIcon}]}
        cancelLabel="KEEP"
        onCancel={cancel}
      />
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  body: {flex: 1, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 18, justifyContent: 'space-between'},
  rows: {gap: 10},
  footer: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textMute,
    textAlign: 'center',
  },
  spacer: {height: radius.sm},
});

export default SettingsScreen;
