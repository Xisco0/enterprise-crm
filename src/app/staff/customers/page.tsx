'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerWithAssignee, CustomerFiltersParams, Profile } from '@/types/crm';
import { getCustomers } from '@/lib/actions/customers';
import { getCurrentProfile } from '@/lib/actions/auth';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Plus, DollarSign, Building2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithAssignee[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<CustomerFiltersParams>({
    search: '',
    status: 'ALL',
    type: 'ALL',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    loadUserAndCustomers();
  }, []);

  useEffect(() => {
    if (currentProfile) {
      loadCustomers(currentProfile.user_id);
    }
  }, [filters]);

  async function loadUserAndCustomers() {
    const profile = await getCurrentProfile();
    const userId = profile?.user_id || '00000000-0000-0000-0000-000000000002';
    setCurrentProfile(profile || {
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
    });
    await loadCustomers(userId);
  }

  async function loadCustomers(userId: string) {
    setIsLoading(true);
    try {
      const res = await getCustomers(filters, 'ASSIGNED', userId);
      setCustomers(res.customers);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load staff customers:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(updated: Partial<CustomerFiltersParams>) {
    setFilters((prev) => ({ ...prev, ...updated }));
  }

  function handleResetFilters() {
    setFilters({
      search: '',
      status: 'ALL',
      type: 'ALL',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      limit: 50,
    });
  }

  const myPortfolioValue = customers.reduce((acc, c) => acc + (Number(c.lifetime_value) || 0), 0);
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Customer Accounts</h1>
          <p className="text-xs text-slate-500">
            Enterprise clients and accounts directly assigned to your sales portfolio.
          </p>
        </div>
        <Link href="/staff/customers/new">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Customer
          </Button>
        </Link>
      </div>

      {/* Mini KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="My Managed Account Value"
          value={formatCurrency(myPortfolioValue)}
          subtitle="Direct contract valuation"
          icon={DollarSign}
        />
        <StatCard
          title="My Active Accounts"
          value={activeCount}
          subtitle="Operating relationships"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Assigned Clients"
          value={totalCount}
          subtitle="Portfolio count"
          icon={Building2}
        />
      </div>

      {/* Search & Filters */}
      <CustomerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        staffList={[]}
        totalResults={totalCount}
      />

      {/* Customer Data Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8">
          <span className="text-xs text-slate-400">Loading your customers...</span>
        </div>
      ) : (
        <CustomerTable customers={customers} basePath="/staff/customers" />
      )}
    </div>
  );
}
