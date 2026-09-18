import { TaskStatus } from '@/types/crm';

/**
 * Check if a task is overdue relative to today / current time
 */
export function isTaskOverdue(task: { status: TaskStatus | string; due_date: string | null; due_at?: string | null }): boolean {
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
  if (!task.due_date) return false;

  const todayStr = new Date().toISOString().split('T')[0];
  if (task.due_date < todayStr) return true;

  if (task.due_date === todayStr && task.due_at) {
    return new Date(task.due_at).getTime() < Date.now();
  }

  return false;
}
