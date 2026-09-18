'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeadWithAssignee, LeadFiltersParams, Profile } from '@/types/crm';
import { getLeads } from '@/lib/actions/leads';
import { getCurrentProfile } from '@/lib/actions/auth';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadTable } from '@/components/leads/LeadTable';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Plus, DollarSign, Flame, CheckCircle2, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function StaffLeadsPage() {
  const [leads, setLeads] = useState<LeadWithAssignee[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<LeadFiltersParams>({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    type: 'ALL',
    source: 'ALL',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    loadUserAndLeads();
  }, []);

  useEffect(() => {
    if (currentProfile) {
      loadLeads(currentProfile.user_id);
    }
  }, [filters]);

  async function loadUserAndLeads() {
    const profile = await getCurrentProfile();
    const userId = profile?.user_id || '00000000-0000-0000-0000-000000000002';
    setCurrentProfile(
      profile || {
        id: userId,
        user_id: userId,
        first_name: 'Marcus',
        last_name: 'Vance',
        email: 'marcus.vance@enterprise.com',
        role: 'STAFF',
        status: 'ACTIVE',
        department: 'Enterprise Sales',
        job_title: 'Senior Account Executive',
        phone: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    await loadLeads(userId);
  }

  async function loadLeads(userId: string) {
    setIsLoading(true);
    try {
      const res = await getLeads(filters, 'ASSIGNED', userId);
      setLeads(res.leads);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load staff leads:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const myPipelineValue = leads.reduce(
    (acc, l) => (l.status !== 'CONVERTED' && l.status !== 'LOST' ? acc + (Number(l.estimated_value) || 0) : acc),
    0
  );
  const myHighPriorityCount = leads.filter(
    (l) => l.priority === 'HIGH' && l.status !== 'CONVERTED' && l.status !== 'LOST'
  ).length;
  const myConvertedCount = leads.filter((l) => l.status === 'CONVERTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Leads Pipeline</h1>
          <p className="text-xs text-slate-500">
            Prospects and qualification opportunities assigned to your territory.
          </p>
        </div>
        <Link href="/staff/leads/new">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Capture Lead
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="My Active Pipeline"
          value={formatCurrency(myPipelineValue)}
          subtitle="Assigned opportunity value"
          icon={DollarSign}
        />
        <StatCard
          title="High Priority Targets"
          value={myHighPriorityCount}
          subtitle="Urgent conversion focus"
          icon={Flame}
        />
        <StatCard
          title="My Conversions"
          value={myConvertedCount}
          subtitle="Closed customer accounts"
          icon={CheckCircle2}
        />
        <StatCard
          title="My Assigned Leads"
          value={totalCount}
          subtitle="Total assigned pipeline"
          icon={Users}
        />
      </div>

      {/* Filter Bar */}
      <LeadFilters staffMembers={[]} isAdmin={false} />

      {/* Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8">
          <span className="text-xs text-slate-400">Loading your leads...</span>
        </div>
      ) : (
        <LeadTable leads={leads} basePath="/staff/leads" />
      )}
    </div>
  );
}
