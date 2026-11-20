import React, {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';

type Props = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
};

const HIT = {top: 8, bottom: 8, left: 8, right: 8};

function TabBarBase({tabs, active, onChange}: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map(tab => {
        const on = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            hitSlop={HIT}
            accessibilityRole="tab"
            accessibilityState={{selected: on}}
            accessibilityLabel={tab}
            style={[styles.tab, on ? styles.tabOn : null]}>
            <Text style={[styles.label, on ? styles.labelOn : null]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 8,
    height: 48,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabOn: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.textSoft,
  },
  labelOn: {color: colors.onDark},
});

export const TabBar = memo(TabBarBase);
export default TabBar;
