'use client';

import React, { useState } from 'react';
import { InteractionReportData } from '@/types/reports';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Clock, 
  BarChart2, 
  Table as TableIcon 
} from 'lucide-react';

interface InteractionReportViewProps {
  data: InteractionReportData;
  periodLabel: string;
}

export function InteractionReportView({ data, periodLabel }: InteractionReportViewProps) {
  const [showTableMode, setShowTableMode] = useState(false);

  const maxActivityTotal = Math.max(...data.activityTimeline.map(t => t.total), 1);

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Touchpoints"
          value={data.totalInteractionsInPeriod}
          subtitle={`Logged during ${periodLabel}`}
          icon={MessageSquare}
        />
        <StatCard
          title="Average Duration"
          value={data.averageDurationMinutes !== null ? `${data.averageDurationMinutes} min` : 'N/A'}
          subtitle="Calls and client sync meetings"
          icon={Clock}
        />
        <StatCard
          title="Active Channels"
          value={data.byType.filter(t => t.count > 0).length}
          subtitle="Communication touchpoints"
          icon={Phone}
        />
        <StatCard
          title="Daily Engagement"
          value={data.activityTimeline.length > 0 ? (data.totalInteractionsInPeriod / data.activityTimeline.length).toFixed(1) : '0'}
          subtitle="Avg interactions per bucket"
          icon={Calendar}
        />
      </div>

      {/* Grid: Channel Distribution & Channel Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Channel Share Progress Bars */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Communication Channels & Touchpoint Share</CardTitle>
            <CardDescription>Breakdown by omnichannel communication method</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            {data.byType.map((item) => {
              const Icon = item.type === 'CALL' ? Phone : item.type === 'EMAIL' ? Mail : item.type === 'MEETING' ? Calendar : FileText;
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-600">
                      <strong className="text-slate-900">{item.count}</strong> ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full rounded-full bg-slate-900 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Channel Details Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Activity Channel Volume</CardTitle>
            <CardDescription>Exact touchpoint count logged across {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead className="text-right">Share (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byType.map((item) => (
                  <TableRow key={item.type}>
                    <TableCell className="font-semibold text-xs text-slate-900">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-xs text-slate-800">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-600">
                      {item.percentage}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Omnichannel Activity Timeline Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Omnichannel Activity Volume Over Time</CardTitle>
            <CardDescription>Daily/weekly cadence of client calls, meetings, emails, and sync notes</CardDescription>
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
          {data.activityTimeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No interactions recorded during {periodLabel}.
            </div>
          ) : showTableMode ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interval / Date</TableHead>
                  <TableHead className="text-center">Calls</TableHead>
                  <TableHead className="text-center">Emails</TableHead>
                  <TableHead className="text-center">Meetings</TableHead>
                  <TableHead className="text-center">Notes / Other</TableHead>
                  <TableHead className="text-right">Total Touchpoints</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activityTimeline.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-xs text-slate-900">{item.label}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-700">{item.calls}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-700">{item.emails}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-700">{item.meetings}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-700">{item.notes + item.other}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-slate-900">
                      {item.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-44 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
                {data.activityTimeline.map((item) => {
                  const heightPercent = Math.round((item.total / maxActivityTotal) * 100);

                  return (
                    <div key={item.date} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group">
                      <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.total}
                      </div>
                      <div className="w-full bg-slate-100 rounded-t flex items-end h-32 relative">
                        <div
                          style={{ height: `${Math.max(heightPercent, item.total > 0 ? 8 : 2)}%` }}
                          className={`w-full rounded-t transition-all ${
                            item.total > 0 ? 'bg-slate-900 group-hover:bg-brand-600' : 'bg-slate-200'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate max-w-[48px] text-center mt-1">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Total Communications: <strong className="text-slate-900 font-semibold">{data.totalInteractionsInPeriod} interactions</strong></span>
                <span>Active Tracking Period: <strong className="text-slate-900 font-semibold">{periodLabel}</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
