'use client';

import React from 'react';
import Link from 'next/link';
import { TaskWithDetails } from '@/types/crm';
import { TASK_TYPE_CONFIG, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '@/lib/constants';
import { toggleTaskComplete, cancelTask, deleteTask } from '@/lib/actions/tasks';
import { isTaskOverdue } from '@/lib/task-utils';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Building2,
  User,
  TrendingUp,
  Edit2,
  Trash2,
  XCircle,
  RotateCcw,
  Calendar,
  Phone,
  Mail,
  Users,
  CalendarCheck,
  CheckSquare,
  Activity,
} from 'lucide-react';

interface TaskTableProps {
  tasks: TaskWithDetails[];
  currentUserId: string;
  currentUserRole?: string;
  onEditTask: (task: TaskWithDetails) => void;
  customerBasePath?: string;
  leadBasePath?: string;
  dealBasePath?: string;
}

export function TaskTable({
  tasks,
  currentUserId,
  currentUserRole = 'STAFF',
  onEditTask,
  customerBasePath = '/admin/customers',
  leadBasePath = '/admin/leads',
  dealBasePath = '/admin/deals',
}: TaskTableProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    setProcessingId(taskId);
    try {
      const isCompleted = currentStatus === 'COMPLETED';
      await toggleTaskComplete(taskId, !isCompleted, currentUserId, currentUserRole);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (taskId: string) => {
    if (!confirm('Are you sure you want to cancel this task?')) return;
    setProcessingId(taskId);
    try {
      await cancelTask(taskId, currentUserId, currentUserRole);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task record?')) return;
    setProcessingId(taskId);
    try {
      await deleteTask(taskId, currentUserId, currentUserRole);
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-3 w-3" />;
      case 'EMAIL':
        return <Mail className="h-3 w-3" />;
      case 'MEETING':
        return <Users className="h-3 w-3" />;
      case 'FOLLOW_UP':
        return <CalendarCheck className="h-3 w-3" />;
      case 'TODO':
        return <CheckSquare className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <CheckSquare className="h-8 w-8 text-slate-400 mb-2" />
        <h3 className="text-xs font-semibold text-slate-800">No tasks found</h3>
        <p className="mt-1 text-[11px] text-slate-500 max-w-sm">
          No tasks match the active filters or timeframe. Create a new task or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-3 w-10 text-center">Done</th>
            <th className="py-3 px-3">Task Details</th>
            <th className="py-3 px-3">Type</th>
            <th className="py-3 px-3">Priority</th>
            <th className="py-3 px-3">Related Record</th>
            <th className="py-3 px-3">Due Date</th>
            <th className="py-3 px-3">Assigned Rep</th>
            <th className="py-3 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isCancelled = task.status === 'CANCELLED';
            const overdue = isTaskOverdue(task);
            const typeCfg = TASK_TYPE_CONFIG[task.task_type] || {
              label: task.task_type,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
              border: 'border-slate-200',
            };
            const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] || {
              label: task.priority,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
              border: 'border-slate-200',
            };
            const statusCfg = TASK_STATUS_CONFIG[task.status] || {
              label: task.status,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
              border: 'border-slate-200',
            };

            const canEdit =
              currentUserRole === 'ADMIN' ||
              task.assigned_to === currentUserId ||
              task.created_by === currentUserId;

            return (
              <tr
                key={task.id}
                className={`hover:bg-slate-50/80 transition-colors ${
                  isCompleted ? 'bg-slate-50/40 opacity-75' : isCancelled ? 'bg-zinc-50/60 opacity-60' : ''
                }`}
              >
                {/* Complete Toggle Checkbox */}
                <td className="py-3 px-3 text-center align-top">
                  <button
                    type="button"
                    disabled={processingId === task.id || isCancelled}
                    onClick={() => handleToggleComplete(task.id, task.status)}
                    className="inline-flex items-center justify-center text-slate-400 hover:text-emerald-600 focus:outline-none transition-colors cursor-pointer"
                    title={isCompleted ? 'Reopen task' : 'Mark complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 hover:text-slate-600" />
                    )}
                  </button>
                </td>

                {/* Title & Description & Reference */}
                <td className="py-3 px-3 align-top max-w-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{task.task_number}</span>
                      {overdue && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0 rounded">
                          <AlertTriangle className="h-2.5 w-2.5 text-rose-600" />
                          OVERDUE
                        </span>
                      )}
                      {isCancelled && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 text-zinc-500 border-zinc-300">
                          Cancelled
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`font-semibold text-slate-900 ${
                        isCompleted ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* Task Type */}
                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 border ${typeCfg.border} ${typeCfg.bg} ${typeCfg.color}`}
                  >
                    {getTypeIcon(task.task_type)}
                    {typeCfg.label}
                  </Badge>
                </td>

                {/* Priority */}
                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold px-2 py-0.5 border ${priorityCfg.border} ${priorityCfg.bg} ${priorityCfg.color}`}
                  >
                    {priorityCfg.label}
                  </Badge>
                </td>

                {/* Related CRM Record */}
                <td className="py-3 px-3 align-top">
                  <div className="space-y-1 text-[11px]">
                    {task.customer && (
                      <Link
                        href={`${customerBasePath}/${task.customer.id}`}
                        className="inline-flex items-center gap-1 text-slate-800 hover:text-blue-600 hover:underline font-medium block truncate max-w-[180px]"
                      >
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{task.customer.company_name || task.customer.name}</span>
                      </Link>
                    )}
                    {task.lead && (
                      <Link
                        href={`${leadBasePath}/${task.lead.id}`}
                        className="inline-flex items-center gap-1 text-slate-800 hover:text-blue-600 hover:underline font-medium block truncate max-w-[180px]"
                      >
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {task.lead.first_name} {task.lead.last_name}
                        </span>
                      </Link>
                    )}
                    {task.deal && (
                      <Link
                        href={`${dealBasePath}/${task.deal.id}`}
                        className="inline-flex items-center gap-1 text-slate-800 hover:text-blue-600 hover:underline font-medium block truncate max-w-[180px]"
                      >
                        <TrendingUp className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{task.deal.title}</span>
                      </Link>
                    )}
                    {!task.customer && !task.lead && !task.deal && (
                      <span className="text-slate-400 italic">Standalone Task</span>
                    )}
                  </div>
                </td>

                {/* Due Date & Time */}
                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <div className="space-y-0.5">
                    <span
                      className={`font-medium block ${
                        overdue ? 'text-rose-700 font-bold' : isCompleted ? 'text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {formatDate(task.due_date)}
                    </span>
                    {task.due_time && (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />
                        {task.due_time.substring(0, 5)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Assigned Rep */}
                <td className="py-3 px-3 align-top whitespace-nowrap">
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                        {task.assignee.first_name[0]}
                      </div>
                      <span className="font-medium text-slate-800 text-[11px]">
                        {task.assignee.first_name} {task.assignee.last_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                  {canEdit && (
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTask(task)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800"
                        title="Edit task"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>

                      {!isCancelled && !isCompleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(task.id)}
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-700"
                          title="Cancel task"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                        className="h-6 w-6 p-0 text-rose-400 hover:text-rose-700"
                        title="Delete task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
