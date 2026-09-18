'use client';

import React from 'react';
import { TaskType, TaskPriority, TaskStatus } from '@/types/database.types';
import { TASK_TYPE_CONFIG, TASK_PRIORITY_CONFIG } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  timeframe: string;
  onTimeframeChange: (value: any) => void;
  priority: string;
  onPriorityChange: (value: any) => void;
  taskType: string;
  onTaskTypeChange: (value: any) => void;
  assignedTo?: string;
  onAssignedToChange?: (value: string) => void;
  staffList?: Array<{ id: string; first_name: string; last_name: string }>;
  onReset: () => void;
  overdueCount?: number;
  dueTodayCount?: number;
}

export function TaskFilters({
  search,
  onSearchChange,
  timeframe,
  onTimeframeChange,
  priority,
  onPriorityChange,
  taskType,
  onTaskTypeChange,
  assignedTo = 'ALL',
  onAssignedToChange,
  staffList = [],
  onReset,
  overdueCount = 0,
  dueTodayCount = 0,
}: TaskFiltersProps) {
  const timeframes = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'TODAY', label: `Today ${dueTodayCount > 0 ? `(${dueTodayCount})` : ''}` },
    { id: 'TOMORROW', label: 'Tomorrow' },
    { id: 'THIS_WEEK', label: 'This Week' },
    { id: 'OVERDUE', label: `Overdue ${overdueCount > 0 ? `(${overdueCount})` : ''}`, isDanger: overdueCount > 0 },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  const hasActiveFilters =
    search.trim().length > 0 ||
    timeframe !== 'ALL' ||
    priority !== 'ALL' ||
    taskType !== 'ALL' ||
    assignedTo !== 'ALL';

  return (
    <div className="space-y-3">
      {/* Timeframe Pill Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {timeframes.map((tf) => {
          const isActive = timeframe === tf.id;
          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => onTimeframeChange(tf.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : tf.isDanger
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tf.label}
            </button>
          );
        })}
      </div>

      {/* Filter Row: Search & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search task title, notes, account or lead..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-white"
          />
        </div>

        {/* Priority Filter */}
        <div className="w-36">
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Priorities</option>
            {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label} Priority
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="w-36">
          <select
            value={taskType}
            onChange={(e) => onTaskTypeChange(e.target.value)}
            className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Task Types</option>
            {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Filter (if provided) */}
        {staffList.length > 0 && onAssignedToChange && (
          <div className="w-40">
            <select
              value={assignedTo}
              onChange={(e) => onAssignedToChange(e.target.value)}
              className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs text-slate-500 hover:text-slate-900"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
}
