import React from 'react';
import Link from 'next/link';
import { getDeals } from '@/lib/actions/deals';
import { DealTable } from '@/components/deals/DealTable';
import { DealFilters } from '@/components/deals/DealFilters';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import { DealFiltersParams } from '@/types/crm';
import { Plus, DollarSign, TrendingUp, CheckCircle2, Briefcase, LayoutGrid } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    stage?: string;
    status?: string;
    priority?: string;
    currency?: string;
    assigned_to?: string;
    sort_by?: string;
    sort_order?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminDealsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: DealFiltersParams = {
    search: params.search,
    stage: (params.stage as any) || 'ALL',
    status: (params.status as any) || 'ALL',
    priority: (params.priority as any) || 'ALL',
    currency: (params.currency as any) || 'ALL',
    assigned_to: params.assigned_to || 'ALL',
    sort_by: (params.sort_by as any) || 'created_at',
    sort_order: (params.sort_order as any) || 'desc',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  };

  const { deals, totalCount } = await getDeals(filters, 'ALL');

  // Compute metrics
  const activeDeals = deals.filter((d) => d.status === 'OPEN');
  const activePipelineValue = activeDeals.reduce(
    (sum, d) => sum + (Number(d.value) || Number(d.amount) || 0),
    0
  );
  const weightedPipelineValue = activeDeals.reduce(
    (sum, d) => sum + ((Number(d.value) || Number(d.amount) || 0) * (d.probability || 0)) / 100,
    0
  );
  const wonDeals = deals.filter((d) => d.status === 'WON' || d.stage === 'CLOSED_WON');
  const totalWonValue = wonDeals.reduce(
    (sum, d) => sum + (Number(d.value) || Number(d.amount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Deals & Sales Pipeline</h1>
          <p className="text-xs text-slate-500">
            Enterprise sales opportunities, revenue forecasts, probability stages, and deal closures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/deals/pipeline">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Pipeline View
            </Button>
          </Link>
          <Link href="/admin/deals/new">
            <Button size="sm" className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="Active Pipeline Value"
          value={formatCurrency(activePipelineValue)}
          subtitle="Open opportunities sum"
          icon={DollarSign}
        />
        <StatCard
          title="Weighted Forecast"
          value={formatCurrency(weightedPipelineValue)}
          subtitle="Probability-adjusted value"
          icon={TrendingUp}
        />
        <StatCard
          title="Closed Won Revenue"
          value={formatCurrency(totalWonValue)}
          subtitle={`${wonDeals.length} deals closed won`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Deals"
          value={totalCount}
          subtitle={`${activeDeals.length} currently open`}
          icon={Briefcase}
        />
      </div>

      {/* Filter Toolbar */}
      <DealFilters basePath="/admin/deals" showPipelineToggle={true} currentView="list" />

      {/* Deals Table */}
      <DealTable deals={deals} basePath="/admin/deals" />
    </div>
  );
}
