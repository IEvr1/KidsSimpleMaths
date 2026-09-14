import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useApp } from '@/src/context/AppContext';
import { useI18n } from '@/src/i18n/context';
import {
  DEFAULT_ADD_SUB_MAX,
  DEFAULT_DIVIDE_MAX,
  DEFAULT_MULTIPLY_MAX,
  clampAddSubMax,
  clampDivideMax,
  clampMultiplyMax,
} from '@/src/logic/limits';
import { goHome } from '@/src/navigation/goHome';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function ParentScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    goal,
    parentPin,
    childName,
    updateGoal,
    updatePin,
    addSubMax,
    multiplyMax,
    divideMax,
    updateChildName,
    updateAddSubMax,
    updateMultiplyMax,
    updateDivideMax,
    resetPoints,
  } = useApp();

  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goal));
  const [nameInput, setNameInput] = useState(childName);
  const [addSubInput, setAddSubInput] = useState(String(addSubMax));
  const [multiplyInput, setMultiplyInput] = useState(String(multiplyMax));
  const [divideInput, setDivideInput] = useState(String(divideMax));
  const [newPin, setNewPin] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  const loadSettings = () => {
    setGoalInput(String(goal));
    setNameInput(childName);
    setAddSubInput(String(addSubMax));
    setMultiplyInput(String(multiplyMax));
    setDivideInput(String(divideMax));
  };

  const tryUnlock = () => {
    if (pinInput === parentPin) {
      setUnlocked(true);
      setPinError(false);
      loadSettings();
    } else {
      setPinError(true);
    }
  };

  const saveSettings = () => {
    const parsedGoal = parseInt(goalInput, 10);
    if (parsedGoal >= 10 && parsedGoal <= 500) {
      updateGoal(parsedGoal);
    }

    updateChildName(nameInput.trim().slice(0, 20));

    const parsedAddSub = parseInt(addSubInput, 10);
    if (!Number.isNaN(parsedAddSub)) {
      updateAddSubMax(clampAddSubMax(parsedAddSub));
    }

    const parsedMultiply = parseInt(multiplyInput, 10);
    if (!Number.isNaN(parsedMultiply)) {
      updateMultiplyMax(clampMultiplyMax(parsedMultiply));
    }

    const parsedDivide = parseInt(divideInput, 10);
    if (!Number.isNaN(parsedDivide)) {
      updateDivideMax(clampDivideMax(parsedDivide));
    }

    if (newPin.length === 4 && /^\d{4}$/.test(newPin)) {
      updatePin(newPin);
      setNewPin('');
    }

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const confirmReset = () => {
    Alert.alert(t('resetPoints'), t('resetConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: () => resetPoints(),
      },
    ]);
  };

  if (!unlocked) {
    return (
      <ScreenLayout>
        <View style={styles.header}>
          <PrimaryButton label={t('back')} onPress={() => goHome(router)} variant="secondary" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('parentTitle')}</Text>
          <Text style={styles.hint}>{t('enterPin')}</Text>
          <Text style={styles.defaultHint}>{t('defaultPinHint')}</Text>

          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            style={[styles.input, pinError && styles.inputError]}
            value={pinInput}
            onChangeText={(v) => {
              setPinInput(v.replace(/\D/g, '').slice(0, 4));
              setPinError(false);
            }}
            placeholder="••••"
            placeholderTextColor={colors.inkMuted}
          />

          {pinError ? <Text style={styles.errorText}>{t('wrongPin')}</Text> : null}

          <PrimaryButton label={t('enterPin')} onPress={tryUnlock} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <PrimaryButton label={t('back')} onPress={() => goHome(router)} variant="secondary" />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{t('parentTitle')}</Text>

        <Text style={styles.label}>{t('childName')}</Text>
        <TextInput
          style={styles.inputText}
          value={nameInput}
          onChangeText={setNameInput}
          placeholder={t('childNamePlaceholder')}
          placeholderTextColor={colors.inkMuted}
          maxLength={20}
        />

        <Text style={styles.label}>{t('setGoal')}</Text>
        <TextInput
          keyboardType="number-pad"
          style={styles.input}
          value={goalInput}
          onChangeText={(v) => setGoalInput(v.replace(/\D/g, '').slice(0, 3))}
        />

        <Text style={styles.sectionTitle}>{t('settingsMath')}</Text>
        <Text style={styles.hintSmall}>{t('mathMaxHint')}</Text>

        <Text style={styles.label}>{t('addSubMax')}</Text>
        <TextInput
          keyboardType="number-pad"
          style={styles.input}
          value={addSubInput}
          onChangeText={(v) => setAddSubInput(v.replace(/\D/g, '').slice(0, 3))}
          placeholder={String(DEFAULT_ADD_SUB_MAX)}
          placeholderTextColor={colors.inkMuted}
        />

        <Text style={styles.label}>{t('multiplyMax')}</Text>
        <TextInput
          keyboardType="number-pad"
          style={styles.input}
          value={multiplyInput}
          onChangeText={(v) => setMultiplyInput(v.replace(/\D/g, '').slice(0, 2))}
          placeholder={String(DEFAULT_MULTIPLY_MAX)}
          placeholderTextColor={colors.inkMuted}
        />

        <Text style={styles.label}>{t('divideMax')}</Text>
        <TextInput
          keyboardType="number-pad"
          style={styles.input}
          value={divideInput}
          onChangeText={(v) => setDivideInput(v.replace(/\D/g, '').slice(0, 2))}
          placeholder={String(DEFAULT_DIVIDE_MAX)}
          placeholderTextColor={colors.inkMuted}
        />

        <Text style={styles.label}>{t('setPin')}</Text>
        <TextInput
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          style={styles.input}
          value={newPin}
          onChangeText={(v) => setNewPin(v.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          placeholderTextColor={colors.inkMuted}
        />

        <PrimaryButton label={t('saveSettings')} onPress={saveSettings} />

        {savedMsg ? <Text style={styles.saved}>{t('saved')}</Text> : null}

        <Pressable onPress={confirmReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>{t('resetPoints')}</Text>
        </Pressable>
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
    gap: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  hintSmall: {
    ...typography.label,
    color: colors.inkMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  defaultHint: {
    ...typography.label,
    color: colors.inkMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.sky,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 20,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.ink,
    backgroundColor: colors.cloud,
    textAlign: 'center',
  },
  inputText: {
    borderWidth: 2,
    borderColor: colors.sky,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 20,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.ink,
    backgroundColor: colors.cloud,
    textAlign: 'left',
  },
  inputError: {
    borderColor: colors.coral,
  },
  errorText: {
    ...typography.label,
    color: colors.coral,
    textAlign: 'center',
  },
  saved: {
    ...typography.label,
    color: colors.grassDark,
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  resetText: {
    ...typography.label,
    color: colors.coral,
  },
});
