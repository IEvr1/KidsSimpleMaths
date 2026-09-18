export type DifficultyBand = 'easy' | 'medium' | 'full';

export type OpDifficulty = {
  band: DifficultyBand;
  bandCorrectStreak: number;
  weak: Record<number, number>;
};

export type DifficultyStore = {
  add: OpDifficulty;
  subtract: OpDifficulty;
  multiply: OpDifficulty;
  divide: OpDifficulty;
};

export type DifficultyProfile = OpDifficulty;
