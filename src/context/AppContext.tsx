import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Language } from '@/src/i18n';
import { clampAddSubMax } from '@/src/logic/limits';
import {
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLY_TABLES,
  normalizeTableSelection,
  type TableSelection,
} from '@/src/logic/tableSelection';
import { roundPoints } from '@/src/logic/scoring';
import {
  defaultState,
  loadState,
  resetPoints as resetPointsStorage,
  saveAddSubMax,
  saveChildName,
  saveGoal,
  saveLanguage,
  saveParentPin,
  savePoints,
  saveStreak,
  saveTargetBonus,
  saveDivideDivisors,
  saveMultiplyTables,
  type StoredState,
} from '@/src/storage';

type AppContextValue = StoredState & {
  isLoading: boolean;
  setLanguage: (lang: Language) => void;
  addPoints: (amount: number) => void;
  setStreak: (streak: number) => void;
  updateGoal: (goal: number) => void;
  updatePin: (pin: string) => void;
  updateChildName: (name: string) => void;
  updateTargetBonus: (bonus: number) => void;
  updateAddSubMax: (value: number) => void;
  updateMultiplyTables: (selection: TableSelection) => void;
  updateDivideDivisors: (selection: TableSelection) => void;
  resetPoints: () => Promise<void>;
  goalReached: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setIsLoading(false);
    });
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language }));
    saveLanguage(language);
  }, []);

  const addPoints = useCallback((amount: number) => {
    setState((prev) => {
      const points = roundPoints(prev.points + amount);
      savePoints(points);
      return { ...prev, points };
    });
  }, []);

  const setStreak = useCallback((streak: number) => {
    setState((prev) => ({ ...prev, streak }));
    saveStreak(streak);
  }, []);

  const updateGoal = useCallback((goal: number) => {
    setState((prev) => ({ ...prev, goal }));
    saveGoal(goal);
  }, []);

  const updatePin = useCallback((parentPin: string) => {
    setState((prev) => ({ ...prev, parentPin }));
    saveParentPin(parentPin);
  }, []);

  const updateChildName = useCallback((childName: string) => {
    setState((prev) => ({ ...prev, childName }));
    saveChildName(childName);
  }, []);

  const updateTargetBonus = useCallback((targetBonus: number) => {
    setState((prev) => ({ ...prev, targetBonus }));
    saveTargetBonus(targetBonus);
  }, []);

  const updateAddSubMax = useCallback((addSubMax: number) => {
    const value = clampAddSubMax(addSubMax);
    setState((prev) => ({ ...prev, addSubMax: value }));
    saveAddSubMax(value);
  }, []);

  const updateMultiplyTables = useCallback((selection: TableSelection) => {
    const value = normalizeTableSelection(selection, DEFAULT_MULTIPLY_TABLES);
    setState((prev) => ({ ...prev, multiplyTables: value }));
    saveMultiplyTables(value);
  }, []);

  const updateDivideDivisors = useCallback((selection: TableSelection) => {
    const value = normalizeTableSelection(selection, DEFAULT_DIVIDE_DIVISORS);
    setState((prev) => ({ ...prev, divideDivisors: value }));
    saveDivideDivisors(value);
  }, []);

  const resetPoints = useCallback(async () => {
    await resetPointsStorage();
    setState((prev) => ({ ...prev, points: 0, streak: 0 }));
  }, []);

  const goalReached = state.points >= state.goal;

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      isLoading,
      setLanguage,
      addPoints,
      setStreak,
      updateGoal,
      updatePin,
      updateChildName,
      updateTargetBonus,
      updateAddSubMax,
      updateMultiplyTables,
      updateDivideDivisors,
      resetPoints,
      goalReached,
    }),
    [
      state,
      isLoading,
      setLanguage,
      addPoints,
      setStreak,
      updateGoal,
      updatePin,
      updateChildName,
      updateTargetBonus,
      updateAddSubMax,
      updateMultiplyTables,
      updateDivideDivisors,
      resetPoints,
      goalReached,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
