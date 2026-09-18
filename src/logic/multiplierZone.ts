export type MultiplierZone = '0-3' | '4-9' | '0-10';

export const MULTIPLIER_ZONES: MultiplierZone[] = ['0-3', '4-9', '0-10'];

export const DEFAULT_MULTIPLIER_ZONE: MultiplierZone = '0-10';

export function parseMultiplierZone(raw: unknown): MultiplierZone {
  if (raw === '0-3' || raw === '4-9' || raw === '0-10') {
    return raw;
  }
  return DEFAULT_MULTIPLIER_ZONE;
}

export function getMultiplierRange(zone: MultiplierZone): { min: number; max: number } {
  switch (zone) {
    case '0-3':
      return { min: 0, max: 3 };
    case '4-9':
      return { min: 4, max: 9 };
    case '0-10':
      return { min: 0, max: 10 };
  }
}

export function randomMultiplierInZone(zone: MultiplierZone): number {
  const { min, max } = getMultiplierRange(zone);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
