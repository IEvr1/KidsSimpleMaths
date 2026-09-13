import { Pressable, StyleSheet, Text } from 'react-native';

import { operationColors } from '@/src/theme/colors';
import { layout, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import type { Operation } from '@/src/logic/types';

type Props = {
  operation: Operation;
  label: string;
  onPress: () => void;
};

const symbols: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

export function OperationButton({ operation, label, onPress }: Props) {
  const color = operationColors[operation];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, borderColor: color },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.symbol}>{symbols[operation]}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 100,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 3,
    borderBottomWidth: 6,
    gap: spacing.xs,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 4,
  },
  symbol: {
    fontSize: 36,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
  },
  label: {
    ...typography.label,
    color: '#fff',
    textAlign: 'center',
  },
});
