import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  current: number;
  goal: number;
  label?: string;
  large?: boolean;
  compact?: boolean;
};

export function ProgressBar({ current, goal, label, large, compact }: Props) {
  const percent = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.track, large && styles.trackLarge, compact && styles.trackCompact]}>
        <View style={[styles.fill, { width: `${percent}%` }, large && styles.fillLarge]} />
      </View>
      {!compact ? (
        <Text style={[styles.percent, large && styles.percentLarge]}>{percent}%</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.sm,
  },
  wrapperCompact: {
    gap: spacing.xs,
  },
  trackCompact: {
    height: 10,
  },
  label: {
    ...typography.label,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  track: {
    height: 14,
    backgroundColor: colors.white,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.skyLight,
  },
  trackLarge: {
    height: 22,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.grass,
    borderRadius: 999,
  },
  fillLarge: {
    backgroundColor: colors.sun,
  },
  percent: {
    ...typography.label,
    color: colors.inkMuted,
    textAlign: 'right',
  },
  percentLarge: {
    fontSize: 18,
    color: colors.ink,
  },
});
