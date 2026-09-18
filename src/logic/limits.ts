import type { MultiplierZone } from './multiplierZone';
import { DEFAULT_MULTIPLIER_ZONE } from './multiplierZone';
import type { SumZone } from './sumZone';
import { DEFAULT_SUM_ZONE } from './sumZone';
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
  sumZone: SumZone;
};

export const DEFAULT_ADD_SUB_MAX = 50;
export {
  DEFAULT_MULTIPLY_TABLES,
  DEFAULT_DIVIDE_DIVISORS,
  DEFAULT_MULTIPLIER_ZONE,
  DEFAULT_SUM_ZONE,
};

export function clampAddSubMax(value: number): number {
  return Math.min(999, Math.max(5, value));
}

