import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  createDefaultDifficultyStore,
  recordAddSubDifficultyResult,
  recordDivideResult,
  recordMultiplyResult,
} from '@/src/logic/difficulty/stats';
import type { DifficultyProfile, DifficultyStore } from '@/src/logic/difficulty/types';
import { getEnabledNumbers, type TableSelection } from '@/src/logic/tableSelection';
import type { SumZone } from '@/src/logic/sumZone';
import type { Operation, Question } from '@/src/logic/types';
import { loadDifficultyStore, saveDifficultyStore } from '@/src/storage/difficulty';

export function useDifficulty(
  operation: Operation,
  addSubMax: number,
  multiplyTables: TableSelection,
  divideDivisors: TableSelection,
  sumZone: SumZone,
) {
  const enabledMultiplyTables = getEnabledNumbers(multiplyTables);
  const enabledDivideDivisors = getEnabledNumbers(divideDivisors);
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
    operation === 'add' || operation === 'subtract'
      ? store.addSub
      : operation === 'multiply'
        ? store.multiply
        : operation === 'divide'
          ? store.divide
          : undefined;

  const recordResult = useCallback(
    (question: Question, correct: boolean) => {
      if (operation === 'add' || operation === 'subtract') {
        const next = recordAddSubDifficultyResult(
          store.addSub,
          question,
          correct,
          addSubMax,
          sumZone,
        );
        const updated = { ...store, addSub: next };
        setStore(updated);
        saveDifficultyStore(updated);
      } else if (operation === 'multiply') {
        const next = recordMultiplyResult(
          store.multiply,
          question,
          correct,
          enabledMultiplyTables,
        );
        const updated = { ...store, multiply: next };
        setStore(updated);
        saveDifficultyStore(updated);
      } else if (operation === 'divide') {
        const next = recordDivideResult(
          store.divide,
          question,
          correct,
          enabledDivideDivisors,
        );
        const updated = { ...store, divide: next };
        setStore(updated);
        saveDifficultyStore(updated);
      }
    },
    [operation, store, addSubMax, sumZone, enabledMultiplyTables, enabledDivideDivisors],
  );

  return { profile, recordResult, loaded };
}
