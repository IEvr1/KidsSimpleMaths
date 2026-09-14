import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Language } from '@/src/i18n';
import {
  DEFAULT_ADD_SUB_MAX,
  DEFAULT_DIVIDE_MAX,
  DEFAULT_MULTIPLY_MAX,
} from '@/src/logic/limits';

const KEYS = {
  points: '@ksm/points',
  goal: '@ksm/goal',
  streak: '@ksm/streak',
  language: '@ksm/language',
  parentPin: '@ksm/parentPin',
  childName: '@ksm/childName',
  targetBonus: '@ksm/targetBonus',
  addSubMax: '@ksm/addSubMax',
  multiplyMax: '@ksm/multiplyMax',
  divideMax: '@ksm/divideMax',
} as const;

export const DEFAULT_GOAL = 50;
export const DEFAULT_PIN = '1234';
export const DEFAULT_TARGET_BONUS = 5;

export type StoredState = {
  points: number;
  goal: number;
  streak: number;
  language: Language;
  parentPin: string;
  childName: string;
  targetBonus: number;
  addSubMax: number;
  multiplyMax: number;
  divideMax: number;
};

export const defaultState: StoredState = {
  points: 0,
  goal: DEFAULT_GOAL,
  streak: 0,
  language: 'el',
  parentPin: DEFAULT_PIN,
  childName: '',
  targetBonus: DEFAULT_TARGET_BONUS,
  addSubMax: DEFAULT_ADD_SUB_MAX,
  multiplyMax: DEFAULT_MULTIPLY_MAX,
  divideMax: DEFAULT_DIVIDE_MAX,
};

export async function loadState(): Promise<StoredState> {
  try {
    const [
      pointsRaw,
      goalRaw,
      streakRaw,
      languageRaw,
      pinRaw,
      childNameRaw,
      targetBonusRaw,
      addSubMaxRaw,
      multiplyMaxRaw,
      divideMaxRaw,
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.points),
      AsyncStorage.getItem(KEYS.goal),
      AsyncStorage.getItem(KEYS.streak),
      AsyncStorage.getItem(KEYS.language),
      AsyncStorage.getItem(KEYS.parentPin),
      AsyncStorage.getItem(KEYS.childName),
      AsyncStorage.getItem(KEYS.targetBonus),
      AsyncStorage.getItem(KEYS.addSubMax),
      AsyncStorage.getItem(KEYS.multiplyMax),
      AsyncStorage.getItem(KEYS.divideMax),
    ]);

    return {
      points: Math.round((parseFloat(pointsRaw ?? '0') || 0) * 100) / 100,
      goal: parseInt(goalRaw ?? String(DEFAULT_GOAL), 10) || DEFAULT_GOAL,
      streak: parseInt(streakRaw ?? '0', 10) || 0,
      language: (languageRaw as Language) || 'el',
      parentPin: pinRaw ?? DEFAULT_PIN,
      childName: childNameRaw ?? '',
      targetBonus: parseInt(targetBonusRaw ?? String(DEFAULT_TARGET_BONUS), 10) || 0,
      addSubMax: parseInt(addSubMaxRaw ?? String(DEFAULT_ADD_SUB_MAX), 10) || DEFAULT_ADD_SUB_MAX,
      multiplyMax:
        parseInt(multiplyMaxRaw ?? String(DEFAULT_MULTIPLY_MAX), 10) || DEFAULT_MULTIPLY_MAX,
      divideMax: parseInt(divideMaxRaw ?? String(DEFAULT_DIVIDE_MAX), 10) || DEFAULT_DIVIDE_MAX,
    };
  } catch {
    return { ...defaultState };
  }
}

export async function savePoints(points: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.points, String(points));
}

export async function saveGoal(goal: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.goal, String(goal));
}

export async function saveStreak(streak: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.streak, String(streak));
}

export async function saveLanguage(language: Language): Promise<void> {
  await AsyncStorage.setItem(KEYS.language, language);
}

export async function saveParentPin(pin: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.parentPin, pin);
}

export async function saveChildName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.childName, name);
}

export async function saveTargetBonus(bonus: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.targetBonus, String(bonus));
}

export async function saveAddSubMax(value: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.addSubMax, String(value));
}

export async function saveMultiplyMax(value: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.multiplyMax, String(value));
}

export async function saveDivideMax(value: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.divideMax, String(value));
}

export async function resetPoints(): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.points, '0'),
    AsyncStorage.setItem(KEYS.streak, '0'),
  ]);
}
