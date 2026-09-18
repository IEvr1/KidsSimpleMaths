import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createDefaultDifficultyStore,
  mergeLegacyAddSubDifficulty,
} from '@/src/logic/difficulty/stats';
import type { DifficultyStore, OpDifficulty } from '@/src/logic/difficulty/types';

const KEY = '@ksm/difficulty';

type LegacyDifficultyStore = Partial<DifficultyStore> & {
  add?: OpDifficulty;
  subtract?: OpDifficulty;
};

export async function loadDifficultyStore(): Promise<DifficultyStore> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return createDefaultDifficultyStore();
    const parsed = JSON.parse(raw) as LegacyDifficultyStore;
    const defaults = createDefaultDifficultyStore();

    const addSub =
      parsed.addSub != null
        ? { ...defaults.addSub, ...parsed.addSub }
        : mergeLegacyAddSubDifficulty(parsed.add, parsed.subtract);

    return {
      addSub,
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
