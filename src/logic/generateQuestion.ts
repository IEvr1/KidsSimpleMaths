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

function pickMultiplyPair(multiplyMax: number): [number, number] {
  const extras = MULTIPLY_EXTRA.filter(([a, b]) => a <= multiplyMax && b <= multiplyMax);

  if (extras.length > 0 && Math.random() < 0.15) {
    return extras[randomInt(0, extras.length - 1)];
  }

  return [randomInt(0, multiplyMax), randomInt(0, multiplyMax)];
}

export function generateQuestion(
  operation: Operation,
  limits?: Partial<OperationLimits>,
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
      a = randomInt(1, addSubMax);
      b = randomInt(1, addSubMax);
      answer = a + b;
      symbol = '+';
      break;
    }
    case 'subtract': {
      a = randomInt(1, addSubMax);
      b = randomInt(1, a);
      answer = a - b;
      symbol = '-';
      break;
    }
    case 'multiply': {
      [a, b] = pickMultiplyPair(multiplyMax);
      answer = a * b;
      symbol = '×';
      break;
    }
    case 'divide': {
      b = randomInt(1, divideMax);
      const quotientMax = Math.min(12, divideMax);
      const quotient = randomInt(0, quotientMax);
      a = b * quotient;
      answer = quotient;
      symbol = '÷';
      break;
    }
  }

  return { operation, a, b, answer, symbol };
}
