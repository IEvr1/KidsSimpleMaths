import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  MULTIPLIER_ZONES,
  type MultiplierZone,
} from '@/src/logic/multiplierZone';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  value: MultiplierZone;
  onChange: (zone: MultiplierZone) => void;
  labels: Record<MultiplierZone, string>;
};

export function MultiplierZonePicker({ value, onChange, labels }: Props) {
  return (
    <View style={styles.row}>
      {MULTIPLIER_ZONES.map((zone) => {
        const isSelected = value === zone;
        return (
          <Pressable
            key={zone}
            onPress={() => onChange(zone)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {labels[zone]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    minWidth: 72,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.sky,
    backgroundColor: colors.cloud,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: colors.coral,
    backgroundColor: colors.coralLight,
  },
  chipText: {
    ...typography.label,
    fontSize: 15,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.coral,
  },
});
