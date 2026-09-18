import type { DifficultyProfile } from './difficulty/types';
import {
  pickAdaptiveAddPair,
  pickAdaptiveDivideFromDivisors,
  pickAdaptiveMultiplyFromTables,
  pickAdaptiveSubtractPair,
} from './difficulty/stats';
import type { OperationLimits } from './limits';
import {
  DEFAULT_ADD_SUB_MAX,
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLY_TABLES,
  clampAddSubMax,
} from './limits';
import {
  MULTIPLY_FACTOR_MAX,
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
  profile?: DifficultyProfile,
): [number, number] {
  if (profile) {
    return pickAdaptiveMultiplyFromTables(enabledTables, profile);
  }

  const table = enabledTables[randomInt(0, enabledTables.length - 1)];
  const other = randomInt(0, MULTIPLY_FACTOR_MAX);
  return Math.random() < 0.5 ? [table, other] : [other, table];
}

function pickTableDivide(
  enabledDivisors: number[],
  profile?: DifficultyProfile,
): { a: number; b: number; answer: number } {
  if (profile) {
    const { divisor, quotient } = pickAdaptiveDivideFromDivisors(enabledDivisors, profile);
    return { a: divisor * quotient, b: divisor, answer: quotient };
  }

  const divisor = enabledDivisors[randomInt(0, enabledDivisors.length - 1)];
  const quotient = randomInt(0, MULTIPLY_FACTOR_MAX);
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

  let a: number;
  let b: number;
  let answer: number;
  let symbol: Question['symbol'];

  switch (operation) {
    case 'add': {
      if (difficulty) {
        [a, b] = pickAdaptiveAddPair(addSubMax, difficulty);
      } else {
        a = randomInt(1, addSubMax);
        b = randomInt(1, addSubMax);
      }
      answer = a + b;
      symbol = '+';
      break;
    }
    case 'subtract': {
      if (difficulty) {
        [a, b] = pickAdaptiveSubtractPair(addSubMax, difficulty);
      } else {
        a = randomInt(1, addSubMax);
        b = randomInt(1, a);
      }
      answer = a - b;
      symbol = '-';
      break;
    }
    case 'multiply': {
      [a, b] = pickTableMultiply(multiplyTables, difficulty);
      answer = a * b;
      symbol = '×';
      break;
    }
    case 'divide': {
      ({ a, b, answer } = pickTableDivide(divideDivisors, difficulty));
      symbol = '÷';
      break;
    }
  }

  return { operation, a, b, answer, symbol };
}
