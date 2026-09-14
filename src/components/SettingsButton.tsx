import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function SettingsButton({ onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>⚙</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  pressed: {
    backgroundColor: colors.skyLight,
    transform: [{ scale: 0.96 }],
  },
  icon: {
    fontSize: 22,
    color: colors.inkMuted,
    lineHeight: 24,
  },
});
