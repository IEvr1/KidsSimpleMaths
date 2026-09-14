import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/colors';
import { layout, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
};

export function PrimaryButton({ label, onPress, variant = 'primary', compact }: Props) {
  const bg =
    variant === 'primary'
      ? colors.sun
      : variant === 'danger'
        ? colors.coral
        : colors.sky;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        Platform.OS === 'web' && styles.buttonWeb,
        { backgroundColor: bg },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWeb: {
    cursor: 'pointer',
  },
  buttonCompact: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 3,
    zIndex: 2,
  },
  button: {
    minHeight: layout.buttonMinHeight,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  pressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 3,
  },
  text: {
    ...typography.subtitle,
    color: colors.white,
  },
});
