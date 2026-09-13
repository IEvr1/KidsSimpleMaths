import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OperationButton } from '@/src/components/OperationButton';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useApp } from '@/src/context/AppContext';
import { useI18n } from '@/src/i18n/context';
import { formatPoints } from '@/src/logic/formatPoints';
import type { Operation } from '@/src/logic/types';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const OPERATIONS: Operation[] = ['add', 'subtract', 'multiply', 'divide'];

export default function HomeScreen() {
  const router = useRouter();
  const { t, tOperation } = useI18n();
  const { points, goal } = useApp();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goPractice = (op?: Operation) => {
    if (op) {
      router.push({ pathname: '/practice', params: { op } });
    } else {
      const randomOp = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      router.push({ pathname: '/practice', params: { op: randomOp } });
    }
  };

  const startHold = () => {
    holdTimer.current = setTimeout(() => {
      router.push('/parent');
    }, 3000);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.hero}>
        <View style={styles.mascot}>
          <Text style={styles.mascotSymbol}>+</Text>
        </View>
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>
          {t('pointsOfGoal', { current: formatPoints(points), goal })}
        </Text>
        <ProgressBar current={points} goal={goal} large />
      </View>

      <PrimaryButton label={t('start')} onPress={() => goPractice()} />

      <Text style={styles.sectionTitle}>{t('chooseOperation')}</Text>
      <View style={styles.opsGrid}>
        <View style={styles.opsRow}>
          <OperationButton
            operation="add"
            label={tOperation('add')}
            onPress={() => goPractice('add')}
          />
          <OperationButton
            operation="subtract"
            label={tOperation('subtract')}
            onPress={() => goPractice('subtract')}
          />
        </View>
        <View style={styles.opsRow}>
          <OperationButton
            operation="multiply"
            label={tOperation('multiply')}
            onPress={() => goPractice('multiply')}
          />
          <OperationButton
            operation="divide"
            label={tOperation('divide')}
            onPress={() => goPractice('divide')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('progress')}
          onPress={() => router.push('/progress')}
          variant="secondary"
        />
        <Pressable
          accessibilityHint={t('holdToOpen')}
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={styles.parentHint}
        >
          <Text style={styles.parentHintText}>{t('holdToOpen')}</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  mascot: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.sunDark,
  },
  mascotSymbol: {
    fontSize: 48,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.white,
  },
  title: {
    ...typography.hero,
    color: colors.ink,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  progressLabel: {
    ...typography.subtitle,
    color: colors.ink,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.ink,
    textAlign: 'center',
  },
  opsGrid: {
    gap: spacing.md,
  },
  opsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  parentHint: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  parentHintText: {
    ...typography.label,
    color: colors.inkMuted,
    fontSize: 14,
  },
});
