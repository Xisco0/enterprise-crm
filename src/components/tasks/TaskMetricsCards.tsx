'use client';

import React from 'react';
import { TaskMetricsSummary } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
} from 'lucide-react';

interface TaskMetricsCardsProps {
  metrics: TaskMetricsSummary;
}

export function TaskMetricsCards({ metrics }: TaskMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Due Today */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Due Today
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {metrics.dueTodayCount}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Scheduled for completion today</p>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className={`border-slate-200 shadow-xs ${metrics.overdueCount > 0 ? 'bg-rose-50/20 border-rose-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Overdue
              </span>
              <div className={`text-2xl font-bold font-mono ${metrics.overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {metrics.overdueCount}
              </div>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metrics.overdueCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Passed deadline requiring attention</p>
        </CardContent>
      </Card>

      {/* In Progress / Active */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                In Progress
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {metrics.inProgressCount}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Currently active work items</p>
        </CardContent>
      </Card>

      {/* Completed (7 Days) */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Completed
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {metrics.completedThisWeekCount}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Closed in the last 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
