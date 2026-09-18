'use client';

import React from 'react';
import { StaffWorkloadReportItem } from '@/types/reports';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Users, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StaffWorkloadReportViewProps {
  data: StaffWorkloadReportItem[];
  periodLabel: string;
}

export function StaffWorkloadReportView({ data, periodLabel }: StaffWorkloadReportViewProps) {
  const totalAssignedCustomers = data.reduce((acc, s) => acc + s.assignedCustomers, 0);
  const totalAssignedLeads = data.reduce((acc, s) => acc + s.assignedLeads, 0);
  const totalOpenDeals = data.reduce((acc, s) => acc + s.openDeals, 0);
  const totalOpenDealsValue = data.reduce((acc, s) => acc + s.openDealsValueUSD, 0);
  const totalCompletedTasks = data.reduce((acc, s) => acc + s.completedTasksInPeriod, 0);
  const totalInteractions = data.reduce((acc, s) => acc + s.interactionsInPeriod, 0);

  return (
    <div className="space-y-6">
      {/* Management Principle Callout */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-semibold block">Operational Resource Allocation</strong>
          <span>
            This report summarizes active pipeline ownership, task execution, and client engagement per representative to facilitate balanced workload distribution across the sales organization.
          </span>
        </div>
      </div>

      {/* Staff Workload Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Team Capacity & Activity Summary</CardTitle>
          <CardDescription>Metrics reflecting current account assignments and activity during {periodLabel}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Assigned Customers</TableHead>
                <TableHead className="text-center">Active Leads</TableHead>
                <TableHead className="text-center">Open Deals</TableHead>
                <TableHead>Pipeline Value</TableHead>
                <TableHead className="text-center">Open Tasks</TableHead>
                <TableHead className="text-center">Tasks Done ({periodLabel})</TableHead>
                <TableHead className="text-center">Touchpoints ({periodLabel})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 uppercase">
                        {staff.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{staff.name}</div>
                        <div className="text-[11px] text-slate-500">{staff.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs text-slate-800">
                    {staff.assignedCustomers}
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs text-slate-800">
                    {staff.assignedLeads}
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs text-slate-800">
                    {staff.openDeals}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-900">
                    {formatCurrency(staff.openDealsValueUSD)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-700">
                    {staff.openTasks}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-emerald-600">
                    +{staff.completedTasksInPeriod}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-indigo-600">
                    {staff.interactionsInPeriod}
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals Summary Row */}
              <TableRow className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
                <TableCell colSpan={2} className="text-xs text-slate-900">
                  Organization Total
                </TableCell>
                <TableCell className="text-center text-xs text-slate-900 font-bold">
                  {totalAssignedCustomers}
                </TableCell>
                <TableCell className="text-center text-xs text-slate-900 font-bold">
                  {totalAssignedLeads}
                </TableCell>
                <TableCell className="text-center text-xs text-slate-900 font-bold">
                  {totalOpenDeals}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-900 font-bold">
                  {formatCurrency(totalOpenDealsValue)}
                </TableCell>
                <TableCell className="text-center text-xs text-slate-900 font-bold">
                  {data.reduce((acc, s) => acc + s.openTasks, 0)}
                </TableCell>
                <TableCell className="text-center font-mono text-xs text-emerald-700 font-bold">
                  +{totalCompletedTasks}
                </TableCell>
                <TableCell className="text-center font-mono text-xs text-indigo-700 font-bold">
                  {totalInteractions}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
