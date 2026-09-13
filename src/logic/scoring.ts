import type { AnswerResult, Operation } from './types';

const STREAK_BONUS_INTERVAL = 5;

export const POINTS_ADD_SUB = 0.25;
export const POINTS_MUL_DIV = 1;

export function getPointsPerAnswer(operation: Operation): number {
  return operation === 'add' || operation === 'subtract' ? POINTS_ADD_SUB : POINTS_MUL_DIV;
}

export function roundPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateScore(
  operation: Operation,
  currentPoints: number,
  currentStreak: number,
  goal: number,
  isCorrect: boolean,
): AnswerResult {
  if (!isCorrect) {
    return {
      pointsEarned: 0,
      streakBonus: false,
      newStreak: 0,
      goalReached: currentPoints >= goal,
    };
  }

  const basePoints = getPointsPerAnswer(operation);
  const newStreak = currentStreak + 1;
  const streakBonus = newStreak > 0 && newStreak % STREAK_BONUS_INTERVAL === 0;
  const pointsEarned = roundPoints(basePoints + (streakBonus ? basePoints : 0));
  const totalPoints = roundPoints(currentPoints + pointsEarned);

  return {
    pointsEarned,
    streakBonus,
    newStreak,
    goalReached: totalPoints >= goal && currentPoints < goal,
  };
}
