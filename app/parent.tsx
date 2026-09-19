import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { SettingZonePicker } from '@/src/components/MultiplierZonePicker';
import { TableToggleGrid } from '@/src/components/TableToggleGrid';
import { useApp } from '@/src/context/AppContext';
import { useI18n } from '@/src/i18n/context';
import { DEFAULT_ADD_SUB_MAX, clampAddSubMax } from '@/src/logic/limits';
import type { MultiplierZone } from '@/src/logic/multiplierZone';
import { MULTIPLIER_ZONES } from '@/src/logic/multiplierZone';
import type { SumZone } from '@/src/logic/sumZone';
import { SUM_ZONES } from '@/src/logic/sumZone';
import {
  mergeMulDivTableSelections,
  type TableSelection,
} from '@/src/logic/tableSelection';
import { goHome } from '@/src/navigation/goHome';
import { resetDifficultyStore } from '@/src/storage/difficulty';
import { confirmAction } from '@/src/utils/confirmAction';
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
    multiplyTables,
    divideDivisors,
    multiplierZone,
    sumZone,
    updateChildName,
    updateAddSubSettings,
    updateMulDivTables,
    updateMultiplierZone,
    resetPoints,
  } = useApp();

  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goal));
  const [nameInput, setNameInput] = useState(childName);
  const [addSubInput, setAddSubInput] = useState(String(addSubMax));
  const [mulDivSelection, setMulDivSelection] = useState<TableSelection>(() =>
    mergeMulDivTableSelections(multiplyTables, divideDivisors),
  );
  const [multiplierZoneSelection, setMultiplierZoneSelection] =
    useState<MultiplierZone>(multiplierZone);
  const [sumZoneSelection, setSumZoneSelection] = useState<SumZone>(sumZone);
  const [newPin, setNewPin] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const loadSettings = () => {
    setGoalInput(String(goal));
    setNameInput(childName);
    setAddSubInput(String(addSubMax));
    setMulDivSelection(mergeMulDivTableSelections(multiplyTables, divideDivisors));
    setMultiplierZoneSelection(multiplierZone);
    setSumZoneSelection(sumZone);
  };

  const sumZoneLabels: Record<SumZone, string> = {
    '0-8': t('sumZone_0-8'),
    '9-19': t('sumZone_9-19'),
    '0-19': t('sumZone_0-19'),
  };

  const multiplierZoneLabels: Record<MultiplierZone, string> = {
    '0-3': t('multiplierZone_0-3'),
    '4-9': t('multiplierZone_4-9'),
    '0-10': t('multiplierZone_0-10'),
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
    const addSubValue = !Number.isNaN(parsedAddSub)
      ? clampAddSubMax(parsedAddSub)
      : addSubMax;
    updateAddSubSettings(addSubValue, sumZoneSelection);

    updateMulDivTables(mulDivSelection);
    updateMultiplierZone(multiplierZoneSelection);

    if (newPin.length === 4 && /^\d{4}$/.test(newPin)) {
      updatePin(newPin);
      setNewPin('');
    }

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const showResetMsg = (message: string) => {
    setResetMsg(message);
    setTimeout(() => setResetMsg(null), 2000);
  };

  const confirmReset = () => {
    confirmAction(
      t('resetPoints'),
      t('resetConfirm'),
      () => {
        void resetPoints().then(() => showResetMsg(t('pointsResetDone')));
      },
      { yes: t('yes'), no: t('no') },
    );
  };

  const confirmResetDifficulty = () => {
    confirmAction(
      t('resetDifficulty'),
      t('resetDifficultyConfirm'),
      () => {
        void resetDifficultyStore().then(() => showResetMsg(t('difficultyResetDone')));
      },
      { yes: t('yes'), no: t('no') },
    );
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

        <Text style={styles.subsectionTitle}>{t('addSubSection')}</Text>
        <Text style={styles.hintSmall}>{t('addSubSectionHint')}</Text>

        <Text style={styles.label}>{t('addSubMax')}</Text>
        <TextInput
          keyboardType="number-pad"
          style={styles.input}
          value={addSubInput}
          onChangeText={(v) => setAddSubInput(v.replace(/\D/g, '').slice(0, 3))}
          placeholder={String(DEFAULT_ADD_SUB_MAX)}
          placeholderTextColor={colors.inkMuted}
        />

        <Text style={styles.label}>{t('sumZone')}</Text>
        <Text style={styles.hintSmall}>{t('addSubZoneHint')}</Text>
        <SettingZonePicker
          value={sumZoneSelection}
          onChange={setSumZoneSelection}
          options={SUM_ZONES}
          labels={sumZoneLabels}
        />

        <Text style={styles.subsectionTitle}>{t('mulDivSection')}</Text>
        <Text style={styles.hintSmall}>{t('mulDivSectionHint')}</Text>

        <Text style={styles.label}>{t('mulDivTables')}</Text>
        <Text style={styles.hintSmall}>{t('mulDivTablesHint')}</Text>
        <TableToggleGrid selection={mulDivSelection} onChange={setMulDivSelection} />

        <Text style={styles.label}>{t('multiplierZone')}</Text>
        <Text style={styles.hintSmall}>{t('mulDivZoneHint')}</Text>
        <SettingZonePicker
          value={multiplierZoneSelection}
          onChange={setMultiplierZoneSelection}
          options={MULTIPLIER_ZONES}
          labels={multiplierZoneLabels}
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
        {resetMsg ? <Text style={styles.saved}>{resetMsg}</Text> : null}

        <Pressable onPress={confirmResetDifficulty} style={styles.resetBtn}>
          <Text style={styles.resetText}>{t('resetDifficulty')}</Text>
        </Pressable>

        <Pressable onPress={confirmReset} style={styles.resetBtnSecondary}>
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
  subsectionTitle: {
    ...typography.subtitle,
    fontSize: 17,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.sm,
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
  resetBtnSecondary: {
    padding: spacing.md,
    alignItems: 'center',
  },
  resetText: {
    ...typography.label,
    color: colors.coral,
  },
});
