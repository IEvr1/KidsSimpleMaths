import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LangToggle } from './LangToggle';
import { SettingsButton } from './SettingsButton';
import { colors } from '@/src/theme/colors';
import { layout, spacing } from '@/src/theme/spacing';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  showLangToggle?: boolean;
  onSettingsPress?: () => void;
  settingsLabel?: string;
  keyboardAvoiding?: boolean;
  compact?: boolean;
};

export function ScreenLayout({
  children,
  scroll = true,
  showLangToggle = true,
  onSettingsPress,
  settingsLabel = 'Settings',
  keyboardAvoiding = false,
  compact = false,
}: Props) {
  const content = (
    <View
      style={[
        styles.inner,
        compact && styles.innerCompact,
        scroll && styles.innerScroll,
      ]}
    >
      {showLangToggle || onSettingsPress ? (
        <View style={styles.topBar}>
          {onSettingsPress ? (
            <SettingsButton
              accessibilityLabel={settingsLabel}
              onPress={onSettingsPress}
            />
          ) : null}
          {showLangToggle ? <LangToggle /> : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {content}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, compact && styles.noScrollContent]}>{content}</View>
  );

  return (
    <LinearGradient colors={[colors.skyLight, colors.cloud, '#FFF8EE']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
          >
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    gap: spacing.lg,
  },
  innerCompact: {
    gap: spacing.sm,
  },
  innerScroll: {
    paddingBottom: spacing.xl,
  },
  noScrollContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
