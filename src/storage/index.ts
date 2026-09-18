import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Language } from '@/src/i18n';
import {
  DEFAULT_ADD_SUB_MAX,
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLY_TABLES,
} from '@/src/logic/limits';
import {
  DEFAULT_MULTIPLIER_ZONE,
  parseMultiplierZone,
  type MultiplierZone,
} from '@/src/logic/multiplierZone';
import {
  DEFAULT_SUM_ZONE,
  parseSumZone,
  type SumZone,
} from '@/src/logic/sumZone';
import {
  deriveDivideDivisorsFromMultiplyTables,
  mergeMulDivTableSelections,
  migrateDivideDivisorsFromMax,
  migrateMultiplyTablesFromMax,
  normalizeTableSelection,
  parseTableSelection,
  tableSelectionToStorage,
  type TableSelection,
} from '@/src/logic/tableSelection';

const KEYS = {
  points: '@ksm/points',
  goal: '@ksm/goal',
  streak: '@ksm/streak',
  language: '@ksm/language',
  parentPin: '@ksm/parentPin',
  childName: '@ksm/childName',
  targetBonus: '@ksm/targetBonus',
  addSubMax: '@ksm/addSubMax',
  multiplyTables: '@ksm/multiplyTables',
  divideDivisors: '@ksm/divideDivisors',
  multiplierZone: '@ksm/multiplierZone',
  sumZone: '@ksm/sumZone',
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
  multiplyTables: TableSelection;
  divideDivisors: TableSelection;
  multiplierZone: MultiplierZone;
  sumZone: SumZone;
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
  multiplyTables: [...DEFAULT_MULTIPLY_TABLES],
  divideDivisors: [...DEFAULT_DIVIDE_DIVISORS],
  multiplierZone: DEFAULT_MULTIPLIER_ZONE,
  sumZone: DEFAULT_SUM_ZONE,
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
      multiplyTablesRaw,
      divideDivisorsRaw,
      multiplierZoneRaw,
      sumZoneRaw,
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
      AsyncStorage.getItem(KEYS.multiplyTables),
      AsyncStorage.getItem(KEYS.divideDivisors),
      AsyncStorage.getItem(KEYS.multiplierZone),
      AsyncStorage.getItem(KEYS.sumZone),
      AsyncStorage.getItem(KEYS.multiplyMax),
      AsyncStorage.getItem(KEYS.divideMax),
    ]);

    let multiplyTables = DEFAULT_MULTIPLY_TABLES;
    if (multiplyTablesRaw) {
      multiplyTables = parseTableSelection(JSON.parse(multiplyTablesRaw), DEFAULT_MULTIPLY_TABLES);
    } else if (multiplyMaxRaw) {
      multiplyTables = migrateMultiplyTablesFromMax(parseInt(multiplyMaxRaw, 10) || 10);
    }

    let divideDivisors = DEFAULT_DIVIDE_DIVISORS;
    if (divideDivisorsRaw) {
      divideDivisors = parseTableSelection(JSON.parse(divideDivisorsRaw), DEFAULT_DIVIDE_DIVISORS);
    } else if (divideMaxRaw) {
      divideDivisors = migrateDivideDivisorsFromMax(parseInt(divideMaxRaw, 10) || 10);
    }

    return {
      points: Math.round((parseFloat(pointsRaw ?? '0') || 0) * 100) / 100,
      goal: parseInt(goalRaw ?? String(DEFAULT_GOAL), 10) || DEFAULT_GOAL,
      streak: parseInt(streakRaw ?? '0', 10) || 0,
      language: (languageRaw as Language) || 'el',
      parentPin: pinRaw ?? DEFAULT_PIN,
      childName: childNameRaw ?? '',
      targetBonus: parseInt(targetBonusRaw ?? String(DEFAULT_TARGET_BONUS), 10) || 0,
      addSubMax: parseInt(addSubMaxRaw ?? String(DEFAULT_ADD_SUB_MAX), 10) || DEFAULT_ADD_SUB_MAX,
      multiplyTables: (() => {
        const merged = normalizeTableSelection(
          mergeMulDivTableSelections(multiplyTables, divideDivisors),
          DEFAULT_MULTIPLY_TABLES,
        );
        return merged;
      })(),
      divideDivisors: (() => {
        const merged = normalizeTableSelection(
          mergeMulDivTableSelections(multiplyTables, divideDivisors),
          DEFAULT_MULTIPLY_TABLES,
        );
        return normalizeTableSelection(
          deriveDivideDivisorsFromMultiplyTables(merged),
          DEFAULT_DIVIDE_DIVISORS,
        );
      })(),
      multiplierZone: parseMultiplierZone(multiplierZoneRaw),
      sumZone: parseSumZone(sumZoneRaw),
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

export async function saveMultiplyTables(selection: TableSelection): Promise<void> {
  await AsyncStorage.setItem(KEYS.multiplyTables, tableSelectionToStorage(selection));
}

export async function saveDivideDivisors(selection: TableSelection): Promise<void> {
  await AsyncStorage.setItem(KEYS.divideDivisors, tableSelectionToStorage(selection));
}

export async function saveMultiplierZone(zone: MultiplierZone): Promise<void> {
  await AsyncStorage.setItem(KEYS.multiplierZone, zone);
}

export async function saveSumZone(zone: SumZone): Promise<void> {
  await AsyncStorage.setItem(KEYS.sumZone, zone);
}

export async function resetPoints(): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.points, '0'),
    AsyncStorage.setItem(KEYS.streak, '0'),
  ]);
}
