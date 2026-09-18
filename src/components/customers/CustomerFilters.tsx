'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { CustomerFiltersParams } from '@/types/crm';
import { Profile } from '@/types/crm';

interface CustomerFiltersProps {
  filters: CustomerFiltersParams;
  onFilterChange: (updated: Partial<CustomerFiltersParams>) => void;
  onReset: () => void;
  staffList: Profile[];
  totalResults: number;
}

export function CustomerFilters({
  filters,
  onFilterChange,
  onReset,
  staffList,
  totalResults,
}: CustomerFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.status && filters.status !== 'ALL') ||
    (filters.type && filters.type !== 'ALL') ||
    (filters.assigned_to && filters.assigned_to !== 'ALL');

  return (
    <div className="space-y-3 rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name, company, email, or CUS reference..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '', page: 1 })}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange({ status: e.target.value as any, page: 1 })}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
            <option value="PROSPECT">Prospect</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || 'ALL'}
            onChange={(e) => onFilterChange({ type: e.target.value as any, page: 1 })}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Customer Types</option>
            <option value="BUSINESS">Business / Corporate</option>
            <option value="INDIVIDUAL">Individual / Consultant</option>
          </select>

          {/* Staff Assignee Filter */}
          {staffList.length > 0 && (
            <select
              value={filters.assigned_to || 'ALL'}
              onChange={(e) => onFilterChange({ assigned_to: e.target.value, page: 1 })}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-[160px]"
            >
              <option value="ALL">All Assignees</option>
              {staffList.map((s) => (
                <option key={s.id || s.user_id} value={s.user_id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-800">{totalResults}</strong> matching customer accounts
        </span>
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <button
            onClick={() =>
              onFilterChange({
                sort_by: 'created_at',
                sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc',
              })
            }
            className="font-medium text-slate-700 hover:underline"
          >
            Date Added ({filters.sort_order || 'desc'})
          </button>
        </div>
      </div>
    </div>
  );
}
