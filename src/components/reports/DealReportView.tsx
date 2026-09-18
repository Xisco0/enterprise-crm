'use client';

import React, { useState } from 'react';
import { DealReportData } from '@/types/reports';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  XCircle, 
  PieChart, 
  Briefcase,
  HelpCircle,
  BarChart2,
  Table as TableIcon
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DEAL_STAGE_CONFIG } from '@/lib/constants';

interface DealReportViewProps {
  data: DealReportData;
  periodLabel: string;
}

export function DealReportView({ data, periodLabel }: DealReportViewProps) {
  const [showTableMode, setShowTableMode] = useState(false);

  const primaryWon = data.wonValueByCurrency[0] || { currency: 'NGN', totalValue: 0, count: 0, averageValue: 0 };
  const primaryLost = data.lostValueByCurrency[0] || { currency: 'NGN', totalValue: 0, count: 0 };

  const maxWonTimelineValue = Math.max(...data.wonDealsTimeline.map(t => t.totalValue), 1);

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Deals Created"
          value={data.totalDealsCreatedInPeriod}
          subtitle={`Initiated in ${periodLabel}`}
          icon={Briefcase}
          iconColor="brand"
        />
        <StatCard
          title="Active Open Pipeline"
          value={data.openDealsCount}
          subtitle="Opportunities in flight"
          icon={TrendingUp}
          iconColor="brand"
        />
        <StatCard
          title="Won Deals in Period"
          value={data.wonDealsInPeriod}
          subtitle={`Closed during ${periodLabel}`}
          trend="up"
          icon={Award}
          iconColor="emerald"
        />
        <StatCard
          title="Lost Deals in Period"
          value={data.lostDealsInPeriod}
          subtitle="Disqualified or lost"
          trend={data.lostDealsInPeriod > 0 ? 'down' : 'neutral'}
          icon={XCircle}
          iconColor={data.lostDealsInPeriod > 0 ? 'rose' : 'slate'}
        />
        <StatCard
          title="Sales Win Rate"
          value={data.winRate !== null ? `${data.winRate}%` : 'N/A'}
          subtitle="Won / (Won + Lost)"
          trend="up"
          icon={TrendingUp}
          iconColor="purple"
        />
      </div>

      {/* Multi-Currency Pipeline Valuation Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Open Pipeline Valuation */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Open Pipeline Valuation
          </span>
          <div className="space-y-1">
            {data.pipelineByCurrency.map((c) => (
              <div key={c.currency} className="flex items-baseline justify-between">
                <span className="font-mono text-lg font-extrabold text-slate-900">
                  {formatCurrency(c.totalValue, c.currency)}
                </span>
                <span className="text-xs text-slate-500">
                  {c.count} {c.currency} deals
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Realized Won Revenue */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" /> Won Revenue in Period
          </span>
          <div className="space-y-1">
            {data.wonValueByCurrency.map((c) => (
              <div key={c.currency} className="flex items-baseline justify-between">
                <span className="font-mono text-lg font-extrabold text-emerald-950">
                  {formatCurrency(c.totalValue, c.currency)}
                </span>
                <span className="text-xs text-emerald-700">
                  Avg: {c.count > 0 ? formatCurrency(c.averageValue, c.currency) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lost Opportunity Value */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Lost Value in Period
          </span>
          <div className="space-y-1">
            {data.lostValueByCurrency.map((c) => (
              <div key={c.currency} className="flex items-baseline justify-between">
                <span className="font-mono text-lg font-extrabold text-rose-950">
                  {formatCurrency(c.totalValue, c.currency)}
                </span>
                <span className="text-xs text-rose-700">
                  {c.count} lost deals
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Stage Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sales Pipeline Distribution Across Stages</CardTitle>
          <CardDescription>Valuation and count of opportunities currently progressing through sales stages</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {data.byStage.map((stageItem) => {
              const config = DEAL_STAGE_CONFIG[stageItem.stage] || {
                label: stageItem.label,
                bg: 'bg-slate-100',
                color: 'text-slate-700',
                border: 'border-slate-300',
              };
              return (
                <div
                  key={stageItem.stage}
                  className={`rounded-lg border p-3 ${config.border} bg-white transition-all hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                      {stageItem.count}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs font-bold font-mono text-slate-900">
                    {formatCurrency(stageItem.totalValue, stageItem.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Won Deals Timeline Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Closed-Won Deals Over Time</CardTitle>
            <CardDescription>Realized contract revenue recognized during {periodLabel}</CardDescription>
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
          {data.wonDealsTimeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No deals were won during {periodLabel}.
            </div>
          ) : showTableMode ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interval / Date</TableHead>
                  <TableHead className="text-center">Deals Won</TableHead>
                  <TableHead className="text-right">Realized Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.wonDealsTimeline.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-xs text-slate-900">{item.label}</TableCell>
                    <TableCell className="text-center font-semibold text-xs text-slate-800">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-emerald-600">
                      {formatCurrency(item.totalValue, item.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-44 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
                {data.wonDealsTimeline.map((item) => {
                  const heightPercent = Math.round((item.totalValue / maxWonTimelineValue) * 100);

                  return (
                    <div key={item.date} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group">
                      <div className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.totalValue > 0 ? formatCurrency(item.totalValue, item.currency) : '0'}
                      </div>
                      <div className="w-full bg-slate-100 rounded-t flex items-end h-32 relative">
                        <div
                          style={{ height: `${Math.max(heightPercent, item.totalValue > 0 ? 8 : 2)}%` }}
                          className={`w-full rounded-t transition-all ${
                            item.totalValue > 0 ? 'bg-emerald-600 group-hover:bg-emerald-700' : 'bg-slate-200'
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
                <span>Total Won Deals: <strong className="text-slate-900 font-semibold">{data.wonDealsInPeriod}</strong></span>
                <span>Total Recognized Value: <strong className="text-emerald-700 font-bold font-mono">{formatCurrency(primaryWon.totalValue, primaryWon.currency)}</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lost Deals Reasons Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lost Opportunity Analysis & Disqualification Reasons</CardTitle>
          <CardDescription>Primary recorded reasons why deals failed to convert</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Count</TableHead>
                <TableHead className="text-right">Share (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lostReasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-xs text-slate-400">
                    No lost deal reasons recorded for {periodLabel}.
                  </TableCell>
                </TableRow>
              ) : (
                data.lostReasons.map((item) => (
                  <TableRow key={item.reason}>
                    <TableCell className="font-medium text-xs text-slate-900">
                      {item.reason}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs text-slate-800">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-600">
                      {item.percentage}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
