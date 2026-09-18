import type {
  DifficultyBand,
  DifficultyProfile,
  DifficultyStore,
  OpDifficulty,
} from './types';
import type { Question } from '../types';

export const MULTIPLY_EASY_MAX = 4;
export const MULTIPLY_MEDIUM_MAX = 9;
export const ADD_SUB_EASY_MAX = 10;
export const ADD_SUB_MEDIUM_MAX = 20;
const PROMOTE_STREAK = 5;
const WEAK_BIAS = 0.65;

export function createDefaultDifficultyStore(): DifficultyStore {
  return {
    add: createDefaultOpDifficulty(),
    subtract: createDefaultOpDifficulty(),
    multiply: createDefaultOpDifficulty(),
    divide: createDefaultOpDifficulty(),
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

function questionWithinBand(question: Question, band: DifficultyBand, cap: number): boolean {
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
): OpDifficulty {
  const next = {
    ...profile,
    weak: { ...profile.weak },
  };

  const operands = [question.a, question.b];
  if (correct) {
    operands.forEach((n) => bumpWeak(next.weak, n, -1));
    if (questionWithinBand(question, next.band, addSubMax)) {
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

export function recordAddResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  addSubMax: number,
): OpDifficulty {
  return recordAddSubResult(profile, question, correct, addSubMax);
}

export function recordSubtractResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  addSubMax: number,
): OpDifficulty {
  return recordAddSubResult(profile, question, correct, addSubMax);
}

export function recordMultiplyResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  multiplyMax: number,
): OpDifficulty {
  const next = {
    ...profile,
    weak: { ...profile.weak },
  };

  const factors = [question.a, question.b];
  if (correct) {
    factors.forEach((f) => bumpWeak(next.weak, f, -1));
    if (questionWithinBand(question, next.band, multiplyMax)) {
      next.bandCorrectStreak += 1;
      if (next.bandCorrectStreak >= PROMOTE_STREAK && next.band !== 'full') {
        next.band = promoteBand(next.band);
        next.bandCorrectStreak = 0;
      }
    }
  } else {
    factors.forEach((f) => bumpWeak(next.weak, f, 2));
    next.bandCorrectStreak = 0;
  }

  return next;
}

export function recordDivideResult(
  profile: OpDifficulty,
  question: Question,
  correct: boolean,
  divideMax: number,
): OpDifficulty {
  const next = {
    ...profile,
    weak: { ...profile.weak },
  };

  const divisor = question.b;
  if (correct) {
    bumpWeak(next.weak, divisor, -1);
    if (questionWithinBand(question, next.band, divideMax)) {
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

export function pickAdaptiveMultiplyPair(
  multiplyMax: number,
  profile: DifficultyProfile,
): [number, number] {
  const maxFactor = maxForMultiplyBand(profile.band, multiplyMax);
  const weakPool = getWeakKeys(profile.weak, maxFactor);

  if (weakPool.length > 0 && Math.random() < WEAK_BIAS) {
    const anchor = weakPool[randomInt(0, weakPool.length - 1)];
    const other = randomInt(0, maxFactor);
    return Math.random() < 0.5 ? [anchor, other] : [other, anchor];
  }

  if (profile.band === 'medium' && maxFactor >= 5 && Math.random() < 0.55) {
    const hardFactor = randomInt(5, Math.min(MULTIPLY_MEDIUM_MAX, maxFactor));
    return [hardFactor, randomInt(0, maxFactor)];
  }

  return [randomInt(0, maxFactor), randomInt(0, maxFactor)];
}

export function pickAdaptiveDivide(
  divideMax: number,
  profile: DifficultyProfile,
): { divisor: number; quotient: number } {
  const maxDivisor = Math.max(1, maxForMultiplyBand(profile.band, divideMax));
  const weakPool = getWeakKeys(profile.weak, maxDivisor).filter((n) => n >= 1);

  let divisor: number;
  if (weakPool.length > 0 && Math.random() < WEAK_BIAS) {
    divisor = weakPool[randomInt(0, weakPool.length - 1)];
  } else if (profile.band === 'medium' && maxDivisor >= 5 && Math.random() < 0.55) {
    divisor = randomInt(5, Math.min(MULTIPLY_MEDIUM_MAX, maxDivisor));
  } else {
    divisor = randomInt(1, maxDivisor);
  }

  const quotientMax = Math.min(12, maxDivisor);
  const quotient = randomInt(0, quotientMax);
  return { divisor, quotient };
}
