'use client';

import React, { useState } from 'react';
import { LeadReportData } from '@/types/reports';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Target, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Share2,
  Table as TableIcon,
  BarChart2
} from 'lucide-react';
import { LEAD_STATUS_CONFIG } from '@/lib/constants';

interface LeadReportViewProps {
  data: LeadReportData;
  periodLabel: string;
}

export function LeadReportView({ data, periodLabel }: LeadReportViewProps) {
  const [showTableMode, setShowTableMode] = useState(false);

  const maxTimelineCount = Math.max(
    ...data.conversionTimeline.map(t => Math.max(t.newLeads, t.convertedLeads)),
    1
  );

  return (
    <div className="space-y-6">
      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Pipeline Leads"
          value={data.totalLeads}
          subtitle="All-time prospect roster"
          icon={Target}
        />
        <StatCard
          title="New Leads in Period"
          value={data.newLeadsInPeriod}
          subtitle={`Created in ${periodLabel}`}
          trend={data.newLeadsInPeriod > 0 ? 'up' : 'neutral'}
          icon={UserPlus}
        />
        <StatCard
          title="Qualified Prospects"
          value={data.qualifiedLeads}
          subtitle="Meeting criteria"
          icon={TrendingUp}
        />
        <StatCard
          title="Converted in Period"
          value={data.convertedLeadsInPeriod}
          subtitle="Became paying customers"
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          title="Lost in Period"
          value={data.lostLeadsInPeriod}
          subtitle="Disqualified or churned"
          trend={data.lostLeadsInPeriod > 0 ? 'down' : 'neutral'}
          icon={XCircle}
        />
      </div>

      {/* Conversion Rate Highlight Card */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Lead-to-Customer Conversion Rate
              </span>
              <Badge variant="outline" className="border-indigo-300 bg-indigo-100/70 text-indigo-800 text-[10px]">
                Real CRM Performance
              </Badge>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Calculated as total converted customer accounts divided by total lifetime leads recorded in the CRM.
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            {data.conversionRate !== null ? (
              <>
                <div className="text-3xl font-extrabold font-mono text-indigo-950">
                  {data.conversionRate}%
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  ({data.totalLeads} total leads evaluated)
                </div>
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-500">
                No lead conversion data available.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lead Acquisition Sources & Conversion Timeline Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lead Source Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lead Sources & Acquisition Channels</CardTitle>
            <CardDescription>Where prospective inbound opportunities originate</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            {data.bySource.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No lead sources recorded.
              </div>
            ) : (
              data.bySource.map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Share2 className="h-3 w-3 text-slate-400" />
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Lead Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lead Pipeline Status Distribution</CardTitle>
            <CardDescription>Current stage progression for all active and resolved leads</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead className="text-right">Share (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byStatus.map((item) => {
                  const config = LEAD_STATUS_CONFIG[item.status] || {
                    label: item.label,
                    bg: 'bg-slate-100',
                    color: 'text-slate-700',
                  };
                  return (
                    <TableRow key={item.status}>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${config.bg} ${config.color}`}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-xs text-slate-900">
                        {item.count}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-600">
                        {item.percentage}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Timeline Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Inbound Intake vs. Conversion Timeline</CardTitle>
            <CardDescription>Comparison of new leads created versus conversions finalized in {periodLabel}</CardDescription>
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
          {data.conversionTimeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No lead activity recorded during {periodLabel}.
            </div>
          ) : showTableMode ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interval / Date</TableHead>
                  <TableHead className="text-right">New Inbound Leads</TableHead>
                  <TableHead className="text-right">Converted to Customers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.conversionTimeline.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-xs text-slate-900">{item.label}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-800">
                      +{item.newLeads}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-emerald-600">
                      +{item.convertedLeads}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3 h-44 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
                {data.conversionTimeline.map((item) => {
                  const newHeight = Math.round((item.newLeads / maxTimelineCount) * 100);
                  const convHeight = Math.round((item.convertedLeads / maxTimelineCount) * 100);

                  return (
                    <div key={item.date} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        {/* New Leads Bar */}
                        <div
                          style={{ height: `${Math.max(newHeight, item.newLeads > 0 ? 8 : 2)}%` }}
                          className={`w-3 rounded-t transition-all ${
                            item.newLeads > 0 ? 'bg-slate-700 group-hover:bg-slate-900' : 'bg-slate-200'
                          }`}
                          title={`New Leads: ${item.newLeads}`}
                        />
                        {/* Converted Leads Bar */}
                        <div
                          style={{ height: `${Math.max(convHeight, item.convertedLeads > 0 ? 8 : 2)}%` }}
                          className={`w-3 rounded-t transition-all ${
                            item.convertedLeads > 0 ? 'bg-emerald-600 group-hover:bg-emerald-700' : 'bg-emerald-100'
                          }`}
                          title={`Converted: ${item.convertedLeads}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate max-w-[48px] text-center mt-1">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-slate-700" />
                  <span>New Leads Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-emerald-600" />
                  <span>Converted to Customer</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
