import React, { createContext, useContext, useMemo } from 'react';

import { useApp } from '@/src/context/AppContext';
import { el } from './el';
import { en } from './en';
import type { Language } from './index';
import { t, tOperation } from './index';

type I18nContextValue = {
  language: Language;
  t: (key: keyof typeof el, params?: Record<string, string | number>) => string;
  tOperation: (op: keyof typeof el.operations) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language } = useApp();

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t: (key, params) => t(language, key, params),
      tOperation: (op) => tOperation(language, op),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export { el, en };
