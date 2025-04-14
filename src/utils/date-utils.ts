/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to a human-readable string (DD/MM/YYYY)
 */
export function formatDate(date: Date): string {
  if (!date) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Check if a date is a weekend day (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Check if a date is a holiday (example implementation)
 * In a real application, this would check against a database of holidays
 */
export function isHoliday(date: Date): boolean {
  // Example fixed holidays (in a real app, this would come from a database or API)
  const holidays = [
    // New Year's Day
    { month: 0, day: 1 },
    // Christmas
    { month: 11, day: 25 },
    // Additional holidays would be added here
  ];

  const month = date.getMonth(); // 0-11
  const day = date.getDate(); // 1-31

  return holidays.some(
    (holiday) => holiday.month === month && holiday.day === day
  );
}

/**
 * Calculate business days between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @param includeHolidays If true, holidays will be counted as business days
 * @returns The number of business days between the dates
 */
export function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  includeHolidays: boolean = false
): number {
  let count = 0;
  const curDate = new Date(startDate.getTime());

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    const isHolidayDay = isHoliday(curDate);

    // Include day in count if:
    // 1. It's a weekday (not weekend)
    // 2. OR we're including holidays and it's a holiday
    if (!isWeekendDay || (includeHolidays && isHolidayDay)) {
      count++;
    }

    // Move to the next day
    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

/**
 * Format a date range as a string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  if (!startDate || !endDate) return "";

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
