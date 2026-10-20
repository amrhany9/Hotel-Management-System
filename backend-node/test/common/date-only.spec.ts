import { addDays, daysBetween, isValidDateOnly, monthRange, nightsInRange } from '../../src/domain/common/date-only';

describe('DateOnlyTests', () => {
  it('IsValidDateOnly_AcceptsOnlyRealCalendarDates', () => {
    expect(isValidDateOnly('2026-09-01')).toBe(true);
    expect(isValidDateOnly('2028-02-29')).toBe(true);
    expect(isValidDateOnly('2026-02-29')).toBe(false);
    expect(isValidDateOnly('2026-9-1')).toBe(false);
    expect(isValidDateOnly('2026-09-01T00:00:00Z')).toBe(false);
    expect(isValidDateOnly(20260901)).toBe(false);
  });

  it('DaysBetween_CountsNightsAcrossMonthAndDstBoundaries', () => {
    expect(daysBetween('2026-09-01', '2026-09-05')).toBe(4);
    expect(daysBetween('2026-10-20', '2026-11-03')).toBe(14);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(addDays('2026-02-27', 2)).toBe('2026-03-01');
  });

  it('NightsInRange_ClipsAStayToAHalfOpenWindow', () => {
    expect(nightsInRange('2026-08-08', '2026-08-14', '2026-08-01', '2026-08-10')).toBe(2);
    expect(nightsInRange('2026-08-10', '2026-08-14', '2026-08-01', '2026-08-10')).toBe(0);
  });

  it('MonthRange_ReturnsFirstDayOfMonthAndOfNextMonth', () => {
    expect(monthRange('2026-12-15')).toEqual({ start: '2026-12-01', end: '2027-01-01' });
  });
});
