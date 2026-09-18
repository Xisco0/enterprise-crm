'use client';

import React, { useState } from 'react';
import { TaskReportData } from '@/types/reports';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  BarChart2, 
  Table as TableIcon 
} from 'lucide-react';
import { TASK_PRIORITY_CONFIG, TASK_TYPE_CONFIG } from '@/lib/constants';

interface TaskReportViewProps {
  data: TaskReportData;
  periodLabel: string;
}

export function TaskReportView({ data, periodLabel }: TaskReportViewProps) {
  const [showTableMode, setShowTableMode] = useState(false);

  const maxTimelineCount = Math.max(
    ...data.completionTimeline.map(t => Math.max(t.created, t.completed)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Tasks Created"
          value={data.totalTasksCreatedInPeriod}
          subtitle={`Scheduled in ${periodLabel}`}
          icon={CheckSquare}
        />
        <StatCard
          title="Completed in Period"
          value={data.tasksCompletedInPeriod}
          subtitle={`Finalized during ${periodLabel}`}
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending Queue"
          value={data.pendingCount}
          subtitle="Awaiting action"
          icon={Clock}
        />
        <StatCard
          title="In Progress"
          value={data.inProgressCount}
          subtitle="Currently underway"
          icon={CheckSquare}
        />
        <StatCard
          title="Overdue Tasks"
          value={data.overdueCount}
          subtitle="Past due deadline"
          trend={data.overdueCount > 0 ? 'down' : 'up'}
          icon={AlertTriangle}
        />
      </div>

      {/* Task Completion Rate Highlight */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Task Execution & Velocity
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              Ratio of completed deliverables relative to tasks scheduled during {periodLabel}.
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            {data.completionRate !== null ? (
              <>
                <div className="text-3xl font-extrabold font-mono text-slate-900">
                  {data.completionRate}%
                </div>
                <div className="text-xs text-slate-500">
                  ({data.tasksCompletedInPeriod} completed of {data.totalTasksCreatedInPeriod} created)
                </div>
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-500">
                No tasks scheduled in this period.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Task Types & Task Priorities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Task Categories & Follow-up Types</CardTitle>
            <CardDescription>Breakdown of action items by operational classification</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byType.map((item) => (
                  <TableRow key={item.type}>
                    <TableCell className="font-semibold text-xs text-slate-800">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-xs text-slate-900">
                      {item.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Task Priorities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Urgency breakdown of scheduled operational tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byPriority.map((item) => {
                  const config = TASK_PRIORITY_CONFIG[item.priority] || {
                    label: item.label,
                    bg: 'bg-slate-100',
                    color: 'text-slate-700',
                  };
                  return (
                    <TableRow key={item.priority}>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${config.bg} ${config.color}`}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs text-slate-900">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Task Creation vs Completion Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Task Creation vs. Completion Velocity</CardTitle>
            <CardDescription>Task output and resolution timeline across {periodLabel}</CardDescription>
          </div>
          <button
            type="button"
            onClick={() => setShowTableMode(!showTableMode)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {showTableMode ? (
              <>
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" /> Show Visual Chart
              </>
            ) : (
              <>
                <TableIcon className="w-3.5 h-3.5 text-slate-500" /> View Data Table
              </>
            )}
          </button>
        </CardHeader>
        <CardContent className="p-4">
          {data.completionTimeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No task records available for {periodLabel}.
            </div>
          ) : showTableMode ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interval / Date</TableHead>
                  <TableHead className="text-center">Tasks Created</TableHead>
                  <TableHead className="text-right">Tasks Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.completionTimeline.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-xs text-slate-900">{item.label}</TableCell>
                    <TableCell className="text-center font-semibold text-xs text-slate-800">
                      {item.created}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-emerald-600">
                      +{item.completed}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3 h-44 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
                {data.completionTimeline.map((item) => {
                  const createdHeight = Math.round((item.created / maxTimelineCount) * 100);
                  const completedHeight = Math.round((item.completed / maxTimelineCount) * 100);

                  return (
                    <div key={item.date} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        {/* Created Bar */}
                        <div
                          style={{ height: `${Math.max(createdHeight, item.created > 0 ? 8 : 2)}%` }}
                          className={`w-3 rounded-t transition-all ${
                            item.created > 0 ? 'bg-slate-700 group-hover:bg-slate-900' : 'bg-slate-200'
                          }`}
                          title={`Tasks Created: ${item.created}`}
                        />
                        {/* Completed Bar */}
                        <div
                          style={{ height: `${Math.max(completedHeight, item.completed > 0 ? 8 : 2)}%` }}
                          className={`w-3 rounded-t transition-all ${
                            item.completed > 0 ? 'bg-emerald-600 group-hover:bg-emerald-700' : 'bg-emerald-100'
                          }`}
                          title={`Tasks Completed: ${item.completed}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate max-w-[48px] text-center mt-1">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-slate-700" />
                  <span>Tasks Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-emerald-600" />
                  <span>Tasks Completed</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
