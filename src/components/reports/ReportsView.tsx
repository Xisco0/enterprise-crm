'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CompleteReportData, ReportTab } from '@/types/reports';
import { DateRangePreset } from '@/lib/utils/date-range';
import { generateReportCSV } from '@/lib/report-utils';
import { DateRangeSelector } from './DateRangeSelector';
import { OverviewReportView } from './OverviewReportView';
import { CustomerReportView } from './CustomerReportView';
import { LeadReportView } from './LeadReportView';
import { DealReportView } from './DealReportView';
import { TaskReportView } from './TaskReportView';
import { InteractionReportView } from './InteractionReportView';
import { StaffWorkloadReportView } from './StaffWorkloadReportView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  Building2, 
  UserCheck, 
  TrendingUp, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface ReportsViewProps {
  initialData: CompleteReportData;
  staffList?: Array<{ id: string; name: string; email: string }>;
}

const TAB_CONFIG: Array<{ id: ReportTab; label: string; icon: React.ElementType; adminOnly?: boolean }> = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Building2 },
  { id: 'leads', label: 'Leads & Funnel', icon: UserCheck },
  { id: 'deals', label: 'Deals & Revenue', icon: TrendingUp },
  { id: 'tasks', label: 'Tasks & Velocity', icon: CheckSquare },
  { id: 'interactions', label: 'Interactions', icon: MessageSquare },
  { id: 'staff', label: 'Staff Workload', icon: Users, adminOnly: true },
];

export function ReportsView({ initialData, staffList = [] }: ReportsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTab = (searchParams.get('tab') as ReportTab) || 'overview';
  const isAdmin = initialData.metadata.userRole === 'ADMIN';

  // Visible tabs based on role
  const availableTabs = TAB_CONFIG.filter((t) => !t.adminOnly || isAdmin);

  const handleFilterChange = (params: {
    preset: DateRangePreset;
    from?: string;
    to?: string;
    staffId?: string;
  }) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set('preset', params.preset);

    if (params.preset === 'CUSTOM' && params.from && params.to) {
      current.set('from', params.from);
      current.set('to', params.to);
    } else {
      current.delete('from');
      current.delete('to');
    }

    if (params.staffId && params.staffId !== 'ALL') {
      current.set('staff_id', params.staffId);
    } else {
      current.delete('staff_id');
    }

    startTransition(() => {
      router.push(`${pathname}?${current.toString()}`);
    });
  };

  const handleTabChange = (tabId: ReportTab) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set('tab', tabId);
    startTransition(() => {
      router.push(`${pathname}?${current.toString()}`);
    });
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await generateReportCSV(initialData, currentTab);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `crm-report-${currentTab}-${initialData.metadata.startDateStr}-to-${initialData.metadata.endDateStr}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isAdmin ? 'Analytics & Executive Reports' : 'Personal Performance Reports'}
            </h1>
            <Badge 
              variant="outline" 
              className={isAdmin ? 'bg-brand-50 text-brand-700 border-brand-200 text-xs' : 'bg-slate-100 text-slate-700 text-xs'}
            >
              {isAdmin ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-brand-600" /> Organization-Wide
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-500" /> My Scoped Metrics
                </span>
              )}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin 
              ? 'Real-time multi-dimensional operational metrics, sales conversions, and team capacity.'
              : 'Detailed performance metrics, deal pipeline momentum, and task execution velocity.'}
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            disabled={isPending}
            className="text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV ({currentTab})
          </Button>
        </div>
      </div>

      {/* Date Range & Scoping Filter Bar */}
      <DateRangeSelector
        currentPreset={initialData.metadata.preset}
        currentFrom={initialData.metadata.startDateStr}
        currentTo={initialData.metadata.endDateStr}
        currentStaffId={initialData.metadata.selectedStaffId}
        staffList={staffList}
        showStaffFilter={isAdmin}
        onFilterChange={handleFilterChange}
        periodLabel={initialData.metadata.label}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-px" aria-label="Reports Sub-Navigation">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-3 text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {currentTab === 'overview' && (
          <OverviewReportView data={initialData} onNavigateTab={handleTabChange} />
        )}
        {currentTab === 'customers' && (
          <CustomerReportView data={initialData.customers} periodLabel={initialData.metadata.label} />
        )}
        {currentTab === 'leads' && (
          <LeadReportView data={initialData.leads} periodLabel={initialData.metadata.label} />
        )}
        {currentTab === 'deals' && (
          <DealReportView data={initialData.deals} periodLabel={initialData.metadata.label} />
        )}
        {currentTab === 'tasks' && (
          <TaskReportView data={initialData.tasks} periodLabel={initialData.metadata.label} />
        )}
        {currentTab === 'interactions' && (
          <InteractionReportView data={initialData.interactions} periodLabel={initialData.metadata.label} />
        )}
        {currentTab === 'staff' && isAdmin && (
          <StaffWorkloadReportView data={initialData.staffWorkload || []} periodLabel={initialData.metadata.label} />
        )}
      </div>
    </div>
  );
}
