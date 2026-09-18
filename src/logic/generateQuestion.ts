import type { DifficultyProfile } from './difficulty/types';
import {
  pickAdaptiveDivideFromDivisors,
  pickAdaptiveMultiplyFromTables,
} from './difficulty/stats';
import type { OperationLimits } from './limits';
import {
  DEFAULT_ADD_SUB_MAX,
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLY_TABLES,
  DEFAULT_MULTIPLIER_ZONE,
  DEFAULT_SUM_ZONE,
  clampAddSubMax,
} from './limits';
import {
  randomMultiplierInZone,
  type MultiplierZone,
} from './multiplierZone';
import {
  pickAddPairForSumZone,
  pickSubtractPairForSumZone,
} from './sumZone';
import {
  getEnabledNumbers,
  type TableSelection,
} from './tableSelection';
import type { Operation, Question } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveEnabledNumbers(
  selection: TableSelection | undefined,
  fallback: TableSelection,
): number[] {
  const enabled = getEnabledNumbers(selection ?? fallback);
  return enabled.length > 0 ? enabled : getEnabledNumbers(fallback);
}

function pickTableMultiply(
  enabledTables: number[],
  multiplierZone: MultiplierZone,
  profile?: DifficultyProfile,
): [number, number] {
  if (profile) {
    return pickAdaptiveMultiplyFromTables(enabledTables, profile, multiplierZone);
  }

  const table = enabledTables[randomInt(0, enabledTables.length - 1)];
  const multiplier = randomMultiplierInZone(multiplierZone);
  if (Math.random() < 0.5 && enabledTables.includes(multiplier)) {
    return [multiplier, table];
  }
  return [table, multiplier];
}

function pickTableDivide(
  enabledDivisors: number[],
  multiplierZone: MultiplierZone,
  profile?: DifficultyProfile,
): { a: number; b: number; answer: number } {
  if (profile) {
    const { divisor, quotient } = pickAdaptiveDivideFromDivisors(
      enabledDivisors,
      profile,
      multiplierZone,
    );
    return { a: divisor * quotient, b: divisor, answer: quotient };
  }

  const divisor = enabledDivisors[randomInt(0, enabledDivisors.length - 1)];
  const quotient = randomMultiplierInZone(multiplierZone);
  return { a: divisor * quotient, b: divisor, answer: quotient };
}

export function generateQuestion(
  operation: Operation,
  limits?: Partial<OperationLimits>,
  difficulty?: DifficultyProfile,
): Question {
  const addSubMax = clampAddSubMax(limits?.addSubMax ?? DEFAULT_ADD_SUB_MAX);
  const multiplyTables = resolveEnabledNumbers(
    limits?.multiplyTables,
    DEFAULT_MULTIPLY_TABLES,
  );
  const divideDivisors = resolveEnabledNumbers(
    limits?.divideDivisors,
    DEFAULT_DIVIDE_DIVISORS,
  );
  const multiplierZone = limits?.multiplierZone ?? DEFAULT_MULTIPLIER_ZONE;
  const sumZone = limits?.sumZone ?? DEFAULT_SUM_ZONE;

  let a: number;
  let b: number;
  let answer: number;
  let symbol: Question['symbol'];

  switch (operation) {
    case 'add': {
      [a, b] = pickAddPairForSumZone(addSubMax, sumZone, difficulty);
      answer = a + b;
      symbol = '+';
      break;
    }
    case 'subtract': {
      [a, b] = pickSubtractPairForSumZone(addSubMax, sumZone, difficulty);
      answer = a - b;
      symbol = '-';
      break;
    }
    case 'multiply': {
      [a, b] = pickTableMultiply(multiplyTables, multiplierZone, difficulty);
      answer = a * b;
      symbol = '×';
      break;
    }
    case 'divide': {
      ({ a, b, answer } = pickTableDivide(divideDivisors, multiplierZone, difficulty));
      symbol = '÷';
      break;
    }
  }

  return { operation, a, b, answer, symbol };
}
