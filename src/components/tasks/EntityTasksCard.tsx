'use client';

import React, { useState } from 'react';
import { TaskWithDetails } from '@/types/crm';
import { TASK_TYPE_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/constants';
import { toggleTaskComplete } from '@/lib/actions/tasks';
import { isTaskOverdue } from '@/lib/task-utils';
import { TaskFormModal } from './TaskFormModal';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Edit2,
  Calendar,
  Phone,
  Mail,
  Users,
  CalendarCheck,
  Activity,
} from 'lucide-react';

interface EntityTasksCardProps {
  tasks: TaskWithDetails[];
  currentUserId: string;
  currentUserRole?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  dealId?: string;
  dealTitle?: string;
  title?: string;
}

export function EntityTasksCard({
  tasks,
  currentUserId,
  currentUserRole = 'STAFF',
  customerId,
  customerName,
  leadId,
  leadName,
  dealId,
  dealTitle,
  title = 'Tasks & Scheduled Follow-ups',
}: EntityTasksCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    setProcessingId(taskId);
    try {
      const isCompleted = currentStatus === 'COMPLETED';
      await toggleTaskComplete(taskId, !isCompleted, currentUserId, currentUserRole);
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

  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-xs p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-slate-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {pendingTasks.length} pending action {pendingTasks.length === 1 ? 'item' : 'items'} scheduled for this account.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Task
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
          <CheckSquare className="h-6 w-6 text-slate-400 mb-1.5" />
          <span className="text-xs font-semibold text-slate-700">No tasks scheduled</span>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Keep track of follow-up calls, emails, or deliverables for this record.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="mt-2.5 h-7 text-xs bg-white"
          >
            <Plus className="h-3 w-3 mr-1" /> Schedule Follow-up
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Pending Tasks */}
          {pendingTasks.map((task) => {
            const overdue = isTaskOverdue(task);
            const priorityCfg = TASK_PRIORITY_CONFIG[task.priority];
            const typeCfg = TASK_TYPE_CONFIG[task.task_type];

            return (
              <div
                key={task.id}
                className={`flex items-start justify-between gap-3 p-3 rounded-md border transition-all ${
                  overdue ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    disabled={processingId === task.id}
                    onClick={() => handleToggleComplete(task.id, task.status)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Mark complete"
                  >
                    <Circle className="h-4 w-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900">{task.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 border ${typeCfg.border} ${typeCfg.bg} ${typeCfg.color}`}
                      >
                        {getTypeIcon(task.task_type)}
                        <span className="ml-1">{typeCfg.label}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 border ${priorityCfg.border} ${priorityCfg.bg} ${priorityCfg.color}`}
                      >
                        {priorityCfg.label}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                      <span className={`flex items-center gap-1 font-medium ${overdue ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Due: {formatDate(task.due_date)} {task.due_time ? `@ ${task.due_time.substring(0, 5)}` : ''}
                      </span>
                      {overdue && (
                        <span className="text-rose-700 font-bold bg-rose-100/80 px-1 rounded">
                          OVERDUE
                        </span>
                      )}
                      {task.assignee && (
                        <span>
                          • Assigned to {task.assignee.first_name} {task.assignee.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800 shrink-0"
                  title="Edit task"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}

          {/* Completed Tasks (Collapsible/Subtle) */}
          {completedTasks.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Completed ({completedTasks.length})
              </span>
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-50/40 border border-slate-100 text-xs text-slate-400"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId === task.id}
                      onClick={() => handleToggleComplete(task.id, task.status)}
                      className="text-emerald-600 hover:text-slate-400 transition-colors cursor-pointer"
                      title="Reopen task"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <span className="line-through text-slate-500 text-[11px]">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{formatDate(task.completed_at || task.updated_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        currentUserId={currentUserId}
        initialData={editingTask}
        customerId={customerId}
        customerName={customerName}
        leadId={leadId}
        leadName={leadName}
        dealId={dealId}
        dealTitle={dealTitle}
      />
    </div>
  );
}
