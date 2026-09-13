import { Modal, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  visible: boolean;
  message: string;
  buttonLabel: string;
  onDismiss: () => void;
};

export function CelebrationOverlay({ visible, message, buttonLabel, onDismiss }: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.star}>*</Text>
          <Text style={styles.message}>{message}</Text>
          <PrimaryButton label={buttonLabel} onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  star: {
    fontSize: 72,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.sun,
  },
  message: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
});
