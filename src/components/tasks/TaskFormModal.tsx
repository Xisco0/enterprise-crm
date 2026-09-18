'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskWithDetails } from '@/types/crm';
import { createTask, updateTask } from '@/lib/actions/tasks';
import { TASK_TYPE_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/constants';
import { TaskType, TaskPriority, TaskStatus } from '@/types/database.types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  User,
  CheckSquare,
  AlertCircle,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  initialData?: TaskWithDetails | null;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  dealId?: string;
  dealTitle?: string;
  staffList?: Array<{ id: string; first_name: string; last_name: string; email: string }>;
  onSuccess?: () => void;
}

export function TaskFormModal({
  isOpen,
  onClose,
  currentUserId = '00000000-0000-0000-0000-000000000002',
  initialData,
  customerId,
  customerName,
  leadId,
  leadName,
  dealId,
  dealTitle,
  staffList = [],
  onSuccess,
}: TaskFormModalProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUserId);

  const [targetCustomerId, setTargetCustomerId] = useState<string | undefined>(customerId);
  const [targetLeadId, setTargetLeadId] = useState<string | undefined>(leadId);
  const [targetDealId, setTargetDealId] = useState<string | undefined>(dealId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTaskType(initialData.task_type || 'TODO');
      setPriority(initialData.priority || 'MEDIUM');
      setStatus(initialData.status || 'PENDING');
      setDueDate(initialData.due_date || '');
      setDueTime(initialData.due_time || '');
      setAssignedTo(initialData.assigned_to || currentUserId);
      setTargetCustomerId(initialData.customer_id || customerId);
      setTargetLeadId(initialData.lead_id || leadId);
      setTargetDealId(initialData.deal_id || dealId);
    } else {
      setTitle('');
      setDescription('');
      setTaskType('TODO');
      setPriority('MEDIUM');
      setStatus('PENDING');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('17:00');
      setAssignedTo(currentUserId);
      setTargetCustomerId(customerId);
      setTargetLeadId(leadId);
      setTargetDealId(dealId);
    }
    setError(null);
  }, [initialData, customerId, leadId, dealId, currentUserId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        const res = await updateTask(
          initialData.id,
          {
            title: title.trim(),
            description: description.trim() || undefined,
            task_type: taskType,
            priority,
            status,
            due_date: dueDate || undefined,
            due_time: dueTime || undefined,
            assigned_to: assignedTo || undefined,
            customer_id: targetCustomerId || undefined,
            lead_id: targetLeadId || undefined,
            deal_id: targetDealId || undefined,
          },
          currentUserId
        );

        if (res.error) {
          setError(res.error);
          return;
        }
      } else {
        const res = await createTask(
          {
            title: title.trim(),
            description: description.trim() || undefined,
            task_type: taskType,
            priority,
            status: 'PENDING',
            due_date: dueDate || undefined,
            due_time: dueTime || undefined,
            assigned_to: assignedTo || undefined,
            customer_id: targetCustomerId || undefined,
            lead_id: targetLeadId || undefined,
            deal_id: targetDealId || undefined,
          },
          currentUserId
        );

        if (res.error) {
          setError(res.error);
          return;
        }
      }

      onClose();
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Task: ${initialData?.task_number}` : 'Create New Task & Follow-up'}
      description="Schedule actionable follow-up calls, emails, meetings, and internal milestones."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Context Notice if Preselected */}
        {(customerName || leadName || dealTitle) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1">
            <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
              Associated Record Context:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-slate-800">
              {customerName && (
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  <Building2 className="h-3 w-3 text-slate-500" />
                  <strong>Customer:</strong> {customerName}
                </span>
              )}
              {leadName && (
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  <User className="h-3 w-3 text-slate-500" />
                  <strong>Lead:</strong> {leadName}
                </span>
              )}
              {dealTitle && (
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  <TrendingUp className="h-3 w-3 text-slate-500" />
                  <strong>Deal:</strong> {dealTitle}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Task Title */}
        <div className="space-y-1.5">
          <label htmlFor="task-title" className="text-xs font-semibold text-slate-800 block">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Call John regarding enterprise proposal review"
            required
            className="h-9 text-xs"
          />
        </div>

        {/* Type and Priority Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="task-type" className="text-xs font-semibold text-slate-800 block">
              Task Type
            </label>
            <select
              id="task-type"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-priority" className="text-xs font-semibold text-slate-800 block">
              Priority Level
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="task-due-date" className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" /> Due Date
            </label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-due-time" className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" /> Due Time (Optional)
            </label>
            <Input
              id="task-due-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Staff Assignment */}
        {staffList.length > 0 && (
          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <User className="h-3 w-3 text-slate-400" /> Assigned Staff Member
            </label>
            <select
              id="task-assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name} ({staff.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Selector (If Editing) */}
        {isEditing && (
          <div className="space-y-1.5">
            <label htmlFor="task-status" className="text-xs font-semibold text-slate-800 block">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}

        {/* Description / Additional Notes */}
        <div className="space-y-1.5">
          <label htmlFor="task-desc" className="text-xs font-semibold text-slate-800 block">
            Action Item Details & Directives (Optional)
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Include specific questions, deliverables, or checklist instructions..."
            rows={3}
            className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
