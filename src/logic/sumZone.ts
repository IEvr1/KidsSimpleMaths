import type { DifficultyProfile } from './difficulty/types';
import type { Question } from './types';

export type SumZone = '0-8' | '9-19' | '0-19';

export const SUM_ZONES: SumZone[] = ['0-8', '9-19', '0-19'];

export const DEFAULT_SUM_ZONE: SumZone = '0-19';

const WEAK_BIAS = 0.65;

export function parseSumZone(raw: unknown): SumZone {
  if (raw === '0-8' || raw === '9-19' || raw === '0-19') {
    return raw;
  }
  return DEFAULT_SUM_ZONE;
}

export function getSumRange(
  zone: SumZone,
  addSubMax: number,
): { min: number; max: number } {
  const cap = addSubMax * 2;
  switch (zone) {
    case '0-8':
      return { min: 0, max: Math.min(8, cap) };
    case '9-19':
      return { min: 9, max: Math.min(19, cap) };
    case '0-19':
      return { min: 0, max: Math.min(19, cap) };
  }
}

export function answerInSumZone(
  answer: number,
  zone: SumZone,
  addSubMax: number,
): boolean {
  const { min, max } = getSumRange(zone, addSubMax);
  return answer >= min && answer <= max;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getWeakPool(
  profile: DifficultyProfile | undefined,
  min: number,
  max: number,
): number[] {
  if (!profile) return [];
  const pool: number[] = [];
  for (let n = min; n <= max; n++) {
    const weight = profile.weak[n] ?? 0;
    for (let i = 0; i < weight; i++) {
      pool.push(n);
    }
  }
  return pool;
}

function pickOperandInRange(
  min: number,
  max: number,
  profile?: DifficultyProfile,
  teenBias = false,
): number {
  const weakPool = getWeakPool(profile, min, max);
  if (weakPool.length > 0 && Math.random() < WEAK_BIAS) {
    return weakPool[randomInt(0, weakPool.length - 1)];
  }
  if (teenBias && max >= 11 && Math.random() < 0.55) {
    return randomInt(Math.max(min, 11), Math.min(max, 19));
  }
  return randomInt(min, max);
}

export function pickAddPairForSumZone(
  addSubMax: number,
  sumZone: SumZone,
  profile?: DifficultyProfile,
): [number, number] {
  const { min, max } = getSumRange(sumZone, addSubMax);
  const teenBias = sumZone === '9-19';

  for (let attempt = 0; attempt < 80; attempt++) {
    const targetSum = randomInt(min, max);
    const aMin = Math.max(1, targetSum - addSubMax);
    const aMax = Math.min(addSubMax, targetSum - 1);
    if (aMin > aMax) continue;

    const a = pickOperandInRange(aMin, aMax, profile, teenBias);
    const b = targetSum - a;
    if (b >= 1 && b <= addSubMax) {
      return [a, b];
    }
  }

  return [1, Math.min(addSubMax, Math.max(min, 1))];
}

export function pickSubtractPairForSumZone(
  addSubMax: number,
  sumZone: SumZone,
  profile?: DifficultyProfile,
): [number, number] {
  const { min, max } = getSumRange(sumZone, addSubMax);
  const ansMax = Math.min(max, addSubMax - 1);
  const ansMin = min;
  const teenBias = sumZone === '9-19';

  if (ansMin > ansMax) {
    return [addSubMax, addSubMax - 1];
  }

  for (let attempt = 0; attempt < 80; attempt++) {
    const answer = randomInt(ansMin, ansMax);
    const aMin = Math.max(answer + 1, 2);
    const aMax = addSubMax;
    if (aMin > aMax) continue;

    const a = pickOperandInRange(aMin, aMax, profile, teenBias);
    const b = a - answer;
    if (b >= 1 && b <= addSubMax) {
      return [a, b];
    }
  }

  return [Math.min(addSubMax, 10), 1];
}

export function questionMatchesSumZone(
  question: Question,
  sumZone: SumZone,
  addSubMax: number,
): boolean {
  return answerInSumZone(question.answer, sumZone, addSubMax);
}
