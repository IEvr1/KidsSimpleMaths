export type OperationLimits = {
  addSubMax: number;
  multiplyMax: number;
  divideMax: number;
};

export const DEFAULT_ADD_SUB_MAX = 50;
export const DEFAULT_MULTIPLY_MAX = 10;
export const DEFAULT_DIVIDE_MAX = 10;

export function clampAddSubMax(value: number): number {
  return Math.min(999, Math.max(5, value));
}

export function clampMultiplyMax(value: number): number {
  return Math.min(13, Math.max(0, value));
}

export function clampDivideMax(value: number): number {
  return Math.min(20, Math.max(2, value));
}
