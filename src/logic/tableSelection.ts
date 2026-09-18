export const TABLE_COUNT = 13;
export const TABLE_MIN = 0;
export const TABLE_MAX = 12;
export const MULTIPLY_FACTOR_MAX = 10;

export type TableSelection = boolean[];

export function createTableSelection(from: number, to: number): TableSelection {
  return Array.from({ length: TABLE_COUNT }, (_, i) => i >= from && i <= to);
}

export const DEFAULT_MULTIPLY_TABLES = createTableSelection(0, 10);
export const DEFAULT_DIVIDE_DIVISORS = createTableSelection(1, 10);

export function getEnabledNumbers(selection: TableSelection): number[] {
  const enabled: number[] = [];
  for (let i = TABLE_MIN; i <= TABLE_MAX; i++) {
    if (selection[i]) enabled.push(i);
  }
  return enabled;
}

export function parseTableSelection(raw: unknown, fallback: TableSelection): TableSelection {
  if (!Array.isArray(raw) || raw.length !== TABLE_COUNT) {
    return [...fallback];
  }
  return raw.map((value) => Boolean(value));
}

export function migrateMultiplyTablesFromMax(max: number): TableSelection {
  const cap = Math.min(TABLE_MAX, Math.max(TABLE_MIN, max));
  return createTableSelection(TABLE_MIN, cap);
}

export function migrateDivideDivisorsFromMax(max: number): TableSelection {
  const cap = Math.min(TABLE_MAX, Math.max(1, max));
  return createTableSelection(1, cap);
}

export function normalizeTableSelection(
  selection: TableSelection,
  fallback: TableSelection,
): TableSelection {
  return selection.some(Boolean) ? selection : [...fallback];
}

export function toggleTableSelection(
  selection: TableSelection,
  index: number,
): TableSelection {
  if (index < TABLE_MIN || index > TABLE_MAX) return selection;
  const next = [...selection];
  next[index] = !next[index];
  return next;
}

export function tableSelectionToStorage(selection: TableSelection): string {
  return JSON.stringify(selection);
}
