'use client';

import React from 'react';
import { CompleteReportData, ReportTab } from '@/types/reports';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  UserCheck, 
  TrendingUp, 
  CheckSquare, 
  MessageSquare, 
  ArrowUpRight,
  TrendingDown,
  Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OverviewReportViewProps {
  data: CompleteReportData;
  onNavigateTab: (tab: ReportTab) => void;
}

export function OverviewReportView({ data, onNavigateTab }: OverviewReportViewProps) {
  const { customers, leads, deals, tasks, interactions, metadata } = data;

  return (
    <div className="space-y-8">
      {/* High-Level Executive Scorecard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Executive Summary ({metadata.label})
          </h3>
          <span className="text-xs text-slate-400">
            Computed: {new Date(metadata.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Customers"
            value={customers.newCustomersInPeriod}
            subtitle={`Total: ${customers.totalCustomers} (${customers.activeCustomers} active)`}
            trend={customers.newCustomersInPeriod > 0 ? 'up' : 'neutral'}
            icon={Building2}
          />
          <StatCard
            title="Lead Conversion Rate"
            value={leads.conversionRate !== null ? `${leads.conversionRate}%` : 'N/A'}
            subtitle={`${leads.convertedLeadsInPeriod} converted of ${leads.newLeadsInPeriod} new leads`}
            trend={leads.conversionRate !== null && leads.conversionRate > 20 ? 'up' : 'neutral'}
            icon={UserCheck}
          />
          <StatCard
            title="Deals Won"
            value={deals.wonDealsInPeriod}
            subtitle={
              deals.winRate !== null 
                ? `${deals.winRate}% win rate (${deals.lostDealsInPeriod} lost)`
                : 'No closed deals in period'
            }
            trend={deals.wonDealsInPeriod > 0 ? 'up' : 'neutral'}
            icon={TrendingUp}
          />
          <StatCard
            title="Task Completion Rate"
            value={tasks.completionRate !== null ? `${tasks.completionRate}%` : 'N/A'}
            subtitle={`${tasks.tasksCompletedInPeriod} done (${tasks.overdueCount} overdue)`}
            trend={tasks.completionRate !== null && tasks.completionRate >= 70 ? 'up' : 'neutral'}
            icon={CheckSquare}
          />
        </div>
      </div>

      {/* Module Overview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales & Revenue Card */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Revenue & Sales Performance</CardTitle>
                <CardDescription className="text-xs">Pipeline volume and realized closed-won revenue</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('deals')}
              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            >
              View Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                  Closed Won Revenue
                </span>
                {deals.wonValueByCurrency.length > 0 ? (
                  <div className="space-y-1">
                    {deals.wonValueByCurrency.map((item) => (
                      <div key={item.currency} className="flex items-baseline justify-between">
                        <span className="text-base font-bold text-emerald-700 font-mono">
                          {formatCurrency(item.totalValue, item.currency)}
                        </span>
                        <span className="text-xs text-slate-500">({item.count} deals)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">No won deals in this period</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                  Active Pipeline
                </span>
                {deals.pipelineByCurrency.length > 0 ? (
                  <div className="space-y-1">
                    {deals.pipelineByCurrency.map((item) => (
                      <div key={item.currency} className="flex items-baseline justify-between">
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {formatCurrency(item.totalValue, item.currency)}
                        </span>
                        <span className="text-xs text-slate-500">({item.count} open)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">No open deals currently</span>
                )}
              </div>
            </div>

            {/* Quick Stage Distribution */}
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-2">Deal Stage Distribution</span>
              <div className="space-y-1.5">
                {deals.byStage.map((s) => (
                  <div key={s.stage} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium">{s.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-900 font-semibold">{s.count} deals</span>
                      <span className="text-slate-600 font-mono text-[11px] font-semibold">
                        {s.totalValue > 0 ? formatCurrency(s.totalValue, s.currency) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads & Acquisition Card */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Lead Acquisition & Conversion</CardTitle>
                <CardDescription className="text-xs">Inbound sources and qualification funnel</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            >
              View Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Created</span>
                <span className="text-lg font-bold text-slate-900">{leads.newLeadsInPeriod}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Converted</span>
                <span className="text-lg font-bold text-emerald-600">{leads.convertedLeadsInPeriod}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lost</span>
                <span className="text-lg font-bold text-rose-600">{leads.lostLeadsInPeriod}</span>
              </div>
            </div>

            {/* Inbound Sources Top Breakdown */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Lead Sources</span>
              <div className="space-y-2">
                {leads.bySource.slice(0, 4).map((source) => (
                  <div key={source.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{source.label}</span>
                      <span className="font-semibold text-slate-900 font-mono">{source.count} ({source.percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Productivity (Tasks & Touchpoints) */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Team Execution & Tasks</CardTitle>
                <CardDescription className="text-xs">Follow-ups, scheduled milestones, and completions</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            >
              View Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Created</span>
                <span className="text-lg font-bold text-slate-900">{tasks.totalTasksCreatedInPeriod}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
                <span className="text-lg font-bold text-indigo-600">{tasks.tasksCompletedInPeriod}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Overdue</span>
                <span className="text-lg font-bold text-rose-600">{tasks.overdueCount}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">Pending Execution:</span>
              <span className="font-semibold text-slate-900">{tasks.pendingCount + tasks.inProgressCount} active items</span>
            </div>
          </CardContent>
        </Card>

        {/* Omnichannel Customer Interactions */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Communication & Interactions</CardTitle>
                <CardDescription className="text-xs">Client engagement logged across touchpoints</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('interactions')}
              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            >
              View Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-xs text-slate-500">Total Interactions Logged</span>
                <div className="text-2xl font-bold text-slate-900">{interactions.totalInteractionsInPeriod}</div>
              </div>
              {interactions.averageDurationMinutes !== null && (
                <div className="text-right">
                  <span className="text-xs text-slate-500">Avg Call/Meeting Duration</span>
                  <div className="text-lg font-bold text-slate-700 font-mono">
                    {interactions.averageDurationMinutes} min
                  </div>
                </div>
              )}
            </div>

            {/* Channels distribution */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Channel Activity</span>
              <div className="grid grid-cols-2 gap-2">
                {interactions.byType.map((channel) => (
                  <div key={channel.type} className="flex items-center justify-between p-2 rounded border border-slate-100 text-xs">
                    <span className="text-slate-600 font-medium">{channel.label}</span>
                    <span className="font-bold text-slate-900 font-mono">{channel.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
