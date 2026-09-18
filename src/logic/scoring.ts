import type { AnswerResult, Operation } from './types';

export const POINTS_PER_ANSWER = 1;

export function getPointsPerAnswer(_operation: Operation): number {
  return POINTS_PER_ANSWER;
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
      newStreak: 0,
      goalReached: currentPoints >= goal,
    };
  }

  const pointsEarned = getPointsPerAnswer(operation);
  const newStreak = currentStreak + 1;
  const totalPoints = roundPoints(currentPoints + pointsEarned);

  return {
    pointsEarned,
    newStreak,
    goalReached: totalPoints >= goal && currentPoints < goal,
  };
}
