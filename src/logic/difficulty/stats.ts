import type {
  DifficultyBand,
  DifficultyProfile,
  DifficultyStore,
  OpDifficulty,
} from './types';
import {
  randomMultiplierInZone,
  type MultiplierZone,
} from '../multiplierZone';
import { questionMatchesSumZone, type SumZone } from '../sumZone';
import type { Question } from '../types';

export const MULTIPLY_EASY_MAX = 4;
export const MULTIPLY_MEDIUM_MAX = 9;
export const ADD_SUB_EASY_MAX = 10;
export const ADD_SUB_MEDIUM_MAX = 20;
const PROMOTE_STREAK = 5;
const WEAK_BIAS = 0.65;

export function createDefaultDifficultyStore(): DifficultyStore {
  return {
    addSub: createDefaultOpDifficulty(),
    multiply: createDefaultOpDifficulty(),
    divide: createDefaultOpDifficulty(),
  };
}

export function mergeLegacyAddSubDifficulty(
  add?: Partial<OpDifficulty>,
  subtract?: Partial<OpDifficulty>,
): OpDifficulty {
  const base = createDefaultOpDifficulty();
  const profiles = [add, subtract].filter(Boolean) as OpDifficulty[];

  if (profiles.length === 0) return base;

  const weak: Record<number, number> = { ...base.weak };
  for (const profile of profiles) {
    for (const [key, weight] of Object.entries(profile.weak ?? {})) {
      const n = Number(key);
      weak[n] = Math.max(weak[n] ?? 0, weight);
    }
  }

  const bandOrder: DifficultyBand[] = ['easy', 'medium', 'full'];
  const band = profiles.reduce<DifficultyBand>(
    (lowest, profile) =>
      bandOrder.indexOf(profile.band) < bandOrder.indexOf(lowest) ? profile.band : lowest,
    'full',
  );

  return {
    band,
    bandCorrectStreak: Math.max(...profiles.map((p) => p.bandCorrectStreak ?? 0)),
    weak,
  };
}

function createDefaultOpDifficulty(): OpDifficulty {
  return { band: 'easy', bandCorrectStreak: 0, weak: {} };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxForMultiplyBand(band: DifficultyBand, cap: number): number {
  if (band === 'easy') return Math.min(MULTIPLY_EASY_MAX, cap);
  if (band === 'medium') return Math.min(MULTIPLY_MEDIUM_MAX, cap);
  return cap;
}

function maxForAddSubBand(band: DifficultyBand, cap: number): number {
  if (band === 'easy') return Math.min(ADD_SUB_EASY_MAX, cap);
  if (band === 'medium') return Math.min(ADD_SUB_MEDIUM_MAX, cap);
  return cap;
}

function bumpWeak(weak: Record<number, number>, key: number, amount: number) {
  if (key < 0) return;
  weak[key] = Math.max(0, (weak[key] ?? 0) + amount);
}

function getWeakKeys(weak: Record<number, number>, max: number): number[] {
  const keys: number[] = [];
  for (let n = 0; n <= max; n++) {
    const weight = weak[n] ?? 0;
    for (let i = 0; i < weight; i++) {
      keys.push(n);
    }
  }
  return keys;
}

function promoteBand(band: DifficultyBand): DifficultyBand {
  if (band === 'easy') return 'medium';
  if (band === 'medium') return 'full';
  return 'full';
}

function filterNumbersByBand(numbers: number[], band: DifficultyBand): number[] {
  const max = maxForMultiplyBand(band, 12);
  const filtered = numbers.filter((n) => n <= max);
  return filtered.length > 0 ? filtered : numbers;
}

function getMultiplyTableOperands(question: Question, enabledTables: number[]): number[] {
  return [question.a, question.b].filter((n) => enabledTables.includes(n));
}

function questionWithinBand(
  question: Question,
  band: DifficultyBand,
  cap: number,
  enabledNumbers?: number[],
): boolean {
  if (question.operation === 'multiply' && enabledNumbers) {
    const anchors = getMultiplyTableOperands(question, enabledNumbers);
    const anchor = anchors.length ? Math.max(...anchors) : Math.max(question.a, question.b);
    return anchor <= maxForMultiplyBand(band, 12);
  }
  if (question.operation === 'divide' && enabledNumbers) {
    return (
      enabledNumbers.includes(question.b) &&
      question.b <= maxForMultiplyBand(band, 12)
    );
  }
  if (question.operation === 'multiply') {
    const max = maxForMultiplyBand(band, cap);
    return question.a <= max && question.b <= max;
  }
  if (question.operation === 'divide') {
    return question.b <= maxForMultiplyBand(band, cap);
  }
  if (question.operation === 'add' || question.operation === 'subtract') {
    const max = maxForAddSubBand(band, cap);
    return question.a <= max && question.b <= max;
  }
  return true;
}

function recordAddSubResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  addSubMax: number,
  sumZone: SumZone,
): OpDifficulty {
  const next = {
    ...profile,
    weak: { ...profile.weak },
  };

  const operands = [question.a, question.b];
  if (correct) {
    operands.forEach((n) => bumpWeak(next.weak, n, -1));
    if (questionMatchesSumZone(question, sumZone, addSubMax)) {
      next.bandCorrectStreak += 1;
      if (next.bandCorrectStreak >= PROMOTE_STREAK && next.band !== 'full') {
        next.band = promoteBand(next.band);
        next.bandCorrectStreak = 0;
      }
    }
  } else {
    operands.forEach((n) => bumpWeak(next.weak, n, 2));
    next.bandCorrectStreak = 0;
  }

  return next;
}

export function recordAddSubDifficultyResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  addSubMax: number,
  sumZone: SumZone,
): OpDifficulty {
  return recordAddSubResult(profile, question, correct, addSubMax, sumZone);
}

export function recordMultiplyResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  enabledTables: number[],
): OpDifficulty {
  const next = {
    ...profile,
    weak: { ...profile.weak },
  };

  const factors = getMultiplyTableOperands(question, enabledTables);
  const tracked = factors.length ? factors : [question.a, question.b];
  if (correct) {
    tracked.forEach((f) => bumpWeak(next.weak, f, -1));
    if (questionWithinBand(question, next.band, 12, enabledTables)) {
      next.bandCorrectStreak += 1;
      if (next.bandCorrectStreak >= PROMOTE_STREAK && next.band !== 'full') {
        next.band = promoteBand(next.band);
        next.bandCorrectStreak = 0;
      }
    }
  } else {
    tracked.forEach((f) => bumpWeak(next.weak, f, 2));
    next.bandCorrectStreak = 0;
  }

  return next;
}

export function recordDivideResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  enabledDivisors: number[],
): OpDifficulty {
  const next = {
    ...profile,
    weak: { ...profile.weak },
  };

  const divisor = question.b;
  if (correct) {
    bumpWeak(next.weak, divisor, -1);
    if (questionWithinBand(question, next.band, 12, enabledDivisors)) {
      next.bandCorrectStreak += 1;
      if (next.bandCorrectStreak >= PROMOTE_STREAK && next.band !== 'full') {
        next.band = promoteBand(next.band);
        next.bandCorrectStreak = 0;
      }
    }
  } else {
    bumpWeak(next.weak, divisor, 2);
    next.bandCorrectStreak = 0;
  }

  return next;
}

function pickAddSubOperand(
  maxOp: number,
  profile: DifficultyProfile,
  teenBias: boolean,
): number {
  const weakPool = getWeakKeys(profile.weak, maxOp).filter((n) => n >= 1);

  if (weakPool.length > 0 && Math.random() < WEAK_BIAS) {
    return weakPool[randomInt(0, weakPool.length - 1)];
  }

  if (teenBias && maxOp >= 11 && Math.random() < 0.55) {
    return randomInt(11, Math.min(ADD_SUB_MEDIUM_MAX, maxOp));
  }

  return randomInt(1, maxOp);
}

export function pickAdaptiveAddPair(
  addSubMax: number,
  profile: DifficultyProfile,
): [number, number] {
  const maxOp = maxForAddSubBand(profile.band, addSubMax);
  const teenBias = profile.band === 'medium';

  const a = pickAddSubOperand(maxOp, profile, teenBias);
  const b = pickAddSubOperand(maxOp, profile, teenBias);
  return [a, b];
}

export function pickAdaptiveSubtractPair(
  addSubMax: number,
  profile: DifficultyProfile,
): [number, number] {
  const maxOp = maxForAddSubBand(profile.band, addSubMax);
  const teenBias = profile.band === 'medium';

  let a = pickAddSubOperand(maxOp, profile, teenBias);
  let b = pickAddSubOperand(maxOp, profile, teenBias);
  if (b > a) {
    [a, b] = [b, a];
  }
  return [a, b];
}

function pickFromPool(pool: number[]): number {
  return pool[randomInt(0, pool.length - 1)];
}

export function pickAdaptiveMultiplyFromTables(
  enabledTables: number[],
  profile: DifficultyProfile,
  multiplierZone: MultiplierZone,
): [number, number] {
  const pool = filterNumbersByBand(enabledTables, profile.band);
  const weakPool = getWeakKeys(profile.weak, 12).filter((n) => pool.includes(n));

  let table: number;
  if (weakPool.length > 0 && Math.random() < WEAK_BIAS) {
    table = pickFromPool(weakPool);
  } else if (profile.band === 'medium') {
    const mediumPool = pool.filter((n) => n >= 5 && n <= MULTIPLY_MEDIUM_MAX);
    table =
      mediumPool.length > 0 && Math.random() < 0.55
        ? pickFromPool(mediumPool)
        : pickFromPool(pool);
  } else {
    table = pickFromPool(pool);
  }

  const multiplier = randomMultiplierInZone(multiplierZone);
  if (Math.random() < 0.5 && enabledTables.includes(multiplier)) {
    return [multiplier, table];
  }
  return [table, multiplier];
}

export function pickAdaptiveDivideFromDivisors(
  enabledDivisors: number[],
  profile: DifficultyProfile,
  multiplierZone: MultiplierZone,
): { divisor: number; quotient: number } {
  const pool = filterNumbersByBand(
    enabledDivisors.filter((n) => n >= 1),
    profile.band,
  );
  const weakPool = getWeakKeys(profile.weak, 12).filter((n) => pool.includes(n));

  let divisor: number;
  if (weakPool.length > 0 && Math.random() < WEAK_BIAS) {
    divisor = pickFromPool(weakPool);
  } else if (profile.band === 'medium') {
    const mediumPool = pool.filter((n) => n >= 5 && n <= MULTIPLY_MEDIUM_MAX);
    divisor =
      mediumPool.length > 0 && Math.random() < 0.55
        ? pickFromPool(mediumPool)
        : pickFromPool(pool);
  } else {
    divisor = pickFromPool(pool);
  }

  const quotient = randomMultiplierInZone(multiplierZone);
  return { divisor, quotient };
}
