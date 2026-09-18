import type { TableSelection } from './tableSelection';
import {
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLY_TABLES,
} from './tableSelection';

export type OperationLimits = {
  addSubMax: number;
  multiplyTables: TableSelection;
  divideDivisors: TableSelection;
};

export const DEFAULT_ADD_SUB_MAX = 50;
export { DEFAULT_MULTIPLY_TABLES, DEFAULT_DIVIDE_DIVISORS };

export function clampAddSubMax(value: number): number {
  return Math.min(999, Math.max(5, value));
}

