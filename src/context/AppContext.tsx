import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Language } from '@/src/i18n';
import { roundPoints } from '@/src/logic/scoring';
import {
  defaultState,
  loadState,
  resetPoints as resetPointsStorage,
  saveGoal,
  saveLanguage,
  saveParentPin,
  savePoints,
  saveStreak,
  type StoredState,
} from '@/src/storage';

type AppContextValue = StoredState & {
  isLoading: boolean;
  setLanguage: (lang: Language) => void;
  addPoints: (amount: number) => void;
  setStreak: (streak: number) => void;
  updateGoal: (goal: number) => void;
  updatePin: (pin: string) => void;
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
