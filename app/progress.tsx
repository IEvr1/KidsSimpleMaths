import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useApp } from '@/src/context/AppContext';
import { formatPoints } from '@/src/logic/formatPoints';
import { useI18n } from '@/src/i18n/context';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function ProgressScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { points, goal, streak, goalReached } = useApp();
  const percent = goal > 0 ? Math.min(100, Math.round((points / goal) * 100)) : 0;

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <PrimaryButton label={t('back')} onPress={() => router.back()} variant="secondary" />
      </View>

      <View style={styles.card}>
        <View style={[styles.badge, goalReached && styles.badgeReached]}>
          <Text style={styles.badgeText}>{goalReached ? 'OK' : 'GO'}</Text>
        </View>
        <Text style={styles.title}>{t('progressTitle')}</Text>
        <Text style={styles.subtitle}>{t('progressSubtitle')}</Text>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatPoints(points)}</Text>
            <Text style={styles.statLabel}>{t('points')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{goal}</Text>
            <Text style={styles.statLabel}>{t('goal')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{t('streakLabel')}</Text>
          </View>
        </View>

        <ProgressBar
          current={points}
          goal={goal}
          label={t('pointsOfGoal', { current: formatPoints(points), goal })}
          large
        />

        <Text style={styles.percent}>{t('percentComplete', { percent })}</Text>

        {goalReached ? (
          <View style={styles.reachedBanner}>
            <Text style={styles.reachedText}>{t('goalReached')}</Text>
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeReached: {
    backgroundColor: colors.grass,
  },
  badgeText: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.white,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.skyLight,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    color: colors.skyDark,
  },
  statLabel: {
    ...typography.label,
    color: colors.inkMuted,
    fontSize: 13,
  },
  percent: {
    ...typography.subtitle,
    color: colors.grassDark,
  },
  reachedBanner: {
    backgroundColor: '#E8F9EB',
    borderRadius: 16,
    padding: spacing.md,
    width: '100%',
  },
  reachedText: {
    ...typography.subtitle,
    color: colors.grassDark,
    textAlign: 'center',
  },
});
