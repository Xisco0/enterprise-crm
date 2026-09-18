'use client';

import React, { useState, useMemo } from 'react';
import { TaskWithDetails, TaskMetricsSummary } from '@/types/crm';
import { TaskTable } from './TaskTable';
import { TaskFilters } from './TaskFilters';
import { TaskMetricsCards } from './TaskMetricsCards';
import { TaskFormModal } from './TaskFormModal';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare } from 'lucide-react';
import { isTaskOverdue } from '@/lib/task-utils';

interface TasksViewProps {
  initialTasks: TaskWithDetails[];
  initialMetrics: TaskMetricsSummary;
  currentUserId: string;
  currentUserRole?: string;
  staffList?: Array<{ id: string; first_name: string; last_name: string; email: string }>;
  title?: string;
  description?: string;
  customerBasePath?: string;
  leadBasePath?: string;
  dealBasePath?: string;
}

export function TasksView({
  initialTasks,
  initialMetrics,
  currentUserId,
  currentUserRole = 'STAFF',
  staffList = [],
  title = 'Task & Follow-up Operations',
  description = 'Manage scheduled calls, client emails, team meetings, and deliverables.',
  customerBasePath = '/admin/customers',
  leadBasePath = '/admin/leads',
  dealBasePath = '/admin/deals',
}: TasksViewProps) {
  const [tasks, setTasks] = useState<TaskWithDetails[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');
  const [taskType, setTaskType] = useState<string>('ALL');
  const [assignedTo, setAssignedTo] = useState<string>('ALL');

  // Keep state synced with server props
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleEditTask = (task: TaskWithDetails) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setTimeframe('ALL');
    setPriority('ALL');
    setTaskType('ALL');
    setAssignedTo('ALL');
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.task_number.toLowerCase().includes(q) ||
          (t.customer?.company_name && t.customer.company_name.toLowerCase().includes(q)) ||
          (t.lead?.company_name && t.lead.company_name.toLowerCase().includes(q)) ||
          (t.deal?.title && t.deal.title.toLowerCase().includes(q))
      );
    }

    if (priority !== 'ALL') {
      result = result.filter((t) => t.priority === priority);
    }

    if (taskType !== 'ALL') {
      result = result.filter((t) => t.task_type === taskType);
    }

    if (assignedTo !== 'ALL') {
      result = result.filter((t) => t.assigned_to === assignedTo);
    }

    // Timeframe filtering
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const endOfWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    if (timeframe === 'TODAY') {
      result = result.filter(
        (t) => t.due_date === todayStr && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
      );
    } else if (timeframe === 'TOMORROW') {
      result = result.filter(
        (t) => t.due_date === tomorrowStr && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
      );
    } else if (timeframe === 'THIS_WEEK') {
      result = result.filter(
        (t) =>
          t.due_date &&
          t.due_date >= todayStr &&
          t.due_date <= endOfWeekStr &&
          t.status !== 'COMPLETED' &&
          t.status !== 'CANCELLED'
      );
    } else if (timeframe === 'OVERDUE') {
      result = result.filter((t) => isTaskOverdue(t));
    } else if (timeframe === 'COMPLETED') {
      result = result.filter((t) => t.status === 'COMPLETED');
    }

    return result;
  }, [tasks, search, priority, taskType, assignedTo, timeframe]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-slate-900" />
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-3.5 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Task
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <TaskMetricsCards metrics={initialMetrics} />

      {/* Filter Control Box */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          priority={priority}
          onPriorityChange={setPriority}
          taskType={taskType}
          onTaskTypeChange={setTaskType}
          assignedTo={assignedTo}
          onAssignedToChange={currentUserRole === 'ADMIN' ? setAssignedTo : undefined}
          staffList={staffList}
          onReset={handleResetFilters}
          overdueCount={initialMetrics.overdueCount}
          dueTodayCount={initialMetrics.dueTodayCount}
        />
      </div>

      {/* Task Data Table */}
      <TaskTable
        tasks={filteredTasks}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onEditTask={handleEditTask}
        customerBasePath={customerBasePath}
        leadBasePath={leadBasePath}
        dealBasePath={dealBasePath}
      />

      {/* Create / Edit Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        currentUserId={currentUserId}
        initialData={editingTask}
        staffList={staffList}
      />
    </div>
  );
}
