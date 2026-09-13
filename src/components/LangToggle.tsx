import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/src/context/AppContext';
import type { Language } from '@/src/i18n';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export function LangToggle() {
  const { language, setLanguage } = useApp();

  const renderButton = (lang: Language, label: string) => {
    const active = language === lang;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => setLanguage(lang)}
        style={[styles.langBtn, active && styles.langBtnActive]}
      >
        <Text style={[styles.langText, active && styles.langTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {renderButton('el', 'ΕΛ')}
      <Text style={styles.divider}>|</Text>
      {renderButton('en', 'EN')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  langBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: colors.skyLight,
  },
  langText: {
    ...typography.label,
    color: colors.inkMuted,
  },
  langTextActive: {
    color: colors.skyDark,
  },
  divider: {
    color: colors.inkMuted,
    fontSize: 14,
  },
});
