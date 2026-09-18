'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerWithAssignee, CustomerFiltersParams, Profile } from '@/types/crm';
import { getCustomers } from '@/lib/actions/customers';
import { getAllStaffProfiles } from '@/lib/actions/staff';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Plus, Users, DollarSign, Building2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithAssignee[]>([]);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<CustomerFiltersParams>({
    search: '',
    status: 'ALL',
    type: 'ALL',
    assigned_to: 'ALL',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  async function loadStaff() {
    const staff = await getAllStaffProfiles();
    setStaffList(staff as unknown as Profile[]);
  }

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const res = await getCustomers(filters, 'ALL');
      setCustomers(res.customers);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load customers:', err);
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
      assigned_to: 'ALL',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      limit: 50,
    });
  }

  const totalPortfolioValue = customers.reduce((acc, c) => acc + (Number(c.lifetime_value) || 0), 0);
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Customer Accounts Directory</h1>
          <p className="text-xs text-slate-500">
            Organization-wide customer roster, contract valuations, and account ownership.
          </p>
        </div>
        <Link href="/admin/customers/new">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Customer
          </Button>
        </Link>
      </div>

      {/* Mini KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          subtitle="Cumulative contract lifetime value"
          icon={DollarSign}
        />
        <StatCard
          title="Active Accounts"
          value={activeCount}
          subtitle="Current operating clients"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Registered Accounts"
          value={totalCount}
          subtitle="Enterprise & Individual customers"
          icon={Users}
        />
      </div>

      {/* Search & Multi-criteria Filters */}
      <CustomerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        staffList={staffList}
        totalResults={totalCount}
      />

      {/* Customer Data Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8">
          <span className="text-xs text-slate-400">Loading customer records...</span>
        </div>
      ) : (
        <CustomerTable customers={customers} basePath="/admin/customers" />
      )}
    </div>
  );
}
