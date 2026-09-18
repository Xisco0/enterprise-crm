'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEAL_STAGE_CONFIG, DEAL_STATUS_CONFIG, DEAL_PRIORITY_CONFIG, CURRENCY_CONFIG } from '@/lib/constants';
import { Search, RotateCcw, Filter, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';

interface DealFiltersProps {
  basePath: '/admin/deals' | '/staff/deals';
  showPipelineToggle?: boolean;
  currentView?: 'list' | 'pipeline';
}

export function DealFilters({ basePath, showPipelineToggle = true, currentView = 'list' }: DealFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const stage = searchParams.get('stage') || 'ALL';
  const status = searchParams.get('status') || 'ALL';
  const priority = searchParams.get('priority') || 'ALL';
  const currency = searchParams.get('currency') || 'ALL';

  const [searchInput, setSearchInput] = React.useState(search);

  // Sync internal search input with URL params
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'ALL' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 on filter changes
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleReset = () => {
    setSearchInput('');
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    search ||
      (stage && stage !== 'ALL') ||
      (status && status !== 'ALL') ||
      (priority && priority !== 'ALL') ||
      (currency && currency !== 'ALL')
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search deals (ref, title, customer)..."
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            className="pl-9 pr-3 h-8 text-xs"
          />
        </form>

        {/* View Switcher (List vs Pipeline) */}
        {showPipelineToggle && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
            <Link href={basePath}>
              <Button
                variant={currentView === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2.5 text-xs font-medium ${
                  currentView === 'list' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                <List className="h-3.5 w-3.5 mr-1.5" />
                Table View
              </Button>
            </Link>
            <Link href={`${basePath}/pipeline`}>
              <Button
                variant={currentView === 'pipeline' ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2.5 text-xs font-medium ${
                  currentView === 'pipeline' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                Sales Pipeline
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Stage Filter */}
        <select
          value={stage}
          onChange={(e) => updateFilters({ stage: e.target.value })}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
        >
          <option value="ALL">All Stages</option>
          {Object.entries(DEAL_STAGE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {Object.entries(DEAL_STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => updateFilters({ priority: e.target.value })}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          {Object.entries(DEAL_PRIORITY_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Currency Filter */}
        <select
          value={currency}
          onChange={(e) => updateFilters({ currency: e.target.value })}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
        >
          <option value="ALL">All Currencies</option>
          {Object.entries(CURRENCY_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
