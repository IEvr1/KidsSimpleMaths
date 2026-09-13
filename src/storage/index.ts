import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Language } from '@/src/i18n';

const KEYS = {
  points: '@ksm/points',
  goal: '@ksm/goal',
  streak: '@ksm/streak',
  language: '@ksm/language',
  parentPin: '@ksm/parentPin',
} as const;

export const DEFAULT_GOAL = 50;
export const DEFAULT_PIN = '1234';

export type StoredState = {
  points: number;
  goal: number;
  streak: number;
  language: Language;
  parentPin: string;
};

export const defaultState: StoredState = {
  points: 0,
  goal: DEFAULT_GOAL,
  streak: 0,
  language: 'el',
  parentPin: DEFAULT_PIN,
};

export async function loadState(): Promise<StoredState> {
  try {
    const [pointsRaw, goalRaw, streakRaw, languageRaw, pinRaw] = await Promise.all([
      AsyncStorage.getItem(KEYS.points),
      AsyncStorage.getItem(KEYS.goal),
      AsyncStorage.getItem(KEYS.streak),
      AsyncStorage.getItem(KEYS.language),
      AsyncStorage.getItem(KEYS.parentPin),
    ]);

    return {
      points: Math.round((parseFloat(pointsRaw ?? '0') || 0) * 100) / 100,
      goal: parseInt(goalRaw ?? String(DEFAULT_GOAL), 10) || DEFAULT_GOAL,
      streak: parseInt(streakRaw ?? '0', 10) || 0,
      language: (languageRaw as Language) || 'el',
      parentPin: pinRaw ?? DEFAULT_PIN,
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

export async function resetPoints(): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.points, '0'),
    AsyncStorage.setItem(KEYS.streak, '0'),
  ]);
}
