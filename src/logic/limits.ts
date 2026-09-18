import type { MultiplierZone } from './multiplierZone';
import { DEFAULT_MULTIPLIER_ZONE } from './multiplierZone';
import type { TableSelection } from './tableSelection';
import {
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLY_TABLES,
} from './tableSelection';

export type OperationLimits = {
  addSubMax: number;
  multiplyTables: TableSelection;
  divideDivisors: TableSelection;
  multiplierZone: MultiplierZone;
};

export const DEFAULT_ADD_SUB_MAX = 50;
export { DEFAULT_MULTIPLY_TABLES, DEFAULT_DIVIDE_DIVISORS, DEFAULT_MULTIPLIER_ZONE };

export function clampAddSubMax(value: number): number {
  return Math.min(999, Math.max(5, value));
}

