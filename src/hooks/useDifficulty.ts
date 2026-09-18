import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  createDefaultDifficultyStore,
  recordAddResult,
  recordDivideResult,
  recordMultiplyResult,
  recordSubtractResult,
} from '@/src/logic/difficulty/stats';
import type { DifficultyProfile, DifficultyStore } from '@/src/logic/difficulty/types';
import type { Operation, Question } from '@/src/logic/types';
import { loadDifficultyStore, saveDifficultyStore } from '@/src/storage/difficulty';

export function useDifficulty(
  operation: Operation,
  addSubMax: number,
  multiplyMax: number,
  divideMax: number,
) {
  const [store, setStore] = useState<DifficultyStore>(createDefaultDifficultyStore());
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDifficultyStore().then((data) => {
        setStore(data);
        setLoaded(true);
      });
    }, []),
  );

  const profile: DifficultyProfile | undefined =
    operation === 'add'
      ? store.add
      : operation === 'subtract'
        ? store.subtract
        : operation === 'multiply'
          ? store.multiply
          : operation === 'divide'
            ? store.divide
            : undefined;

  const recordResult = useCallback(
    (question: Question, correct: boolean) => {
      if (operation === 'add') {
        const next = recordAddResult(store.add, question, correct, addSubMax);
        const updated = { ...store, add: next };
        setStore(updated);
        saveDifficultyStore(updated);
      } else if (operation === 'subtract') {
        const next = recordSubtractResult(store.subtract, question, correct, addSubMax);
        const updated = { ...store, subtract: next };
        setStore(updated);
        saveDifficultyStore(updated);
      } else if (operation === 'multiply') {
        const next = recordMultiplyResult(store.multiply, question, correct, multiplyMax);
        const updated = { ...store, multiply: next };
        setStore(updated);
        saveDifficultyStore(updated);
      } else if (operation === 'divide') {
        const next = recordDivideResult(store.divide, question, correct, divideMax);
        const updated = { ...store, divide: next };
        setStore(updated);
        saveDifficultyStore(updated);
      }
    },
    [operation, store, addSubMax, multiplyMax, divideMax],
  );

  return { profile, recordResult, loaded };
}
