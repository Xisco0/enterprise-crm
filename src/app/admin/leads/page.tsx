import React from 'react';
import Link from 'next/link';
import { getLeads } from '@/lib/actions/leads';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadTable } from '@/components/leads/LeadTable';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Plus, TrendingUp, DollarSign, Flame, CheckCircle2, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LeadFiltersParams } from '@/types/crm';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    source?: string;
    assigned_to?: string;
    sort_by?: string;
    sort_order?: string;
  }>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: LeadFiltersParams = {
    search: params.search,
    status: (params.status as any) || 'ALL',
    priority: (params.priority as any) || 'ALL',
    type: (params.type as any) || 'ALL',
    source: (params.source as any) || 'ALL',
    assigned_to: params.assigned_to || 'ALL',
    sort_by: (params.sort_by as any) || 'created_at',
    sort_order: (params.sort_order as any) || 'desc',
  };

  const [{ leads, totalCount }, staffList] = await Promise.all([
    getLeads(filters, 'ALL'),
    getAllStaffProfiles(),
  ]);

  const totalPipelineValue = leads.reduce(
    (acc, l) => (l.status !== 'CONVERTED' && l.status !== 'LOST' ? acc + (Number(l.estimated_value) || 0) : acc),
    0
  );
  const highPriorityCount = leads.filter((l) => l.priority === 'HIGH' && l.status !== 'CONVERTED' && l.status !== 'LOST').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Leads Pipeline & Acquisition</h1>
          <p className="text-xs text-slate-500">
            Prospect qualification, scoring, territory assignment, and customer conversion.
          </p>
        </div>
        <Link href="/admin/leads/new">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Capture Lead
          </Button>
        </Link>
      </div>

      {/* Pipeline KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="Active Pipeline Value"
          value={formatCurrency(totalPipelineValue)}
          subtitle="Unconverted active opportunity sum"
          icon={DollarSign}
        />
        <StatCard
          title="High Priority Prospects"
          value={highPriorityCount}
          subtitle="Urgent conversion targets"
          icon={Flame}
        />
        <StatCard
          title="Converted Customers"
          value={convertedCount}
          subtitle="Successfully closed accounts"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Registered Leads"
          value={totalCount}
          subtitle="All pipeline records"
          icon={Users}
        />
      </div>

      {/* Multi-criteria Filter Bar */}
      <LeadFilters staffMembers={staffList} isAdmin={true} />

      {/* Leads Table */}
      <LeadTable leads={leads} basePath="/admin/leads" />
    </div>
  );
}
