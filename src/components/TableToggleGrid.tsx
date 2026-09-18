import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TABLE_COUNT, type TableSelection } from '@/src/logic/tableSelection';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  selection: TableSelection;
  onChange: (next: TableSelection) => void;
  disabledNumbers?: number[];
};

export function TableToggleGrid({ selection, onChange, disabledNumbers = [] }: Props) {
  const disabled = new Set(disabledNumbers);

  return (
    <View style={styles.grid}>
      {Array.from({ length: TABLE_COUNT }, (_, index) => {
        const isDisabled = disabled.has(index);
        const isSelected = selection[index];

        return (
          <Pressable
            key={index}
            disabled={isDisabled}
            onPress={() => {
              const next = [...selection];
              next[index] = !next[index];
              onChange(next);
            }}
            style={[
              styles.cell,
              isSelected && styles.cellSelected,
              isDisabled && styles.cellDisabled,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected, disabled: isDisabled }}
          >
            <Text
              style={[
                styles.cellText,
                isSelected && styles.cellTextSelected,
                isDisabled && styles.cellTextDisabled,
              ]}
            >
              {index}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.sky,
    backgroundColor: colors.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    borderColor: colors.coral,
    backgroundColor: colors.coralLight,
  },
  cellDisabled: {
    opacity: 0.35,
    borderColor: colors.inkMuted,
  },
  cellText: {
    ...typography.label,
    fontSize: 16,
    color: colors.ink,
  },
  cellTextSelected: {
    color: colors.coral,
  },
  cellTextDisabled: {
    color: colors.inkMuted,
  },
});
