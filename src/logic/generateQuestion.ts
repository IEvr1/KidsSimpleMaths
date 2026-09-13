import type { Operation, Question } from './types';

const ADD_SUB_MAX = 50;

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

function pickMultiplyPair(): [number, number] {
  if (Math.random() < 0.15) {
    return MULTIPLY_EXTRA[randomInt(0, MULTIPLY_EXTRA.length - 1)];
  }
  return [randomInt(1, 10), randomInt(1, 10)];
}

export function generateQuestion(operation: Operation): Question {
  let a: number;
  let b: number;
  let answer: number;
  let symbol: Question['symbol'];

  switch (operation) {
    case 'add': {
      a = randomInt(1, ADD_SUB_MAX);
      b = randomInt(1, ADD_SUB_MAX);
      answer = a + b;
      symbol = '+';
      break;
    }
    case 'subtract': {
      a = randomInt(1, ADD_SUB_MAX);
      b = randomInt(1, a);
      answer = a - b;
      symbol = '-';
      break;
    }
    case 'multiply': {
      [a, b] = pickMultiplyPair();
      answer = a * b;
      symbol = '×';
      break;
    }
    case 'divide': {
      b = randomInt(2, 10);
      const quotient = randomInt(1, 12);
      a = b * quotient;
      answer = quotient;
      symbol = '÷';
      break;
    }
  }

  return { operation, a, b, answer, symbol };
}
