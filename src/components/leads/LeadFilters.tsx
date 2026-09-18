'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { LEAD_STATUS_CONFIG, LEAD_PRIORITY_CONFIG, LEAD_SOURCE_CONFIG } from '@/lib/constants';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
}

interface LeadFiltersProps {
  staffMembers?: StaffMember[];
  isAdmin?: boolean;
}

export function LeadFilters({ staffMembers = [], isAdmin = false }: LeadFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'ALL';
  const priority = searchParams.get('priority') || 'ALL';
  const type = searchParams.get('type') || 'ALL';
  const source = searchParams.get('source') || 'ALL';
  const assignedTo = searchParams.get('assigned_to') || 'ALL';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter change
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    updateFilter('search', query);
  }

  function handleReset() {
    router.replace(pathname);
  }

  const hasActiveFilters =
    Boolean(search) ||
    status !== 'ALL' ||
    priority !== 'ALL' ||
    type !== 'ALL' ||
    source !== 'ALL' ||
    assignedTo !== 'ALL';

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search by lead ref, name, company, email..."
            className="pl-8 h-8 text-xs bg-slate-50/50 border-slate-200 focus-visible:bg-white"
          />
        </form>

        {/* Filter Select Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(LEAD_STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            {Object.entries(LEAD_PRIORITY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label} Priority
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="BUSINESS">Corporate</option>
            <option value="INDIVIDUAL">Individual</option>
          </select>

          {/* Source Filter */}
          <select
            value={source}
            onChange={(e) => updateFilter('source', e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            {Object.entries(LEAD_SOURCE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Staff Filter (Admin only) */}
          {isAdmin && staffMembers.length > 0 && (
            <select
              value={assignedTo}
              onChange={(e) => updateFilter('assigned_to', e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="ALL">All Assignees</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              ))}
            </select>
          )}

          {/* Reset Action */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs text-slate-500 hover:text-slate-800 px-2"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
