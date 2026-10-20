export type DateOnly = string;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isValidDateOnly(value: unknown): value is DateOnly {
  if (typeof value !== 'string') return false;
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function toUtcMs(date: DateOnly): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtcMs(ms: number): DateOnly {
  return new Date(ms).toISOString().slice(0, 10);
}

export function daysBetween(from: DateOnly, to: DateOnly): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

export function addDays(date: DateOnly, days: number): DateOnly {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

export function todayUtc(now: Date = new Date()): DateOnly {
  return now.toISOString().slice(0, 10);
}

export function monthRange(date: DateOnly): { start: DateOnly; end: DateOnly } {
  const [year, month] = date.split('-').map(Number);
  return {
    start: fromUtcMs(Date.UTC(year, month - 1, 1)),
    end: fromUtcMs(Date.UTC(year, month, 1)),
  };
}

export const maxDate = (a: DateOnly, b: DateOnly): DateOnly => (a > b ? a : b);
export const minDate = (a: DateOnly, b: DateOnly): DateOnly => (a < b ? a : b);

export function nightsInRange(checkIn: DateOnly, checkOut: DateOnly, from: DateOnly, to: DateOnly): number {
  return Math.max(0, daysBetween(maxDate(checkIn, from), minDate(checkOut, to)));
}
