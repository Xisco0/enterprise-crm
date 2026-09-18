import React from 'react';
import { getInteractions } from '@/lib/actions/interactions';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { getCurrentProfile } from '@/lib/actions/auth';
import { InteractionTable } from '@/components/interactions/InteractionTable';
import { InteractionFilters } from '@/components/interactions/InteractionFilters';
import { StatCard } from '@/components/ui/stat-card';
import { InteractionFiltersParams } from '@/types/crm';
import { MessageSquare, Phone, Users, FileText } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    performed_by?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminInteractionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000001';

  const filters: InteractionFiltersParams = {
    search: params.search,
    type: (params.type as any) || 'ALL',
    performed_by: params.performed_by || 'ALL',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  };

  const [{ interactions, totalCount }, staffList] = await Promise.all([
    getInteractions(filters, 'ALL'),
    getAllStaffProfiles(),
  ]);

  const callsCount = interactions.filter((i) => i.type === 'CALL').length;
  const meetingsCount = interactions.filter((i) => i.type === 'MEETING').length;
  const notesCount = interactions.filter((i) => i.type === 'NOTE').length;

  const formattedStaff = staffList.map((s) => ({
    id: s.id,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
    email: s.email,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Client Interactions & Activity Log
        </h1>
        <p className="text-xs text-slate-500">
          Organization-wide chronological history of client phone calls, meetings, emails, and notes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Activities"
          value={totalCount}
          subtitle="All recorded interactions"
          icon={MessageSquare}
        />
        <StatCard
          title="Calls Logged"
          value={callsCount}
          subtitle="Client phone conversations"
          icon={Phone}
        />
        <StatCard
          title="Meetings & Demos"
          value={meetingsCount}
          subtitle="Client presentations held"
          icon={Users}
        />
        <StatCard
          title="Internal Notes"
          value={notesCount}
          subtitle="Strategy and team memos"
          icon={FileText}
        />
      </div>

      {/* Filters Toolbar */}
      <InteractionFilters
        basePath="/admin/interactions"
        staffMembers={formattedStaff}
        isAdmin={true}
      />

      {/* Table */}
      <InteractionTable
        interactions={interactions}
        basePath="/admin/interactions"
        customerBasePath="/admin/customers"
        leadBasePath="/admin/leads"
        dealBasePath="/admin/deals"
      />
    </div>
  );
}
