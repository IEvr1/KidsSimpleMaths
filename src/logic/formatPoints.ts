import { roundPoints } from './scoring';

export function formatPoints(value: number): string {
  const rounded = roundPoints(value);
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }
  return rounded.toFixed(2);
}
