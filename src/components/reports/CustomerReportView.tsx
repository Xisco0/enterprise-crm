'use client';

import React, { useState } from 'react';
import { CustomerReportData } from '@/types/reports';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Building2, 
  TrendingUp,
  Table as TableIcon,
  BarChart2
} from 'lucide-react';
import { CUSTOMER_STATUS_CONFIG } from '@/lib/constants';

interface CustomerReportViewProps {
  data: CustomerReportData;
  periodLabel: string;
}

export function CustomerReportView({ data, periodLabel }: CustomerReportViewProps) {
  const [showTableMode, setShowTableMode] = useState(false);

  const maxNewInBucket = Math.max(...data.growthTimeline.map(t => t.newCustomers), 1);

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Client Base"
          value={data.totalCustomers}
          subtitle="All-time registered accounts"
          icon={Users}
        />
        <StatCard
          title="New in Period"
          value={data.newCustomersInPeriod}
          subtitle={`Added during ${periodLabel}`}
          trend={data.newCustomersInPeriod > 0 ? 'up' : 'neutral'}
          icon={UserPlus}
        />
        <StatCard
          title="Active Accounts"
          value={data.activeCustomers}
          subtitle="Active enterprise subscriptions"
          icon={UserCheck}
        />
        <StatCard
          title="Inactive / Churned"
          value={data.inactiveCustomers + data.churnedCustomers}
          subtitle={`${data.churnedCustomers} churned accounts`}
          trend={data.churnedCustomers > 0 ? 'down' : 'neutral'}
          icon={UserX}
        />
      </div>

      {/* Customer Growth Over Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Customer Growth & Onboarding Timeline</CardTitle>
            <CardDescription>Number of client accounts established during {periodLabel}</CardDescription>
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
          {data.growthTimeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No customer creation events found for {periodLabel}.
            </div>
          ) : showTableMode ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interval / Date</TableHead>
                  <TableHead className="text-right">New Customers Added</TableHead>
                  <TableHead className="text-right">Cumulative Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.growthTimeline.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-xs text-slate-900">{item.label}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-slate-800">
                      +{item.newCustomers}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-600">
                      {item.cumulative}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              {/* Accessible Bar Chart */}
              <div className="flex items-end gap-2 h-44 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
                {data.growthTimeline.map((item) => {
                  const heightPercent = Math.round((item.newCustomers / maxNewInBucket) * 100);
                  return (
                    <div key={item.date} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group">
                      <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.newCustomers}
                      </div>
                      <div className="w-full bg-slate-100 rounded-t flex items-end h-32 relative">
                        <div
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                          className={`w-full rounded-t transition-all ${
                            item.newCustomers > 0 ? 'bg-slate-900 group-hover:bg-brand-600' : 'bg-slate-200'
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
                <span>Total Added in Period: <strong className="text-slate-900 font-semibold">{data.newCustomersInPeriod} customers</strong></span>
                <span>Cumulative Customer Base: <strong className="text-slate-900 font-semibold">{data.totalCustomers}</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Grid: Account Status + Account Type Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account Status Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Customer Status Breakdown</CardTitle>
            <CardDescription>Distribution of active, inactive, prospect, and churned accounts</CardDescription>
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
                  const config = CUSTOMER_STATUS_CONFIG[item.status] || {
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

        {/* Account Type Classification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Account Type Classification</CardTitle>
            <CardDescription>Corporate enterprise accounts versus individual client records</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {data.byType.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    {item.label}
                  </span>
                  <span className="font-mono text-slate-600">
                    <strong className="text-slate-900">{item.count}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${item.type === 'BUSINESS' ? 'bg-slate-900' : 'bg-brand-500'}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
