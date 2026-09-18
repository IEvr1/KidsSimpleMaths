import type { DifficultyProfile } from './difficulty/types';
import {
  pickAdaptiveAddPair,
  pickAdaptiveDivide,
  pickAdaptiveMultiplyPair,
  pickAdaptiveSubtractPair,
} from './difficulty/stats';
import type { OperationLimits } from './limits';
import {
  DEFAULT_ADD_SUB_MAX,
  DEFAULT_DIVIDE_MAX,
  DEFAULT_MULTIPLY_MAX,
  clampAddSubMax,
  clampDivideMax,
  clampMultiplyMax,
} from './limits';
import type { Operation, Question } from './types';

const MULTIPLY_EXTRA: [number, number][] = [
  [11, 11],
  [12, 12],
  [13, 13],
  [10, 11],
  [11, 10],
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMultiplyPair(multiplyMax: number, profile?: DifficultyProfile): [number, number] {
  if (profile) {
    return pickAdaptiveMultiplyPair(multiplyMax, profile);
  }

  const extras = MULTIPLY_EXTRA.filter(([a, b]) => a <= multiplyMax && b <= multiplyMax);
  if (extras.length > 0 && Math.random() < 0.15) {
    return extras[randomInt(0, extras.length - 1)];
  }
  return [randomInt(0, multiplyMax), randomInt(0, multiplyMax)];
}

function pickDividePair(
  divideMax: number,
  profile?: DifficultyProfile,
): { a: number; b: number; answer: number } {
  if (profile) {
    const { divisor, quotient } = pickAdaptiveDivide(divideMax, profile);
    return { a: divisor * quotient, b: divisor, answer: quotient };
  }

  const b = randomInt(1, divideMax);
  const quotientMax = Math.min(12, divideMax);
  const quotient = randomInt(0, quotientMax);
  return { a: b * quotient, b, answer: quotient };
}

export function generateQuestion(
  operation: Operation,
  limits?: Partial<OperationLimits>,
  difficulty?: DifficultyProfile,
): Question {
  const addSubMax = clampAddSubMax(limits?.addSubMax ?? DEFAULT_ADD_SUB_MAX);
  const multiplyMax = clampMultiplyMax(limits?.multiplyMax ?? DEFAULT_MULTIPLY_MAX);
  const divideMax = clampDivideMax(limits?.divideMax ?? DEFAULT_DIVIDE_MAX);

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
      if (difficulty?.band === 'full') {
        const extras = MULTIPLY_EXTRA.filter(
          ([x, y]) => x <= multiplyMax && y <= multiplyMax,
        );
        if (extras.length > 0 && Math.random() < 0.12) {
          [a, b] = extras[randomInt(0, extras.length - 1)];
        } else {
          [a, b] = pickMultiplyPair(multiplyMax, difficulty);
        }
      } else {
        [a, b] = pickMultiplyPair(multiplyMax, difficulty);
      }
      answer = a * b;
      symbol = '×';
      break;
    }
    case 'divide': {
      ({ a, b, answer } = pickDividePair(divideMax, difficulty));
      symbol = '÷';
      break;
    }
  }

  return { operation, a, b, answer, symbol };
}
