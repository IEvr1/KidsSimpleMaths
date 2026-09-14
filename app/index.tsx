import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

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
  const { points, goal, childName } = useApp();

  const goPractice = (op?: Operation) => {
    if (op) {
      router.push({ pathname: '/practice', params: { op } });
    } else {
      const randomOp = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      router.push({ pathname: '/practice', params: { op: randomOp } });
    }
  };

  return (
    <ScreenLayout
      onSettingsPress={() => router.push('/parent')}
      settingsLabel={t('settings')}
    >
      <View style={styles.hero}>
        <Text style={styles.title}>{t('appName')}</Text>
        {childName ? (
          <Text style={styles.greeting}>{t('greeting', { name: childName })}</Text>
        ) : null}
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

    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.hero,
    color: colors.ink,
    textAlign: 'center',
  },
  greeting: {
    ...typography.subtitle,
    color: colors.grassDark,
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
});
