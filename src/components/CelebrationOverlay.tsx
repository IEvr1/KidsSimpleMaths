import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  visible: boolean;
  message: string;
  subtitle?: string;
  buttonLabel: string;
  onDismiss: () => void;
};

const CONFETTI = [
  { color: colors.sun, top: '18%', left: '12%', size: 14 },
  { color: colors.grass, top: '22%', right: '14%', size: 12 },
  { color: colors.sky, top: '38%', left: '8%', size: 10 },
  { color: colors.coral, top: '34%', right: '10%', size: 16 },
  { color: colors.sunDark, bottom: '28%', left: '16%', size: 11 },
  { color: colors.grassDark, bottom: '24%', right: '18%', size: 13 },
] as const;

export function CelebrationOverlay({
  visible,
  message,
  subtitle,
  buttonLabel,
  onDismiss,
}: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.6);
      opacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scale, opacity]);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        {CONFETTI.map((piece, index) => (
          <View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                borderRadius: piece.size / 2,
                top: 'top' in piece ? piece.top : undefined,
                bottom: 'bottom' in piece ? piece.bottom : undefined,
                left: 'left' in piece ? piece.left : undefined,
                right: 'right' in piece ? piece.right : undefined,
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.trophy}>
            <Text style={styles.trophyText}>★</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <PrimaryButton label={buttonLabel} onPress={onDismiss} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  confetti: {
    position: 'absolute',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 4,
    borderColor: colors.sun,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  trophy: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.sunDark,
  },
  trophyText: {
    fontSize: 48,
    color: colors.white,
  },
  message: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.grassDark,
    textAlign: 'center',
  },
});
