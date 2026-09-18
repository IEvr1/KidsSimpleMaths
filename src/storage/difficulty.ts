import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultDifficultyStore } from '@/src/logic/difficulty/stats';
import type { DifficultyStore } from '@/src/logic/difficulty/types';

const KEY = '@ksm/difficulty';

export async function loadDifficultyStore(): Promise<DifficultyStore> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return createDefaultDifficultyStore();
    const parsed = JSON.parse(raw) as Partial<DifficultyStore>;
    const defaults = createDefaultDifficultyStore();
    return {
      add: { ...defaults.add, ...parsed.add },
      subtract: { ...defaults.subtract, ...parsed.subtract },
      multiply: { ...defaults.multiply, ...parsed.multiply },
      divide: { ...defaults.divide, ...parsed.divide },
    };
  } catch {
    return createDefaultDifficultyStore();
  }
}

export async function saveDifficultyStore(store: DifficultyStore): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

export async function resetDifficultyStore(): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(createDefaultDifficultyStore()));
}
