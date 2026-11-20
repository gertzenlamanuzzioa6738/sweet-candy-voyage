import React, {memo} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import type {IconComponent} from './PrimaryButton';

export type PopupAction = {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  tone?: 'pink' | 'mint' | 'grape';
};

type Props = {
  visible: boolean;
  title: string;
  caption?: string;
  /** primary actions, each with its own caption; stacked top to bottom */
  actions: PopupAction[];
  cancelLabel: string;
  onCancel: () => void;
  danger?: boolean;
};

/** Pause, leave-stage and erase-progress all use this one popup. */
function ConfirmPopupBase({
  visible,
  title,
  caption,
  actions,
  cancelLabel,
  onCancel,
  danger = false,
}: Props) {
  if (!visible) {
    return null;
  }
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <View pointerEvents="none" style={styles.topLight} />
          <Text style={[styles.title, danger ? styles.titleDanger : null]}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
          <View style={styles.actions}>
            {actions.map(action => (
              <PrimaryButton
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                Icon={action.Icon}
                tone={action.tone || 'pink'}
                height={54}
              />
            ))}
            <SecondaryButton label={cancelLabel} onPress={onCancel} height={48} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(74,32,64,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.3,
    shadowRadius: 26,
    elevation: 14,
  },
  topLight: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: colors.text,
    textAlign: 'center',
  },
  titleDanger: {color: colors.danger},
  caption: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: colors.textSoft,
    textAlign: 'center',
  },
  actions: {marginTop: 20, gap: 10},
});

export const ConfirmPopup = memo(ConfirmPopupBase);
export default ConfirmPopup;
