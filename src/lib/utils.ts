import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'NGN'
): string {
  if (amount === null || amount === undefined) return '₦0';
  const curr = currency.toUpperCase();
  
  // Format standard Nigerian Naira or specified currency
  try {
    const formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: curr === 'USD' ? 'NGN' : curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    // If Intl output doesn't include the ₦ symbol or formats with NGN prefix, ensure ₦ symbol is used
    if (curr === 'NGN' || curr === 'USD') {
      return formatted.replace(/^[A-Z]{3}\s?/, '₦');
    }
    return formatted;
  } catch {
    return `₦${amount.toLocaleString('en-NG')}`;
  }
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM d, yyyy · h:mm a');
  } catch {
    return '—';
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || 'U';
}

export function isTaskOverdue(task: { status: string; due_date: string | null; due_at?: string | null }): boolean {
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
  if (!task.due_date) return false;

  const todayStr = new Date().toISOString().split('T')[0];
  if (task.due_date < todayStr) return true;

  if (task.due_date === todayStr && task.due_at) {
    return new Date(task.due_at).getTime() < Date.now();
  }

  return false;
}
