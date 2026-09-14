import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Language } from '@/src/i18n';
import {
  clampAddSubMax,
  clampDivideMax,
  clampMultiplyMax,
} from '@/src/logic/limits';
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
  saveDivideMax,
  saveMultiplyMax,
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
  updateMultiplyMax: (value: number) => void;
  updateDivideMax: (value: number) => void;
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

  const updateMultiplyMax = useCallback((multiplyMax: number) => {
    const value = clampMultiplyMax(multiplyMax);
    setState((prev) => ({ ...prev, multiplyMax: value }));
    saveMultiplyMax(value);
  }, []);

  const updateDivideMax = useCallback((divideMax: number) => {
    const value = clampDivideMax(divideMax);
    setState((prev) => ({ ...prev, divideMax: value }));
    saveDivideMax(value);
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
      updateMultiplyMax,
      updateDivideMax,
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
      updateMultiplyMax,
      updateDivideMax,
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
