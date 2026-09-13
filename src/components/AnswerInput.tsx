import { RefObject } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/src/theme/colors';
import { layout, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  enterHint?: string;
  disabled?: boolean;
  inputRef?: RefObject<TextInput | null>;
  state?: 'default' | 'correct' | 'wrong';
  compact?: boolean;
};

export function AnswerInput({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  submitLabel,
  enterHint,
  disabled,
  inputRef,
  state = 'default',
  compact,
}: Props) {
  const borderColor =
    state === 'correct' ? colors.grass : state === 'wrong' ? colors.coral : colors.sky;

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <TextInput
        ref={inputRef}
        accessibilityLabel={placeholder}
        editable={!disabled}
        keyboardType={Platform.OS === 'web' ? 'default' : 'number-pad'}
        maxLength={4}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, ''))}
        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key)}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        returnKeyType="done"
        submitBehavior="submit"
        {...(Platform.OS === 'web' ? { inputMode: 'numeric' as const } : {})}
        style={[
          styles.input,
          compact && styles.inputCompact,
          { borderColor },
          disabled && styles.inputDisabled,
        ]}
        value={value}
      />
      {enterHint ? (
        <Text style={[styles.hint, compact && styles.hintCompact]}>{enterHint}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submitBtn,
          compact && styles.submitBtnCompact,
          disabled && styles.submitDisabled,
          pressed && !disabled && styles.submitPressed,
        ]}
      >
        <Text style={[styles.submitText, compact && styles.submitTextCompact]}>
          {submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
    width: '100%',
  },
  wrapperCompact: {
    gap: spacing.sm,
  },
  input: {
    minHeight: layout.buttonMinHeight + 8,
    backgroundColor: colors.white,
    borderRadius: layout.borderRadius,
    borderWidth: 3,
    paddingHorizontal: spacing.lg,
    ...typography.question,
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  inputCompact: {
    minHeight: 52,
    fontSize: 30,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
  },
  inputDisabled: {
    opacity: 0.85,
  },
  hint: {
    ...typography.label,
    color: colors.inkMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  hintCompact: {
    fontSize: 12,
    marginTop: -2,
  },
  submitBtn: {
    minHeight: layout.buttonMinHeight,
    backgroundColor: colors.sun,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  submitBtnCompact: {
    minHeight: 48,
    borderRadius: 16,
    borderBottomWidth: 4,
  },
  submitPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 3,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...typography.subtitle,
    color: colors.white,
  },
  submitTextCompact: {
    fontSize: 18,
  },
});
