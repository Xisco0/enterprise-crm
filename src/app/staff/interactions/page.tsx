import React from 'react';
import { getInteractions } from '@/lib/actions/interactions';
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
    page?: string;
    limit?: string;
  }>;
}

export default async function StaffInteractionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const currentUserId = profile?.user_id || '00000000-0000-0000-0000-000000000002';

  const filters: InteractionFiltersParams = {
    search: params.search,
    type: (params.type as any) || 'ALL',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  };

  const { interactions, totalCount } = await getInteractions(filters, 'ASSIGNED', currentUserId);

  const callsCount = interactions.filter((i) => i.type === 'CALL').length;
  const meetingsCount = interactions.filter((i) => i.type === 'MEETING').length;
  const notesCount = interactions.filter((i) => i.type === 'NOTE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          My Activity & Interaction Log
        </h1>
        <p className="text-xs text-slate-500">
          Personal history of client communication, calls, meetings, and notes logged under your account.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="My Activities"
          value={totalCount}
          subtitle="All my logged entries"
          icon={MessageSquare}
        />
        <StatCard
          title="Calls Made"
          value={callsCount}
          subtitle="My client phone calls"
          icon={Phone}
        />
        <StatCard
          title="Meetings Held"
          value={meetingsCount}
          subtitle="Client demos & sessions"
          icon={Users}
        />
        <StatCard
          title="Internal Notes"
          value={notesCount}
          subtitle="Account documentation"
          icon={FileText}
        />
      </div>

      {/* Filters Toolbar */}
      <InteractionFilters
        basePath="/staff/interactions"
        staffMembers={[]}
        isAdmin={false}
      />

      {/* Table */}
      <InteractionTable
        interactions={interactions}
        basePath="/staff/interactions"
        customerBasePath="/staff/customers"
        leadBasePath="/staff/leads"
        dealBasePath="/staff/deals"
      />
    </div>
  );
}
