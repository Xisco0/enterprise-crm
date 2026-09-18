/**
 * Enterprise CRM Date Range Engine for Reports & Analytics
 * Provides deterministic date range calculations, presets, and intelligent timeline grouping.
 */

export type DateRangePreset = 
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export interface DateRangeResult {
  startDate: Date;
  endDate: Date;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string;   // YYYY-MM-DD
  label: string;
  preset: DateRangePreset;
  grouping: 'daily' | 'weekly' | 'monthly';
}

export function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Resolves a date preset or custom range into exact start/end dates and formatting metadata
 */
export function resolveDateRange(
  preset: DateRangePreset = 'THIS_MONTH',
  customFrom?: string,
  customTo?: string,
  nowDate: Date = new Date()
): DateRangeResult {
  const now = new Date(nowDate.getTime());
  let startDate: Date;
  let endDate: Date;
  let label = 'This Month';
  let grouping: 'daily' | 'weekly' | 'monthly' = 'daily';

  switch (preset) {
    case 'TODAY': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      label = 'Today';
      grouping = 'daily';
      break;
    }
    case 'YESTERDAY': {
      const yesterday = new Date(now.getTime() - 86400000);
      startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
      endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
      label = 'Yesterday';
      grouping = 'daily';
      break;
    }
    case 'THIS_WEEK': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 6 * 86400000);
      endDate.setHours(23, 59, 59, 999);
      label = 'This Week';
      grouping = 'daily';
      break;
    }
    case 'LAST_WEEK': {
      const day = now.getDay();
      const diff = now.getDate() - day - 6; // Previous Monday
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 6 * 86400000);
      endDate.setHours(23, 59, 59, 999);
      label = 'Last Week';
      grouping = 'daily';
      break;
    }
    case 'THIS_MONTH': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      label = 'This Month';
      grouping = 'daily';
      break;
    }
    case 'LAST_MONTH': {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      label = 'Last Month';
      grouping = 'daily';
      break;
    }
    case 'THIS_QUARTER': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
      label = `Q${currentQuarter + 1} ${now.getFullYear()}`;
      grouping = 'weekly';
      break;
    }
    case 'THIS_YEAR': {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      label = `Year ${now.getFullYear()}`;
      grouping = 'monthly';
      break;
    }
    case 'CUSTOM':
    default: {
      if (customFrom && customTo) {
        const fromParts = customFrom.split('-').map(Number);
        const toParts = customTo.split('-').map(Number);
        startDate = new Date(fromParts[0], fromParts[1] - 1, fromParts[2], 0, 0, 0, 0);
        endDate = new Date(toParts[0], toParts[1] - 1, toParts[2], 23, 59, 59, 999);
      } else if (customFrom) {
        const fromParts = customFrom.split('-').map(Number);
        startDate = new Date(fromParts[0], fromParts[1] - 1, fromParts[2], 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else {
        // Fallback to This Month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 31) {
        grouping = 'daily';
      } else if (diffDays <= 180) {
        grouping = 'weekly';
      } else {
        grouping = 'monthly';
      }
      label = `${formatDateToYYYYMMDD(startDate)} to ${formatDateToYYYYMMDD(endDate)}`;
      break;
    }
  }

  return {
    startDate,
    endDate,
    startDateStr: formatDateToYYYYMMDD(startDate),
    endDateStr: formatDateToYYYYMMDD(endDate),
    label,
    preset,
    grouping,
  };
}

/**
 * Checks if a given ISO date string or Date is within the given start/end boundaries
 */
export function isDateInRange(
  dateValue: string | Date | null | undefined,
  startDate: Date,
  endDate: Date
): boolean {
  if (!dateValue) return false;
  const time = new Date(dateValue).getTime();
  if (isNaN(time)) return false;
  return time >= startDate.getTime() && time <= endDate.getTime();
}

/**
 * Generates continuous timeline buckets between startDate and endDate
 */
export function generateTimelineBuckets(
  startDate: Date,
  endDate: Date,
  grouping: 'daily' | 'weekly' | 'monthly' = 'daily'
): Array<{ key: string; label: string; start: number; end: number }> {
  const buckets: Array<{ key: string; label: string; start: number; end: number }> = [];

  if (grouping === 'daily') {
    const current = new Date(startDate.getTime());
    current.setHours(0, 0, 0, 0);

    while (current.getTime() <= endDate.getTime()) {
      const key = formatDateToYYYYMMDD(current);
      const start = new Date(current).getTime();
      const end = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999).getTime();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[current.getMonth()]} ${current.getDate()}`;

      buckets.push({ key, label, start, end });
      current.setDate(current.getDate() + 1);
    }
  } else if (grouping === 'weekly') {
    const current = new Date(startDate.getTime());
    let weekIndex = 1;

    while (current.getTime() <= endDate.getTime()) {
      const start = current.getTime();
      const weekEnd = new Date(current.getTime() + 6 * 86400000);
      weekEnd.setHours(23, 59, 59, 999);
      const actualEnd = Math.min(weekEnd.getTime(), endDate.getTime());
      const key = `W${weekIndex}-${formatDateToYYYYMMDD(current)}`;
      const label = `W${weekIndex} (${current.getMonth() + 1}/${current.getDate()})`;

      buckets.push({ key, label, start, end: actualEnd });
      current.setDate(current.getDate() + 7);
      weekIndex++;
    }
  } else {
    // monthly
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    while (current.getTime() <= endDate.getTime()) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const start = current.getTime();
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
      const actualEnd = Math.min(monthEnd.getTime(), endDate.getTime());
      const label = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;

      buckets.push({ key, label, start, end: actualEnd });
      current.setMonth(current.getMonth() + 1);
    }
  }

  return buckets;
}
