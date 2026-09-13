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
  streakBonus: boolean;
  newStreak: number;
  goalReached: boolean;
};
