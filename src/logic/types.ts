export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export type Question = {
  operation: Operation;
  a: number;
  b: number;
  answer: number;
  symbol: '+' | '-' | '×' | '÷';
};

export type AnswerResult = {
  pointsEarned: number;
  newStreak: number;
  goalReached: boolean;
};
