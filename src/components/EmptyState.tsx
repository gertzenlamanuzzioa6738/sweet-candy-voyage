import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import type {IconComponent} from './PrimaryButton';

type Props = {
  Icon: IconComponent;
  title: string;
  caption: string;
};

/** Any list or tab that can be empty shows this, never a blank area. */
function EmptyStateBase({Icon, title, caption}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.disc}>
        <Icon size={44} color={colors.textMute} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  disc: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceMute,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.text,
    textAlign: 'center',
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.textSoft,
    textAlign: 'center',
  },
  spacer: {height: radius.sm},
});

export const EmptyState = memo(EmptyStateBase);
export default EmptyState;
