import React, {memo, useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';
import type {IconComponent} from './PrimaryButton';

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

function Toggle({on, onPress, label}: {on: boolean; onPress: () => void; label: string}) {
  const slide = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: on ? 1 : 0,
      useNativeDriver: true,
      tension: 200,
      friction: 16,
    }).start();
  }, [on, slide]);

  const translateX = slide.interpolate({inputRange: [0, 1], outputRange: [0, 24]});

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="switch"
      accessibilityState={{checked: on}}
      accessibilityLabel={label}
      style={[styles.track, on ? styles.trackOn : null]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.knob, {transform: [{translateX}]}]}
      />
    </Pressable>
  );
}

function Segment({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map(option => {
        const on = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityState={{selected: on}}
            accessibilityLabel={option}
            style={[styles.segmentItem, on ? styles.segmentItemOn : null]}>
            <Text style={[styles.segmentText, on ? styles.segmentTextOn : null]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type Props = {
  label: string;
  caption: string;
  Icon: IconComponent;
  tint?: string;
} & (
  | {control: 'toggle'; value: boolean; onToggle: () => void}
  | {control: 'segment'; options: string[]; value: string; onSelect: (next: string) => void}
  | {control: 'danger'; actionLabel: string; onAction: () => void}
);

/** One settings card. Every control here changes real behaviour — nothing decorative. */
function SettingRowBase(props: Props) {
  const {label, caption, Icon, tint = colors.primary} = props;
  const danger = props.control === 'danger';

  return (
    <View style={styles.row}>
      <View style={[styles.disc, {backgroundColor: `${danger ? colors.danger : tint}1A`}]}>
        <Icon size={22} color={danger ? colors.danger : tint} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, danger ? styles.labelDanger : null]}>{label}</Text>
        <Text numberOfLines={2} style={styles.caption}>
          {caption}
        </Text>
      </View>
      <View style={styles.control}>
        {props.control === 'toggle' ? (
          <Toggle on={props.value} onPress={props.onToggle} label={label} />
        ) : null}
        {props.control === 'segment' ? (
          <Segment options={props.options} value={props.value} onChange={props.onSelect} />
        ) : null}
        {props.control === 'danger' ? (
          <Pressable
            onPress={props.onAction}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={props.actionLabel}
            style={styles.dangerButton}>
            <Text style={styles.dangerText}>{props.actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  disc: {width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center'},
  text: {flex: 1, gap: 2},
  label: {fontSize: 14, lineHeight: 19, fontWeight: '900', letterSpacing: 0.6, color: colors.text},
  labelDanger: {color: colors.danger},
  caption: {fontSize: 10, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8, color: colors.textSoft},
  control: {alignItems: 'flex-end', justifyContent: 'center'},
  track: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 3,
    backgroundColor: colors.borderDeep,
    justifyContent: 'center',
  },
  trackOn: {backgroundColor: colors.primary},
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  segmentItem: {
    width: 54,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemOn: {backgroundColor: colors.primary},
  segmentText: {fontSize: 11, lineHeight: 15, fontWeight: '900', letterSpacing: 1, color: colors.textSoft},
  segmentTextOn: {color: colors.onDark},
  dangerButton: {
    width: 92,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE6EA',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  dangerText: {fontSize: 11, lineHeight: 15, fontWeight: '900', letterSpacing: 1, color: colors.danger},
});

export const SettingRow = memo(SettingRowBase);
export default SettingRow;
