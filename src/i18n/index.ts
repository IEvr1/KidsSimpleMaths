import { el } from './el';
import { en } from './en';

export type Language = 'el' | 'en';

const dictionaries = { el, en } as const;

export function t(
  lang: Language,
  key: keyof typeof el,
  params?: Record<string, string | number>,
): string {
  const dict = dictionaries[lang];
  let value: string;

  if (key === 'operations') {
    return '';
  }

  const raw = dict[key];
  if (typeof raw === 'object') {
    return '';
  }

  value = raw as string;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }

  return value;
}

export function tOperation(lang: Language, op: keyof typeof el.operations): string {
  return dictionaries[lang].operations[op];
}

export { el, en };
